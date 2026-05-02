<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_inquiries_get_all( WP_REST_Request $req ) {
    global $wpdb;
    $status = sanitize_text_field($req->get_param('status') ?: '');
    $sql    = "SELECT * FROM {$wpdb->prefix}rankers_inquiries";
    if ($status) $sql .= $wpdb->prepare(" WHERE status=%s",$status);
    $sql .= " ORDER BY created_at DESC";
    return rest_ensure_response($wpdb->get_results($sql));
}

function rankers_inquiries_create( WP_REST_Request $req ) {
    global $wpdb;
    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_inquiries', array(
        'id'=>$id,
        'name'          =>sanitize_text_field($req->get_param('name')),
        'guardian_name' =>sanitize_text_field($req->get_param('guardianName')),
        'dob'           =>sanitize_text_field($req->get_param('dob')),
        'gender'        =>sanitize_text_field($req->get_param('gender')),
        'phone'         =>sanitize_text_field($req->get_param('phone')),
        'email'         =>sanitize_email($req->get_param('email')),
        'address'       =>sanitize_textarea_field($req->get_param('address')),
        'school_name'   =>sanitize_text_field($req->get_param('schoolName')),
        'course_interest'=>sanitize_text_field($req->get_param('courseInterest')),
        'status'        =>'NEW',
    ));
    return new WP_REST_Response(array('message'=>'Inquiry submitted','id'=>$id),201);
}

function rankers_inquiries_update( WP_REST_Request $req ) {
    global $wpdb;
    $id = sanitize_text_field($req->get_param('id'));
    $wpdb->update($wpdb->prefix.'rankers_inquiries',
        array('status'=>sanitize_text_field($req->get_param('status'))),
        array('id'=>$id)
    );
    return rest_ensure_response(array('message'=>'Updated'));
}

function rankers_inquiries_delete( WP_REST_Request $req ) {
    global $wpdb;
    $wpdb->delete($wpdb->prefix.'rankers_inquiries',array('id'=>sanitize_text_field($req->get_param('id'))));
    return rest_ensure_response(array('message'=>'Deleted'));
}
