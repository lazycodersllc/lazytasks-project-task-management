<?php

namespace Lazytask\Controller;

use Lazytask\Helper\Lazytask_DatabaseQuerySchema;
use Lazytask\Helper\Lazytask_DatabaseTableSchema;
use Lazytask\Helper\Lazytask_SlugGenerator;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

final class Lazytask_ProjectController {

	const TABLE_PROJECTS = LAZYTASK_TABLE_PREFIX . 'projects';
	public function getAllProjects(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$projectsTable = LAZYTASK_TABLE_PREFIX . 'projects';
		$companyTable = LAZYTASK_TABLE_PREFIX . 'companies';

		$requestData = $request->get_params();

		$query = "SELECT projects.id, projects.name, projects.slug, projects.code,
				 projects.status, projects.company_id, company.name as companyName
				FROM {$projectsTable} as projects
				JOIN {$companyTable} as company ON projects.company_id = company.id
				WHERE projects.deleted_at IS NULL AND projects.status = %d";
		$companyId = null;
		// filter by company_id
		if(isset($requestData['company_id']) && $requestData['company_id'] != ''){
			$query .= " AND projects.company_id = %d";
			$companyId = (int)$requestData['company_id'];
			$prepared_query = $db->prepare($query, 1, $companyId);

		}else{
			$prepared_query = $db->prepare($query, 1);
		}


		$results = $db->get_results($prepared_query, ARRAY_A);

		$returnArray = [];
		if($results && count($results) > 0){
			$projectsId = array_column($results, 'id');
			$projectController = new Lazytask_ProjectController();
			$projectMembers = $projectController->getProjectMembers($projectsId);
			$projectTasks = $projectController->getNoOfTasksByProject($projectsId);
			$companyController = new Lazytask_CompanyController();
			$companyMembers = $companyController->getCompanyMembers(array_unique(array_column($results, 'company_id')));

			foreach ($results as $key => $value) {
				$returnArray[] = [
					'id' => $value['id'],
					'name' => $value['name'],
					'slug' => $value['slug'],
					'code' => $value['code'],
					'status' => $value['status'],
					'company_id' => $value['company_id'],
					'company_name' => $value['companyName'],
					'members' => isset($projectMembers[ $value['id'] ]) ? $projectMembers[ $value['id'] ] :[],
					'total_tasks' => isset($projectTasks[ $value['id'] ]) ? $projectTasks[ $value['id'] ] : '0',
					'parent' => ['id'=>$value['company_id'], 'name'=>$value['companyName'], 'members'=> isset($companyMembers[ $value['company_id'] ]) && sizeof($companyMembers[ $value['company_id'] ]) >0 ? $companyMembers[ $value['company_id'] ] :[]]
				];
			}
			return new WP_REST_Response(['status'=>200, 'message'=>'Success', 'data'=>$returnArray, 'requestData'=>$requestData], 200);
		}
		return new WP_REST_Response(['status'=>200, 'message'=>'No record found', 'data'=>$returnArray], 200);
	}
	const TABLE_PROJECT_MEMBERS = LAZYTASK_TABLE_PREFIX . 'projects_users';


	public function create(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$projectTable = LAZYTASK_TABLE_PREFIX.'projects';
		$requestData = $request->get_json_params();
		$name = sanitize_text_field($requestData['name']);
		$slug = Lazytask_SlugGenerator::slug($name, self::TABLE_PROJECTS, 'slug' );
		$code = $requestData['code'];
		$address = sanitize_textarea_field($requestData['address']);
		$owner_id = isset($requestData['owner_id']) && $requestData['owner_id']!="" ? $requestData['owner_id']: null;
		$companyId = $requestData['company_id'];
		$created_at = gmdate('Y-m-d H:i:s');
		$updated_at = gmdate('Y-m-d H:i:s');
		$members = isset($requestData['members']) && sizeof($requestData['members'])> 0 ? $requestData['members'] : [];
		$createdBy = isset($requestData['created_by']) && $requestData['created_by']!='' ? $requestData['created_by'] : null;

		$db->insert(
			$projectTable,
			array(
				"owner_id" => (int)$owner_id,
				"company_id" => (int)$companyId,
				"name" => $name,
				"slug" => $slug,
				"code" => $code,
				"address" => $address,
				"created_at" => $created_at,
				"updated_at" => $updated_at,
				'created_by' => (int)$createdBy,
				),
			[
				'%d',
				'%d',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%d'
			]
		);
		$project_id = $wpdb->insert_id;
		if($project_id){
			if(sizeof($members)>0){

				$loggedInUserId = isset($requestData['created_by']) && $requestData['created_by']!='' ? $requestData['created_by'] : null;
				$loggedInUser = get_user_by('ID', $loggedInUserId);
				$userController = new Lazytask_UserController();

				$uniqueMembers = array_unique( array_column( $members, 'id' ) );
				$projectMembersTable = LAZYTASK_TABLE_PREFIX.'projects_users';
				foreach ( $uniqueMembers as $member ) {
					$db->insert($projectMembersTable, [
						"project_id" => $project_id,
						"user_id" => (int)$member,
						"created_at" => $created_at,
						"updated_at" => $updated_at,
					],
						[
							'%d',
							'%d',
							'%s',
							'%s',
						]

					);
				}

				$memberName = $members[array_search($member, array_column($members, 'id'))]['name'];

				$roles = $userController->getRolesByUser((int)$member);

				$userHasRoles = isset($roles['roles']) && sizeof($roles['roles'])>0 ? array_unique($roles['roles']) : [];
				$rolesName = sizeof($userHasRoles) > 0 ? implode(', ', array_column($userHasRoles, 'name')) : '';

				$referenceInfo = ['id'=>$project_id, 'name'=>$name, 'type'=>'project'];
				$placeholdersArray = ['member_name' => $memberName, 'project_name'=>$name, 'creator_name'=> $loggedInUser ? $loggedInUser->display_name:'', 'member_roles'=>$rolesName];

				do_action('lazytask_project_assigned_member', $referenceInfo, ['web-app', 'email'], [$member], $placeholdersArray);

			}

			$defaultPriorities = ['Low', 'Medium', 'High'];
			$defaultColors = ['#00FF00', '#FFA500', '#dd4040'];
			$projectPrioritiesTable = LAZYTASK_TABLE_PREFIX.'project_priorities';
			foreach ($defaultPriorities as $key => $value) {
				$db->insert(
					$projectPrioritiesTable,
					array(
						"project_id" => $project_id,
						"name" => $value,
						"color_code" => $defaultColors[$key],
						"sort_order" => $key+1,
						"created_at" => $created_at,
						"updated_at" => $updated_at,
					),
					[
						'%d',
						'%s',
						'%s',
						'%d',
						'%s',
						'%s',
					]
				);
			}

			$properties['attributes'] = [
				'name' => $name,
				'slug' => $slug,
				'code' => $code,
				'address' => $address,
				'owner_id' => $owner_id,
				'company_id' => $companyId,
				'created_at' => $created_at,
			];
			$activityLogArg = [
				"user_id" => $createdBy,
				"subject_id" => $project_id,
				"subject_name" => 'project',
				"subject_type" => 'project',
				"event" => 'created',
				"properties" => wp_json_encode($properties),
				"created_at" => $created_at,
			];
			$activityLogTable = LAZYTASK_TABLE_PREFIX . 'activity_log';
			$db->insert($activityLogTable, $activityLogArg);

		}
		$data =  $this->getProjectById($project_id);
		if($data){
			return new WP_REST_Response(['status'=>200, 'message'=>'Project created successfully', 'data'=>$data], 200);
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'Project not found', 'data'=>null], 404);
	}

	public function update(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$projectTableName = LAZYTASK_TABLE_PREFIX . 'projects';

		// Sanitize and validate the input data
		$requestData = $request->get_json_params();

		$id = $request->get_param('id');
		if(!$id){
			return array('message' => 'Project ID is required');
		}
		$prevProject = $this->getProjectById($id);

		$prevProjectMembers = $prevProject['members'];
		$prevProjectMembersId = sizeof($prevProjectMembers) > 0 ? array_column($prevProjectMembers, 'id'):[];


		$submittedData = [];
		$properties = [];
		if(isset($requestData['name'])){
			$submittedData['name'] = $requestData['name']!="" ? sanitize_text_field($requestData['name']) : '';
			if($prevProject['name'] != $submittedData['name']){
				$properties['old']['name'] = $prevProject['name'];
				$properties['attributes']['name'] = $submittedData['name'];
			}
		}
		if(isset($requestData['code'])){
			$submittedData['code'] = $requestData['code']!="" ? sanitize_text_field($requestData['code']) : '';
		}
		if(isset($requestData['slug'])){
			$newSlug = Lazytask_SlugGenerator::slug($requestData['name'], self::TABLE_PROJECTS, 'slug' );
			$submittedData['slug'] = $requestData['slug']!="" ? sanitize_text_field($requestData['slug']) : $newSlug;
		}
		if(isset($requestData['address'])){
			$submittedData['address'] = $requestData['address']!="" ? sanitize_textarea_field($requestData['address']) : '';
		}
		if(isset($requestData['status'])){
			$submittedData['status'] = $requestData['status']!="" ? $requestData['status'] : null;
		}

		if(sizeof($submittedData)>0){
			$submittedData['updated_at'] = gmdate('Y-m-d H:i:s');
			$db->update(
				$projectTableName,
				$submittedData,
				array( 'id' => $id )
			);
		}
		$members = isset($requestData['members']) && sizeof($requestData['members'])> 0 ? $requestData['members'] : [];

		if(sizeof($members)>0){

			$loggedInUserId = isset($requestData['updated_by']) && $requestData['updated_by']!="" ? $requestData['updated_by'] : null;
			$loggedInUser = get_user_by('ID', $loggedInUserId);
			$userController = new Lazytask_UserController();

			$db->delete(self::TABLE_PROJECT_MEMBERS, array('project_id' => $id));
			$uniqueMembers = array_unique( array_column( $members, 'id' ) );
			// Then, insert the new members
			foreach ( $uniqueMembers as $member ) {
				$db->insert(self::TABLE_PROJECT_MEMBERS, array(
					"project_id" => $id,
					"user_id" => (int)$member,
					"created_at" => gmdate('Y-m-d H:i:s'),
					"updated_at" => gmdate('Y-m-d H:i:s'),
				));

				if(!in_array($member, $prevProjectMembersId)){

					$memberName = $members[array_search($member, array_column($members, 'id'))]['name'];


					$roles = $userController->getRolesByUser((int)$member);

					$userHasRoles = isset($roles['roles']) && sizeof($roles['roles'])>0 ? array_unique($roles['roles']) : [];
					$rolesName = sizeof($userHasRoles) > 0 ? implode(', ', array_column($userHasRoles, 'name')) : '';

					$referenceInfo = ['id'=>$id, 'name'=>$prevProject['name'], 'type'=>'project'];
					$placeholdersArray = ['member_name' => $memberName, 'project_name'=>$prevProject['name'], 'creator_name'=> $loggedInUser ? $loggedInUser->display_name:'', 'member_roles'=>$rolesName];

					do_action('lazytask_project_assigned_member', $referenceInfo, ['web-app', 'email'], [$member], $placeholdersArray);
				}
			}

			// Then, remove the members that are not in the new list
			foreach ($prevProjectMembersId as $member) {
				if(!in_array($member, $uniqueMembers)){
					$memberName = $prevProjectMembers[array_search($member, array_column($prevProjectMembers, 'id'))]['name'];
					$roles = $userController->getRolesByUser((int)$member);

					$userHasRoles = isset($roles['roles']) && sizeof($roles['roles'])>0 ? array_unique($roles['roles']) : [];
					$rolesName = sizeof($userHasRoles) > 0 ? implode(', ', array_column($userHasRoles, 'name')) : '';

					$referenceInfo = ['id'=>$id, 'name'=>$prevProject['name'], 'type'=>'project'];
					$placeholdersArray = ['member_name' => $memberName, 'project_name'=>$prevProject['name'], 'creator_name'=> $loggedInUser ? $loggedInUser->display_name:'', 'member_roles'=>$rolesName];

					do_action('lazytask_project_removed_member', $referenceInfo, ['web-app', 'email'], [$member], $placeholdersArray);
				}
			}
		}else{
			if($prevProjectMembersId && sizeof($prevProjectMembersId)==1){
				$userController = new Lazytask_UserController();
				$loggedInUserId = isset($requestData['updated_by']) && $requestData['updated_by']!="" ? $requestData['updated_by'] : null;
				$loggedInUser = get_user_by('ID', $loggedInUserId);
				$projectMembersTable = LAZYTASK_TABLE_PREFIX.'projects_users';
				$db->delete($projectMembersTable, array('project_id' => $id));
				foreach ($prevProjectMembersId as $member) {
					$memberName = $prevProjectMembers[array_search($member, array_column($prevProjectMembers, 'id'))]['name'];
					$roles = $userController->getRolesByUser((int)$member);

					$userHasRoles = isset($roles['roles']) && sizeof($roles['roles'])>0 ? array_unique($roles['roles']) : [];
					$rolesName = sizeof($userHasRoles) > 0 ? implode(', ', array_column($userHasRoles, 'name')) : '';

					$referenceInfo = ['id'=>$id, 'name'=>$prevProject['name'], 'type'=>'project'];
					$placeholdersArray = ['member_name' => $memberName, 'project_name'=>$prevProject['name'], 'creator_name'=> $loggedInUser ? $loggedInUser->display_name:'', 'member_roles'=>$rolesName];

					do_action('lazytask_project_removed_member', $referenceInfo, ['web-app', 'email'], [$member], $placeholdersArray);
				}
			}
		}
		$ids=[];
		if(isset($requestData['deleted_member_id']) && $requestData['deleted_member_id']!=""){
			$tableTaskMembers = LAZYTASK_TABLE_PREFIX . 'task_members';
			$taskTable = LAZYTASK_TABLE_PREFIX . 'tasks';
			// get all tasks by project id and member id using join query
			$tasks = $db->get_results(
				$db->prepare(
					"SELECT tasks.id FROM `{$taskTable}` as tasks
					JOIN `{$tableTaskMembers}` as taskMembers  ON tasks.id = taskMembers.task_id
					WHERE tasks.project_id = %d AND taskMembers.user_id = %d", (int)$id, (int)$requestData['deleted_member_id']), ARRAY_A);
			//delete task members
			if($tasks && sizeof($tasks)>0){
				$taskIds = array_column($tasks, 'id');
				if (!empty($taskIds)) {
					// Prepare a single query to delete all relevant task members
					$placeholders = implode(',', array_fill(0, count($taskIds), '%d'));
					$sql = "DELETE FROM {$tableTaskMembers} WHERE task_id IN ($placeholders) AND user_id = %d";

					// Prepare the arguments array
					$args = array_merge($taskIds, [(int)$requestData['deleted_member_id']]);

					// Execute the query
					$wpdb->query($wpdb->prepare($sql, ...$args));
				}

			}

		}

		if(sizeof($properties)>0){
			$updatedBy = isset($requestData['updated_by']) && $requestData['updated_by']!="" ? $requestData['updated_by'] : null;
			$activityLogArg = [
				"user_id" => $updatedBy,
				"subject_id" => $id,
				"subject_name" => 'project',
				"subject_type" => 'project',
				"event" => 'updated',
				"properties" => wp_json_encode($properties),
				"created_at" => gmdate('Y-m-d H:i:s'),
			];
			$activityLogTable = LAZYTASK_TABLE_PREFIX . 'activity_log';
			$db->insert($activityLogTable, $activityLogArg);
		}

		// Return the updated project
		$data =  $this->getProjectById($id);
		if($data){
			return new WP_REST_Response(['status'=>200, 'message'=>'Project updated successfully', 'data'=>$data, 'ids'=>$ids], 200);
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'Project not found', 'data'=>[]], 404);
	}


	public function delete(WP_REST_Request $request){

		// Sanitize and validate the input data
		$id = $request->get_param('id');
		$requestData = $request->get_json_params();
		$deleted_at = gmdate('Y-m-d H:i:s');

		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$db->query('START TRANSACTION');
		$deletedBy = isset($requestData['deleted_by']) && $requestData['deleted_by']!="" ? $requestData['deleted_by'] : null;

		$projectUpdated = $db->update(
			self::TABLE_PROJECTS,
			array(
				"deleted_by" => (int)$deletedBy,
				"deleted_at" => $deleted_at,
				"status" => 0,
			),
			array( 'id' => $id )
		);

		if (!$projectUpdated) {
			// Rollback the transaction
			$db->query('ROLLBACK');
			return new WP_Error('db_update_error', 'Could not update project in the database.', array('status' => 500));
		}

		$properties['attributes'] = [
			'deleted_by' => $deletedBy,
			'deleted_at' => $deleted_at,
			'status' => 0,
		];
		$activityLogArg = [
			"user_id" => $deletedBy,
			"subject_id" => $id,
			"subject_name" => 'project',
			"subject_type" => 'project',
			"event" => 'deleted',
			"properties" => wp_json_encode($properties),
			"created_at" => gmdate('Y-m-d H:i:s'),
		];
		$activityLogTable = LAZYTASK_TABLE_PREFIX . 'activity_log';
		$db->insert($activityLogTable, $activityLogArg);

		$db->query('COMMIT');
		$data = $this->getProjectById($id);
		// Return a success message
		if($data){
			return new WP_REST_Response(['status'=>200, 'message'=>'Project deleted successfully', 'data'=>$data], 200);
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'Project not found', 'data'=>null], 404);
	}

	public function getProjectById($projectId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$projectsTable = LAZYTASK_TABLE_PREFIX . 'projects';
		$companyTable = LAZYTASK_TABLE_PREFIX . 'companies';
		$project = $db->get_row(
			$db->prepare(
				"SELECT projects.id, projects.name, projects.slug, projects.code, projects.status, projects.company_id, company.name as companyName 
					FROM `{$projectsTable}` as projects
					JOIN `{$companyTable}` as company  ON projects.company_id = company.id 
					WHERE projects.id = %d", (int)$projectId), ARRAY_A);
		if($project){
			$companyController = new Lazytask_CompanyController();
			$companyMembers = $companyController->getCompanyMembers($project['company_id']);

			$projectMembers = $this->getProjectMembers($projectId);
			$projectPriorities = Lazytask_DatabaseQuerySchema::getProjectPriorities($projectId);
			$project['members'] = $projectMembers[$projectId];
			$project['parent'] = ['id'=>$project['company_id'], 'name'=>$project['companyName'], 'members'=> isset($companyMembers[ $project['company_id'] ]) && sizeof($companyMembers[ $project['company_id'] ]) >0 ? $companyMembers[ $project['company_id'] ] :[]];
			$project['projectPriorities'] = $projectPriorities;

			return $project;
		}

		return null;
	}

	public function getProjectsByIds($projectsId) {
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$projectsTable = LAZYTASK_TABLE_PREFIX . 'projects';
		$companyTable = LAZYTASK_TABLE_PREFIX . 'companies';


		if (is_array($projectsId)) {
			$ids = implode(', ', array_fill(0, count($projectsId), '%s'));
		}else{
			$ids = '%s';
			$projectsId = [$projectsId];
		}

		$sql = "SELECT projects.id, projects.name, projects.slug, projects.code, projects.status, projects.company_id, company.name as companyName FROM `{$projectsTable}` as projects
			JOIN `{$companyTable}` as company  ON projects.company_id = company.id 
		WHERE projects.id IN ($ids)";

		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), $projectsId));

		$projects = $db->get_results($db->prepare(
			$query
		), ARRAY_A);

		if($projects && sizeof($projects)){
			$companyController = new Lazytask_CompanyController();
			$companyMembers = $companyController->getCompanyMembers(array_unique(array_column($projects, 'company_id')));

			$projectMembers = $this->getProjectMembers(array_unique(array_column( $projects, 'id')));

			$returnArray = [];
			foreach ($projects as $key => $project) {
				$projectPriorities = Lazytask_DatabaseQuerySchema::getProjectPriorities($project['id']);
				$project['members'] = $projectMembers[$project['id']];
				$project['parent'] = ['id'=>$project['company_id'], 'name'=>$project['companyName'], 'members'=> isset($companyMembers[ $project['company_id'] ]) && sizeof($companyMembers[ $project['company_id'] ]) >0 ? $companyMembers[ $project['company_id'] ] :[]];
				$project['projectPriorities'] = $projectPriorities;
				$returnArray[$project['id']]=$project;
			}

			return $returnArray;
		}

		return null;
	}

	public function getProjectMembers($projectsId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		if($projectsId == ''){
			return [];
		}
		$usersTable = $wpdb->prefix . 'users';
		$projectMembersTable = LAZYTASK_TABLE_PREFIX . 'projects_users';

		if (is_array($projectsId)) {
			$ids = implode(', ', array_fill(0, count($projectsId), '%s'));
		}else{
			$ids = '%s';
			$projectsId = [$projectsId];
		}

		$sql = "SELECT * FROM `{$usersTable}` as users
			JOIN `{$projectMembersTable}` as projectMembers  ON users.ID = projectMembers.user_id 
		WHERE projectMembers.project_id IN ($ids)";

		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), $projectsId));
		$results = $db->get_results($db->prepare(
			$query
		), ARRAY_A);

		$returnArray = [];
		if($results){
			foreach ($results as $key => $value) {
				$returnArray[$value['project_id']][] = [
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

	public function getNoOfTasksByProject($projectsId, $groupByStatus = false){
		global $wpdb;

		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		if($projectsId == '' || sizeof($projectsId) == 0){
			return [];
		}
		$tableTask = LAZYTASK_TABLE_PREFIX . 'tasks';
		$tableProjects = LAZYTASK_TABLE_PREFIX . 'projects';

		if (is_array($projectsId)) {
			$ids = implode(', ', array_fill(0, count($projectsId), '%s'));
		}else{
			$ids = '%s';
			$projectsId = [$projectsId];
		}

		$sql = "SELECT count(task.id) as totalRecords, projects.id as project_id, task.status as status FROM `{$tableTask}` as task
			JOIN `{$tableProjects}` as projects  ON projects.id = task.project_id
		WHERE task.deleted_at IS NULL AND projects.id IN ($ids) group by projects.id";

		if($groupByStatus){
			$sql .= " , task.status";
		}

		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), $projectsId));
		$results = $db->get_results($query, ARRAY_A);

		$returnArray = [];
		if($results){
			foreach ($results as $key => $value) {
				if($groupByStatus){
					$returnArray['statusData'][$value['status']] = $value['status'];
					$returnArray['recordData'][$value['project_id']][$value['status']] = $value['totalRecords'];
				}else{
					$returnArray[$value['project_id']] = $value['totalRecords'];
				}
			}
		}
		return $returnArray;
	}

	public function createProjectPriority(WP_REST_Request $request){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$requestData = $request->get_json_params();
		$projectId = $requestData['project_id'];
		$name = sanitize_text_field($requestData['name']);
		$color_code = isset($requestData['color_code']) && $requestData['color_code']!="" ? $requestData['color_code'] : '#000000';
		$sort_order = isset($requestData['sort_order']) && $requestData['sort_order']!="" ? $requestData['sort_order'] : 1;
		$created_by = isset($requestData['created_by']) && $requestData['created_by']!="" ? $requestData['created_by'] : null; // get current user id (logged in user id
		$created_at = gmdate('Y-m-d H:i:s');

		if($projectId == ''){
			return new WP_REST_Response(['status'=>404, 'message'=>'Project is required', 'data'=>null], 404);
		}
		if($name == ''){
			return new WP_REST_Response(['status'=>404, 'message'=>'Name is required', 'data'=>null], 404);
		}

		$db->insert(LAZYTASK_TABLE_PREFIX . 'project_priorities', array(
			"project_id" => $projectId,
			"name" => $name,
			"color_code" => $color_code,
			"sort_order" => $sort_order,
			"created_at" => $created_at,
			"created_by" => $created_by,
		));
		$priorityId = $wpdb->insert_id;
		if($priorityId && $projectId){
			$data =  Lazytask_DatabaseQuerySchema::getProjectPriorities($projectId);
			if($data){
				return new WP_REST_Response(['status'=>200, 'message'=>'Project priority created successfully', 'data'=>$data], 200);
			}
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'Project priority not found', 'data'=>null], 404);

	}

	public function getPrioritiesByProjectId(WP_REST_Request $request){
		$projectId = $request->get_param( 'id' );
		if($projectId == ''){
			return new WP_REST_Response(['status'=>404, 'message'=>'Project ID is required', 'data'=>[]], 200);
		}
		$data = Lazytask_DatabaseQuerySchema::getProjectPriorities($projectId);
		if($data && sizeof($data)>0){
			return new WP_REST_Response(['status'=>200, 'message'=>'Success', 'data'=>$data], 200);
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'No record found', 'data'=>[]], 200);
	}

	public function getTasksByProjectId(WP_REST_Request $request){
		global $wpdb;
		$projectId = $request->get_param( 'id' );
		$project = $this->getProjectById($projectId);


		$returnArray = [];
		if ($project){

			$projectPriorities = Lazytask_DatabaseQuerySchema::getProjectPriorities($project['id']);

			$companyController = new Lazytask_CompanyController();
			$company = $companyController->getCompanyById($project['company_id'], $request);

			$projectTaskSections = Lazytask_DatabaseQuerySchema::getTaskSectionsByProjectId($project['id']);
			$taskSections = array_unique(array_column($projectTaskSections, 'slug'));

			$taskController = new Lazytask_TaskController();
			$tasks = $taskController->getTasksByProjectId($project['id']);

			$sectionData = null;
			if(isset($tasks['sectionData']) && sizeof($tasks['sectionData'])>0){
				foreach ($taskSections as $section) {
					$sectionData[$section] = isset($tasks['sectionData'][$section]) ? $tasks['sectionData'][$section] : [];
				}
			}

			$project['parent'] = $company;

			$returnArray['projectInfo'] = $project;
			$returnArray['projectPriorities'] = $projectPriorities;
			$returnArray['taskSections'] = $taskSections;
			$returnArray['taskListSectionsName'] = $projectTaskSections && sizeof($projectTaskSections)>0 ? $projectTaskSections : null;
			$returnArray['tasks'] = $sectionData;
			$returnArray['allTasks'] = isset($tasks['taskData']) ? $tasks['taskData'] : null;
			$returnArray['childTasks'] = isset($tasks['childData']) ? $tasks['childData'] : null;

			return new WP_REST_Response(['status'=>200, 'message'=>'Success','data' => $returnArray], 200);

		}
		return new WP_REST_Response(['status'=>404, 'message'=>'No record found','data' => null], 200);
	}


	public function getTaskSectionsByProjectId(WP_REST_Request $request){
		$projectId = $request->get_param( 'id' );
		if($projectId == ''){
			return new WP_REST_Response(['status'=>404, 'message'=>'Project ID is required','data' => []], 200);
		}
		$data = Lazytask_DatabaseQuerySchema::getTaskSectionsByProjectId($projectId);
		if($data && sizeof($data)>0){
			$arrayValues = array_values($data);
			return new WP_REST_Response(['status'=>200, 'message'=>'Success','data' => $arrayValues], 200);
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'No record found','data' => []], 200);
	}

	// get projects by user id and company id
	public function getProjectsByUserIdAndCompanyId($userId, $companiesId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$projectsTable = LAZYTASK_TABLE_PREFIX . 'projects';
		$companyTable = LAZYTASK_TABLE_PREFIX . 'companies';
		$projectMembersTable = LAZYTASK_TABLE_PREFIX . 'projects_users';
		$ids = implode(', ', array_fill(0, count($companiesId), '%s'));

		$sql = "SELECT projects.* 
				FROM `{$projectsTable}` as projects
				JOIN `{$companyTable}` as company  ON projects.company_id = company.id 
				JOIN `{$projectMembersTable}` as projectMembers  ON projects.id = projectMembers.project_id 
				WHERE projectMembers.user_id = %d AND projects.company_id IN ($ids) group by projects.id";
		//call_user_func_array with user id
		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql, $userId), $companiesId));
		$results = $db->get_results($query, ARRAY_A);
		$returnArray = [];
		if($results && count($results) > 0){
			$projectsId = array_column($results, 'id');
			$projectController = new Lazytask_ProjectController();
			$projectMembers = $projectController->getProjectMembers($projectsId);
			$projectTasks = $projectController->getNoOfTasksByProject($projectsId);

			foreach ($results as $key => $value) {
				$returnArray[$value['company_id']][] = [
					'id' => $value['id'],
					'name' => $value['name'],
					'slug' => $value['slug'],
					'code' => $value['code'],
					'status' => $value['status'],
					'members' => isset($projectMembers[ $value['id'] ]) ? $projectMembers[ $value['id'] ] :[],
					'total_tasks' => isset($projectTasks[ $value['id'] ]) ? $projectTasks[ $value['id'] ] : '0',
				];
			}
		}
		return $returnArray;
	}


}