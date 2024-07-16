<?php

namespace Lazytask\Routes;

use Lazytask\Controller\Lazytask_CompanyController;
use Lazytask\Controller\Lazytask_ProjectController;
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/sign-up',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_UserController(), 'signUp'),
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/lazy-link/roles',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_UserController(), 'lazyLinkRoles'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/projects/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_ProjectController(), 'create'),
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
			'/sections/sort-order/update',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytask_TaskController(), 'updateSectionSortOrder'),
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
			'/attachments/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_TaskController(), 'createAttachment'),
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/attachments/delete/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytask_TaskController(), 'removeAttachment'),
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
				'args' => array()
			)
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/tags/create',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytask_TagController(), 'create'),
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
				'permission_callback' => array(new Lazytask_UserController(), 'permission_check'),
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
	}

}