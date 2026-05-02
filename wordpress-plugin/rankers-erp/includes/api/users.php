<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_users_get_all( WP_REST_Request $req ) {
    global $wpdb;
    $role = sanitize_text_field($req->get_param('role') ?: '');
    $sql  = "SELECT id, email, name, role, photo_url, created_at FROM {$wpdb->prefix}rankers_users";
    if ($role) $sql .= $wpdb->prepare(" WHERE role=%s",$role);
    $sql .= " ORDER BY created_at DESC";
    return rest_ensure_response($wpdb->get_results($sql));
}

function rankers_users_update( WP_REST_Request $req ) {
    global $wpdb;
    $id   = sanitize_text_field($req->get_param('id'));
    $data = array_filter(array(
        'name'      =>sanitize_text_field($req->get_param('name') ?: ''),
        'email'     =>sanitize_email($req->get_param('email') ?: ''),
        'role'      =>sanitize_text_field($req->get_param('role') ?: ''),
        'photo_url' =>esc_url_raw($req->get_param('photoUrl') ?: ''),
    ), fn($v)=>$v!=='');
    $wpdb->update($wpdb->prefix.'rankers_users',$data,array('id'=>$id));
    return rest_ensure_response(array('message'=>'User updated'));
}
