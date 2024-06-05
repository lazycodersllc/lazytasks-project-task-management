<?php

/**
 * Fired during plugin deactivation
 *
 * @link       https://lazycoders.co
 * @since      1.0.0
 *
 * @package    Lazy_Task
 * @subpackage Lazy_Task/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    Lazy_Task
 * @subpackage Lazy_Task/includes
 * @author     lazycoders <info@lazycoders.co>
 */
class Lazy_Task_Deactivator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function deactivate() {
		$login_page_id = get_option('pms_rbs_login_page_id');
		$dashboard_page_id = get_option('pms_rbs_dashboard_page_id');

		if($login_page_id)
			wp_delete_post($login_page_id, true);
		if($dashboard_page_id)
			wp_delete_post($dashboard_page_id, true);

		delete_option('pms_rbs_login_page_id');
		delete_option('pms_rbs_dashboard_page_id');


	}

}
