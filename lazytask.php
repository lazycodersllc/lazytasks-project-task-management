<?php
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://lazycoders.co
 * @since             1.0.0
 * @package           Lazy_Task
 *
 * @wordpress-plugin
 * Plugin Name:       LazyTasks - Project & Task Management with Collaboration, Kanban and Gantt Chart
 * Plugin URI:        https://lazycoders.co/lazytasks
 * Description:       Comprehensive Task and Project Management: Create, assign, follow, and comment on tasks with ease. Our user-friendly interface ensures your projects are always on track and accessible.
 * Version:           1.0.0
 * Requires at least: 3.0.1
 * Requires PHP:      7.4
 * Author:            Lazycoders
 * Author URI:        https://lazycoders.co
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       lazytask
 * Domain Path:       /languages
 */
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

global $wpdb;
/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'LAZYTASK_VERSION', '1.0.0' );

define( 'LAZYTASK_TABLE_PREFIX', $wpdb->prefix .'pms_' );

const LAZYTASK_JWT_SECRET_KEY = SECURE_AUTH_KEY;


/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-lazytask-activator.php
 */
function lazytask_activate() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-lazytask-activator.php';
	Lazytask_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-lazytask-deactivator.php
 */
function lazytask_deactivate() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-lazytask-deactivator.php';
	Lazytask_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'lazytask_activate' );
register_deactivation_hook( __FILE__, 'lazytask_deactivate' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-pms-rbs.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function lazytask_run() {

	$plugin = new Lazy_Task();
	$plugin->run();

}
lazytask_run();

require_once "vendor/autoload.php";
