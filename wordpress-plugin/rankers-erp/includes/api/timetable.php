<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_timetable_get( WP_REST_Request $req ) {
    global $wpdb;
    $bid  = sanitize_text_field($req->get_param('batchId'));
    $tt   = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_timetables WHERE batch_id=%s",$bid));
    if (!$tt) return rest_ensure_response(null);
    $tt->slots = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_timetable_slots WHERE timetable_id=%s ORDER BY FIELD(day,'MON','TUE','WED','THU','FRI','SAT'), start_time",$tt->id));
    return rest_ensure_response($tt);
}

function rankers_timetable_add_slot( WP_REST_Request $req ) {
    global $wpdb;
    $bid = sanitize_text_field($req->get_param('batchId'));
    $tt  = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}rankers_timetables WHERE batch_id=%s",$bid));
    if (!$tt) {
        $ttid = rankers_uuid();
        $wpdb->insert($wpdb->prefix.'rankers_timetables',array('id'=>$ttid,'batch_id'=>$bid));
    } else { $ttid = $tt->id; }
    $sid = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_timetable_slots', array(
        'id'=>$sid,'timetable_id'=>$ttid,
        'day'         =>sanitize_text_field($req->get_param('day')),
        'start_time'  =>sanitize_text_field($req->get_param('startTime')),
        'end_time'    =>sanitize_text_field($req->get_param('endTime')),
        'subject'     =>sanitize_text_field($req->get_param('subject')),
        'teacher_name'=>sanitize_text_field($req->get_param('teacherName') ?: ''),
        'room_no'     =>sanitize_text_field($req->get_param('roomNo') ?: ''),
    ));
    return new WP_REST_Response(array('message'=>'Slot added','id'=>$sid),201);
}

function rankers_timetable_delete_slot( WP_REST_Request $req ) {
    global $wpdb;
    $wpdb->delete($wpdb->prefix.'rankers_timetable_slots',array('id'=>sanitize_text_field($req->get_param('id'))));
    return rest_ensure_response(array('message'=>'Slot deleted'));
}
