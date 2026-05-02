<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_attendance_mark( WP_REST_Request $req ) {
    global $wpdb;
    $records = (array)$req->get_param('records'); // [{studentId, batchId, date, status, timetableSlotId?}]
    $count   = 0;
    foreach ($records as $r) {
        $sid  = sanitize_text_field($r['studentId'] ?? '');
        $bid  = sanitize_text_field($r['batchId']   ?? '');
        $date = sanitize_text_field($r['date']       ?? '');
        $st   = sanitize_text_field($r['status']     ?? 'PRESENT');
        $slot = sanitize_text_field($r['timetableSlotId'] ?? '');
        if (!$sid || !$bid || !$date) continue;
        // Upsert
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}rankers_attendance WHERE student_id=%s AND batch_id=%s AND date=%s",
            $sid,$bid,$date
        ));
        if ($existing) {
            $wpdb->update($wpdb->prefix.'rankers_attendance',array('status'=>$st),array('id'=>$existing));
        } else {
            $wpdb->insert($wpdb->prefix.'rankers_attendance',array(
                'id'=>rankers_uuid(),'student_id'=>$sid,'batch_id'=>$bid,
                'timetable_slot_id'=>$slot ?: null,'date'=>$date,'status'=>$st
            ));
        }
        $count++;
    }
    return rest_ensure_response(array('message'=>"$count records saved"));
}

function rankers_attendance_get_batch( WP_REST_Request $req ) {
    global $wpdb;
    $bid  = sanitize_text_field($req->get_param('batchId'));
    $date = sanitize_text_field($req->get_param('date') ?: '');
    $sql  = $wpdb->prepare(
        "SELECT a.*, u.name as student_name, s.reg_no FROM {$wpdb->prefix}rankers_attendance a
         JOIN {$wpdb->prefix}rankers_students s ON s.id=a.student_id
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id
         WHERE a.batch_id=%s", $bid
    );
    if ($date) $sql .= $wpdb->prepare(" AND a.date=%s",$date);
    $sql .= " ORDER BY a.date DESC";
    return rest_ensure_response($wpdb->get_results($sql));
}

function rankers_attendance_get_student( WP_REST_Request $req ) {
    global $wpdb;
    $sid  = sanitize_text_field($req->get_param('studentId'));
    $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT a.*, b.name as batch_name FROM {$wpdb->prefix}rankers_attendance a
         JOIN {$wpdb->prefix}rankers_batches b ON b.id=a.batch_id
         WHERE a.student_id=%s ORDER BY a.date DESC", $sid
    ));
    $total   = count($rows);
    $present = count(array_filter($rows, fn($r)=>$r->status==='PRESENT'));
    return rest_ensure_response(array('records'=>$rows,'total'=>$total,'present'=>$present,'percentage'=>$total>0?round($present/$total*100,1):0));
}
