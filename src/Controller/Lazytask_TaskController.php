<?php

namespace Lazytask\Controller;

use Lazytask\Helper\Lazytask_DatabaseTableSchema;
use Lazytask\Helper\Lazytask_SlugGenerator;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

final class Lazytask_TaskController {


	const TABLE_TASKS = LAZYTASK_TABLE_PREFIX . 'tasks';
	const TABLE_TASK_MEMBERS = LAZYTASK_TABLE_PREFIX . 'task_members';
	const TABLE_COMMENTS = LAZYTASK_TABLE_PREFIX . 'comments';

	const TABLE_ACTIVITY_LOG = LAZYTASK_TABLE_PREFIX . 'activity_log';

	const TABLE_ATTACHMENTS = LAZYTASK_TABLE_PREFIX . 'attachments';

	public function create(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		// Sanitize and validate the input data
		$requestData = $request->get_json_params();
		$name = sanitize_text_field($requestData['name']);
		$slug = Lazytask_SlugGenerator::slug($name, self::TABLE_TASKS, 'slug');
		$parent = isset($requestData['parent']) && $requestData['parent'] != "" ? (int)$requestData['parent']['id'] : null;
		$projectId = isset($requestData['project_id']) && $requestData['project_id'] != "" ? (int)$requestData['project_id'] : null;
		$taskSectionId = isset($requestData['task_section_id']) && $requestData['task_section_id'] != "" ? (int)$requestData['task_section_id'] : null;
		$priorityId = isset($requestData['priority']) && $requestData['priority'] != "" ? (int)$requestData['priority']['id'] : null;
		$priority = isset($requestData['priority']) && $requestData['priority'] != "" ? $requestData['priority'] : null;
		$assignedToId = isset($requestData['assigned_to']) && $requestData['assigned_to'] != "" ? (int)$requestData['assigned_to']['id'] : null;
		$assignedToName = isset($requestData['assigned_to']) && $requestData['assigned_to'] != "" ? $requestData['assigned_to']['name'] : null;
		$assignedTo = isset($requestData['assigned_to']) && $requestData['assigned_to'] != "" ? $requestData['assigned_to'] : null;
		$createdBy = isset($requestData['created_by']) && $requestData['created_by'] != "" ? $requestData['created_by'] : null;

		$start_date = isset($requestData['start_date']) && $requestData['start_date']!='' && $requestData['start_date']!='null' ? gmdate('Y-m-d H:i:s', strtotime($requestData['start_date'])): null;
		$end_date = isset($requestData['end_date']) && $requestData['end_date']!='' && $requestData['end_date']!='null' ? gmdate('Y-m-d H:i:s', strtotime($requestData['end_date'])): null;

		$type = isset($requestData['type']) && $requestData['type'] != "" ? $requestData['type'] : 'task';

		$description = sanitize_text_field($requestData['description']);
		$status = sanitize_text_field($requestData['status']);
		$created_at = gmdate('Y-m-d H:i:s');
		$members = isset($requestData['members']) && sizeof($requestData['members'])> 0 ? $requestData['members'] : [];
		$tags = isset($requestData['tags']) && sizeof($requestData['tags'])> 0 ? $requestData['tags'] : [];
		// Check if the required fields are present
		if (empty($name)) {
			return new WP_Error('required_fields', 'Please ensure all required fields are provided.', array('status' => 400));
		}

		// Start a transaction
		$db->query('START TRANSACTION');
		// get the task section by id
		$taskSection = $this->getTaskSectionById($taskSectionId);

		$argTask = array(
			"name" => $name,
			"parent_id" => $parent,
			"project_id" => $projectId,
			"section_id" => $taskSectionId,
			"priority_id" => $priorityId,
			"assigned_to" => $assignedToId,
			"start_date" => $start_date,
			"end_date" => $end_date,
			"created_by" => $createdBy,
			'slug' => $slug,
			"description" => $description,
			"status" => $taskSection && $taskSection['mark_is_complete'] == 'complete' ? 'COMPLETED': 'ACTIVE',
			"created_at" => $created_at,
		);
		// Insert the task into the database
		$taskInserted = $db->insert(
			self::TABLE_TASKS,
			$argTask
		);

		// Check if the task was inserted successfully
		if (!$taskInserted) {
			// Rollback the transaction
			$db->query('ROLLBACK');
			return new WP_Error('db_insert_error', 'Could not insert task into the database.', array('status' => 500));
		}

		$taskId = $wpdb->insert_id;

		// Insert the task members into the database
		$memberArg = [];
		if(sizeof($members)>0){
			foreach ( $members as $member ) {
				if((int)$member['id']==0){
					$db->query('ROLLBACK');
					return new WP_Error('db_insert_error', 'Could not insert task member into the database.', array('status' => 500));
				}
				$memberArg[] = [
					'id' => $member['id'],
					'name' => $member['name'],
				];
				$memberInserted = $db->insert(self::TABLE_TASK_MEMBERS, array(
					"task_id" => $taskId,
					"user_id" => (int)$member['id'],
					"created_at" => $created_at,
					"updated_at" => $created_at,
				));

				if (!$memberInserted) {
					// Rollback the transaction
					$db->query('ROLLBACK');
					return new WP_Error('db_insert_error', 'Could not insert task member into the database.', array('status' => 500));
				}
			}
		}

		if($tags && sizeof($tags)>0){
			$taskTagsTable = LAZYTASK_TABLE_PREFIX . 'task_tags';

			$tagObj = new Lazytask_TagController();

			foreach ( $tags as $tag ) {
				$submittedTag = [
					'name' => $tag,
					'user_id' => $createdBy,
				];
			  $assignedTags =$tagObj->tagGetOrCreate($submittedTag);

			  if($assignedTags) {
				  $db->insert(
					  $taskTagsTable,
					  array(
						  "task_id" => $taskId,
						  "tag_id" => $assignedTags['id'],
						  "user_id" => $createdBy,
						  "created_at" => $created_at,
						  )
				  );
			  }


			}
		}

		$properties = [];

		if($memberArg && sizeof($memberArg)>0){
			$argTask['members'] = $memberArg;
		}

		if($priority){
			$argTask['priority_name'] = $priority['name'];
		}
		if($assignedTo){
			$argTask['assignedTo_name'] = $assignedTo['name'];
		}

		$properties['attributes'] = $argTask;

		$activityLogArg = [
			"user_id" => $createdBy,
			"subject_id" => $taskId,
			"subject_name" => 'task',
			"subject_type" => $type,
			"event" => 'created',
			"properties" => wp_json_encode($properties),
			"created_at" => $created_at,
		];

		$activityLogInserted = $db->insert(self::TABLE_ACTIVITY_LOG, $activityLogArg);

		// Commit the transaction
		$db->query('COMMIT');

		$task = $this->getTaskById($taskId);
		if($task){
			$loggedInUserId = isset($requestData['created_by']) && $requestData['created_by']!='' ? (int)$requestData['created_by'] : null;
			$loggedInUser = get_user_by('ID', $loggedInUserId);
			if($task['assignedTo_id']){

				$referenceInfo = ['id'=>$task['id'], 'name'=>$task['name'], 'type'=>'task'];
				$placeholdersArray = [
					'member_name'=>$assignedToName,
					'task_name'=>$task['name'],
					'project_name' => isset($task['project']['name']) ? $task['project']['name']:'',
					'creator_name'=>$loggedInUser?$loggedInUser->display_name:''
				];

				do_action('lazytask_task_assigned_member',  $referenceInfo, ['web-app', 'email'], [$task['assignedTo_id']], $placeholdersArray);
			}

			if($task['members'] && sizeof($task['members'])>0){
				foreach ($task['members'] as $member) {
					if($assignedToId && $member['id'] == $createdBy){

						$referenceInfo = ['id'=>$task['id'], 'name'=>$task['name'], 'type'=>'task'];
						$placeholdersArray = [
							'member_name' => $assignedToName,
							'task_name'=>$task['name'],
							'creator_name'=> $loggedInUser ? $loggedInUser->display_name : ''
						];

						do_action('lazytask_task_follow_by_own', $referenceInfo, ['web-app', 'email'], [$assignedToId], $placeholdersArray);

					}elseif ($member['id'] != $createdBy){
						$memberName = $member['name'];

						$referenceInfo = ['id'=>$task['id'], 'name'=>$task['name'], 'type'=>'task'];
						$placeholdersArray = [
							'member_name' => $memberName,
							'task_name'=>$task['name'],
							'project_name' => isset($task['project']['name']) ? $task['project']['name']:'',
							'creator_name'=> $loggedInUser ? $loggedInUser->display_name : ''
						];

						do_action('lazytask_task_follow_to_other', $referenceInfo, ['web-app', 'email'], [$member['id']], $placeholdersArray);
					}
				}
			}

			$column[$task['section_slug']] = $task;
			$myTaskColumn = [];
			$currentDate = gmdate('Y-m-d');
			$next7Days = gmdate('Y-m-d', strtotime($currentDate. ' + 7 days'));
			if($task['end_date'] < $currentDate){
				$task['my_task_section'] = 'overdue';
				$myTaskColumn['overdue'] = $task;
			}elseif($task['end_date'] == $currentDate){
				$task['my_task_section'] = 'today';
				$myTaskColumn['today'] = $task;
			}elseif($task['end_date'] > $currentDate && $task['end_date'] <= $next7Days){
				$task['my_task_section'] = 'nextSevenDays';
				$myTaskColumn['nextSevenDays'] = $task;
			}else{
				$task['my_task_section'] = 'upcoming';
				$myTaskColumn['upcoming'] = $task;
			}
			return new WP_REST_Response(['status'=>200, 'message'=>'Task created successfully', 'data'=>$task, 'column'=> $column, 'myTaskColumn'=>$myTaskColumn ], 200);
		}
		return new WP_Error('not_found', 'Task not found.', array('status' => 404));
	}

	public function update(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		// Sanitize and validate the input data
		$id = $request->get_param('id');
		$requestData = $request->get_json_params();
		$members = isset($requestData['members']) && sizeof($requestData['members'])> 0 ? $requestData['members'] : [];

		if($id == null || $id == ''){
			return new WP_Error('required_fields', 'Please ensure all required fields are provided.', array('status' => 400));
		}
		$prevTask = $this->getTaskById($id);

		if(!$prevTask){
			return new WP_Error('not_found', 'Task not found.', array('status' => 404));
		}

		$prevTaskMembers = $prevTask['members'];
		$prevTaskMembersId = sizeof($prevTaskMembers) > 0 ? array_column($prevTaskMembers, 'id'):[];

		// Start a transaction
		$db->query('START TRANSACTION');

		$submittedData = [];

		$properties = [];

		if(isset($requestData['name'])){
			$submittedData['name'] = sanitize_text_field($requestData['name']);

			if($prevTask['name'] != $submittedData['name']){
				$properties['old']['name'] = $prevTask['name'];
				$properties['attributes']['name'] = $submittedData['name'];
			}
		}

		if(isset($requestData['parent'])){
			$submittedData['parent_id'] = isset($requestData['parent']) && $requestData['parent'] != "" ? (int)$requestData['parent']['id'] : null;

			if($prevTask['parent_id'] != $submittedData['parent_id']){
				$properties['old']['parent_id'] = $prevTask['parent_id'];
				$properties['attributes']['parent_id'] = $submittedData['parent_id'];
			}
		}
		if(isset($requestData['project_id'])){
			$submittedData['project_id'] = isset($requestData['project_id']) && $requestData['project_id'] != "" ? (int)$requestData['project_id'] : null;

			if($prevTask['project_id'] != $submittedData['project_id']){
				$properties['old']['project_id'] = $prevTask['project_id'];
				$properties['attributes']['project_id'] = $submittedData['project_id'];
			}
		}
		if(isset($requestData['task_section_id'])){
			$submittedData['section_id'] = isset($requestData['task_section_id']) && $requestData['task_section_id'] != "" ? (int)$requestData['task_section_id'] : null;

			if($prevTask['section_id'] != $submittedData['section_id']){
				$properties['old']['section_id'] = $prevTask['section_id'];
				$properties['attributes']['section_id'] = $submittedData['section_id'];
			}
		}
		if(isset($requestData['priority'])){
			$submittedData['priority_id'] = $requestData['priority'] != "" ? (int)$requestData['priority']['id'] : null;

			if($prevTask['priority_id'] != $submittedData['priority_id']){
				$properties['old']['priority_id'] = (int)$prevTask['priority_id'];
				$properties['old']['priority_name'] = isset( $prevTask['priority']) && $prevTask['priority'] ? $prevTask['priority']['name'] : '';
				$properties['attributes']['priority_id'] = (int)$submittedData['priority_id'];
				$properties['attributes']['priority_name'] = $requestData['priority'] ? $requestData['priority']['name'] : '';
			}
		}
		if(isset($requestData['assigned_to'])){
			$submittedData['assigned_to'] = isset($requestData['assigned_to']) && $requestData['assigned_to'] != "" ? $requestData['assigned_to']['id'] : null;

			if($prevTask['assignedTo_id'] != $submittedData['assigned_to']){
				$properties['old']['assigned_to'] = (int)$prevTask['assigned_to']['id'];
				$properties['old']['assignedTo_name'] = $prevTask['assigned_to']['name'];
				$properties['attributes']['assigned_to'] = (int)$submittedData['assigned_to'];
				$properties['attributes']['assignedTo_name'] = $requestData['assigned_to'] != "" ? $requestData['assigned_to']['name'] : '';
			}
		}
		if(isset($requestData['description'])){
			$submittedData['description'] = sanitize_textarea_field($requestData['description']);

			if($prevTask['description'] != $submittedData['description']){
				$properties['old']['description'] = $prevTask['description'];
				$properties['attributes']['description'] = $submittedData['description'];
			}
		}
		if(isset($requestData['status'])){
			$submittedData['status'] = sanitize_text_field($requestData['status']);
		}
		if(isset($requestData['start_date'])){
			$submittedData['start_date'] = $requestData['start_date']!=''? gmdate('Y-m-d H:i:s', strtotime($requestData['start_date'])): null;
		}
		if(isset($requestData['end_date'])){
			$submittedData['end_date'] = $requestData['end_date']!=''? gmdate('Y-m-d', strtotime($requestData['end_date'])): null;

			if($prevTask['end_date'] != $submittedData['end_date']){
				$properties['old']['end_date'] = $prevTask['end_date'];
				$properties['attributes']['end_date'] = $submittedData['end_date'];
			}
		}



		// Update the task in the database
		if(sizeof($submittedData)>0){
			if(isset($requestData['updated_by'])){
				$submittedData['updated_by'] = isset($requestData['updated_by']) && $requestData['updated_by'] != "" ? (int)$requestData['updated_by'] : null;
			}
			$submittedData['updated_at'] = gmdate('Y-m-d H:i:s');

			$taskTable = LAZYTASK_TABLE_PREFIX . 'tasks';
			$taskUpdated = $db->update(
				$taskTable,
				$submittedData,
				array('id' => $id)
			);

			// Check if the task was updated successfully
			if (!$taskUpdated) {
				// Rollback the transaction
				$db->query('ROLLBACK');
				return new WP_Error('db_update_error', 'Could not update task in the database.', array('status' => 500));
			}
		}

		// Update the task members in the database
		if(sizeof($members)>0){

			$loggedInUserId = isset($requestData['updated_by']) && $requestData['updated_by']!="" ? $requestData['updated_by'] : null;
			$loggedInUser = get_user_by('ID', $loggedInUserId);

			$taskMembersTable = LAZYTASK_TABLE_PREFIX . 'task_members';
			$db->delete($taskMembersTable, array('task_id' => $id));
			$updatedAt = gmdate('Y-m-d H:i:s');
			$createdAt = gmdate('Y-m-d H:i:s');
			foreach ( $members as $member ) {

				if((int)$member['id']==0){
					$db->query('ROLLBACK');
					return new WP_Error('db_update_error', 'Could not update task member in the database.', array('status' => 500));
				}
				$memberInserted = $db->insert($taskMembersTable, array(
					"task_id" => $id,
					"user_id" => (int)$member['id'],
					"created_at" => $createdAt,
					"updated_at" => $updatedAt,
				));

				if (!$memberInserted) {
					// Rollback the transaction
					$db->query('ROLLBACK');
					return new WP_Error('db_update_error', 'Could not update task member in the database.', array('status' => 500));
				}

				$assigned_to_id = isset($prevTask['assigned_to']) && $prevTask['assigned_to'] != "" ? $prevTask['assigned_to']['id'] : null;

				if($assigned_to_id && !in_array($member['id'], $prevTaskMembersId) && $member['id'] == $loggedInUserId){
					$assignedToName = isset($prevTask['assigned_to']) && $prevTask['assigned_to'] != "" ? $prevTask['assigned_to']['name'] : null;

					$memberName = $members[array_search($member['id'], array_column($members, 'id'))]['name'];

					$referenceInfo = ['id'=>$id, 'name'=>$prevTask['name'], 'type'=>'task'];
					$placeholdersArray = ['member_name' => $assignedToName, 'task_name'=>$prevTask['name'], 'creator_name'=> $memberName];

					do_action('lazytask_task_follow_by_own', $referenceInfo, ['web-app', 'email'], [$assigned_to_id], $placeholdersArray);
				}elseif(!in_array($member['id'], $prevTaskMembersId) && $member['id'] != $loggedInUserId){
					$memberName = $members[array_search($member['id'], array_column($members, 'id'))]['name'];

					$referenceInfo = ['id'=>$id, 'name'=>$prevTask['name'], 'type'=>'task'];
					$placeholdersArray = ['member_name' => $memberName, 'task_name'=>$prevTask['name'], 'creator_name'=> $loggedInUser ? $loggedInUser->display_name : ''];

					do_action('lazytask_task_follow_to_other', $referenceInfo, ['web-app', 'email'], [$member['id']], $placeholdersArray);
				}
			}
		}

		$createdBy = isset($requestData['updated_by']) && $requestData['updated_by'] != "" ? (int)$requestData['updated_by'] : null;
		$created_at = gmdate('Y-m-d H:i:s');

		if( sizeof($properties) > 0 ) {
			$activityLogArg = [
				"user_id" => $createdBy,
				"subject_id" => $id,
				"subject_name" => 'task',
				"subject_type" => isset($prevTask['parent']) && $prevTask['parent'] ? 'sub-task':'task',
				"event" => 'updated',
				"properties" => wp_json_encode($properties),
				"created_at" => $created_at,
			];
			$activitiesLogTable = LAZYTASK_TABLE_PREFIX . 'activity_log';

			$db->insert($activitiesLogTable, $activityLogArg);
		}
		// Commit the transaction
		$db->query('COMMIT');

		$task = $this->getTaskById($id);

		if(isset($requestData['assigned_to'])){

			$assigned_to_id = isset($requestData['assigned_to']) && $requestData['assigned_to'] != "" ? $requestData['assigned_to']['id'] : null;

			if($prevTask['assignedTo_id'] != $assigned_to_id){
				$assignedToName = isset($requestData['assigned_to']) && $requestData['assigned_to'] != "" ? $requestData['assigned_to']['name'] : null;
				$loggedInUserId = isset($requestData['updated_by']) && $requestData['updated_by']!='' ? (int)$requestData['updated_by'] : null;
				$loggedInUser = get_user_by('ID', $loggedInUserId);

				$referenceInfo = ['id'=>$task['id'], 'name'=>$task['name'], 'type'=>'task'];
				$placeholdersArray = [
					'member_name'=>$assignedToName,
					'task_name'=>$task['name'],
					'project_name' => isset($task['project']['name']) ? $task['project']['name']:'',
					'creator_name'=>$loggedInUser?$loggedInUser->display_name:''
				];

				do_action('lazytask_task_assigned_member',  $referenceInfo, ['web-app', 'email'], [$task['assignedTo_id']], $placeholdersArray);
			}
		}

		if(isset($requestData['end_date'])){
			$submittedData['end_date'] = $requestData['end_date']!=''? gmdate('Y-m-d', strtotime($requestData['end_date'])): null;

			if($prevTask['end_date'] != $submittedData['end_date']){
				$assignedToName = isset($task['assigned_to']) && $task['assigned_to'] != "" ? $task['assigned_to']['name'] : null;
				$loggedInUserId = isset($requestData['updated_by']) && $requestData['updated_by']!='' ? (int)$requestData['updated_by'] : null;
				$loggedInUser = get_user_by('ID', $loggedInUserId);

				$referenceInfo = ['id'=>$task['id'], 'name'=>$task['name'], 'type'=>'task'];
				$placeholdersArray = [
					'member_name'=>$assignedToName,
					'task_name'=>$task['name'],
					'project_name' => isset($task['project']['name']) ? $task['project']['name']:'',
					'previous_assigned_date' => $prevTask['end_date'],
					'new_assigned_date' => $submittedData['end_date'],
					'creator_name'=>$loggedInUser?$loggedInUser->display_name:''
				];
				if($task['assignedTo_id']){
					do_action('lazytask_task_deadline_changed',  $referenceInfo, ['web-app', 'email'], [$task['assignedTo_id']], $placeholdersArray);
				}

			}
		}

		if($task){
			$column[$task['section_slug']] = $task;
			$myTaskColumn = [];
			$currentDate = gmdate('Y-m-d');
			$next7Days = gmdate('Y-m-d', strtotime($currentDate. ' + 7 days'));
			if($task['end_date'] < $currentDate){
				$task['my_task_section'] = 'overdue';
				$myTaskColumn['overdue'] = $task;
			}elseif($task['end_date'] == $currentDate){
				$task['my_task_section'] = 'today';
				$myTaskColumn['today'] = $task;
			}elseif($task['end_date'] > $currentDate && $task['end_date'] <= $next7Days){
				$task['my_task_section'] = 'nextSevenDays';
				$myTaskColumn['nextSevenDays'] = $task;
			}else{
				$task['my_task_section'] = 'upcoming';
				$myTaskColumn['upcoming'] = $task;
			}
			return new WP_REST_Response(['status'=>200, 'message'=>'Task updated successfully', 'data'=>$task, 'column'=> $column, 'myTaskColumn'=>$myTaskColumn, 'loggedUserID'=>$createdBy ], 200);
		}
		return new WP_Error('not_found', 'Task not found.', array('status' => 404));
	}


	public function updateTaskSortOrder(WP_REST_Request $request){
		global $wpdb;

		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$tableTasks = LAZYTASK_TABLE_PREFIX . 'tasks';


		$requestData = $request->get_json_params();

		$project_id = $requestData['project_id'];
		$orderedList = $requestData['orderedList'];
		$updated_at = gmdate('Y-m-d H:i:s');
		$updated_by = isset($requestData['updated_by']) && $requestData['updated_by'] != "" ? (int)$requestData['updated_by'] : null;

		$entityId = $orderedList && isset($orderedList['draggableId'])?$orderedList['draggableId']:null;
		$destinationSlug = $orderedList && isset($orderedList['destination']['droppableId'])?$orderedList['destination']['droppableId']:null;
		$sourceSlug = $orderedList && isset($orderedList['source']['droppableId'])?$orderedList['source']['droppableId']:null;
		$type = $orderedList && isset($orderedList['type'])?$orderedList['type']:'';
		$sortOrder = $orderedList && isset($orderedList['destination']['index'])?$orderedList['destination']['index']:0;
		$updateColumnData = $orderedList && isset($orderedList['updateColumnData'])?$orderedList['updateColumnData']:[];

		if(!$project_id){
			return new WP_Error('required_fields', 'Please ensure all required fields are provided.', array('status' => 400));
		}

		if($entityId && $destinationSlug){
			$db->query('START TRANSACTION');
			if($type=="SUBTASK"){

				if($destinationSlug != $sourceSlug){
					$destinationParentTask = $this->getParentTaskBySlug($destinationSlug, $project_id);
					$destinationParentTaskId = $destinationParentTask  ? $destinationParentTask['id']: '';
					if($destinationParentTaskId){
						$db->update(
							$tableTasks,
							array(
								"parent_id" => (int)$destinationParentTaskId,
								"section_id" => (int)$destinationParentTask['section_id'],
								"sort_order" => (int)$sortOrder,
								"updated_at" => $updated_at,
								"updated_by" => $updated_by,
							),
							array( 'project_id' => $project_id, 'id' => $entityId )
						);
					}
				}

			}else{
				if($destinationSlug != $sourceSlug){

					$prevTask = $this->getTaskById($entityId);

					$destinationSection = $this->getTaskSectionsByProjectId($project_id);
					$destinationSectionId = $destinationSection && isset($destinationSection[$destinationSlug]) ? $destinationSection[$destinationSlug]['id']: '';
					$destinationSectionName = $destinationSection && isset($destinationSection[$destinationSlug]) ? $destinationSection[$destinationSlug]['name']: '';
					$destinationSectionMarkIsComplete = $destinationSection && isset($destinationSection[$destinationSlug]) && $destinationSection[$destinationSlug]['mark_is_complete'] == 'complete' ? 'COMPLETED': 'ACTIVE';
					if($destinationSectionId){
						$db->update(
							$tableTasks,
							array(
								"section_id" => (int)$destinationSectionId,
								"sort_order" => (int)$sortOrder,
								"updated_at" => $updated_at,
								"updated_by" => $updated_by,
								"status" => $destinationSectionMarkIsComplete,
							),
							array( 'project_id' => $project_id, 'id' => $entityId )
						);

						$createdBy = isset($requestData['updated_by']) && $requestData['updated_by'] != "" ? (int)$requestData['updated_by'] : null;
						$created_at = gmdate('Y-m-d H:i:s');

						$properties = [];

						$properties['old']['section_id'] = $prevTask['task_section_id'];
						$properties['old']['section_name'] = $prevTask['section_name'];

						$properties['attributes']['section_id'] = $destinationSectionId;
						$properties['attributes']['section_name'] = $destinationSectionName;

						if( sizeof($properties) > 0 ) {
							$activityLogArg = [
								"user_id" => $createdBy,
								"subject_id" => $entityId,
								"subject_name" => 'task',
								"subject_type" => isset($prevTask['parent']) && $prevTask['parent'] ? 'sub-task':'task',
								"event" => 'updated',
								"properties" => wp_json_encode($properties),
								"created_at" => $created_at,
							];

							$db->insert(self::TABLE_ACTIVITY_LOG, $activityLogArg);
						}
					}
				}

			}

			if(sizeof($updateColumnData)>0){

				if($destinationSlug == $sourceSlug){
					if(isset($updateColumnData[$destinationSlug]) && sizeof($updateColumnData[$destinationSlug])>0){
						foreach ($updateColumnData[$destinationSlug] as $sortOrder => $value) {
							$db->update(
								$tableTasks,
								array(
									"sort_order" => (int)$sortOrder,
									"updated_at" => $updated_at,
									"updated_by" => $updated_by,
								),
								array( 'project_id' => $project_id, 'id' => $value['id'] )
							);
						}
					}

				}elseif ($destinationSlug != $sourceSlug){
					if(isset($updateColumnData[$destinationSlug]) && sizeof($updateColumnData[$destinationSlug])>0){
						foreach ($updateColumnData[$destinationSlug] as $sortOrder => $value) {
							$db->update(
								$tableTasks,
								array(
									"sort_order" => (int)$sortOrder,
									"updated_at" => $updated_at,
									"updated_by" => $updated_by,
								),
								array( 'project_id' => $project_id, 'id' => $value['id'] )
							);
						}
					}

					if(isset($updateColumnData[$sourceSlug]) && sizeof($updateColumnData[$sourceSlug])>0){
						foreach ($updateColumnData[$sourceSlug] as $sortOrder => $value) {
							$db->update(
								$tableTasks,
								array(
									"sort_order" => (int)$sortOrder,
									"updated_at" => $updated_at,
									"updated_by" => $updated_by,
								),
								array( 'project_id' => $project_id, 'id' => $value['id'] )
							);
						}
					}
				}
			}


			$db->query('COMMIT');

		}

		return new WP_REST_Response(['status'=>200, 'message'=>'Success','data' => $updateColumnData], 200);

	}

	public function getTasksByProjectId($projectId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$allResults = $db->get_results($db->prepare("SELECT tasks.id as taskId, tasks.name as taskName, tasks.slug as taskSlug, tasks.description as taskDescription, tasks.status as taskStatus, tasks.created_at as taskCreatedAt, tasks.updated_at as taskUpdatedAt, tasks.start_date as start_date, tasks.end_date as end_date, tasks.parent_id as parentId, tasks.sort_order as sortOrder, 
       projects.company_id as companyId, projects.id as projectId, projects.name as projectName, projects.code as projectCode, projects.slug as projectSlug, projects.status as projectStatus, 
       taskSections.id as sectionId, taskSections.name as sectionName, taskSections.slug as sectionSlug,
       assignedTo.ID as assignedToId, assignedTo.display_name as assignedToName, assignedTo.user_email as assignedToEmail, assignedTo.user_login as assignedToUsername, assignedTo.user_registered as assignedToCreatedAt,
       priority.id as priorityId, priority.name as priorityName, priority.color_code as color_code, priority.sort_order as sort_order,
	   taskParent.id as taskParentId, taskParent.name as taskParentName, taskParent.slug as taskParentSlug, taskParent.description as taskParentDescription, taskParent.status as taskParentStatus, taskParent.created_at as taskParentCreatedAt, taskParent.sort_order as parentSortOrder
FROM {$wpdb->prefix}pms_tasks as tasks
    JOIN {$wpdb->prefix}pms_projects as projects ON tasks.project_id = projects.id
    JOIN {$wpdb->prefix}pms_task_sections as taskSections ON tasks.section_id = taskSections.id
    LEFT JOIN {$wpdb->prefix}users as assignedTo ON tasks.assigned_to = assignedTo.ID
    LEFT JOIN {$wpdb->prefix}pms_project_priorities as priority ON tasks.priority_id = priority.id
	LEFT JOIN {$wpdb->prefix}pms_tasks as taskParent ON tasks.parent_id = taskParent.id
         WHERE tasks.deleted_at IS NULL AND projects.id = %d order by tasks.sort_order ASC", (int)$projectId), ARRAY_A);


		$returnArray = null;
		if ($allResults){
			$parentResults = array_filter($allResults, function($item)  {
				return $item['parentId'] == '' && $item['parentId'] == null;
			});

			$tasksId = array_column($allResults, 'taskId');
			$taskMembers = $this->getTaskMembers($tasksId);

			$taskComments = $this->getCommentsByTaskId($tasksId, 'task');

			$taskActivityLogs = $this->getActivityLogsByTaskId($tasksId, 'task');

			$taskAttachments = $this->getAttachmentsByTaskId($tasksId, 'task');

			$taskTags = $this->getTaskTagsByTaskId($tasksId);

			$childResults = array_filter($allResults, function($item)  {
				return $item['parentId'] != '' && $item['parentId'] != null;
			});

			$childArray = [];
			if($childResults){
				foreach ($childResults as $value) {
					$parentId = $value['parentId'];

					$assignedTo = null;
					if($value['assignedToId']){
						$assignedTo = [
							'id' => $value['assignedToId'],
							'name' => $value['assignedToName'],
							'email' => $value['assignedToEmail'],
							'username' => $value['assignedToUsername'],
							'created_at' => $value['assignedToCreatedAt'],
							'avatar' => Lazytask_UserController::getUserAvatar($value['assignedToId']),
						];
					}
					$priority = null;
					if($value['priorityId']){
						$priority = [
							'id' => $value['priorityId'],
							'name' => $value['priorityName'],
							'project_id' => $value['projectId'],
							'color_code' => $value['color_code'],
							'sort_order' => $value['sort_order'],
						];
					}

					$childArray[$parentId][] = [
						'id' => $value['taskId'],
						'task_section_id' => $value['sectionId'],
						'section_slug' => $value['sectionSlug'],
						'section_name' => trim($value['sectionName']),
						'name' => $value['taskName'],
						'slug' => $value['taskSlug'],
						'description' => $value['taskDescription'],
						'sort_order' => $value['sortOrder'],
						'assigned_to' => $assignedTo,
						'assignedTo_id' => $value['assignedToId'],
						'start_date'=> $value['start_date'],
						'end_date'=> $value['end_date'],
						'status'=> $value['taskStatus'],
						'priority_id'=> $value['priorityId'],
						'priority'=> $priority,
						'parent'=> [
							'id' => $value['taskParentId'],
							'name' => $value['taskParentName'],
							'slug' => $value['taskParentSlug'],
							'description' => $value['taskParentDescription']
						],
						'created_at'=> $value['taskCreatedAt'],
						'updated_at'=> $value['taskUpdatedAt'],
						'members' => isset($taskMembers[ $value['taskId'] ]) ? $taskMembers[ $value['taskId'] ] :[],
						'comments' => isset($taskComments[ $value['taskId'] ]) && sizeof($taskComments[ $value['taskId'] ]) > 0 ? $taskComments[ $value['taskId'] ] :[],
						'logActivities' => isset($taskActivityLogs[ $value['taskId'] ]) && sizeof($taskActivityLogs[ $value['taskId'] ]) > 0 ? $taskActivityLogs[ $value['taskId'] ] :[],
						'attachments' => isset($taskAttachments[ $value['taskId'] ]) && sizeof($taskAttachments[ $value['taskId'] ]) > 0 ? $taskAttachments[ $value['taskId'] ] :[],
						'tags' => isset($taskTags[ $value['taskId'] ]) && sizeof($taskTags[ $value['taskId'] ]) > 0 ? $taskTags[ $value['taskId'] ] :[],
					];

					$returnArray['taskData'][$value['taskId']]= [
						'id' => $value['taskId'],
						'project_id'=> $value['projectId'],
						'task_section_id' => $value['sectionId'],
						'section_slug' => $value['sectionSlug'],
						'section_name' => trim($value['sectionName']),
						'name' => $value['taskName'],
						'slug' => $value['taskSlug'],
						'description' => $value['taskDescription'],
						'sort_order' => $value['sortOrder'],
						'assigned_to' => $assignedTo,
						'assignedTo_id' => $value['assignedToId'],
						'start_date'=> $value['start_date'],
						'end_date'=> $value['end_date'],
						'status'=> $value['taskStatus'],
						'priority_id'=> $value['priorityId'],
						'priority'=> $priority,
						'parent'=> [
							'id' => $value['taskParentId'],
							'name' => $value['taskParentName'],
							'slug' => $value['taskParentSlug'],
							'description' => $value['taskParentDescription']
						],
						'created_at'=> $value['taskCreatedAt'],
						'updated_at'=> $value['taskUpdatedAt'],
						'members' => isset($taskMembers[ $value['taskId'] ]) ? $taskMembers[ $value['taskId'] ] :[],
						'comments' => isset($taskComments[ $value['taskId'] ]) && sizeof($taskComments[ $value['taskId'] ]) > 0 ? $taskComments[ $value['taskId'] ] :[],
						'logActivities' => isset($taskActivityLogs[ $value['taskId'] ]) && sizeof($taskActivityLogs[ $value['taskId'] ]) > 0 ? $taskActivityLogs[ $value['taskId'] ] :[],
						'attachments' => isset($taskAttachments[ $value['taskId'] ]) && sizeof($taskAttachments[ $value['taskId'] ]) > 0 ? $taskAttachments[ $value['taskId'] ] :[],
						'tags' => isset($taskTags[ $value['taskId'] ]) && sizeof($taskTags[ $value['taskId'] ]) > 0 ? $taskTags[ $value['taskId'] ] :[],
					];
				}
			}

			foreach ( $parentResults as $key => $result ) {

				$assignedTo = null;
				if($result['assignedToId']){
					$assignedTo = [
						'id' => $result['assignedToId'],
						'name' => $result['assignedToName'],
						'email' => $result['assignedToEmail'],
						'username' => $result['assignedToUsername'],
						'created_at' => $result['assignedToCreatedAt'],
						'avatar' => Lazytask_UserController::getUserAvatar($result['assignedToId']),
					];
				}
				$priority = null;
				if($result['priorityId']){
					$priority = [
						'id' => $result['priorityId'],
						'name' => $result['priorityName'],
						'project_id' => $result['projectId'],
						'color_code' => $result['color_code'],
						'sort_order' => $result['sort_order'],
					];
				}

				$returnArray['sectionData'][$result['sectionSlug']][] = [
					'id' => $result['taskId'],
					'project_id'=> $result['projectId'],
					'task_section_id' => $result['sectionId'],
					'section_slug' => $result['sectionSlug'],
					'section_name' => trim($result['sectionName']),
					'name' => $result['taskName'],
					'slug' => $result['taskSlug'],
					'description' => $result['taskDescription'],
					'sort_order' => $result['sortOrder'],
					'assigned_to' => $assignedTo,
					'assignedTo_id' => $result['assignedToId'],
					'start_date'=> $result['start_date'],
					'end_date'=> $result['end_date'],
					'status'=> $result['taskStatus'],
					'priority_id'=> $result['priorityId'],
					'priority'=> $priority,
					'parent'=> null,
					'created_at'=> $result['taskCreatedAt'],
					'updated_at'=> $result['taskUpdatedAt'],
					'members' => isset($taskMembers[ $result['taskId'] ]) ? $taskMembers[ $result['taskId'] ] :[],
					'children' => isset($childArray[ $result['taskId'] ]) && sizeof($childArray[ $result['taskId'] ])>0 ? $childArray[ $result['taskId'] ] :[],
					'comments' => isset($taskComments[ $result['taskId'] ]) && sizeof($taskComments[ $result['taskId'] ]) > 0 ? $taskComments[ $result['taskId'] ] :[],
					'logActivities' => isset($taskActivityLogs[ $result['taskId'] ]) && sizeof($taskActivityLogs[ $result['taskId'] ]) > 0 ? $taskActivityLogs[ $result['taskId'] ] :[],
					'attachments' => isset($taskAttachments[ $result['taskId'] ]) && sizeof($taskAttachments[ $result['taskId'] ]) > 0 ? $taskAttachments[ $result['taskId'] ] :[],
					'tags' => isset($taskTags[ $result['taskId'] ]) && sizeof($taskTags[ $result['taskId'] ]) > 0 ? $taskTags[ $result['taskId'] ] :[],
				];

				$returnArray['taskData'][$result['taskId']]= [
					'id' => $result['taskId'],
					'project_id'=> $result['projectId'],
					'task_section_id' => $result['sectionId'],
					'section_slug' => $result['sectionSlug'],
					'section_name' => trim($result['sectionName']),
					'name' => $result['taskName'],
					'slug' => $result['taskSlug'],
					'description' => $result['taskDescription'],
					'sort_order' => $result['sortOrder'],
					'assigned_to' => $assignedTo,
					'assignedTo_id' => $result['assignedToId'],
					'start_date'=> $result['start_date'],
					'end_date'=> $result['end_date'],
					'status'=> $result['taskStatus'],
					'priority_id'=> $result['priorityId'],
					'priority'=> $priority,
					'parent'=> null,
					'created_at'=> $result['taskCreatedAt'],
					'updated_at'=> $result['taskUpdatedAt'],
					'members' => isset($taskMembers[ $result['taskId'] ]) ? $taskMembers[ $result['taskId'] ] :[],
					'children' => isset($childArray[ $result['taskId'] ]) && sizeof($childArray[ $result['taskId'] ])>0 ? $childArray[ $result['taskId'] ] :[],
					'comments' => isset($taskComments[ $result['taskId'] ]) && sizeof($taskComments[ $result['taskId'] ]) > 0 ? $taskComments[ $result['taskId'] ] :[],
					'logActivities' => isset($taskActivityLogs[ $result['taskId'] ]) && sizeof($taskActivityLogs[ $result['taskId'] ]) > 0 ? $taskActivityLogs[ $result['taskId'] ] :[],
					'attachments' => isset($taskAttachments[ $result['taskId'] ]) && sizeof($taskAttachments[ $result['taskId'] ]) > 0 ? $taskAttachments[ $result['taskId'] ] :[],
					'tags' => isset($taskTags[ $result['taskId'] ]) && sizeof($taskTags[ $result['taskId'] ]) > 0 ? $taskTags[ $result['taskId'] ] :[],
				];

				$returnArray['childData'][$result['taskSlug']] = isset($childArray[ $result['taskId'] ]) && sizeof($childArray[ $result['taskId'] ])>0 ? $childArray[ $result['taskId'] ] :[];
			}
		}
		return $returnArray;
	}

	public function getTaskSectionsByProjectId($projectId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$taskSectionsTable = LAZYTASK_TABLE_PREFIX . 'task_sections';
		$results = $db->get_results($db->prepare("SELECT * FROM {$wpdb->prefix}pms_task_sections WHERE project_id = %d order by sort_order ASC", (int)$projectId), ARRAY_A);
		$arrayReturn = [];
		if ($results){
			foreach ( $results as $result ) {
				$arrayReturn[$result['slug']] = [
					'id' => $result['id'],
					'name' => $result['name'],
					'slug' => $result['slug'],
					'sort_order' => $result['sort_order'],
					'mark_is_complete' => $result['mark_is_complete'],
				];
			}
		}

		return $arrayReturn;
	}


	private function getTaskMembers($tasksId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$usersTable = $wpdb->prefix . 'users';
		$taskMembersTable = self::TABLE_TASK_MEMBERS;

		if (is_array($tasksId)) {
			$ids = implode(', ', array_fill(0, count($tasksId), '%s'));
		}else{
			$ids = '%s';
			$tasksId = [$tasksId];
		}

		$sql = "SELECT * FROM `{$wpdb->prefix}users` as users
			JOIN `{$wpdb->prefix}pms_task_members` as taskMembers  ON users.ID = taskMembers.user_id 
		WHERE taskMembers.task_id IN ($ids)";

		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), $tasksId));

		$results = $db->get_results(
			$query, ARRAY_A);

		$returnArray = [];
		if($results){
			foreach ($results as $key => $value) {
				$returnArray[$value['task_id']][] = [
					'id' => $value['ID'],
					'name' => $value['display_name'],
					'email' => $value['user_email'],
					'username' => $value['user_login'],
					'created_at' => $value['user_registered'],
					'avatar' => Lazytask_UserController::getUserAvatar($value['ID']),
				];
			}
		}
		return $returnArray;
	}

	public function show(WP_REST_Request $request){

		$taskId = $request->get_param('id');

		$task = $this->getTaskById($taskId);

		if($task){
			$column[$task['section_slug']] = $task;
			$myTaskColumn = [];
			$currentDate = gmdate('Y-m-d');
			$next7Days = gmdate('Y-m-d', strtotime($currentDate. ' + 7 days'));
			if($task['end_date'] < $currentDate){
				$task['my_task_section'] = 'overdue';
				$myTaskColumn['overdue'] = $task;
			}elseif($task['end_date'] == $currentDate){
				$task['my_task_section'] = 'today';
				$myTaskColumn['today'] = $task;
			}elseif($task['end_date'] > $currentDate && $task['end_date'] <= $next7Days){
				$task['my_task_section'] = 'nextSevenDays';
				$myTaskColumn['nextSevenDays'] = $task;
			}else{
				$task['my_task_section'] = 'upcoming';
				$myTaskColumn['upcoming'] = $task;
			}
			return new WP_REST_Response(['status'=>200, 'message'=>'Project show successfully', 'data'=>$task, 'column'=> $column, 'myTaskColumn'=>$myTaskColumn ], 200);
		}
		return new WP_Error('not_found', 'Task not found.', array('status' => 404));

	}

	public function delete(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$taskId = $request->get_param('id');
		$requestData = $request->get_json_params();

		$type = isset($requestData['type']) && $requestData['type'] ? $requestData['type']:'task';
		$deleted_at = gmdate('Y-m-d H:i:s');
		$deleted_by = isset($requestData['deleted_by']) && $requestData['deleted_by'] != "" ? (int)$requestData['deleted_by'] : null;

		$tableTasks = LAZYTASK_TABLE_PREFIX . 'tasks';
		// task soft delete by task id
		$db->query('START TRANSACTION');
		$taskDeleted = $db->update(
			$tableTasks,
			array(
				"deleted_at" => $deleted_at,
				"deleted_by" => $deleted_by,
			),
			array( 'id' => $taskId )
		);

		if (!$taskDeleted) {
			// Rollback the transaction
			$db->query('ROLLBACK');
			return new WP_Error('db_update_error', 'Could not delete task in the database.', array('status' => 500));
		}
		// activity log for task delete
		$properties['attributes'] = [
			'deleted_by' => $deleted_by,
			'deleted_at' => $deleted_at,
			'type' => $type, // 'task' or 'sub-task'
			'status' => 0,
		];
		$activityLogArg = [
			"user_id" => $deleted_by,
			"subject_id" => $taskId,
			"subject_name" => 'task',
			"subject_type" => $type,
			"event" => 'deleted',
			"properties" => wp_json_encode($properties),
			"created_at" => $deleted_at,
		];
		$activitiesLogTable = LAZYTASK_TABLE_PREFIX . 'activity_log';
		$db->insert($activitiesLogTable, $activityLogArg);

		// Commit the transaction
		$db->query('COMMIT');

		$task = $this->getTaskById($taskId);

		if($task){
			$column[$task['section_slug']] = $task;
			$myTaskColumn = [];
			$currentDate = gmdate('Y-m-d');
			$next7Days = gmdate('Y-m-d', strtotime($currentDate. ' + 7 days'));
			if($task['end_date'] < $currentDate){
				$task['my_task_section'] = 'overdue';
				$myTaskColumn['overdue'] = $task;
			}elseif($task['end_date'] == $currentDate){
				$task['my_task_section'] = 'today';
				$myTaskColumn['today'] = $task;
			}elseif($task['end_date'] > $currentDate && $task['end_date'] <= $next7Days){
				$task['my_task_section'] = 'nextSevenDays';
				$myTaskColumn['nextSevenDays'] = $task;
			}else{
				$task['my_task_section'] = 'upcoming';
				$myTaskColumn['upcoming'] = $task;
			}
			return new WP_REST_Response(['status'=>200, 'message'=>'Task deleted successfully', 'data'=>$task, 'task'=>$task, 'column'=> $column, 'myTaskColumn'=>$myTaskColumn ], 200);
		}
		return new WP_Error('not_found', 'Task not found.', array('status' => 404));

	}

	public function getTaskById($taskId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		if($taskId == ''){
			return [];
		}

		$result = $db->get_row($db->prepare("SELECT tasks.id as taskId, tasks.name as taskName, tasks.slug as taskSlug, tasks.description as taskDescription, tasks.status as taskStatus, tasks.created_at as taskCreatedAt, tasks.updated_at as taskUpdatedAt, tasks.start_date as start_date, tasks.end_date as end_date, tasks.parent_id as parentId, 
       projects.company_id as companyId, projects.id as projectId, projects.name as projectName, projects.code as projectCode, projects.slug as projectSlug, projects.status as projectStatus, 
       taskSections.id as sectionId, taskSections.name as sectionName, taskSections.slug as sectionSlug,
       assignedTo.ID as assignedToId, assignedTo.display_name as assignedToName, assignedTo.user_email as assignedToEmail, assignedTo.user_login as assignedToUsername, assignedTo.user_registered as assignedToCreatedAt,
       priority.id as priorityId, priority.name as priorityName, priority.color_code as color_code, priority.sort_order as sort_order,
	   taskParent.id as taskParentId, taskParent.name as taskParentName, taskParent.slug as taskParentSlug, taskParent.description as taskParentDescription, taskParent.status as taskParentStatus, taskParent.created_at as taskParentCreatedAt,
	   parentTaskSections.id as parentTaskSectionId, parentTaskSections.name as parentTaskSectionName, parentTaskSections.slug as parentTaskSectionSlug
	FROM {$wpdb->prefix}pms_tasks as tasks
    JOIN {$wpdb->prefix}pms_projects as projects ON tasks.project_id = projects.id
    JOIN {$wpdb->prefix}pms_task_sections as taskSections ON tasks.section_id = taskSections.id
    LEFT JOIN {$wpdb->prefix}users as assignedTo ON tasks.assigned_to = assignedTo.ID
    LEFT JOIN {$wpdb->prefix}pms_project_priorities as priority ON tasks.priority_id = priority.id
	LEFT JOIN {$wpdb->prefix}pms_tasks as taskParent ON tasks.parent_id = taskParent.id
	LEFT JOIN {$wpdb->prefix}pms_task_sections as parentTaskSections ON taskParent.section_id = parentTaskSections.id
         WHERE tasks.id = %d LIMIT 1", $taskId), ARRAY_A);
		$returnArray = [];
		if($result){
			$taskMembers = $this->getTaskMembers($taskId);
			$subTasks = $this->getSubTasksByTaskId($taskId);

			$taskComments = $this->getCommentsByTaskId($taskId, 'task');

			$taskActivityLogs = $this->getActivityLogsByTaskId($taskId, 'task');

			$taskAttachments = $this->getAttachmentsByTaskId($taskId, 'task');

			$taskTags = $this->getTaskTagsByTaskId($taskId);

			$projectObj = new Lazytask_ProjectController();

			$project = $projectObj->getProjectById($result['projectId']);

			$parent = null;
			if($result['taskParentId']){
				$parent = [
					'id' => $result['taskParentId'],
					'name' => $result['taskParentName'],
					'slug' => $result['taskParentSlug'],
					'description' => $result['taskParentDescription'],
					'task_section_id' => $result['parentTaskSectionId'],
					'section_name' => trim($result['parentTaskSectionName']),
					'section_slug' => $result['parentTaskSectionSlug'],
				];
			}
			$assignedTo = null;
			if($result['assignedToId']){
				$assignedTo = [
					'id' => $result['assignedToId'],
					'name' => $result['assignedToName'],
					'email' => $result['assignedToEmail'],
					'username' => $result['assignedToUsername'],
					'created_at' => $result['assignedToCreatedAt'],
					'avatar' => Lazytask_UserController::getUserAvatar($result['assignedToId']),
				];
			}
			$priority = null;
			if($result['priorityId']){
				$priority = [
					'id' => $result['priorityId'],
					'name' => $result['priorityName'],
					'project_id' => $result['projectId'],
					'color_code' => $result['color_code'],
					'sort_order' => $result['sort_order'],
				];
			}


			$returnArray = [
				'id' => $result['taskId'],
				'project_id' => $result['projectId'],
				'project' => $project,
				'task_section_id' => $result['sectionId'],
				'section_slug' => $result['sectionSlug'],
				'section_name' => trim($result['sectionName']),
				'name' => $result['taskName'],
				'slug' => $result['taskSlug'],
				'description' => $result['taskDescription'],
				'assignedTo_id' => $result['assignedToId'],
				'assigned_to' => $assignedTo,
				'start_date'=> $result['start_date'],
				'end_date'=> $result['end_date'],
				'status'=> $result['taskStatus'],
				'priority_id'=> $result['priorityId'],
				'priority'=> $priority,
				'parent'=>$parent,
				'created_at'=> $result['taskCreatedAt'],
				'updated_at'=> $result['taskUpdatedAt'],
				'members' => isset($taskMembers[ $result['taskId'] ]) ? $taskMembers[ $result['taskId'] ] :[],
				'children' => isset($subTasks[ $result['taskId'] ]['child']) ? $subTasks[ $result['taskId'] ]['child'] :[],
				'comments' => isset($taskComments[ $result['taskId'] ]) && sizeof($taskComments[ $result['taskId'] ]) > 0 ? $taskComments[ $result['taskId'] ] :[],
				'logActivities' => isset($taskActivityLogs[ $result['taskId'] ]) && sizeof($taskActivityLogs[ $result['taskId'] ]) > 0 ? $taskActivityLogs[ $result['taskId'] ] :[],
				'attachments' => isset($taskAttachments[ $result['taskId'] ]) && sizeof($taskAttachments[ $result['taskId'] ]) > 0 ? $taskAttachments[ $result['taskId'] ] :[],
				'tags' => isset($taskTags[ $result['taskId'] ]) && sizeof($taskTags[ $result['taskId'] ]) > 0 ? $taskTags[ $result['taskId'] ] :[],
			];
		}
		return $returnArray;
	}

	private function getSubTasksByTaskId($taskId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$sql = "SELECT tasks.id as taskId, tasks.name as taskName, tasks.slug as taskSlug, tasks.description as taskDescription, tasks.status as taskStatus, tasks.created_at as taskCreatedAt, tasks.updated_at as taskUpdatedAt, tasks.start_date as start_date, tasks.end_date as end_date, tasks.parent_id as parentId, 
	   projects.company_id as companyId, projects.id as projectId, projects.name as projectName, projects.code as projectCode, projects.slug as projectSlug, projects.status as projectStatus, 
	   taskSections.id as sectionId, taskSections.name as sectionName, taskSections.slug as sectionSlug,
	   assignedTo.ID as assignedToId, assignedTo.display_name as assignedToName, assignedTo.user_email as assignedToEmail, assignedTo.user_login as assignedToUsername, assignedTo.user_registered as assignedToCreatedAt,
	   priority.id as priorityId, priority.name as priorityName, priority.color_code as color_code, priority.sort_order as sort_order,
	   taskParent.id as taskParentId, taskParent.name as taskParentName, taskParent.slug as taskParentSlug, taskParent.description as taskParentDescription, taskParent.status as taskParentStatus, taskParent.created_at as taskParentCreatedAt,
	   parentTaskSections.id as parentTaskSectionId, parentTaskSections.name as parentTaskSectionName, parentTaskSections.slug as parentTaskSectionSlug
	FROM {$wpdb->prefix}pms_tasks as tasks
	JOIN {$wpdb->prefix}pms_projects as projects ON tasks.project_id = projects.id
	JOIN {$wpdb->prefix}pms_task_sections as taskSections ON tasks.section_id = taskSections.id
	LEFT JOIN {$wpdb->prefix}users as assignedTo ON tasks.assigned_to = assignedTo.ID
	LEFT JOIN {$wpdb->prefix}pms_project_priorities as priority ON tasks.priority_id = priority.id
	LEFT JOIN {$wpdb->prefix}pms_tasks as taskParent ON tasks.parent_id = taskParent.id
	LEFT JOIN {$wpdb->prefix}pms_task_sections as parentTaskSections ON taskParent.section_id = parentTaskSections.id
	 WHERE tasks.parent_id IS NOT NULL AND tasks.deleted_at IS NULL AND tasks.parent_id = %d";
		$results = $db->get_results($db->prepare($sql, $taskId), ARRAY_A);
		$returnArray = [];
		if ($results){

			$tasksId = array_column($results, 'taskId');
			$taskMembers = $this->getTaskMembers($tasksId);

			foreach ($results as $result) {
				$parentId = $result['parentId'];
				$assignedTo = null;
				if($result['assignedToId']){
					$assignedTo = [
						'id' => $result['assignedToId'],
						'name' => $result['assignedToName'],
						'email' => $result['assignedToEmail'],
						'username' => $result['assignedToUsername'],
						'created_at' => $result['assignedToCreatedAt'],
						'avatar' => Lazytask_UserController::getUserAvatar($result['assignedToId']),
					];
				}

				$priority = null;
				if($result['priorityId']){
					$priority = [
						'id' => $result['priorityId'],
						'name' => $result['priorityName'],
						'project_id' => $result['projectId'],
						'color_code' => $result['color_code'],
						'sort_order' => $result['sort_order'],
					];
				}


				$returnArray[$parentId]['child'][] = [
					'id' => $result['taskId'],
					'project_id' => $result['projectId'],
					'task_section_id' => $result['sectionId'],
					'section_name' => trim($result['sectionName']),
					'section_slug' => $result['sectionSlug'],
					'name' => $result['taskName'],
					'slug' => $result['taskSlug'],
					'description' => $result['taskDescription'],
					'assigned_to' => $assignedTo,
					'assignedTo_id' => $result['assignedToId'],
					'start_date'=> $result['start_date'],
					'end_date'=> $result['end_date'],
					'status'=> $result['taskStatus'],
					'priority_id'=> $result['priorityId'],
					'priority'=> $priority,
					'parent'=> [
						'id' => $result['taskParentId'],
						'name' => $result['taskParentName'],
						'slug' => $result['taskParentSlug'],
						'description' => $result['taskParentDescription'],
						'task_section_id' => $result['parentTaskSectionId'],
						'section_name' => trim($result['parentTaskSectionName']),
						'section_slug' => $result['parentTaskSectionSlug'],
					],
					'created_at'=> $result['taskCreatedAt'],
					'updated_at'=> $result['taskUpdatedAt'],
					'members' => isset($taskMembers[ $result['taskId'] ]) ? $taskMembers[ $result['taskId'] ] :[],
				];

			}

		}
		return $returnArray;
	}

	public function getParentTaskBySlug($slug, $projectId) {
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$tableTask = LAZYTASK_TABLE_PREFIX . 'tasks';
		$tableProjects = LAZYTASK_TABLE_PREFIX . 'projects';

		$task = $db->get_row($db->prepare("SELECT task.id, task.name, task.slug, task.sort_order, task.section_id, projects.name as project_name, projects.id as project_id FROM `{$wpdb->prefix}pms_tasks` as task
		 JOIN `{$wpdb->prefix}pms_projects` as projects ON task.project_id = projects.id
		 WHERE task.slug = %s and projects.id=%d", $slug, $projectId), ARRAY_A);

		if($task){
			return $task;
		}

		return null;

	}


	public function createTaskSection(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$requestData = $request->get_json_params();
		$name = $requestData['name'];
		$projectId = $requestData['project_id'];

		$submittedData = [];
		$submittedData['name'] = sanitize_text_field($requestData['name']);
		$submittedData['project_id'] = isset($requestData['project_id']) && $requestData['project_id'] != "" ? (int)$requestData['project_id'] : null;
		$submittedData['sort_order'] = isset($requestData['sort_order']) && $requestData['sort_order'] != "" ? (int)$requestData['sort_order'] : 999;
		$submittedData['created_at'] = gmdate('Y-m-d H:i:s');
		$submittedData['updated_at'] = gmdate('Y-m-d H:i:s');
		$submittedData['created_by'] = isset($requestData['created_by']) && $requestData['created_by'] != "" ? (int)$requestData['created_by'] : null;


		$tableTaskSection = LAZYTASK_TABLE_PREFIX . 'task_sections';

		// generate uuid
		$generateUUID = wp_generate_uuid4();
		$slug = Lazytask_SlugGenerator::slug( $generateUUID, $tableTaskSection, 'slug' );
		$submittedData['slug'] = $slug;

		if($name == ''){
			return new WP_Error('required_fields', 'Please enter name.', array('status' => 400));
		}
		if($projectId == ''){
			return new WP_Error('required_fields', 'Please select project.', array('status' => 400));
		}

		$db->insert($tableTaskSection, $submittedData);
		$taskSectionId = $wpdb->insert_id;
		$taskSection = $this->getTaskSectionById($taskSectionId);
		if($taskSection){
			$returnArray['taskSections'] = $taskSection['slug'];
			$returnArray['tasks'][$taskSection['slug']] = [];
			$returnArray['taskListSectionsName'][$taskSection['slug']] = ['id'=> $taskSection['id'], 'name' => $taskSection['name'], 'slug' => $taskSection['slug'], 'sort_order' => $taskSection['sort_order'], 'mark_is_complete' => $taskSection['mark_is_complete'] ] ;
			return new WP_REST_Response(['status'=>200, 'message'=>'Success','data' => $returnArray], 200);
		}

	}

	public function updateTaskSection(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$requestData = $request->get_json_params();
		$id = $request->get_param('id');
		$name = sanitize_text_field($requestData['name']);
		$updated_at = gmdate('Y-m-d H:i:s');
		$updated_by = isset($requestData['updated_by']) && $requestData['updated_by'] != "" ? (int)$requestData['updated_by'] : null;

		$tableTaskSection = LAZYTASK_TABLE_PREFIX . 'task_sections';

		$db->query('START TRANSACTION');

		$taskSectionUpdated = $db->update(
			$tableTaskSection,
			array(
				"name" => $name,
				"updated_at" => $updated_at,
				"updated_by" => $updated_by,
			),
			array( 'id' => $id )
		);

		// Check if the task was updated successfully
		if (!$taskSectionUpdated) {
			// Rollback the transaction
			$db->query('ROLLBACK');
			return new WP_Error('db_update_error', 'Could not update task section in the database.', array('status' => 500));
		}

		$db->query('COMMIT');

		$taskSection = $this->getTaskSectionById($id);
		if($taskSection){
			$returnArray['taskSections'] = $taskSection['slug'];
			$returnArray['taskListSectionsName'][$taskSection['slug']] = ['id'=> $taskSection['id'], 'name' => $taskSection['name'], 'slug' => $taskSection['slug'], 'sort_order' => $taskSection['sort_order'], 'mark_is_complete' => $taskSection['mark_is_complete'] ] ;
			return new WP_REST_Response(['status'=>200, 'message'=>'Success','data' => $returnArray], 200);
		}
		return new WP_Error('not_found', 'Task section not found.', array('status' => 404));
	}

	public function markIsCompleteTaskSection(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$requestData = $request->get_json_params();
		$id = $request->get_param('id');
		$updated_at = gmdate('Y-m-d H:i:s');
		$updated_by = isset($requestData['updated_by']) && $requestData['updated_by'] != "" ? (int)$requestData['updated_by'] : null;

		$project_id = isset($requestData['project_id']) && $requestData['project_id'] != "" ? (int)$requestData['project_id'] : null;

		$markIsChecked = isset($requestData['markIsChecked']) && $requestData['markIsChecked'] ? 'complete' : 'regular';

		$tableTaskSection = LAZYTASK_TABLE_PREFIX . 'task_sections';

		$db->query('START TRANSACTION');

		$exitCheckMarkIsComplete = $db->get_row($db->prepare("SELECT * FROM {$tableTaskSection} WHERE mark_is_complete='complete' AND id != %d AND project_id = %d", $id, $project_id));
		if($exitCheckMarkIsComplete){
			//already exits
			return new WP_REST_Response(['status'=>'409', 'message' => 'Already mark is complete available', 'data' =>[]]);
			}


		$taskSectionUpdated = $db->update(
			$tableTaskSection,
			array(
				"mark_is_complete" => $markIsChecked,
				"updated_at" => $updated_at,
				"updated_by" => $updated_by,
			),
			array( 'id' => $id, 'project_id' => $project_id )
		);

		// Check if the task was updated successfully
		if (!$taskSectionUpdated) {
			// Rollback the transaction
			$db->query('ROLLBACK');
			return new WP_Error('db_update_error', 'Could not update task section in the database.', array('status' => 500));
		}

		//task status update by section mark is complete
		$taskTable = LAZYTASK_TABLE_PREFIX . 'tasks';
		$db->update(
			$taskTable,
			array(
				"status" => $markIsChecked=='complete' ? 'COMPLETED' : 'ACTIVE',
				"updated_at" => $updated_at,
				"updated_by" => $updated_by,
			),
			array( 'section_id' => $id, 'project_id'=> $project_id )
		);

		$db->query('COMMIT');

		$taskSection = $this->getTaskSectionById($id);
		if($taskSection){
			$returnArray['taskSections'] = $taskSection['slug'];
			$returnArray['taskListSectionsName'][$taskSection['slug']] = ['id'=> $taskSection['id'], 'name' => $taskSection['name'], 'slug' => $taskSection['slug'], 'sort_order' => $taskSection['sort_order'] , 'mark_is_complete' => $taskSection['mark_is_complete'] ] ;
			$returnArray['section'] = ['id'=> $taskSection['id'], 'name' => $taskSection['name'], 'slug' => $taskSection['slug'], 'sort_order' => $taskSection['sort_order'], 'mark_is_complete' => $taskSection['mark_is_complete'] ] ;
			return new WP_REST_Response(['status'=>200, 'message'=>'Success','data' => $returnArray], 200);
		}
		return new WP_Error('not_found', 'Task section not found.', array('status' => 404));
	}

	public function softDeleteTaskSection(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$requestData = $request->get_json_params();
		$id = $request->get_param('id');
		$deleted_at = gmdate('Y-m-d H:i:s');
		$deleted_by = isset($requestData['deleted_by']) && $requestData['deleted_by'] != "" ? (int)$requestData['deleted_by'] : null;

		$tableTaskSection = LAZYTASK_TABLE_PREFIX . 'task_sections';

		$db->query('START TRANSACTION');
		$taskSectionDeleted= false;
		if($id && $deleted_at && $deleted_by){
			$taskSectionDeleted = $db->update(
				$tableTaskSection,
				array(
					"deleted_at" => $deleted_at,
					"deleted_by" => $deleted_by,
				),
				array( 'id' => $id )
			);
		}

		// Check if the task was updated successfully
		if (!$taskSectionDeleted) {
			// Rollback the transaction
			$db->query('ROLLBACK');
			return new WP_Error('db_update_error', 'Could not delete task section in the database.', array('status' => 500));
		}

		// activity log for task delete
		$properties['attributes'] = [
			'deleted_by' => $deleted_by,
			'deleted_at' => $deleted_at,
			'status' => 0,
		];
		$activityLogArg = [
			"user_id" => $deleted_by,
			"subject_id" => $id,
			"subject_name" => 'section',
			"subject_type" => 'section',
			"event" => 'deleted',
			"properties" => wp_json_encode($properties),
			"created_at" => $deleted_at,
		];
		$activitiesLogTable = LAZYTASK_TABLE_PREFIX . 'activity_log';
		$db->insert($activitiesLogTable, $activityLogArg);

		$db->query('COMMIT');

		$taskSection = $this->getTaskSectionById($id);
		if($taskSection){
			$returnArray['taskSections'] = $taskSection['slug'];
			$returnArray['taskListSectionsName'][$taskSection['slug']] = ['id'=> $taskSection['id'], 'name' => $taskSection['name'], 'slug' => $taskSection['slug'], 'sort_order' => $taskSection['sort_order'], 'mark_is_complete' => $taskSection['mark_is_complete'] ] ;
			return new WP_REST_Response(['status'=>200, 'message'=>'Success','data' => $returnArray], 200);
		}
		return new WP_Error('not_found', 'Task section not found.', array('status' => 404));
	}

	public function updateSectionSortOrder(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$requestData = $request->get_json_params();

		$project_id = $requestData['project_id'];
		$orderedList = $requestData['orderedList'];
		$updated_at = gmdate('Y-m-d H:i:s');
		$updated_by = isset($requestData['updated_by']) && $requestData['updated_by'] != "" ? (int)$requestData['updated_by'] : null;

		$tableTaskSection = LAZYTASK_TABLE_PREFIX . 'task_sections';

		$db->query('START TRANSACTION');

		if($project_id && sizeof($orderedList)>0){
			foreach ($orderedList as $key => $value) {
				$db->update(
					$tableTaskSection,
					array(
						"sort_order" => (int)$key,
						"updated_at" => $updated_at,
						"updated_by" => $updated_by,
					),
					array( 'project_id' => $project_id, 'slug' => $value )
				);
			}
		}

		$db->query('COMMIT');

		return new WP_REST_Response(['status'=>200, 'message'=>'Success','data' => $orderedList], 200);
	}

	public function getTaskSectionById($taskSectionId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$taskSection = $db->get_row($db->prepare(
			"SELECT taskSection.id, taskSection.name, taskSection.slug, taskSection.sort_order, taskSection.mark_is_complete, projects.name as project_name, projects.id as project_id 
			FROM `{$wpdb->prefix}pms_task_sections` as taskSection
		 JOIN `{$wpdb->prefix}pms_projects` as projects ON taskSection.project_id = projects.id
		 WHERE taskSection.id = %d", $taskSectionId), ARRAY_A);

		if($taskSection){
			return $taskSection;
		}

		return null;
	}

	public function createComment(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		// Sanitize and validate the input data
		$requestData = $request->get_json_params();
		$content = sanitize_textarea_field($requestData['content']);
		$parentId = isset($requestData['parent_id']) && $requestData['parent_id'] != "" ? (int)$requestData['parent'] : null;
		$commentableId = isset($requestData['commentable_id']) && $requestData['commentable_id'] != "" ? (int)$requestData['commentable_id'] : null;
		$userId = isset($requestData['user_id']) && $requestData['user_id'] != "" ? (int)$requestData['user_id'] : null;
		$commentableType = isset($requestData['commentable_type']) && $requestData['commentable_type'] != "" ? $requestData['commentable_type'] : null;
		$created_at = gmdate('Y-m-d H:i:s');
		if (empty($content)) {
			return new WP_Error('required_fields', 'Please ensure all required fields are provided.', array('status' => 400));
		}

		if(empty($commentableId)){
			return new WP_Error('required_fields', 'Please ensure all required fields are provided.', array('status' => 400));
		}
		if(empty($userId)){
			return new WP_Error('required_fields', 'Please ensure all required fields are provided.', array('status' => 400));
		}

		// Start a transaction
		$db->query('START TRANSACTION');
	 $commentsTable = LAZYTASK_TABLE_PREFIX . 'comments';
		// Insert the task into the database
		$commentInserted = $db->insert(
			$commentsTable,
			array(
				"content" => $content,
				"parent_id" => $parentId,
				"commentable_id" => $commentableId,
				"commentable_type" => $commentableType,
				"user_id" => $userId,
				"created_at" => $created_at,
			)
		);

		// Check if the task was inserted successfully
		if (!$commentInserted) {
			// Rollback the transaction
			$db->query('ROLLBACK');
			return new WP_Error('db_insert_error', 'Could not insert comment into the database.', array('status' => 500));
		}

		$commentId = $wpdb->insert_id;

		// Commit the transaction
		$db->query('COMMIT');

		$task = $this->getTaskById($commentableId);
		if($task){
			$column[$task['section_slug']] = $task;
			$myTaskColumn = [];
			$currentDate = gmdate('Y-m-d');
			$next7Days = gmdate('Y-m-d', strtotime($currentDate. ' + 7 days'));
			if($task['end_date'] < $currentDate){
				$task['my_task_section'] = 'overdue';
				$myTaskColumn['overdue'] = $task;
			}elseif($task['end_date'] == $currentDate){
				$task['my_task_section'] = 'today';
				$myTaskColumn['today'] = $task;
			}elseif($task['end_date'] > $currentDate && $task['end_date'] <= $next7Days){
				$task['my_task_section'] = 'nextSevenDays';
				$myTaskColumn['nextSevenDays'] = $task;
			}else{
				$task['my_task_section'] = 'upcoming';
				$myTaskColumn['upcoming'] = $task;
			}
			$comment = $this->getCommentsById($commentId);
			return new WP_REST_Response(['status'=>200, 'message'=>'Comment created successfully', 'data'=>$comment, 'task'=>$task, 'column'=> $column, 'myTaskColumn'=>$myTaskColumn, 'loggedUserID'=>$userId ], 200);
		}

		/*$comment = $this->getCommentsById($commentId);
		if($comment){
			return new WP_REST_Response(['status'=>200, 'message'=>'Comment created successfully', 'data'=>$comment ], 200);
		}*/
		return new WP_Error('not_found', 'Task not found.', array('status' => 404));
	}

	// delete comment by id
	public function softDeleteComment(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$commentId = $request->get_param('id');
		$requestData = $request->get_json_params();

		$deleted_at = gmdate('Y-m-d H:i:s');
		$deleted_by = isset($requestData['deleted_by']) && $requestData['deleted_by'] != "" ? (int)$requestData['deleted_by'] : null;

		$tableComments = LAZYTASK_TABLE_PREFIX . 'comments';
		// task soft delete by task id
		$db->query('START TRANSACTION');
		$commentDeleted = $db->update(
			$tableComments,
			array(
				"deleted_at" => $deleted_at,
				"deleted_by" => $deleted_by,
			),
			array( 'id' => $commentId )
		);

		if (!$commentDeleted) {
			// Rollback the transaction
			$db->query('ROLLBACK');
			return new WP_Error('db_update_error', 'Could not delete comment in the database.', array('status' => 500));
		}
		// activity log for comment delete
		$properties['attributes'] = [
			'deleted_by' => $deleted_by,
			'deleted_at' => $deleted_at,
		];
		$activityLogArg = [
			"user_id" => $deleted_by,
			"subject_id" => $commentId,
			"subject_name" => 'comment',
			"subject_type" => 'comment',
			"event" => 'deleted',
			"properties" => wp_json_encode($properties),
			"created_at" => $deleted_at,
		];
		$activitiesLogTable = LAZYTASK_TABLE_PREFIX . 'activity_log';
		$db->insert($activitiesLogTable, $activityLogArg);
		// Commit the transaction
		$db->query('COMMIT');

		$comment = $this->getCommentsById($commentId);
		if($comment){
			$task = $this->getTaskById($comment['commentable_id']);
			if($task){
				$column[$task['section_slug']] = $task;
				$myTaskColumn = [];
				$currentDate = gmdate('Y-m-d');
				$next7Days = gmdate('Y-m-d', strtotime($currentDate. ' + 7 days'));
				if($task['end_date'] < $currentDate){
					$task['my_task_section'] = 'overdue';
					$myTaskColumn['overdue'] = $task;
				}elseif($task['end_date'] == $currentDate){
					$task['my_task_section'] = 'today';
					$myTaskColumn['today'] = $task;
				}elseif($task['end_date'] > $currentDate && $task['end_date'] <= $next7Days){
					$task['my_task_section'] = 'nextSevenDays';
					$myTaskColumn['next'] = $task;
				}else{
					$task['my_task_section'] = 'upcoming';
					$myTaskColumn['upcoming'] = $task;
				}
				return new WP_REST_Response(['status'=>200, 'message'=>'Comment deleted successfully', 'data'=>$comment, 'task'=>$task, 'column'=> $column, 'myTaskColumn'=>$myTaskColumn ], 200);
			}
		}
		return new WP_Error('not_found', 'Comment not found.', array('status' => 404));

	}


	public function getCommentsById($id){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$commentsTable = LAZYTASK_TABLE_PREFIX . 'comments';
		$usersTable = $wpdb->prefix . 'users';

		$row = $db->get_row($db->prepare(
			"SELECT comments.id, comments.content, comments.parent_id, comments.commentable_id, comments.commentable_type, comments.user_id, comments.created_at, comments.updated_at, users.display_name as user_name, users.user_email as user_email 
			FROM {$commentsTable} as comments
         JOIN {$usersTable} as users ON comments.user_id = users.ID
         WHERE comments.id = %d order by id DESC", (int)$id), ARRAY_A);
		$returnArray= [];
		if($row){
//			$row['children'] = $this->getCommentsByParentId($row['id']);

			$returnArray = [
				'id' => $row['id'],
				'content' => $row['content'],
				'parent_id' => $row['parent_id'],
				'commentable_id' => $row['commentable_id'],
				'commentable_type' => $row['commentable_type'],
				'user_id' => $row['user_id'],
				'user_name' => $row['user_name'],
				'user_email' => $row['user_email'],
				'created_at' => $row['created_at'],
				'updated_at' => $row['updated_at'],
				'children' => []
			];
		}

		return $returnArray;
	}

	public function getCommentsByTaskId($commentableId, $commentableType){

		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$commentsTable = LAZYTASK_TABLE_PREFIX . 'comments';
		$usersTable = $wpdb->prefix . 'users';

		if (is_array($commentableId)) {
			$ids = implode(', ', array_fill(0, count($commentableId), '%s'));
		}else{
			$ids = '%s';
			$commentableId = [$commentableId];
		}

		$sql = "SELECT comments.id, comments.content, comments.parent_id, comments.commentable_id, comments.commentable_type, comments.user_id, comments.created_at, comments.updated_at, users.display_name as user_name, users.user_email as user_email 
		FROM {$commentsTable} as comments
		 JOIN {$usersTable} as users ON comments.user_id = users.ID
		 WHERE comments.deleted_at IS NULL AND comments.deleted_by IS NULL AND comments.commentable_id IN ($ids) and comments.commentable_type = '{$commentableType}' order by comments.id DESC";

		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), $commentableId));

		$allResults = $db->get_results( $query, ARRAY_A);

		$returnArray = null;
		if ($allResults){
			$parentResults = array_filter($allResults, function($item)  {
				return $item['parent_id'] == '' && $item['parent_id'] == null;
			});

			$childResults = array_filter($allResults, function($item)  {
				return $item['parent_id'] != '' && $item['parent_id'] != null;
			});
			if($parentResults && sizeof($parentResults)>0){
				foreach ( $parentResults as $parent_result ) {
					$returnArray[$parent_result['commentable_id']][] = [
						'id' => $parent_result['id'],
						'content' => $parent_result['content'],
						'parent_id' => $parent_result['parent_id'],
						'commentable_id' => $parent_result['commentable_id'],
						'commentable_type' => $parent_result['commentable_type'],
						'user_id' => $parent_result['user_id'],
						'user_name' => $parent_result['user_name'],
						'user_email' => $parent_result['user_email'],
						'avatar' => Lazytask_UserController::getUserAvatar($parent_result['user_id']),
						'created_at' => $parent_result['created_at'],
						'updated_at' => $parent_result['updated_at'],
						'children' => $childResults && sizeof($childResults)>0 ? array_filter($childResults, function($item) use ($parent_result) {
							return $item['parent_id'] == $parent_result['id'];
						}) : [],
					];

				}
			}
		}
		return $returnArray;

	}

	public function getActivityLogsByTaskId($subjectId, $subjectName){

		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$activityLogTable = LAZYTASK_TABLE_PREFIX . 'activity_log';
		$usersTable = $wpdb->prefix . 'users';

		if (is_array($subjectId)) {
			$ids = implode(', ', array_fill(0, count($subjectId), '%s'));
		}else{
			$ids = '%s';
			$subjectId = [$subjectId];
		}

		$sql = "SELECT activityLog.id, activityLog.properties, activityLog.subject_id, activityLog.subject_name, activityLog.subject_type, activityLog.user_id, activityLog.event, activityLog.created_at, activityLog.updated_at, users.display_name as user_name, users.user_email as user_email FROM `{$activityLogTable}` as activityLog
		 JOIN `{$usersTable}` as users ON activityLog.user_id = users.ID
		 WHERE activityLog.subject_id IN ($ids) and activityLog.subject_name = '{$subjectName}' order by activityLog.id ASC";

		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), $subjectId));

		$allResults = $db->get_results($query, ARRAY_A);

		$returnArray = [];
		if($allResults && sizeof($allResults)>0){
			foreach ( $allResults as $all_result ) {
				$returnArray[$all_result['subject_id']][] = [
					'id' => $all_result['id'],
					'properties' => json_decode($all_result['properties'], true),
					'subject_id' => $all_result['subject_id'],
					'subject_name' => $all_result['subject_name'],
					'subject_type' => $all_result['subject_type'],
					'user_id' => $all_result['user_id'],
					'user_name' => $all_result['user_name'],
					'user_email' => $all_result['user_email'],
					'event' => $all_result['event'],
					'created_at' => $all_result['created_at'],
					'updated_at' => $all_result['updated_at'],
				];
			}
		}
		return $returnArray;

	}


	public function createAttachment(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		// Sanitize and validate the input data
		$requestData = $request->get_body_params();
		$requestFileData = $request->get_file_params();

		$taskId = $requestData['task_id'];
		$userId = $requestData['user_id'];
		$file_upload_response=[];

		if($taskId){
			require_once(ABSPATH . 'wp-admin/includes/file.php');
			require_once(ABSPATH . 'wp-admin/includes/image.php');
			if($requestFileData && sizeof($requestFileData)>0){
				$uploadedFiles = [];
				$count = 1;
				foreach ( $requestFileData as $file){
					$upload_overrides = array('test_form' => false);

					$moveFile = wp_handle_upload($file, $upload_overrides);

					if($moveFile){
						$attachment = array(
							'post_author' => $userId,
							'post_title' => $file['name'],
							'post_content' => '',
							'post_status' => 'inherit',
							'post_mime_type' => image_type_to_mime_type(exif_imagetype($moveFile['file']))
						);

						$attachment_id = wp_insert_attachment($attachment, $moveFile['file']);

						$attach_data = wp_generate_attachment_metadata($attachment_id, $moveFile['file']);
						wp_update_attachment_metadata($attachment_id, $attach_data);

						if($attachment_id){
							$tableAttachments = $wpdb->prefix. 'pms_attachments';
							$db->insert(
								$tableAttachments,
								array(
									'file_name'=>isset( $file['name']) ? $file['name']: null,
									'file_path'=>isset( $moveFile['url']) ? $moveFile['url']: null,
									'mine_type' => isset( $file['type']) ? $file['type']: null,
									'size' => isset( $file['size']) ? $file['size']: null,
									'wp_attachment_id' => $attachment_id,
									"subject_id" => $taskId,
									"subject_name" => 'task',
									"subject_type"=>'task',
									"user_id" => $userId,
									"created_at" => gmdate('Y-m-d H:i:s'),
								)
							);

							$uploadedFiles[] = isset( $file['name']) ? $count.'. '. $file['name']: null;
							$count++;
						}
					}

				}

				$argTask= [];
				$argTask['name'] = implode(', ', $uploadedFiles);
				$argTask['message'] = 'Attachment upload';
				$properties['attributes'] = $argTask;
				$created_at= gmdate('Y-m-d H:i:s');

				$activityLogArg = [
					"user_id" => $userId,
					"subject_id" => $taskId,
					"subject_name" => 'task',
					"subject_type" => 'task',
					"event" => 'attachment-upload',
					"properties" => wp_json_encode($properties),
					"created_at" => $created_at,
				];

				$activityLogInserted = $db->insert(self::TABLE_ACTIVITY_LOG, $activityLogArg);

			}

//			$attachments = $this->getAttachmentsByTaskId($taskId, 'task');
			$task = $this->getTaskById($taskId);
			if($task){
				$column[$task['section_slug']] = $task;
				$myTaskColumn = [];
				$currentDate = gmdate('Y-m-d');
				$next7Days = gmdate('Y-m-d', strtotime($currentDate. ' + 7 days'));
				if($task['end_date'] < $currentDate){
					$task['my_task_section'] = 'overdue';
					$myTaskColumn['overdue'] = $task;
				}elseif($task['end_date'] == $currentDate){
					$task['my_task_section'] = 'today';
					$myTaskColumn['today'] = $task;
				}elseif($task['end_date'] > $currentDate && $task['end_date'] <= $next7Days){
					$task['my_task_section'] = 'nextSevenDays';
					$myTaskColumn['nextSevenDays'] = $task;
				}else{
					$task['my_task_section'] = 'upcoming';
					$myTaskColumn['upcoming'] = $task;
				}
				return new WP_REST_Response(['status'=>200, 'message'=>'Attachment upload successfully', 'data'=>$task['attachments'], 'task'=>$task, 'column'=> $column, 'myTaskColumn'=>$myTaskColumn, 'loggedUserID'=>$userId ], 200);
			}

		}
		return new WP_Error('not_found', 'Task not found.', array('status' => 404));
	}

	//remove task attachment
	public function removeAttachment(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$id = $request->get_param('id');

		$userId = $request->get_param('deleted_by');
		$taskId = $request->get_param('task_id');
//		return new WP_REST_Response(['status'=>200, 'message'=>'Attachment remove successfully', 'data'=>$taskId, 'loggedUserID'=>$userId ], 200);

		$attachment = $this->getAttachmentById($id);
		if($attachment){
			$tableAttachments = $wpdb->prefix. 'pms_attachments';
			$db->delete($tableAttachments, array('id' => $id));

			wp_delete_attachment($attachment['wp_attachment_id'], true);

			$argTask= [];
			$argTask['name'] = $attachment['name'];
			$argTask['message'] = 'Attachment removed';
			$properties['attributes'] = $argTask;
			$created_at= gmdate('Y-m-d H:i:s');

			$activityLogArg = [
				"user_id" => $userId,
				"subject_id" => $taskId,
				"subject_name" => 'task',
				"subject_type" => 'task',
				"event" => 'attachment-removed',
				"properties" => wp_json_encode($properties),
				"created_at" => $created_at,
			];

			$activityLogInserted = $db->insert(self::TABLE_ACTIVITY_LOG, $activityLogArg);


			$task = $this->getTaskById($taskId);
			if($task){
				$column[$task['section_slug']] = $task;
				$myTaskColumn = [];
				$currentDate = gmdate('Y-m-d');
				$next7Days = gmdate('Y-m-d', strtotime($currentDate. ' + 7 days'));
				if($task['end_date'] < $currentDate){
					$task['my_task_section'] = 'overdue';
					$myTaskColumn['overdue'] = $task;
				}elseif($task['end_date'] == $currentDate){
					$task['my_task_section'] = 'today';
					$myTaskColumn['today'] = $task;
				}elseif($task['end_date'] > $currentDate && $task['end_date'] <= $next7Days){
					$task['my_task_section'] = 'nextSevenDays';
					$myTaskColumn['nextSevenDays'] = $task;
				}else{
					$task['my_task_section'] = 'upcoming';
					$myTaskColumn['upcoming'] = $task;
				}
				return new WP_REST_Response(['status'=>200, 'message'=>'Attachment remove successfully', 'data'=>$task['attachments'], 'task'=>$task, 'column'=> $column, 'myTaskColumn'=>$myTaskColumn, 'loggedUserID'=>$userId ], 200);
			}
		}
		return new WP_Error('not_found', 'Attachment not found.', array('status' =>''));
	}


	public function getAttachmentsByTaskId($taskId, $subjectName = 'task'){

		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$attachmentsTable = LAZYTASK_TABLE_PREFIX . 'attachments';
		$usersTable = $wpdb->prefix . 'users';

		if (is_array($taskId)) {
			$ids = implode(', ', array_fill(0, count($taskId), '%s'));
		}else{
			$ids = '%s';
			$taskId = [$taskId];
		}

		$sql = "SELECT attachments.id, attachments.file_name, attachments.file_path, attachments.mine_type, attachments.size, attachments.wp_attachment_id, attachments.subject_id, attachments.subject_name, attachments.subject_type, attachments.user_id, attachments.created_at, users.display_name as user_name, users.user_email as user_email FROM `{$attachmentsTable}` as attachments
		 JOIN `{$usersTable}` as users ON attachments.user_id = users.ID
		 WHERE attachments.subject_id IN ($ids) and attachments.subject_name = '{$subjectName}' order by attachments.id DESC";

		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), $taskId));

		$allResults = $db->get_results( $query, ARRAY_A);

		$returnArray = [];
		if ($allResults){
			foreach ( $allResults as $all_result ) {
				$returnArray[$all_result['subject_id']][] = [
					'id' => $all_result['id'],
					'name' => $all_result['file_name'],
					'file_path' => $all_result['file_path'],
					'mine_type' => $all_result['mine_type'],
					'size' => $all_result['size'],
					'wp_attachment_id' => $all_result['wp_attachment_id'],
					'subject_id' => $all_result['subject_id'],
					'subject_name' => $all_result['subject_name'],
					'subject_type' => $all_result['subject_type'],
					'user_id' => $all_result['user_id'],
					'user_name' => $all_result['user_name'],
					'user_email' => $all_result['user_email'],
					'created_at' => $all_result['created_at'],
				];
			}
		}
		return $returnArray;

	}
	// task attachment by id
	public function getAttachmentById($id){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$attachmentsTable = LAZYTASK_TABLE_PREFIX . 'attachments';
		$usersTable = $wpdb->prefix . 'users';

		$row = $db->get_row($db->prepare(
			"SELECT attachments.id, attachments.file_name, attachments.file_path, attachments.mine_type, attachments.size, attachments.wp_attachment_id, attachments.subject_id, attachments.subject_name, attachments.subject_type, attachments.user_id, attachments.created_at, users.display_name as user_name, users.user_email as user_email 
			FROM {$attachmentsTable} as attachments
		 JOIN {$usersTable} as users ON attachments.user_id = users.ID
		 WHERE attachments.id = %d order by id DESC", (int)$id), ARRAY_A);
		$returnArray= [];
		if($row){
			$returnArray = [
				'id' => $row['id'],
				'name' => $row['file_name'],
				'file_path' => $row['file_path'],
				'mine_type' => $row['mine_type'],
				'size' => $row['size'],
				'wp_attachment_id' => $row['wp_attachment_id'],
				'subject_id' => $row['subject_id'],
				'subject_name' => $row['subject_name'],
				'subject_type' => $row['subject_type'],
				'user_id' => $row['user_id'],
				'user_name' => $row['user_name'],
				'user_email' => $row['user_email'],
				'created_at' => $row['created_at'],
			];
		}

		return $returnArray;
	}

	public function tagAssignToTask( WP_REST_Request $request) {

		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$taskTagsTable = LAZYTASK_TABLE_PREFIX . 'task_tags';

		$requestData = $request->get_json_params();
		$tagName = sanitize_text_field($requestData['name']);
		$taskId = isset($requestData['task_id']) && $requestData['task_id'] != "" ? (int)$requestData['task_id'] : null;
		$userId = isset($requestData['user_id']) && $requestData['user_id'] != "" ? (int)$requestData['user_id'] : null;

		if($tagName){
			$tagObj = new Lazytask_TagController();
			$tag = $tagObj->tagGetOrCreate($requestData);
			$submittedData=[];
			if($tag && $taskId){
				$tagId = (int)$tag['id'];
				$existingTaskTag = $db->get_row($db->prepare("SELECT * FROM `{$wpdb->prefix}pms_task_tags` WHERE deleted_by IS NULL and deleted_at IS NULL and tag_id = %d and task_id = %d", $tagId, $taskId), ARRAY_A);
				if(!$existingTaskTag){
					$submittedData['tag_id']=$tag['id'];
					$submittedData['task_id']=$taskId;
					$submittedData['user_id']=$userId;
					$submittedData['created_at']=gmdate('Y-m-d H:i:s');
					$db->insert($taskTagsTable, $submittedData);
				}
				$task = $this->getTaskById($taskId);
				$taskTags = $task && isset($task['tags']) ? $task['tags'] : [];
				$myTaskColumn = [];
				if($task){
					$currentDate = gmdate('Y-m-d');
					$next7Days = gmdate('Y-m-d', strtotime($currentDate. ' + 7 days'));
					if($task['end_date'] < $currentDate){
						$task['my_task_section'] = 'overdue';
						$myTaskColumn['overdue'] = $task;
					}elseif($task['end_date'] == $currentDate){
						$task['my_task_section'] = 'today';
						$myTaskColumn['today'] = $task;
					}elseif($task['end_date'] > $currentDate && $task['end_date'] <= $next7Days){
						$task['my_task_section'] = 'nextSevenDays';
						$myTaskColumn['nextSevenDays'] = $task;
					}else{
						$task['my_task_section'] = 'upcoming';
						$myTaskColumn['upcoming'] = $task;
					}
				}

				return new WP_REST_Response(['status'=>200, 'message'=>'Tag assign successfully', 'data'=>$taskTags, 'task'=>$task, 'tag'=>$tag, 'myTaskColumn'=>$myTaskColumn ], 200);
			}

			return new WP_REST_Response(['status'=>200, 'message'=>'Tag assign successfully', 'data'=>[], 'task'=>null, 'tag'=>$tag ,'myTaskColumn'=>[] ], 200);

		}

		return new WP_REST_Response(['status'=>404, 'message'=>'Tag not found', 'data'=>[], 'task'=>null, 'tag'=> null, 'myTaskColumn'=>[]  ], 400);

	}

	public function tagRemoveFromTask( WP_REST_Request $request) {

		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$taskTagsTable = LAZYTASK_TABLE_PREFIX . 'task_tags';

		$requestData = $request->get_json_params();
		$tagName = sanitize_text_field($requestData['name']);
		$taskId = isset($requestData['task_id']) && $requestData['task_id'] != "" ? (int)$requestData['task_id'] : null;
		$userId = isset($requestData['user_id']) && $requestData['user_id'] != "" ? (int)$requestData['user_id'] : null;

		if($tagName){
			$tagObj = new Lazytask_TagController();
			$tag = $tagObj->tagGetOrCreate($requestData);
			if($tag && $taskId){
				$tagId = (int)$tag['id'];
				$existingTaskTag = $db->get_row($db->prepare("SELECT * FROM `{$wpdb->prefix}pms_task_tags` WHERE deleted_by IS NULL and deleted_at IS NULL and tag_id = %d and task_id = %d", $tagId, $taskId), ARRAY_A);
				if($existingTaskTag){
					$db->update(
						$taskTagsTable,
						array(
							"deleted_at" => gmdate('Y-m-d H:i:s'),
							"deleted_by" => $userId,
						),
						array( 'id' => (int)$existingTaskTag['id'] )
					);
				}
				$task = $this->getTaskById($taskId);
				$taskTags = $task && isset($task['tags']) ? $task['tags'] : [];
				$myTaskColumn = [];
				if($task){
					$currentDate = gmdate('Y-m-d');
					$next7Days = gmdate('Y-m-d', strtotime($currentDate. ' + 7 days'));
					if($task['end_date'] < $currentDate){
						$task['my_task_section'] = 'overdue';
						$myTaskColumn['overdue'] = $task;
					}elseif($task['end_date'] == $currentDate){
						$task['my_task_section'] = 'today';
						$myTaskColumn['today'] = $task;
					}elseif($task['end_date'] > $currentDate && $task['end_date'] <= $next7Days){
						$task['my_task_section'] = 'nextSevenDays';
						$myTaskColumn['nextSevenDays'] = $task;
					}else{
						$task['my_task_section'] = 'upcoming';
						$myTaskColumn['upcoming'] = $task;
					}
				}
				return new WP_REST_Response(['status'=>200, 'message'=>'Tag remove successfully', 'data'=>$taskTags, 'task'=>$task, 'tag'=>$tag, 'myTaskColumn'=>$myTaskColumn ], 200);
			}

			return new WP_REST_Response(['status'=>200, 'message'=>'Tag remove successfully', 'data'=>[], 'task'=>null, 'tag'=>$tag, 'myTaskColumn'=>[] ], 200);
		}

		return new WP_REST_Response(['status'=>404, 'message'=>'Tag not found', 'data'=>[], 'task'=>null, 'tag'=>null, 'myTaskColumn'=>[] ], 400);

	}

	public function getTaskTagsByTaskId( $taskId ) {

		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$tagsTable = LAZYTASK_TABLE_PREFIX . 'tags';
		$taskTagsTable = LAZYTASK_TABLE_PREFIX . 'task_tags';


		if(is_array($taskId)){
			$ids = implode(', ', array_fill(0, count($taskId), '%d'));
		}else{
			$ids = '%d';
			$taskId = [$taskId];
		}

		$sql = "SELECT taskTags.id as id, tags.id as tag_id, tags.name, taskTags.task_id
			FROM {$taskTagsTable} as taskTags
			JOIN {$tagsTable} as tags ON taskTags.tag_id=tags.id
			WHERE taskTags.deleted_at IS NULL AND taskTags.deleted_by IS NULL AND taskTags.task_id IN ($ids)";

		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), $taskId));

		$results = $db->get_results( $query, ARRAY_A);
		$arrayReturn = [];
		if ($results){
			foreach ( $results as $result ) {
				$arrayReturn[$result['task_id']][] = [
					'id' => $result['id'],
					'tag_id' => $result['tag_id'],
					'name' => $result['name'],
					'task_id' => $result['task_id'],
				];
			}
		}

		return $arrayReturn;
	}



	public function getTasksByAssignedUserId($userId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$allResults = $db->get_results($db->prepare("SELECT tasks.id as taskId, tasks.name as taskName, tasks.slug as taskSlug, tasks.description as taskDescription, tasks.status as taskStatus, tasks.created_at as taskCreatedAt, tasks.updated_at as taskUpdatedAt, tasks.start_date as start_date, tasks.end_date as end_date, tasks.parent_id as parentId, tasks.sort_order as sortOrder, 
       projects.company_id as companyId, projects.id as projectId, projects.name as projectName, projects.code as projectCode, projects.slug as projectSlug, projects.status as projectStatus, 
       taskSections.id as sectionId, taskSections.name as sectionName, taskSections.slug as sectionSlug,
       assignedTo.ID as assignedToId, assignedTo.display_name as assignedToName, assignedTo.user_email as assignedToEmail, assignedTo.user_login as assignedToUsername, assignedTo.user_registered as assignedToCreatedAt,
       priority.id as priorityId, priority.name as priorityName, priority.color_code as color_code, priority.sort_order as sort_order,
	   taskParent.id as taskParentId, taskParent.name as taskParentName, taskParent.slug as taskParentSlug, taskParent.description as taskParentDescription, taskParent.status as taskParentStatus, taskParent.created_at as taskParentCreatedAt, taskParent.sort_order as parentSortOrder
FROM {$wpdb->prefix}pms_tasks as tasks
    JOIN {$wpdb->prefix}pms_projects as projects ON tasks.project_id = projects.id
    JOIN {$wpdb->prefix}users as assignedTo ON tasks.assigned_to = assignedTo.ID
   	LEFT JOIN {$wpdb->prefix}pms_task_sections as taskSections ON tasks.section_id = taskSections.id
    LEFT JOIN {$wpdb->prefix}pms_project_priorities as priority ON tasks.priority_id = priority.id
	LEFT JOIN {$wpdb->prefix}pms_tasks as taskParent ON tasks.parent_id = taskParent.id
    WHERE tasks.deleted_at IS NULL AND assignedTo.ID = %d order by tasks.sort_order ASC", $userId), ARRAY_A);


		$returnArray = null;
		if ($allResults){
			$parentResults = array_filter($allResults, function($item)  {
				return $item['parentId'] == '' && $item['parentId'] == null;
			});

			$tasksId = array_column($allResults, 'taskId');

			$taskMembers = $this->getTaskMembers($tasksId);

			$taskComments = $this->getCommentsByTaskId($tasksId, 'task');

			$taskActivityLogs = $this->getActivityLogsByTaskId($tasksId, 'task');

			$taskAttachments = $this->getAttachmentsByTaskId($tasksId, 'task');

			$taskTags = $this->getTaskTagsByTaskId($tasksId);

			$childResults = array_filter($allResults, function($item)  {
				return $item['parentId'] != '' && $item['parentId'] != null;
			});

			$projectsId = array_unique(array_column($allResults, 'projectId'));

			$projectObj = new Lazytask_ProjectController();

			$projects = $projectObj->getProjectsByIds($projectsId);

			$childArray = [];
			if($childResults){
				foreach ($childResults as $value) {
					$parentId = $value['parentId'];
					$assignedTo = null;
					if($value['assignedToId']){
						$assignedTo = [
							'id' => $value['assignedToId'],
							'name' => $value['assignedToName'],
							'email' => $value['assignedToEmail'],
							'username' => $value['assignedToUsername'],
							'created_at' => $value['assignedToCreatedAt'],
							'avatar' => Lazytask_UserController::getUserAvatar($value['assignedToId']),
						];
					}
					$priority = null;
					if($value['priorityId']){
						$priority = [
							'id' => $value['priorityId'],
							'name' => $value['priorityName'],
							'project_id' => $value['projectId'],
							'color_code' => $value['color_code'],
							'sort_order' => $value['sort_order'],
						];
					}

					$childArray[$parentId][] = [
						'id' => $value['taskId'],
						'task_section_id' => $value['sectionId'],
						'section_slug' => $value['sectionSlug'],
						'section_name' => trim($value['sectionName']),
						'project_id'=> $value['projectId'],
						'project'=> $projects && isset($projects[$value['projectId']]) ? $projects[$value['projectId']]:[],
						'name' => $value['taskName'],
						'slug' => $value['taskSlug'],
						'description' => $value['taskDescription'],
						'sort_order' => $value['sortOrder'],
						'assigned_to' => $assignedTo,
						'assignedTo_id' => $value['assignedToId'],
						'start_date'=> $value['start_date'],
						'end_date'=> $value['end_date'],
						'status'=> $value['taskStatus'],
						'priority_id'=> $value['priorityId'],
						'priority'=> $priority,
						'parent'=> [
							'id' => $value['taskParentId'],
							'name' => $value['taskParentName'],
							'slug' => $value['taskParentSlug'],
							'description' => $value['taskParentDescription']
						],
						'created_at'=> $value['taskCreatedAt'],
						'updated_at'=> $value['taskUpdatedAt'],
						'members' => isset($taskMembers[ $value['taskId'] ]) ? $taskMembers[ $value['taskId'] ] :[],
						'comments' => isset($taskComments[ $value['taskId'] ]) && sizeof($taskComments[ $value['taskId'] ]) > 0 ? $taskComments[ $value['taskId'] ] :[],
						'logActivities' => isset($taskActivityLogs[ $value['taskId'] ]) && sizeof($taskActivityLogs[ $value['taskId'] ]) > 0 ? $taskActivityLogs[ $value['taskId'] ] :[],
						'attachments' => isset($taskAttachments[ $value['taskId'] ]) && sizeof($taskAttachments[ $value['taskId'] ]) > 0 ? $taskAttachments[ $value['taskId'] ] :[],
						'tags' => isset($taskTags[ $value['taskId'] ]) && sizeof($taskTags[ $value['taskId'] ]) > 0 ? $taskTags[ $value['taskId'] ] :[],
					];

				}
			}

			foreach ( $parentResults as $key => $result ) {

				$assignedTo = null;
				if($result['assignedToId']){
					$assignedTo = [
						'id' => $result['assignedToId'],
						'name' => $result['assignedToName'],
						'email' => $result['assignedToEmail'],
						'username' => $result['assignedToUsername'],
						'created_at' => $result['assignedToCreatedAt'],
						'avatar' => Lazytask_UserController::getUserAvatar($result['assignedToId']),
					];
				}
				$project = null;

				$priority = null;
				if($result['priorityId']){
					$priority = [
						'id' => $result['priorityId'],
						'name' => $result['priorityName'],
						'project_id' => $result['projectId'],
						'color_code' => $result['color_code'],
						'sort_order' => $result['sort_order'],
					];
				}

				$returnArray['data'][] = [
					'id' => $result['taskId'],
					'project_id'=> $result['projectId'],
					'project'=> $projects && isset($projects[$result['projectId']]) ? $projects[$result['projectId']]:[],
					'task_section_id' => $result['sectionId'],
					'section_slug' => $result['sectionSlug'],
					'section_name' => trim($result['sectionName']),
					'name' => $result['taskName'],
					'slug' => $result['taskSlug'],
					'description' => $result['taskDescription'],
					'sort_order' => $result['sortOrder'],
					'assigned_to' => $assignedTo,
					'assignedTo_id' => $result['assignedToId'],
					'start_date'=> $result['start_date'],
					'end_date'=> $result['end_date'],
					'status'=> $result['taskStatus'],
					'priority_id'=> $result['priorityId'],
					'priority'=> $priority,
					'parent'=> null,
					'created_at'=> $result['taskCreatedAt'],
					'updated_at'=> $result['taskUpdatedAt'],
					'members' => isset($taskMembers[ $result['taskId'] ]) ? $taskMembers[ $result['taskId'] ] :[],
					'children' => isset($childArray[ $result['taskId'] ]) && sizeof($childArray[ $result['taskId'] ])>0 ? $childArray[ $result['taskId'] ] :[],
					'comments' => isset($taskComments[ $result['taskId'] ]) && sizeof($taskComments[ $result['taskId'] ]) > 0 ? $taskComments[ $result['taskId'] ] :[],
					'logActivities' => isset($taskActivityLogs[ $result['taskId'] ]) && sizeof($taskActivityLogs[ $result['taskId'] ]) > 0 ? $taskActivityLogs[ $result['taskId'] ] :[],
					'attachments' => isset($taskAttachments[ $result['taskId'] ]) && sizeof($taskAttachments[ $result['taskId'] ]) > 0 ? $taskAttachments[ $result['taskId'] ] :[],
					'tags' => isset($taskTags[ $result['taskId'] ]) && sizeof($taskTags[ $result['taskId'] ]) > 0 ? $taskTags[ $result['taskId'] ] :[],
				];


				$returnArray['childData'][$result['taskSlug']] = isset($childArray[ $result['taskId'] ]) && sizeof($childArray[ $result['taskId'] ])>0 ? $childArray[ $result['taskId'] ] :[];
			}
		}
		return $returnArray;
	}

	public function getQuickTaskByUserId($userId) {

		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);


		$allResults = $db->get_results($db->prepare("SELECT * FROM {$wpdb->prefix}pms_quick_tasks as quick_tasks
         JOIN {$wpdb->prefix}users as users ON quick_tasks.user_id = users.ID
		 WHERE quick_tasks.status=1 AND quick_tasks.user_id = %d order by quick_tasks.sort_order ASC", (int)$userId), ARRAY_A);
		$returnArray = [];
		if($allResults){
			foreach ($allResults as $result) {
				$returnArray[] = [
					'id' => $result['id'],
					'name' => $result['name'],
					'user_id' => $result['user_id'],
					'user_name' => $result['display_name'],
					'sort_order' => $result['sort_order'],
					'status' => $result['status'],
					'created_at' => $result['created_at'],
					'updated_at' => $result['updated_at'],
				];
			}
		}
		return $returnArray;
	}

	public function getQuickTaskById( $id ) {
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$tasksTable = LAZYTASK_TABLE_PREFIX . 'quick_tasks';
		$userTable = $wpdb->prefix . 'users';

		$row = $db->get_row($db->prepare("SELECT * FROM {$tasksTable} as quick_tasks
		 JOIN {$userTable} as users ON quick_tasks.user_id = users.ID
		 WHERE quick_tasks.id = %d", (int)$id), ARRAY_A);
		if($row){
			return [
				'id' => $row['id'],
				'name' => $row['name'],
				'user_id' => $row['user_id'],
				'user_name' => $row['display_name'],
				'sort_order' => $row['sort_order'],
				'status' => $row['status'],
				'created_at' => $row['created_at'],
				'updated_at' => $row['updated_at'],
			];
		}
		return null;

	}

	public function quickTaskCreate(WP_REST_Request $request) {
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$requestData = $request->get_json_params();
		$name = sanitize_text_field($requestData['name']);
		$userId = isset($requestData['user_id']) && $requestData['user_id'] != "" ? (int)$requestData['user_id'] : null;
		$created_at = gmdate('Y-m-d H:i:s');
//		return new WP_REST_Response(['status'=>200, 'message'=>'Quick task created successfully', 'data'=>$requestData ], 200);

		if (empty($name)) {
			return new WP_Error('required_fields', 'Please ensure all required fields are provided.', array('status' => 400));
		}

		if(empty($userId)){
			return new WP_Error('required_fields', 'Please ensure all required fields are provided.', array('status' => 400));
		}

		$db->query('START TRANSACTION');

		$tableName = LAZYTASK_TABLE_PREFIX . 'quick_tasks';
		$quickTaskInserted = $db->insert(
			$tableName,
			array(
				"name" => $name,
				"user_id" => $userId,
				"created_at" => $created_at,
			)
		);

		if (!$quickTaskInserted) {
			$db->query('ROLLBACK');
			return new WP_Error('db_insert_error', 'Could not insert quick task into the database.', array('status' => 500));
		}

		$quickTaskId = $wpdb->insert_id;

		$db->query('COMMIT');

		$quickTask = $this->getQuickTaskById($quickTaskId);
		if($quickTask){
			return new WP_REST_Response(['status'=>200, 'message'=>'Quick task created successfully', 'data'=>$quickTask ], 200);
		}
		return new WP_Error('not_found', 'Quick task not found.', array('status' => 404));

	}

	//delete quick task
	public function quickTaskDelete(WP_REST_Request $request) {
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$id = $request->get_param('id');
        $userId = $request->get_param('deleted_by');

		$quickTask = $this->getQuickTaskById($id);
		if($quickTask){
			$tableName = LAZYTASK_TABLE_PREFIX . 'quick_tasks';
			$db->delete($tableName, array('id' => $id));
			return new WP_REST_Response(['status'=>200, 'message'=>'Quick task removed successfully', 'data'=>['id'=>$id], 'loggedUserID'=>$userId ], 200);
		}
		return new WP_Error('not_found', 'Quick task not found.', array('status' => 404));
	}

}