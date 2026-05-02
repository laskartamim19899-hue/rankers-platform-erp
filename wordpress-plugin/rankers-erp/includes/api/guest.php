<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_guest_get_all( WP_REST_Request $req ) {
    global $wpdb;
    $rows = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}rankers_guest_teachers ORDER BY created_at DESC");
    foreach ($rows as &$r) {
        $r->payments = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_guest_payments WHERE guest_teacher_id=%s ORDER BY paid_at DESC",$r->id));
    }
    return rest_ensure_response($rows);
}

function rankers_guest_create( WP_REST_Request $req ) {
    global $wpdb;
    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_guest_teachers', array(
        'id'=>$id,
        'name'          =>sanitize_text_field($req->get_param('name')),
        'phone'         =>sanitize_text_field($req->get_param('phone') ?: ''),
        'email'         =>sanitize_email($req->get_param('email') ?: ''),
        'subject'       =>sanitize_text_field($req->get_param('subject')),
        'qualification' =>sanitize_text_field($req->get_param('qualification') ?: ''),
        'rate_per_class'=>floatval($req->get_param('ratePerClass')),
    ));
    return new WP_REST_Response(array('message'=>'Guest teacher added','id'=>$id),201);
}

function rankers_guest_pay( WP_REST_Request $req ) {
    global $wpdb;
    $id       = rankers_uuid();
    $classes  = intval($req->get_param('classesHeld'));
    $rate     = floatval($req->get_param('ratePerClass'));
    $class_amt= $classes * $rate;
    $allow    = floatval($req->get_param('allowances') ?: 0);
    $total    = $class_amt + $allow;
    $wpdb->insert($wpdb->prefix.'rankers_guest_payments', array(
        'id'=>$id,
        'guest_teacher_id'=>sanitize_text_field($req->get_param('guestTeacherId')),
        'month'           =>sanitize_text_field($req->get_param('month')),
        'classes_held'    =>$classes,'rate_per_class'=>$rate,
        'class_amount'    =>$class_amt,'allowances'=>$allow,'total_amount'=>$total,
        'payment_mode'    =>sanitize_text_field($req->get_param('paymentMode') ?: 'CASH'),
        'transaction_id'  =>sanitize_text_field($req->get_param('transactionId') ?: ''),
        'remarks'         =>sanitize_textarea_field($req->get_param('remarks') ?: ''),
        'status'          =>'PAID',
    ));
    return new WP_REST_Response(array('message'=>'Payment recorded','id'=>$id,'totalAmount'=>$total),201);
}

function rankers_guest_delete( WP_REST_Request $req ) {
    global $wpdb;
    $id = sanitize_text_field($req->get_param('id'));
    $wpdb->delete($wpdb->prefix.'rankers_guest_payments',array('guest_teacher_id'=>$id));
    $wpdb->delete($wpdb->prefix.'rankers_guest_teachers',array('id'=>$id));
    return rest_ensure_response(array('message'=>'Deleted'));
}
