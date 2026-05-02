<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_settings_get( WP_REST_Request $req ) {
    global $wpdb;
    $row = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}rankers_settings WHERE id='singleton'");
    if (!$row) return new WP_Error('not_found','Settings not found',array('status'=>404));
    return rest_ensure_response(array(
        'lateFeePerDay'   =>floatval($row->late_fee_per_day),
        'gracePeriodDays' =>intval($row->grace_period_days),
        'lateFeeEnabled'  =>(bool)$row->late_fee_enabled,
        'institutionName' =>$row->institution_name,
        'phone'           =>$row->phone,'email'=>$row->email,
        'website'         =>$row->website,'address'=>$row->address,
        'gstNumber'       =>$row->gst_number,'tagline'=>$row->tagline,
        'principalName'   =>$row->principal_name,
    ));
}

function rankers_settings_update( WP_REST_Request $req ) {
    global $wpdb;
    $data = array_filter(array(
        'late_fee_per_day'  => $req->get_param('lateFeePerDay') !== null ? floatval($req->get_param('lateFeePerDay')) : null,
        'grace_period_days' => $req->get_param('gracePeriodDays') !== null ? intval($req->get_param('gracePeriodDays')) : null,
        'late_fee_enabled'  => $req->get_param('lateFeeEnabled') !== null ? ($req->get_param('lateFeeEnabled') ? 1 : 0) : null,
        'institution_name'  => sanitize_text_field($req->get_param('institutionName') ?: ''),
        'phone'             => sanitize_text_field($req->get_param('phone') ?: ''),
        'email'             => sanitize_email($req->get_param('email') ?: ''),
        'website'           => esc_url_raw($req->get_param('website') ?: ''),
        'address'           => sanitize_textarea_field($req->get_param('address') ?: ''),
        'gst_number'        => sanitize_text_field($req->get_param('gstNumber') ?: ''),
        'tagline'           => sanitize_text_field($req->get_param('tagline') ?: ''),
        'principal_name'    => sanitize_text_field($req->get_param('principalName') ?: ''),
    ), fn($v) => $v !== null && $v !== '');
    $wpdb->update($wpdb->prefix.'rankers_settings',$data,array('id'=>'singleton'));
    return rest_ensure_response(array('message'=>'Settings updated'));
}
