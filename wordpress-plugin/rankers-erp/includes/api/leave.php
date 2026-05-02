<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_leave_get_all( WP_REST_Request $req ) {
    global $wpdb;
    $status = sanitize_text_field($req->get_param('status') ?: '');
    $sql    = "SELECT l.*, u.name as student_name, s.reg_no
               FROM {$wpdb->prefix}rankers_leave_passes l
               JOIN {$wpdb->prefix}rankers_students s ON s.id=l.student_id
               JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id";
    if ($status) $sql .= $wpdb->prepare(" WHERE l.status=%s",$status);
    $sql .= " ORDER BY l.issued_at DESC";
    return rest_ensure_response($wpdb->get_results($sql));
}

function rankers_leave_create( WP_REST_Request $req ) {
    global $wpdb;
    $id      = rankers_uuid();
    $count   = (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}rankers_leave_passes");
    $pass_no = sprintf('LP-%s-%04d', gmdate('Y'), $count+1);
    $wpdb->insert($wpdb->prefix.'rankers_leave_passes', array(
        'id'         =>$id,
        'student_id' =>sanitize_text_field($req->get_param('studentId')),
        'reason'     =>sanitize_textarea_field($req->get_param('reason')),
        'destination'=>sanitize_text_field($req->get_param('destination')),
        'start_date' =>sanitize_text_field($req->get_param('startDate')),
        'end_date'   =>sanitize_text_field($req->get_param('endDate')),
        'status'     =>sanitize_text_field($req->get_param('status') ?: 'APPROVED'),
        'pass_no'    =>$pass_no,
        'issued_by'  =>sanitize_text_field($req->get_param('issuedBy')),
        'notes'      =>sanitize_textarea_field($req->get_param('notes') ?: ''),
    ));
    return new WP_REST_Response(array('message'=>'Leave pass created','id'=>$id,'passNo'=>$pass_no),201);
}

function rankers_leave_update( WP_REST_Request $req ) {
    global $wpdb;
    $id   = sanitize_text_field($req->get_param('id'));
    $data = array_filter(array(
        'status'      =>sanitize_text_field($req->get_param('status') ?: ''),
        'returned_at' =>$req->get_param('returnedAt') ? sanitize_text_field($req->get_param('returnedAt')) : null,
        'notes'       =>sanitize_textarea_field($req->get_param('notes') ?: ''),
    ), fn($v)=>$v!==null&&$v!=='');
    $wpdb->update($wpdb->prefix.'rankers_leave_passes',$data,array('id'=>$id));
    return rest_ensure_response(array('message'=>'Updated'));
}
