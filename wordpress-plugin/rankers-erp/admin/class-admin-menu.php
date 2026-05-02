<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Rankers_ERP_Admin_Menu {
    public static function register() {
        add_menu_page(
            'Rankers ERP',
            'Rankers ERP',
            'read',
            'rankers-erp',
            array( __CLASS__, 'render_page' ),
            'dashicons-welcome-learn-more',
            3
        );
        $sub_pages = array(
            array('Dashboard',    'rankers-erp'),
            array('Students',     'rankers-erp-students'),
            array('Finance',      'rankers-erp-finance'),
            array('Academic',     'rankers-erp-academic'),
            array('Attendance',   'rankers-erp-attendance'),
            array('Admissions',   'rankers-erp-admissions'),
            array('Reports',      'rankers-erp-reports'),
            array('Expenses',     'rankers-erp-expenses'),
            array('Salary',       'rankers-erp-salary'),
            array('Staff',        'rankers-erp-staff'),
            array('Hostel',       'rankers-erp-hostel'),
            array('Inventory',    'rankers-erp-inventory'),
            array('Leave',        'rankers-erp-leave'),
            array('Timetable',    'rankers-erp-timetable'),
            array('Announcements','rankers-erp-announcements'),
            array('Inquiries',    'rankers-erp-inquiries'),
            array('Guest Teachers','rankers-erp-guest'),
            array('Settings',     'rankers-erp-settings'),
        );
        foreach ( $sub_pages as $i => $sub ) {
            add_submenu_page(
                'rankers-erp',
                $sub[0] . ' — Rankers ERP',
                $sub[0],
                'read',
                $sub[1],
                array( __CLASS__, 'render_page' )
            );
        }
        // Remove duplicate first submenu
        remove_submenu_page('rankers-erp','rankers-erp');
        add_submenu_page('rankers-erp','Dashboard — Rankers ERP','Dashboard','read','rankers-erp',array(__CLASS__,'render_page'));
    }

    public static function render_page() {
        $page = sanitize_text_field( $_GET['page'] ?? 'rankers-erp' );
        $map  = array(
            'rankers-erp'              => 'dashboard',
            'rankers-erp-students'     => 'students',
            'rankers-erp-finance'      => 'finance',
            'rankers-erp-academic'     => 'academic',
            'rankers-erp-attendance'   => 'attendance',
            'rankers-erp-admissions'   => 'admissions',
            'rankers-erp-reports'      => 'reports',
            'rankers-erp-expenses'     => 'expenses',
            'rankers-erp-salary'       => 'salary',
            'rankers-erp-staff'        => 'staff',
            'rankers-erp-hostel'       => 'hostel',
            'rankers-erp-inventory'    => 'inventory',
            'rankers-erp-leave'        => 'leave',
            'rankers-erp-timetable'    => 'timetable',
            'rankers-erp-announcements'=> 'announcements',
            'rankers-erp-inquiries'    => 'inquiries',
            'rankers-erp-guest'        => 'guest',
            'rankers-erp-settings'     => 'settings',
        );
        $current = $map[$page] ?? 'dashboard';
        include RANKERS_ERP_PLUGIN_DIR . 'admin/partials/admin-page.php';
    }
}
