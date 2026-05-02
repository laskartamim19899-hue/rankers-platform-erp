<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_expenses_get_all( WP_REST_Request $req ) {
    global $wpdb;
    $month = sanitize_text_field($req->get_param('month') ?: '');
    $sql   = "SELECT * FROM {$wpdb->prefix}rankers_expenses";
    if ($month) $sql .= $wpdb->prepare(" WHERE DATE_FORMAT(date,'%Y-%m')=%s",$month);
    $sql .= " ORDER BY date DESC";
    return rest_ensure_response($wpdb->get_results($sql));
}

function rankers_expenses_create( WP_REST_Request $req ) {
    global $wpdb;
    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_expenses', array(
        'id'=>$id,
        'title'      =>sanitize_text_field($req->get_param('title')),
        'category'   =>sanitize_text_field($req->get_param('category')),
        'amount'     =>floatval($req->get_param('amount')),
        'date'       =>sanitize_text_field($req->get_param('date')),
        'description'=>sanitize_textarea_field($req->get_param('description')),
        'payee_name' =>sanitize_text_field($req->get_param('payeeName')),
        'purpose'    =>sanitize_textarea_field($req->get_param('purpose')),
    ));
    return new WP_REST_Response(array('message'=>'Expense recorded','id'=>$id),201);
}

function rankers_expenses_delete( WP_REST_Request $req ) {
    global $wpdb;
    $wpdb->delete($wpdb->prefix.'rankers_expenses',array('id'=>sanitize_text_field($req->get_param('id'))));
    return rest_ensure_response(array('message'=>'Deleted'));
}
