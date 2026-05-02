<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_academic_get_courses( WP_REST_Request $req ) {
    global $wpdb;
    $rows = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}rankers_courses ORDER BY created_at DESC");
    foreach ($rows as &$r) {
        $r->batches = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_batches WHERE course_id=%s",$r->id));
        $r->student_count = (int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}rankers_student_courses WHERE course_id=%s",$r->id));
    }
    return rest_ensure_response($rows);
}

function rankers_academic_create_course( WP_REST_Request $req ) {
    global $wpdb;
    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_courses', array(
        'id'=>$id,
        'name'       =>sanitize_text_field($req->get_param('name')),
        'description'=>sanitize_textarea_field($req->get_param('description')),
        'duration'   =>sanitize_text_field($req->get_param('duration')),
    ));
    return new WP_REST_Response(array('message'=>'Course created','id'=>$id),201);
}

function rankers_academic_delete_course( WP_REST_Request $req ) {
    global $wpdb;
    $id = sanitize_text_field($req->get_param('id'));
    $wpdb->delete($wpdb->prefix.'rankers_courses',array('id'=>$id));
    return rest_ensure_response(array('message'=>'Deleted'));
}

function rankers_academic_get_batches( WP_REST_Request $req ) {
    global $wpdb;
    $rows = $wpdb->get_results(
        "SELECT b.*, c.name as course_name, u.name as teacher_name,
                COUNT(sc.student_id) as student_count
         FROM {$wpdb->prefix}rankers_batches b
         LEFT JOIN {$wpdb->prefix}rankers_courses c ON c.id=b.course_id
         LEFT JOIN {$wpdb->prefix}rankers_users u ON u.id=b.teacher_id
         LEFT JOIN {$wpdb->prefix}rankers_student_courses sc ON sc.batch_id=b.id
         GROUP BY b.id"
    );
    return rest_ensure_response($rows);
}

function rankers_academic_create_batch( WP_REST_Request $req ) {
    global $wpdb;
    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_batches', array(
        'id'=>$id,
        'name'      =>sanitize_text_field($req->get_param('name')),
        'course_id' =>sanitize_text_field($req->get_param('courseId')),
        'teacher_id'=>sanitize_text_field($req->get_param('teacherId') ?: ''),
    ));
    return new WP_REST_Response(array('message'=>'Batch created','id'=>$id),201);
}

function rankers_academic_get_tests( WP_REST_Request $req ) {
    global $wpdb;
    return rest_ensure_response($wpdb->get_results("SELECT * FROM {$wpdb->prefix}rankers_tests ORDER BY date DESC"));
}

function rankers_academic_create_test( WP_REST_Request $req ) {
    global $wpdb;
    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_tests', array(
        'id'=>$id,
        'title'    =>sanitize_text_field($req->get_param('title')),
        'type'     =>sanitize_text_field($req->get_param('type')),
        'date'     =>sanitize_text_field($req->get_param('date')),
        'max_marks'=>floatval($req->get_param('maxMarks')),
    ));
    return new WP_REST_Response(array('message'=>'Test created','id'=>$id),201);
}

function rankers_academic_record_result( WP_REST_Request $req ) {
    global $wpdb;
    $test_id   = sanitize_text_field($req->get_param('testId'));
    $student_id= sanitize_text_field($req->get_param('studentId'));
    $marks     = floatval($req->get_param('marksObtained'));
    $existing  = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}rankers_results WHERE test_id=%s AND student_id=%s",$test_id,$student_id));
    if ($existing) {
        $wpdb->update($wpdb->prefix.'rankers_results',array('marks_obtained'=>$marks),array('id'=>$existing));
        return rest_ensure_response(array('message'=>'Result updated'));
    }
    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_results',array('id'=>$id,'test_id'=>$test_id,'student_id'=>$student_id,'marks_obtained'=>$marks));
    return new WP_REST_Response(array('message'=>'Result recorded','id'=>$id),201);
}

function rankers_academic_get_results( WP_REST_Request $req ) {
    global $wpdb;
    $tid  = sanitize_text_field($req->get_param('testId'));
    $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT r.*, u.name as student_name, s.reg_no
         FROM {$wpdb->prefix}rankers_results r
         JOIN {$wpdb->prefix}rankers_students s ON s.id=r.student_id
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id
         WHERE r.test_id=%s ORDER BY r.marks_obtained DESC", $tid
    ));
    return rest_ensure_response($rows);
}
