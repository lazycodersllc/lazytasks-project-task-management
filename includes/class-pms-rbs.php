<?php

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://lazycoders.co
 * @since      1.0.0
 *
 * @package    Lazy_Task
 * @subpackage Lazy_Task/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    Lazy_Task
 * @subpackage Lazy_Task/includes
 * @author     lazycoders <info@lazycoders.co>
 */
class Lazy_Task {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Lazy_Task_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $version    The current version of the plugin.
	 */
	protected $version;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
		if ( defined( 'PMS_RBS_VERSION' ) ) {
			$this->version = PMS_RBS_VERSION;
		} else {
			$this->version = '1.0.0';
		}
		$this->plugin_name = 'LazyTasks';

		$this->load_dependencies();
		$this->set_locale();
		$this->define_admin_hooks();
		$this->define_public_hooks();

	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Lazy_Task_Loader. Orchestrates the hooks of the plugin.
	 * - Lazy_Task_i18n. Defines internationalization functionality.
	 * - Lazy_Task_Admin. Defines all hooks for the admin area.
	 * - Lazy_Task_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-pms-rbs-loader.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-pms-rbs-i18n.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-pms-rbs-admin.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-pms-rbs-public.php';

		$this->loader = new Lazy_Task_Loader();

	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the Lazy_Task_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function set_locale() {

		$plugin_i18n = new Lazy_Task_i18n();

		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );

	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {

		$plugin_admin = new Lazy_Task_Admin( $this->get_plugin_name(), $this->get_version() );

//		$this->loader->add_action( 'plugins_loaded', $plugin_admin, 'my_plugin_set_db' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );
        $this->loader->add_action( 'admin_menu', $plugin_admin, 'admin_menu_project_management_system' );
		$this->loader->add_action( 'rest_api_init', $plugin_admin, 'admin_routes' );
		$this->loader->add_action( 'wp_login', $plugin_admin, 'my_auth_login');
		$this->loader->add_action( 'init', $this, 'add_custom_user_role' );
		$this->loader->add_filter( 'theme_page_templates', $this, 'pms_add_page_template_to_dropdown' );
		$this->loader->add_filter( 'template_include', $this, 'lazy_pms_load_plugin_template' );
		$this->loader->add_filter( 'show_admin_bar', $this, 'hide_admin_bar' );
	}
	function hide_admin_bar(){ return false; }

	/**
	 * Add page templates.
	 *
	 * @param  array  $templates  The list of page templates
	 *
	 * @return array  $templates  The modified list of page templates
	 */
   public function pms_add_page_template_to_dropdown( $templates )
	{
		$templates[plugin_dir_url( __DIR__ ) . 'templates/lazy-pms-page-template.php'] = __( 'Lazy PMS Page Template', 'pms-rbs' );
//	   $templates[plugin_dir_path( dirname( __FILE__ ) ) . 'templates/dashboard-page-template.php'] = __( 'Dashboard Page Template', 'text-domain' );

		return $templates;
	}
	/**
	 * Check if current page has our custom template. Try to load
	 * template from theme directory and if not exist load it
	 * from root plugin directory.
	 */
	function lazy_pms_load_plugin_template( $template ) {

		if(  get_page_template_slug() === plugin_dir_url( __DIR__ )  . 'templates/lazy-pms-page-template.php' ) {
			$template = plugin_dir_path( dirname( __FILE__ ) ). 'templates/lazy-pms-page-template.php';
		}
		if($template == '') {
			throw new \Exception('No template found');
		}

		return $template;
	}


	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks() {

		$plugin_public = new Lazy_Task_Public( $this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );

	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @return    Lazy_Task_Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     1.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}

	function add_custom_user_role() {
		add_role( 'll_pms', 'Lazy Link PMS',
			array(
				'll_pms_plugins' => true
			)
		);

		$rolesArray = array('administrator', 'editor', 'author', 'contributor');
		global $wp_roles;
		foreach ( $wp_roles as  $role_obj )
		{
//			var_dump($role_obj);die();
			if(is_array($role_obj)){
				foreach ( $role_obj as $key=>$roleName )
				{
					if(in_array($key, $rolesArray))
					{
						$role = get_role( $key);
						$role->add_cap( 'll_pms', true );
					}

				}
			}
		}
	}

}
