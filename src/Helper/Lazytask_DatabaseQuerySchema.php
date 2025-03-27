<?php

namespace Lazytask\Helper;
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Lazytask_DatabaseQuerySchema {

	public static function getTaskSectionsByProjectId($projectId) {
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$tableName = LAZYTASK_TABLE_PREFIX . 'task_sections';

		$results = $db->get_results($db->prepare(
			"SELECT * FROM $tableName 
         	WHERE deleted_at IS NULL 
           AND deleted_by IS NULL 
           AND project_id = %d order by sort_order ASC", (int)$projectId), ARRAY_A);
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


	public static function getProjectPriorities($projectId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$priorityTable = LAZYTASK_TABLE_PREFIX . 'project_priorities';
		$projectTable = LAZYTASK_TABLE_PREFIX . 'projects';
		$sql = "SELECT project.id as projectId, priority.id as priorityId, priority.name as priorityName, priority.color_code as color_code, priority.sort_order as sort_order 
				FROM `{$priorityTable}` as priority 
				JOIN `{$projectTable}` as project ON priority.`project_id` = project.`id` 
				WHERE project.`id` = %d";
		$results = $db->get_results($db->prepare(
			$sql, (int)$projectId
		), ARRAY_A);

		$returnArray = [];
		if($results){
			foreach ( $results as $result ) {
				$returnArray[] = [
					'id' => $result['priorityId'],
					'name' => $result['priorityName'],
					'project_id' => $result['projectId'],
					'color_code' => $result['color_code'],
					'sort_order' => $result['sort_order'],
				];
			}
		}
		return $returnArray;
	}

	//getProjectPriorityById
	public static function getProjectPriorityById($priorityId, $projectId){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$priorityTable = LAZYTASK_TABLE_PREFIX . 'project_priorities';
		$sql = "SELECT * FROM `{$priorityTable}` WHERE `id` = %d AND project_id = %d";
		$results = $db->get_row($db->prepare(
			$sql, (int)$priorityId, (int)$projectId
		), ARRAY_A);
		return $results;
	}

	//all projects
	public static function getAllProjects(){
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$projectTable = LAZYTASK_TABLE_PREFIX . 'projects';
		$sql = "SELECT * FROM `{$projectTable}` WHERE deleted_at IS NULL AND deleted_by IS NULL";
		$results = $db->get_results($sql, ARRAY_A);
		return $results ? $results : [];
	}

}