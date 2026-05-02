<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// Load all API handlers
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/auth.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/students.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/finance.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/academic.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/attendance.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/expenses.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/announcements.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/settings.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/inquiries.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/leave.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/timetable.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/inventory.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/salary.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/guest.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/hostel.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/users.php';
require_once RANKERS_ERP_PLUGIN_DIR . 'includes/api/reports.php';

class Rankers_ERP_API {

    const NS = 'rankers/v1';

    public static function register_routes() {
        // ── Auth ──────────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/auth/login',           array( 'methods' => 'POST', 'callback' => 'rankers_auth_login',           'permission_callback' => '__return_true' ) );
        register_rest_route( self::NS, '/auth/register',        array( 'methods' => 'POST', 'callback' => 'rankers_auth_register',         'permission_callback' => '__return_true' ) );
        register_rest_route( self::NS, '/auth/forgot-password', array( 'methods' => 'POST', 'callback' => 'rankers_auth_forgot_password',  'permission_callback' => '__return_true' ) );
        register_rest_route( self::NS, '/auth/reset-password',  array( 'methods' => 'POST', 'callback' => 'rankers_auth_reset_password',   'permission_callback' => '__return_true' ) );
        register_rest_route( self::NS, '/auth/change-password', array( 'methods' => 'POST', 'callback' => 'rankers_auth_change_password',  'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/auth/me',              array( 'methods' => 'GET',  'callback' => 'rankers_auth_me',               'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Students ──────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/students',                     array( 'methods' => 'GET',   'callback' => 'rankers_students_get_all',        'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/students',                     array( 'methods' => 'POST',  'callback' => 'rankers_students_create',         'permission_callback' => '__return_true' ) );
        register_rest_route( self::NS, '/students/pending',             array( 'methods' => 'GET',   'callback' => 'rankers_students_get_pending',    'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/students/search/(?P<regNo>[^/]+)', array( 'methods' => 'GET', 'callback' => 'rankers_students_search_regno', 'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/students/(?P<id>[^/]+)',       array( 'methods' => 'GET',   'callback' => 'rankers_students_get_one',        'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/students/(?P<id>[^/]+)',       array( 'methods' => 'PUT',   'callback' => 'rankers_students_update',         'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/students/(?P<id>[^/]+)',       array( 'methods' => 'DELETE','callback' => 'rankers_students_delete',         'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/students/(?P<id>[^/]+)/approve', array( 'methods' => 'PUT', 'callback' => 'rankers_students_approve',       'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Finance ───────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/finance/fees/(?P<studentId>[^/]+)', array( 'methods' => 'GET',  'callback' => 'rankers_finance_get_fees',    'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/finance/fees/allocate',             array( 'methods' => 'POST', 'callback' => 'rankers_finance_allocate_fee','permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/finance/payments',                  array( 'methods' => 'POST', 'callback' => 'rankers_finance_record_payment','permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/finance/payments/(?P<id>[^/]+)',    array( 'methods' => 'GET',  'callback' => 'rankers_finance_get_payment', 'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/finance/payments/(?P<id>[^/]+)',    array( 'methods' => 'DELETE','callback' => 'rankers_finance_delete_payment','permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/finance/dues',                      array( 'methods' => 'GET',  'callback' => 'rankers_finance_get_dues',    'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/finance/ledger',                    array( 'methods' => 'GET',  'callback' => 'rankers_finance_get_ledger',  'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Academic ──────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/academic/courses',              array( 'methods' => 'GET',   'callback' => 'rankers_academic_get_courses',   'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/academic/courses',              array( 'methods' => 'POST',  'callback' => 'rankers_academic_create_course', 'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/academic/courses/(?P<id>[^/]+)',array( 'methods' => 'DELETE','callback' => 'rankers_academic_delete_course', 'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/academic/batches',              array( 'methods' => 'GET',   'callback' => 'rankers_academic_get_batches',   'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/academic/batches',              array( 'methods' => 'POST',  'callback' => 'rankers_academic_create_batch',  'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/academic/tests',                array( 'methods' => 'GET',   'callback' => 'rankers_academic_get_tests',     'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/academic/tests',                array( 'methods' => 'POST',  'callback' => 'rankers_academic_create_test',   'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/academic/results',              array( 'methods' => 'POST',  'callback' => 'rankers_academic_record_result', 'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/academic/results/(?P<testId>[^/]+)', array( 'methods' => 'GET', 'callback' => 'rankers_academic_get_results','permission_callback' => 'rankers_is_authenticated' ) );

        // ── Attendance ────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/attendance',            array( 'methods' => 'POST', 'callback' => 'rankers_attendance_mark',      'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/attendance/batch/(?P<batchId>[^/]+)', array( 'methods' => 'GET', 'callback' => 'rankers_attendance_get_batch','permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/attendance/student/(?P<studentId>[^/]+)', array( 'methods' => 'GET', 'callback' => 'rankers_attendance_get_student','permission_callback' => 'rankers_is_authenticated' ) );

        // ── Expenses ──────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/expenses',              array( 'methods' => 'GET',   'callback' => 'rankers_expenses_get_all', 'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/expenses',              array( 'methods' => 'POST',  'callback' => 'rankers_expenses_create',  'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/expenses/(?P<id>[^/]+)',array( 'methods' => 'DELETE','callback' => 'rankers_expenses_delete',  'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Announcements ─────────────────────────────────────────────────────
        register_rest_route( self::NS, '/announcements',              array( 'methods' => 'GET',   'callback' => 'rankers_announcements_get_all', 'permission_callback' => '__return_true' ) );
        register_rest_route( self::NS, '/announcements',              array( 'methods' => 'POST',  'callback' => 'rankers_announcements_create',  'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/announcements/(?P<id>[^/]+)',array( 'methods' => 'DELETE','callback' => 'rankers_announcements_delete',  'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Settings ──────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/settings', array( 'methods' => 'GET', 'callback' => 'rankers_settings_get', 'permission_callback' => '__return_true' ) );
        register_rest_route( self::NS, '/settings', array( 'methods' => 'PUT', 'callback' => 'rankers_settings_update', 'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Inquiries ─────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/inquiries',              array( 'methods' => 'GET',  'callback' => 'rankers_inquiries_get_all', 'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/inquiries',              array( 'methods' => 'POST', 'callback' => 'rankers_inquiries_create',  'permission_callback' => '__return_true' ) );
        register_rest_route( self::NS, '/inquiries/(?P<id>[^/]+)',array( 'methods' => 'PUT',  'callback' => 'rankers_inquiries_update',  'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/inquiries/(?P<id>[^/]+)',array( 'methods' => 'DELETE','callback' => 'rankers_inquiries_delete', 'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Leave ─────────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/leaves',              array( 'methods' => 'GET',  'callback' => 'rankers_leave_get_all', 'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/leaves',              array( 'methods' => 'POST', 'callback' => 'rankers_leave_create',  'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/leaves/(?P<id>[^/]+)',array( 'methods' => 'PUT',  'callback' => 'rankers_leave_update',  'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Timetable ─────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/timetable/(?P<batchId>[^/]+)',       array( 'methods' => 'GET',  'callback' => 'rankers_timetable_get',    'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/timetable/(?P<batchId>[^/]+)/slots', array( 'methods' => 'POST', 'callback' => 'rankers_timetable_add_slot','permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/timetable/slots/(?P<id>[^/]+)',      array( 'methods' => 'DELETE','callback' => 'rankers_timetable_delete_slot','permission_callback' => 'rankers_is_authenticated' ) );

        // ── Inventory ─────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/inventory',              array( 'methods' => 'GET',   'callback' => 'rankers_inventory_get_all',    'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/inventory',              array( 'methods' => 'POST',  'callback' => 'rankers_inventory_create',     'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/inventory/issue',        array( 'methods' => 'POST',  'callback' => 'rankers_inventory_issue',      'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/inventory/return/(?P<id>[^/]+)', array( 'methods' => 'PUT', 'callback' => 'rankers_inventory_return', 'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Salary ────────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/salary/staff',                   array( 'methods' => 'GET',  'callback' => 'rankers_salary_get_staff',    'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/salary/staff',                   array( 'methods' => 'POST', 'callback' => 'rankers_salary_create_staff', 'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/salary/pay',                     array( 'methods' => 'POST', 'callback' => 'rankers_salary_pay',          'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/salary/records',                 array( 'methods' => 'GET',  'callback' => 'rankers_salary_get_records',  'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/salary/slip/(?P<id>[^/]+)',      array( 'methods' => 'GET',  'callback' => 'rankers_salary_get_slip',     'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Guest Teachers ────────────────────────────────────────────────────
        register_rest_route( self::NS, '/guest',              array( 'methods' => 'GET',  'callback' => 'rankers_guest_get_all',   'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/guest',              array( 'methods' => 'POST', 'callback' => 'rankers_guest_create',    'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/guest/pay',          array( 'methods' => 'POST', 'callback' => 'rankers_guest_pay',       'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/guest/(?P<id>[^/]+)',array( 'methods' => 'DELETE','callback' => 'rankers_guest_delete',   'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Hostel ────────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/hostel',              array( 'methods' => 'GET',  'callback' => 'rankers_hostel_get_all',  'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/hostel/allocate',     array( 'methods' => 'POST', 'callback' => 'rankers_hostel_allocate','permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/hostel/allocations',  array( 'methods' => 'GET',  'callback' => 'rankers_hostel_get_allocations','permission_callback' => 'rankers_is_authenticated' ) );

        // ── Users ─────────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/users',              array( 'methods' => 'GET',  'callback' => 'rankers_users_get_all', 'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/users/(?P<id>[^/]+)',array( 'methods' => 'PUT',  'callback' => 'rankers_users_update',  'permission_callback' => 'rankers_is_authenticated' ) );

        // ── Reports ───────────────────────────────────────────────────────────
        register_rest_route( self::NS, '/reports/dashboard',    array( 'methods' => 'GET', 'callback' => 'rankers_reports_dashboard',   'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/reports/attendance',   array( 'methods' => 'GET', 'callback' => 'rankers_reports_attendance',  'permission_callback' => 'rankers_is_authenticated' ) );
        register_rest_route( self::NS, '/reports/finance',      array( 'methods' => 'GET', 'callback' => 'rankers_reports_finance',     'permission_callback' => 'rankers_is_authenticated' ) );
    }
}

// ── Shared permission callback ─────────────────────────────────────────────────
function rankers_is_authenticated( WP_REST_Request $request ) {
    $token = $request->get_header( 'X-Rankers-Token' );
    if ( ! $token ) return new WP_Error( 'unauthorized', 'Authentication required', array( 'status' => 401 ) );
    $user_id = get_transient( 'rankers_token_' . $token );
    if ( ! $user_id ) return new WP_Error( 'unauthorized', 'Invalid or expired token', array( 'status' => 401 ) );
    return true;
}

// ── Get user from token ────────────────────────────────────────────────────────
function rankers_get_user_from_token( WP_REST_Request $request ) {
    global $wpdb;
    $token   = $request->get_header( 'X-Rankers-Token' );
    $user_id = get_transient( 'rankers_token_' . $token );
    return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}rankers_users WHERE id = %s", $user_id ) );
}

// ── UUID helper ───────────────────────────────────────────────────────────────
function rankers_uuid() {
    return wp_generate_uuid4();
}
