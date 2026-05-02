<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_hostel_get_all( WP_REST_Request $req ) {
    global $wpdb;
    $rows = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}rankers_hostels ORDER BY room_number");
    foreach ($rows as &$r) {
        $r->occupancy = (int)$wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}rankers_hostel_allocations WHERE hostel_id=%s AND (leave_date IS NULL OR leave_date > CURDATE())",$r->id
        ));
    }
    return rest_ensure_response($rows);
}

function rankers_hostel_allocate( WP_REST_Request $req ) {
    global $wpdb;
    $student_id = sanitize_text_field($req->get_param('studentId'));
    $hostel_id  = sanitize_text_field($req->get_param('hostelId'));
    $join_date  = sanitize_text_field($req->get_param('joinDate') ?: gmdate('Y-m-d'));

    $existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}rankers_hostel_allocations WHERE student_id=%s AND (leave_date IS NULL OR leave_date > CURDATE())",$student_id));
    if ($existing) return new WP_Error('exists','Student already allocated to a hostel',array('status'=>400));

    $hostel = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_hostels WHERE id=%s",$hostel_id));
    if (!$hostel) return new WP_Error('not_found','Hostel not found',array('status'=>404));

    $occ = (int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}rankers_hostel_allocations WHERE hostel_id=%s AND (leave_date IS NULL OR leave_date > CURDATE())",$hostel_id));
    if ($occ >= $hostel->capacity) return new WP_Error('full','Hostel room is full',array('status'=>400));

    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_hostel_allocations',array('id'=>$id,'student_id'=>$student_id,'hostel_id'=>$hostel_id,'join_date'=>$join_date));
    return new WP_REST_Response(array('message'=>'Student allocated to hostel','id'=>$id),201);
}

function rankers_hostel_get_allocations( WP_REST_Request $req ) {
    global $wpdb;
    return rest_ensure_response($wpdb->get_results(
        "SELECT ha.*, u.name as student_name, s.reg_no, h.room_number
         FROM {$wpdb->prefix}rankers_hostel_allocations ha
         JOIN {$wpdb->prefix}rankers_students s ON s.id=ha.student_id
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id
         JOIN {$wpdb->prefix}rankers_hostels h ON h.id=ha.hostel_id
         ORDER BY ha.join_date DESC"
    ));
}
