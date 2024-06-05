<?php

namespace App\Controller;

use App\Helper\DatabaseTableSchema;
use App\Helper\SlugGenerator;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

final class CompanyController {

	const TABLE_COMPANIES = PMS_TABLE_PREFIX . 'companies';
	const TABLE_COMPANY_MEMBERS = PMS_TABLE_PREFIX . 'companies_users';

	public function index(){

		global $wpdb;

		$db = DatabaseTableSchema::get_global_wp_db($wpdb);

		$results = $db->get_results($db->prepare("SELECT * FROM `{$wpdb->prefix}pms_companies` WHERE status = %d and deleted_at IS NULL",1), ARRAY_A);
		if (count($results) > 0) {
			$companiesId = array_column($results, 'id');
			$companyMembers = $this->getCompanyMembers($companiesId);
			$companyProjects = $this->companyProjects($companiesId);
			foreach ($results as $key => $value) {
				$results[$key]['members'] = isset($companyMembers[ $value['id'] ]) ? $companyMembers[ $value['id'] ] :[];
				$results[$key]['projects'] = isset($companyProjects[ $value['id']]) ? $companyProjects[ $value['id']] :[];
			}
			return new WP_REST_Response(['status'=>200, 'message'=>'Success', 'data'=>$results], 200);
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'No record found', 'data'=>[]], 404);
	}

	public function create(WP_REST_Request $request){
		global $wpdb;
		$db = DatabaseTableSchema::get_global_wp_db($wpdb);
//		$requestData = json_decode($request->get_body(), true);
//
		$requestData = $request->get_json_params();
		$submittedData = [];
		if(isset($requestData['name'])){
			$submittedData['name'] = $requestData['name']!="" ? sanitize_text_field($requestData['name']) : '';
			$newSlug = SlugGenerator::slug($requestData['name'], self::TABLE_COMPANIES, 'slug' );
			$submittedData['slug'] = $requestData['slug']!="" ? sanitize_text_field($requestData['slug']) : $newSlug;
		}
		if(isset($requestData['short_name'])){
			$submittedData['short_name'] = $requestData['short_name']!="" ? sanitize_text_field($requestData['short_name']) : '';
		}
		if(isset($requestData['code'])){
			$submittedData['code'] = $requestData['code']!="" ? sanitize_text_field($requestData['code']) : '';
		}
		if(isset($requestData['address'])){
			$submittedData['address'] = $requestData['address']!="" ? sanitize_textarea_field($requestData['address']) : '';
		}
		if(isset($requestData['owner_id'])){
			$submittedData['owner_id'] = $requestData['owner_id']!="" ? $requestData['owner_id'] : null;
		}
		$members = isset($requestData['members']) && sizeof($requestData['members'])> 0 ? $requestData['members'] : [];
		$companyTableName = PMS_TABLE_PREFIX . 'companies';
		$db->insert(
			$companyTableName,
			$submittedData);
		$company_id = $wpdb->insert_id;

		if($company_id && sizeof($members)>0){
			$uniqueMembers = array_unique( array_column( $members, 'id' ) );
			$companyMembersTableName = PMS_TABLE_PREFIX . 'companies_users';
			foreach ( $uniqueMembers as $member ) {
				$db->insert(
					$companyMembersTableName,
					array(
						"company_id" => $company_id,
						"user_id" => (int)$member,
						)
				);
			}

		}
		$data = $this->getCompanyById($company_id);
		if($data){
			return new WP_REST_Response(['status'=>200, 'message'=>'Company updated successfully', 'data'=>$data], 200);
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'Company not found', 'data'=>null], 404);

	}

	public function update(WP_REST_Request $request){
		global $wpdb;
		$db = DatabaseTableSchema::get_global_wp_db($wpdb);

		// Sanitize and validate the input data
		$requestData = $request->get_json_params();
		$id = $request->get_param('id');

		if(!$id){
			return array('status'=> 500, 'message' => 'Company ID is required', 'data'=>[]);
		}
		$submittedData = [];
		if(isset($requestData['name'])){
			$submittedData['name'] = $requestData['name']!="" ? sanitize_text_field($requestData['name']) : '';
		}
		if(isset($requestData['short_name'])){
			$submittedData['short_name'] = $requestData['short_name']!="" ? sanitize_text_field($requestData['short_name']) : '';
		}
		if(isset($requestData['code'])){
			$submittedData['code'] = $requestData['code']!="" ? sanitize_text_field($requestData['code']) : '';
		}
		if(isset($requestData['slug'])){
			$newSlug = SlugGenerator::slug($requestData['name'], self::TABLE_COMPANIES, 'slug' );
			$submittedData['slug'] = $requestData['slug']!="" ? sanitize_text_field($requestData['slug']) : $newSlug;
		}
		if(isset($requestData['address'])){
			$submittedData['address'] = $requestData['address']!="" ? sanitize_textarea_field($requestData['address']) : '';
		}
		if(isset($requestData['owner_id'])){
			$submittedData['owner_id'] = $requestData['owner_id']!="" ? $requestData['owner_id'] : null;
		}



		$updated_at = gmdate('Y-m-d H:i:s');
		$members = isset($requestData['members']) && sizeof($requestData['members'])> 0 ? $requestData['members'] : [];

		// Update the company in the database
		if(sizeof($submittedData)>0){
			$submittedData['updated_at'] = $updated_at;

			$companyTableName = PMS_TABLE_PREFIX . 'companies';

			$db->update(
				$companyTableName,
				$submittedData,
				array( 'id' => $id )
			);
		}
		if(sizeof($members)>0){
			$companyMembersTableName = PMS_TABLE_PREFIX . 'companies_users';

			$db->delete($companyMembersTableName, array('company_id' => $id));
			// Then, insert the new members
		 $uniqueMembers = array_unique( array_column( $members, 'id' ) );
			foreach ( $uniqueMembers as $member ) {
				$db->insert(
					$companyMembersTableName,
					array(
						"company_id" => $id,
						"user_id" => (int)$member,
						"created_at" => $updated_at,
						"updated_at" => $updated_at,
						)
				);
			}
		}

		// Return the updated company and its members
		$data = $this->getCompanyById($id);
		if($data){
			return new WP_REST_Response(['status'=>200, 'message'=>'Company updated successfully', 'data'=>$data], 200);
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'Company not found', 'data'=>null], 404);
	}

	public function show(WP_REST_Request $request){
		global $wpdb;

		// Sanitize and validate the input data
		$id = $request->get_param('id');

		if(!$id){
			return array('status'=> 500, 'message' => 'Company ID is required', 'data'=>[]);
		}
		// Return the updated company and its members
		$data = $this->getCompanyById($id);
		if($data){
			return new WP_REST_Response(['status'=>200, 'message'=>'Success', 'data'=>$data], 200);
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'Company not found', 'data'=>null], 404);
	}

	public function delete(WP_REST_Request $request){
		global $wpdb;
		$db = DatabaseTableSchema::get_global_wp_db($wpdb);

		// Sanitize and validate the input data
		$id = $request->get_param('id');
		$deleted_at = gmdate('Y-m-d H:i:s');
		// Update the deleted_at field in the database for the company with the provided ID
		$db->query('START TRANSACTION');
		$companyTableName = PMS_TABLE_PREFIX . 'companies';
		$companyUpdated = $db->update(
			$companyTableName,
			array(
				"deleted_at" => $deleted_at,
				"status" => 0,
			),
			array( 'id' => $id )
		);
		if (!$companyUpdated) {
			// Rollback the transaction
			$db->query('ROLLBACK');
			return new WP_Error('db_update_error', 'Could not update company in the database.', array('status' => 500));
		}
		$db->query('COMMIT');
		$data = $this->getCompanyById($id);
		if($data){
			return new WP_REST_Response(['status'=>200, 'message'=>'Company deleted successfully', 'data'=>$data], 200);
		}
		return new WP_REST_Response(['status'=>404, 'message'=>'Company not found', 'data'=>null], 404);
	}

	public function getCompanyById($id) {
		global $wpdb;
		$db = DatabaseTableSchema::get_global_wp_db($wpdb);

		$row = $db->get_row( $db->prepare( "SELECT * FROM `{$wpdb->prefix}pms_companies` WHERE id = %d", (int)$id ), ARRAY_A );
		if ( $row && count( $row ) > 0 ) {
			$companiesId    = $row['id'];
			$companyMembers = $this->getCompanyMembers( $companiesId );
			$row['members'] = isset( $companyMembers[ $row['id'] ] ) ? $companyMembers[ $row['id'] ] : [];
			return $row;
		}
		return null;
	}

	public function getCompanyMembers($companiesId){
		global $wpdb;
		$db = DatabaseTableSchema::get_global_wp_db($wpdb);
		$usersTable = $wpdb->prefix . 'users';
		$companyMembersTable = PMS_TABLE_PREFIX . 'companies_users';
	if (is_array($companiesId)) {
		$ids = implode(', ', array_fill(0, count($companiesId), '%s'));
	}else{
		$ids = '%s';
		$companiesId = [$companiesId];
	}

		$sql = "SELECT * FROM `{$usersTable}` as users
			JOIN `{$companyMembersTable}` as companyMembers  ON users.ID = companyMembers.user_id 
		WHERE companyMembers.company_id IN ($ids)";

		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), $companiesId));

		$results = $db->get_results(
			$query, ARRAY_A);
		$returnArray = [];
		if($results){
			foreach ($results as $key => $value) {
				$returnArray[$value['company_id']][] = [
					'id' => $value['ID'],
					'name' => $value['display_name'],
					'email' => $value['user_email'],
					'username' => $value['user_login'],
					'created_at' => $value['user_registered'],
					'avatar' => UserController::getUserAvatar($value['ID']),
					];
			}
		}
		return $returnArray;
	}

	private function companyProjects($companiesId){
		global $wpdb;
		$db = DatabaseTableSchema::get_global_wp_db($wpdb);
		$projectsTable = PMS_TABLE_PREFIX . 'projects';
		$companyTable = PMS_TABLE_PREFIX . 'companies';

		$ids = implode(', ', array_fill(0, count($companiesId), '%s'));

		$sql = "SELECT projects.id, projects.name, projects.slug, projects.code, projects.status, projects.company_id FROM `{$projectsTable}` as projects
			JOIN `{$companyTable}` as company  ON projects.company_id = company.id 
		WHERE company.id IN ($ids)";

		$query = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), $companiesId));

		$results = $db->get_results($query, ARRAY_A);

		$returnArray = [];
		if($results && count($results) > 0){
			$projectsId = array_column($results, 'id');
			$projectController = new ProjectController();
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