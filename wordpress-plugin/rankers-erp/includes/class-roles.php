<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Rankers_ERP_Roles {
    public static function register() {
        $roles = array(
            'rankers_super_admin' => array(
                'display_name' => 'Rankers Super Admin',
                'capabilities' => array(
                    'read' => true, 'upload_files' => true,
                    'rankers_manage_all' => true, 'rankers_manage_finance' => true,
                    'rankers_manage_students' => true, 'rankers_manage_staff' => true,
                    'rankers_view_reports' => true, 'rankers_manage_settings' => true,
                ),
            ),
            'rankers_admin' => array(
                'display_name' => 'Rankers Admin',
                'capabilities' => array(
                    'read' => true, 'upload_files' => true,
                    'rankers_manage_finance' => true, 'rankers_manage_students' => true,
                    'rankers_manage_staff' => true, 'rankers_view_reports' => true,
                ),
            ),
            'rankers_accountant' => array(
                'display_name' => 'Rankers Accountant',
                'capabilities' => array(
                    'read' => true,
                    'rankers_manage_finance' => true, 'rankers_view_reports' => true,
                ),
            ),
            'rankers_teacher' => array(
                'display_name' => 'Rankers Teacher',
                'capabilities' => array(
                    'read' => true,
                    'rankers_manage_academic' => true,
                ),
            ),
            'rankers_student' => array(
                'display_name' => 'Rankers Student',
                'capabilities' => array(
                    'read' => true,
                    'rankers_view_own' => true,
                ),
            ),
        );

        foreach ( $roles as $role_key => $role_data ) {
            if ( ! get_role( $role_key ) ) {
                add_role( $role_key, $role_data['display_name'], $role_data['capabilities'] );
            }
        }
    }
}
