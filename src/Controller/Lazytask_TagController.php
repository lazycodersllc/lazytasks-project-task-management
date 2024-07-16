<?php

namespace Lazytask\Controller;

use Lazytask\Helper\Lazytask_DatabaseTableSchema;
use WP_REST_Request;
use WP_REST_Response;

final class Lazytask_TagController {

	const TABLE_TAGS = LAZYTASK_TABLE_PREFIX . 'tags';

	public function getAllTags() {
		global $wpdb;
		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);
		$tagTableName = LAZYTASK_TABLE_PREFIX . 'tags';
		$tags = $db->get_results("SELECT * FROM {$tagTableName}", ARRAY_A);
		try {
			if($tags) {
				return new WP_REST_Response(['status'=>200, 'message'=>'Success', 'data'=>$tags], 200);
			}
			return new WP_REST_Response(['status'=>200, 'message'=>'No tags found', 'data'=>[]], 200);
		} catch (\Exception $e) {
			return new WP_REST_Response(['status'=>400, 'message'=>'Error', 'data'=>[]], 400);
		}

	}

	public function create( WP_REST_Request $request ) {

		global $wpdb;

		$requestData = $request->get_json_params();

	  $response = $this->tagGetOrCreate($requestData);
	  if($response) {
	  	return new WP_REST_Response(['status'=>200, 'message'=>'Tag created successfully', 'data'=>$response], 200);
	  }
	  return new WP_REST_Response(['status'=>400, 'message'=>'Tag creation failed', 'data'=>[]], 400);

	}

	public function tagGetOrCreate( $requestData ) {

		global $wpdb;

		$db = Lazytask_DatabaseTableSchema::get_global_wp_db($wpdb);

		$tagsTable = LAZYTASK_TABLE_PREFIX . 'tags';

		$name = isset($requestData['name']) && $requestData['name']!='' ? $requestData['name'] : null;
		if(!$name) {
			return new WP_REST_Response(['status'=>400, 'message'=>'Name is required', 'data'=>[]], 400);
		}

		$created_at = gmdate('Y-m-d H:i:s');
		$submittedData = [];
		$submittedData['name'] = sanitize_text_field($name);
		$submittedData['parent_id'] = isset($requestData['parent_id']) ? (int)$requestData['parent_id']:null;
		$submittedData['description'] = isset($requestData['description']) ? sanitize_textarea_field($requestData['description']):null;
		$submittedData['created_at'] = $created_at;
		$submittedData['user_id'] = isset($requestData['user_id']) && $requestData['user_id'] != "" ? (int)$requestData['user_id'] : null;

		try {

			if($db->get_var($db->prepare("SELECT COUNT(*) FROM {$tagsTable} WHERE name = %s", $name)) > 0) {
				$existTag = $db->get_row($db->prepare("SELECT * FROM {$tagsTable} WHERE name =%s", $name), ARRAY_A);

				return $existTag;
			}
			$db->query('START TRANSACTION');

			$db->insert($tagsTable, $submittedData);

			$db->query('COMMIT');

			$tagId = $db->insert_id;

			$tag = $db->get_row($db->prepare("SELECT * FROM {$tagsTable} WHERE id =%d",$tagId), ARRAY_A);

			return $tag;
		} catch (\Exception $e) {
			return null;
		}

	}
}