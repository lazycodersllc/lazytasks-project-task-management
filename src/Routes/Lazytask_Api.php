<?php

namespace Lazytask\Routes;

use Lazytask\Controller\Lazytask_CompanyController;
use Lazytask\Controller\Lazytask_NotificationController;
use Lazytask\Controller\Lazytask_ProjectController;
use Lazytask\Controller\Lazytask_SettingController;
use Lazytask\Controller\Lazytask_TagController;
use Lazytask\Controller\Lazytask_TaskController;
use Lazytask\Controller\Lazytask_UserController;
use WP_REST_Server;

class Lazytask_Api {
	CONST ROUTE_NAMESPACE = 'pms/api/v1';
	public function register_routes(){

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/jwt-auth/login',
			array(
			'methods' => WP_REST_Server::CREATABLE,
			'callback' => array(new Lazytask_UserController(), 'jwt_auth_generate_token'),
			'permission_callback' => '__return_true',
			'args' => array(
				'email' => array(
					'required' => true,
					'validate_callback' => function($param, $request, $key){
						return $param;
					}
				),
				'password' => array(
					'required' => true,
					'validate_callback' => function($param, $request, $key){
						return $param;
					}
				)
			)
		));

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/forget-password-request',
			array(
			'methods' => WP_REST_Server::CREATABLE,
			'callback' => array(new Lazytask_UserController(), 'lazytask_forget_password_request'),
			'permission_callback' => '__return_true',
			'args' => array(
				'email' => array(
					'required' => true,
					'validate_callback' => function($param, $request, $key){
						return $param;
					}
				)
			)
		));

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/forget-password-store',
			array(
			'methods' => WP_REST_Server::CREATABLE,
			'callback' => array(new Lazytask_UserController(), 'lazytask_forget_password_store'),
			'permission_callback' => '__return_true'
		));

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/jwt-auth/verified',
			array(
			'methods' => WP_REST_Server::READABLE,
			'callback' => array(new Lazytask_UserController(), 'validate_token'),
			'permission_callback' => '__return_true',
			'args' => array()
		));

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/admin/after-login/token',
			array(
			'methods' => WP_REST_Server::READABLE,
			'callback' => array(new Lazytask_UserController(), 'admin_after_auth_login'),
			'permission_callback' => '__return_true',
			'args' => array()
		));

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/login',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_UserController(), 'login'),
				'permission_callback' => '__return_true',
				'args' => array(
					'email' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					),
					'password' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/logout', array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_UserController(), 'logout_user'),
				'permission_callback' => '__return_true',
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/users/edit/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_UserController(), 'update'),
				'permission_callback' => '__return_true',
				/*'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin']);
				},*/
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/all-members',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_UserController(), 'getAllMembers'),
				'permission_callback' => '__return_true',
//				'permission_callback' => array(new UserController(), 'permission_check'),
				/*'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin']);
				},*/
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/users/show/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_UserController(), 'show'),
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
//				'permission_callback' => '__return_true',
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/sign-up',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_UserController(), 'signUp'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin','admin','director']);
				},
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/lazy-link/roles',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_UserController(), 'lazyLinkRoles'),
//				'permission_callback' => '__return_true',
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/companies',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_CompanyController(), 'index'),
//				'permission_callback' => '__return_true',
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/companies/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_CompanyController(), 'create'),
//				'permission_callback' => '__return_true',
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin']);
				},
				'args' => array(
					'name' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/companies/edit/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_CompanyController(), 'update'),
//				'permission_callback' => '__return_true',
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/companies/show/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_CompanyController(), 'show'),
				'permission_callback' => '__return_true',
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/companies/delete/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_CompanyController(), 'delete'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/projects',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_ProjectController(), 'getAllProjects'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director']);
				},
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/projects/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_ProjectController(), 'create'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director']);
				},
				'args' => array(
					'name' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					),
					'company_id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/projects/edit/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_ProjectController(), 'update'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/projects/delete/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_ProjectController(), 'delete'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/projects/sections/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_ProjectController(), 'getTaskSectionsByProjectId'),
				'permission_callback' => '__return_true',
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/projects/priorities/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_ProjectController(), 'getPrioritiesByProjectId'),
				'permission_callback' => '__return_true',
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tasks/by/project/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_ProjectController(), 'getTasksByProjectId'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee','follower','task-edit','task-view']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
//						'type' => 'integer',
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
			)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tasks/by/user/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_UserController(), 'getTaskByLoggedInUserId'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee','follower','task-edit','task-view']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
//						'type' => 'integer',
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
			)
			)
		);

		//taskSection section start
		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/sections/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_TaskController(), 'createTaskSection'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'manager']);
				},
				'args' => array(
					'name' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					),
					'project_id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/sections/edit/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_TaskController(), 'updateTaskSection'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'manager']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					),
					'name' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/sections/mark-is-complete/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_TaskController(), 'markIsCompleteTaskSection'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'manager']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/sections/delete/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_TaskController(), 'softDeleteTaskSection'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'manager']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/sections/sort-order/update',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_TaskController(), 'updateSectionSortOrder'),
				'permission_callback' => '__return_true',
				'args' => array(
					'project_id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		//priority section start
		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/priorities/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_ProjectController(), 'createProjectPriority'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director']);
				},
				'args' => array(
					'name' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					),
					'project_id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		//task section start

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tasks/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_TaskController(), 'create'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee']);
				},
				'args' => array(
					'name' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tasks/edit/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_TaskController(), 'update'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tasks/show/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_TaskController(), 'show'),
				'permission_callback' => '__return_true',
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
			)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tasks/delete/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_TaskController(), 'delete'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
			)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tasks/sort-order/update',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_TaskController(), 'updateTaskSortOrder'),
				'permission_callback' => '__return_true',
				'args' => array(
					'project_id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);
		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tasks/tag/assign',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_TaskController(), 'tagAssignToTask'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee','follower']);
				},
				'args' => array(
					'name' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);
		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tasks/tag/remove',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_TaskController(), 'tagRemoveFromTask'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee']);
				},
				'args' => array(
					'name' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					),
					'task_id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/comments/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_TaskController(), 'createComment'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee', 'follower']);
				},
				'args' => array(
					'content' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					),
					'user_id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					),
					'commentable_id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/comments/delete/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_TaskController(), 'softDeleteComment'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/attachments/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_TaskController(), 'createAttachment'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee']);
				},
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/attachments/delete/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_TaskController(), 'removeAttachment'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		//tags section start
		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tags',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_TagController(), 'getAllTags'),
//				'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => '__return_true',
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tags/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_TagController(), 'create'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee']);
				},
				'args' => array(
					'name' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);


		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/quick-tasks/by/user/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_UserController(), 'getQuickTaskByLoggedInUserId'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee', 'follower']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
//						'type' => 'integer',
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/quick-tasks/delete/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::DELETABLE,
				'callback' => array(new Lazytask_TaskController(), 'quickTaskDelete'),
				'permission_callback' => '__return_true',
				'args' => array(
					'id' => array(
						'required' => true,
//						'type' => 'integer',
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/quick-tasks/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_TaskController(), 'quickTaskCreate'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin', 'director', 'accounts', 'manager', 'line_manager', 'employee', 'follower']);
				},
				'args' => array(
					'name' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		// notification section

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/notification-action-list',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_NotificationController(), 'getNotificationActionList'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin']);
				},
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/notification-channels',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_NotificationController(), 'getNotificationChannels'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin']);
				},
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/notification-templates',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_NotificationController(), 'getNotificationTemplates'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin']);
				},
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/notification-templates/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_NotificationController(), 'createNotificationTemplate'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin']);
				},
				'args' => array(
					'title' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/notification-templates/show/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_NotificationController(), 'showNotificationTemplate'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		//edit notification template
		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/notification-templates/edit/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_NotificationController(), 'editNotificationTemplate'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin', 'admin']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					),
					'title' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		//delete notification template by id
		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/notification-templates/delete/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::DELETABLE,
				'callback' => array(new Lazytask_NotificationController(), 'deleteNotificationTemplate'),
				'permission_callback' => function($request) {
					$userController = new Lazytask_UserController();
					return $userController->permission_check($request, ['superadmin']);
				},
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/settings', [
			'methods' => WP_REST_Server::READABLE,
			'callback' => [ new Lazytask_SettingController(), 'get_settings'],
//			'permission_callback' => '__return_true',
			'permission_callback' => function($request) {
				$userController = new Lazytask_UserController();
				return $userController->permission_check($request, ['superadmin']);
			},
		]);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/settings', [
			'methods' => WP_REST_Server::EDITABLE,
			'callback' => [new Lazytask_SettingController(), 'update_settings'],
//			'permission_callback' => '__return_true',
			'permission_callback' => function($request) {
				$userController = new Lazytask_UserController();
				return $userController->permission_check($request, ['superadmin']);
			},
		]);

	}

}