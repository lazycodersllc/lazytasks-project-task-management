<?php

namespace App\Helper;

use wpdb;

class DatabaseTableSchema {

	public static function run(){
		self::tbl_companies();
		self::tbl_companies_users();

		self::tbl_projects();
		self::tbl_projects_users();
		self::tbl_project_priorities();

		self::tbl_task_sections();
		self::tbl_tasks();
		self::tbl_task_members();
		self::tbl_roles();
		self::tbl_permissions();
		self::tbl_role_has_permissions();
		self::tbl_user_has_roles();
		self::tbl_comments();
		self::tbl_activity_log();
		self::tbl_attachment();
		self::tbl_tags();
		self::tbl_task_tags();
		self::tbl_quick_task();
	}

	private static function tbl_companies(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'companies';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` int NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '9999',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}


	private static function tbl_companies_users(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'companies_users';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	private static function tbl_projects(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'projects';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` int NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '9999',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}
	private static function tbl_projects_users(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'projects_users';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}
	private static function tbl_project_priorities(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'project_priorities';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Low',
  `color_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `sort_order` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}
	private static function tbl_task_sections(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'task_sections';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Untitled Section',
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	private static function tbl_tasks(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'tasks';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned DEFAULT NULL,
  `project_id` bigint unsigned DEFAULT NULL,
  `section_id` bigint unsigned DEFAULT NULL,
  `assigned_to` bigint unsigned DEFAULT NULL,
  `priority_id` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `sort_order` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	private static function tbl_task_members(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'task_members';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `task_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	private static function tbl_roles(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'roles';
		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	private static function tbl_permissions(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'permissions';
		$table_generate_query = "CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	private static function tbl_role_has_permissions(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'role_has_permissions';
		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	private static function tbl_user_has_roles(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'user_has_roles';
		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	private static function tbl_comments(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'comments';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `commentable_id` int DEFAULT NULL,
  `commentable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` int NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '9999',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	private static function tbl_activity_log(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'activity_log';

		$table_generate_query = "
	       CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `subject_id` int DEFAULT NULL,
  `subject_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `properties` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	private static function tbl_attachment(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'attachments';

		$table_generate_query = "
	       CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `mine_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` int DEFAULT NULL,
  `wp_attachment_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `subject_id` int DEFAULT NULL,
  `subject_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}


	private static function tbl_tags(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'tags';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` int NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '9999',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}


	private static function tbl_task_tags(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'task_tags';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `task_id` bigint unsigned DEFAULT NULL,
  `tag_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}


	private static function tbl_quick_task(){
		global $wpdb;
		$table_name = PMS_TABLE_PREFIX . 'quick_tasks';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
		  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
		  `user_id` int DEFAULT NULL,
		  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
		  `status` int NOT NULL DEFAULT '1',
		  `sort_order` int NOT NULL DEFAULT '9999',
		  `created_at` timestamp NULL DEFAULT NULL,
		  `updated_at` timestamp NULL DEFAULT NULL,
		  PRIMARY KEY (`id`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}

	public static function get_global_wp_db( $wpdb = NULL ) {
		static $db;
		if ( is_null($db) || ! is_null( $wpdb ) ) {
			$db = is_null($wpdb) ? $GLOBALS['wpdb'] : $wpdb;
		}
		return $db;
	}
}