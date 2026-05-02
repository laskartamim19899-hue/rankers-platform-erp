<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_announcements_get_all( WP_REST_Request $req ) {
    global $wpdb;
    $audience = sanitize_text_field($req->get_param('audience') ?: '');
    $sql = "SELECT * FROM {$wpdb->prefix}rankers_announcements";
    if ($audience) $sql .= $wpdb->prepare(" WHERE target_audience=%s OR target_audience='ALL'",$audience);
    $sql .= " ORDER BY created_at DESC LIMIT 50";
    return rest_ensure_response($wpdb->get_results($sql));
}

function rankers_announcements_create( WP_REST_Request $req ) {
    global $wpdb;
    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_announcements', array(
        'id'=>$id,
        'title'          =>sanitize_text_field($req->get_param('title')),
        'content'        =>sanitize_textarea_field($req->get_param('content')),
        'type'           =>sanitize_text_field($req->get_param('type') ?: 'GENERAL'),
        'target_audience'=>sanitize_text_field($req->get_param('targetAudience') ?: 'ALL'),
    ));
    return new WP_REST_Response(array('message'=>'Announcement created','id'=>$id),201);
}

function rankers_announcements_delete( WP_REST_Request $req ) {
    global $wpdb;
    $wpdb->delete($wpdb->prefix.'rankers_announcements',array('id'=>sanitize_text_field($req->get_param('id'))));
    return rest_ensure_response(array('message'=>'Deleted'));
}
