<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

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
class Lazytask_Deactivator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function deactivate() {
		$login_page_id = get_option('lazytask_login_page_id');
		$dashboard_page_id = get_option('lazytask_dashboard_page_id');

		if($login_page_id)
			wp_delete_post($login_page_id, true);
		if($dashboard_page_id)
			wp_delete_post($dashboard_page_id, true);

		delete_option('lazytask_login_page_id');
		delete_option('lazytask_dashboard_page_id');


	}

}
