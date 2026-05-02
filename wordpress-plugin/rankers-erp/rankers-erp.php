<?php
/**
 * Plugin Name:       Rankers Platform ERP
 * Plugin URI:        https://rankersplatform.com
 * Description:       Full-featured Institutional ERP Suite — Students, Finance, Academic, Attendance, Salary, Hostel, Inventory and more.
 * Version:           1.0.0
 * Author:            Rankers Platform
 * Author URI:        https://rankersplatform.com
 * License:           GPL-2.0+
 * Text Domain:       rankers-erp
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'RANKERS_ERP_VERSION',   '1.0.0' );
define( 'RANKERS_ERP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'RANKERS_ERP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'RANKERS_ERP_DB_VERSION', '1.0' );

// ── Includes ────────────────────────────────────────────────────────────────
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/class-activator.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/class-roles.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/class-api.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'admin/class-admin-menu.php';

// ── Activation / Deactivation ────────────────────────────────────────────────
register_activation_hook( __FILE__, array( 'Rankers_ERP_Activator', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Rankers_ERP_Activator', 'deactivate' ) );

// ── Bootstrap ────────────────────────────────────────────────────────────────
add_action( 'init', array( 'Rankers_ERP_Roles', 'register' ) );
add_action( 'rest_api_init', array( 'Rankers_ERP_API', 'register_routes' ) );
add_action( 'admin_menu', array( 'Rankers_ERP_Admin_Menu', 'register' ) );
add_action( 'admin_enqueue_scripts', 'rankers_erp_enqueue_admin_assets' );

function rankers_erp_enqueue_admin_assets( $hook ) {
    if ( strpos( $hook, 'rankers-erp' ) === false ) return;

    $asset_file = RANKERS_ERP_PLUGIN_DIR . 'build/index.asset.php';
    $deps        = file_exists( $asset_file ) ? require( $asset_file ) : array( 'dependencies' => array( 'react', 'react-dom', 'wp-element' ), 'version' => RANKERS_ERP_VERSION );

    wp_enqueue_script(
        'rankers-erp-app',
        RANKERS_ERP_PLUGIN_URL . 'build/index.js',
        $deps['dependencies'],
        $deps['version'],
        true
    );

    wp_enqueue_style(
        'rankers-erp-app',
        RANKERS_ERP_PLUGIN_URL . 'build/index.css',
        array(),
        $deps['version']
    );

    wp_localize_script( 'rankers-erp-app', 'rankersERP', array(
        'apiBase'   => rest_url( 'rankers/v1' ),
        'nonce'     => wp_create_nonce( 'wp_rest' ),
        'adminUrl'  => admin_url( 'admin.php' ),
        'siteUrl'   => get_site_url(),
        'version'   => RANKERS_ERP_VERSION,
        'currentUser' => array(
            'id'    => get_current_user_id(),
            'login' => wp_get_current_user()->user_login,
            'email' => wp_get_current_user()->user_email,
            'roles' => wp_get_current_user()->roles,
        ),
    ) );
}

// ── Shortcodes ────────────────────────────────────────────────────────────────
add_shortcode( 'rankers_apply',   'rankers_erp_shortcode_apply' );
add_shortcode( 'rankers_results', 'rankers_erp_shortcode_results' );
add_shortcode( 'rankers_courses', 'rankers_erp_shortcode_courses' );

function rankers_erp_shortcode_apply( $atts ) {
    wp_enqueue_script( 'rankers-erp-app', RANKERS_ERP_PLUGIN_URL . 'build/index.js', array( 'react', 'react-dom', 'wp-element' ), RANKERS_ERP_VERSION, true );
    wp_enqueue_style( 'rankers-erp-app', RANKERS_ERP_PLUGIN_URL . 'build/index.css', array(), RANKERS_ERP_VERSION );
    wp_localize_script( 'rankers-erp-app', 'rankersERP', array( 'apiBase' => rest_url( 'rankers/v1' ), 'nonce' => wp_create_nonce( 'wp_rest' ), 'page' => 'apply' ) );
    return '<div id="rankers-erp-root" data-page="apply"></div>';
}
function rankers_erp_shortcode_results( $atts ) {
    return '<div id="rankers-erp-root" data-page="results"></div>';
}
function rankers_erp_shortcode_courses( $atts ) {
    return '<div id="rankers-erp-root" data-page="courses"></div>';
}
