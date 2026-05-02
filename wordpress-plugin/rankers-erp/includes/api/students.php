<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_students_get_all( WP_REST_Request $req ) {
    global $wpdb;
    $rows = $wpdb->get_results(
        "SELECT s.*, u.name, u.email,
            GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR '||') AS course_names,
            GROUP_CONCAT(DISTINCT b.name ORDER BY b.name SEPARATOR '||') AS batch_names
         FROM {$wpdb->prefix}rankers_students s
         JOIN {$wpdb->prefix}rankers_users u ON u.id = s.user_id
         LEFT JOIN {$wpdb->prefix}rankers_student_courses sc ON sc.student_id = s.id
         LEFT JOIN {$wpdb->prefix}rankers_courses c ON c.id = sc.course_id
         LEFT JOIN {$wpdb->prefix}rankers_batches b ON b.id = sc.batch_id
         GROUP BY s.id ORDER BY s.id DESC"
    );
    return rest_ensure_response( array_map( 'rankers_format_student', $rows ) );
}

function rankers_students_get_pending( WP_REST_Request $req ) {
    global $wpdb;
    $rows = $wpdb->get_results(
        "SELECT s.*, u.name, u.email FROM {$wpdb->prefix}rankers_students s
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id
         WHERE s.status='PENDING' ORDER BY s.id DESC"
    );
    return rest_ensure_response( $rows );
}

function rankers_students_get_one( WP_REST_Request $req ) {
    global $wpdb;
    $id  = sanitize_text_field( $req->get_param('id') );
    $row = $wpdb->get_row( $wpdb->prepare(
        "SELECT s.*, u.name, u.email FROM {$wpdb->prefix}rankers_students s
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id WHERE s.id=%s", $id
    ) );
    if ( ! $row ) return new WP_Error('not_found','Student not found',array('status'=>404));

    $fees = $wpdb->get_results( $wpdb->prepare(
        "SELECT f.*, c.name as course_name FROM {$wpdb->prefix}rankers_fees f
         JOIN {$wpdb->prefix}rankers_courses c ON c.id=f.course_id WHERE f.student_id=%s ORDER BY f.due_date", $id
    ) );
    foreach ( $fees as &$fee ) {
        $fee->payments = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_payments WHERE fee_id=%s",$fee->id));
    }
    $row->fees    = $fees;
    $row->courses = $wpdb->get_results($wpdb->prepare(
        "SELECT sc.*, c.name as course_name, b.name as batch_name
         FROM {$wpdb->prefix}rankers_student_courses sc
         JOIN {$wpdb->prefix}rankers_courses c ON c.id=sc.course_id
         LEFT JOIN {$wpdb->prefix}rankers_batches b ON b.id=sc.batch_id WHERE sc.student_id=%s", $id
    ));
    return rest_ensure_response( $row );
}

function rankers_students_create( WP_REST_Request $req ) {
    global $wpdb;
    $email  = sanitize_email( $req->get_param('email') );
    $name   = sanitize_text_field( $req->get_param('name') );
    $batch_id = sanitize_text_field( $req->get_param('batchId') );

    if ( $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}rankers_users WHERE email=%s",$email)) ) {
        return new WP_Error('user_exists','User with this email already exists',array('status'=>400));
    }

    $user_id = rankers_uuid();
    $wpdb->insert( $wpdb->prefix.'rankers_users', array(
        'id'=>$user_id,'email'=>$email,
        'password_hash'=>password_hash($req->get_param('password') ?: 'password123', PASSWORD_BCRYPT),
        'name'=>$name,'role'=>'STUDENT'
    ));

    $sid = rankers_uuid();
    $wpdb->insert( $wpdb->prefix.'rankers_students', array(
        'id'=>$sid,'user_id'=>$user_id,
        'guardian_name' => sanitize_text_field($req->get_param('guardianName')),
        'dob'           => sanitize_text_field($req->get_param('dob')),
        'gender'        => sanitize_text_field($req->get_param('gender')),
        'phone'         => sanitize_text_field($req->get_param('phone')),
        'address'       => sanitize_textarea_field($req->get_param('address')),
        'school_name'   => sanitize_text_field($req->get_param('schoolName')),
        'madhyamik_marks'    => $req->get_param('madhyamikMarks'),
        'hs_marks_physics'   => $req->get_param('hsMarksPhysics'),
        'hs_marks_chemistry' => $req->get_param('hsMarksChemistry'),
        'hs_marks_biology'   => $req->get_param('hsMarksBiology'),
        'prev_neet_marks'    => $req->get_param('prevNeetMarks'),
        'is_residential'     => $req->get_param('isResidential') ? 1 : 0,
        'status'        => 'PENDING',
    ));

    $course_id = null;
    if ( $batch_id ) {
        $batch = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_batches WHERE id=%s",$batch_id));
        if ( $batch ) {
            $course_id = $batch->course_id;
            $wpdb->insert($wpdb->prefix.'rankers_student_courses',array('student_id'=>$sid,'course_id'=>$course_id,'batch_id'=>$batch_id));
        }
    }

    $af = $req->get_param('academicFee');
    $mh = $req->get_param('monthlyHostelFee');
    $ir = $req->get_param('isResidential');
    if ( $course_id && $af ) {
        $wpdb->insert($wpdb->prefix.'rankers_fees',array('id'=>rankers_uuid(),'student_id'=>$sid,'course_id'=>$course_id,'amount'=>floatval($af),'type'=>'ACADEMIC','due_date'=>gmdate('Y-m-d'),'status'=>'PENDING'));
    }
    if ( $course_id && $ir && $mh ) {
        $months = array('JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC');
        $start  = (int)gmdate('n') - 1;
        for ( $i=0; $i<12; $i++ ) {
            $m = ($start+$i)%12;
            $yr= (int)gmdate('Y') + intdiv($start+$i,12);
            $wpdb->insert($wpdb->prefix.'rankers_fees',array('id'=>rankers_uuid(),'student_id'=>$sid,'course_id'=>$course_id,'amount'=>floatval($mh),'type'=>'HOSTEL','month'=>$months[$m],'due_date'=>sprintf('%04d-%02d-10',$yr,$m+1),'status'=>'PENDING'));
        }
    }

    return new WP_REST_Response(array('message'=>'Student registered','studentId'=>$sid),201);
}

function rankers_students_approve( WP_REST_Request $req ) {
    global $wpdb;
    $id  = sanitize_text_field($req->get_param('id'));
    $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_students WHERE id=%s",$id));
    if (!$row) return new WP_Error('not_found','Not found',array('status'=>404));
    if ($row->status==='APPROVED') return new WP_Error('already','Already approved',array('status'=>400));
    $count  = (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}rankers_students");
    $reg_no = sprintf('RP-%s-%04d',gmdate('Y'),$count+1);
    $wpdb->update($wpdb->prefix.'rankers_students',array('status'=>'APPROVED','reg_no'=>$reg_no),array('id'=>$id));
    return rest_ensure_response(array('message'=>'Approved','regNo'=>$reg_no));
}

function rankers_students_update( WP_REST_Request $req ) {
    global $wpdb;
    $id   = sanitize_text_field($req->get_param('id'));
    $data = array_filter(array(
        'phone'         => $req->get_param('phone') ? sanitize_text_field($req->get_param('phone')) : null,
        'address'       => $req->get_param('address') ? sanitize_textarea_field($req->get_param('address')) : null,
        'photo_url'     => $req->get_param('photoUrl') ? esc_url_raw($req->get_param('photoUrl')) : null,
        'guardian_name' => $req->get_param('guardianName') ? sanitize_text_field($req->get_param('guardianName')) : null,
        'school_name'   => $req->get_param('schoolName') ? sanitize_text_field($req->get_param('schoolName')) : null,
    ), fn($v) => $v !== null);
    $wpdb->update($wpdb->prefix.'rankers_students',$data,array('id'=>$id));
    return rest_ensure_response(array('message'=>'Student updated'));
}

function rankers_students_search_regno( WP_REST_Request $req ) {
    global $wpdb;
    $reg = sanitize_text_field($req->get_param('regNo'));
    $row = $wpdb->get_row($wpdb->prepare(
        "SELECT s.*, u.name, u.email FROM {$wpdb->prefix}rankers_students s
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id WHERE s.reg_no=%s", $reg
    ));
    if (!$row) return new WP_Error('not_found','Not found',array('status'=>404));
    $row->courses = $wpdb->get_results($wpdb->prepare(
        "SELECT sc.*,c.name as course_name,b.name as batch_name FROM {$wpdb->prefix}rankers_student_courses sc
         JOIN {$wpdb->prefix}rankers_courses c ON c.id=sc.course_id
         LEFT JOIN {$wpdb->prefix}rankers_batches b ON b.id=sc.batch_id WHERE sc.student_id=%s",$row->id
    ));
    return rest_ensure_response($row);
}

function rankers_students_delete( WP_REST_Request $req ) {
    global $wpdb;
    $id  = sanitize_text_field($req->get_param('id'));
    $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_students WHERE id=%s",$id));
    if (!$row) return new WP_Error('not_found','Not found',array('status'=>404));
    foreach (['rankers_student_courses','rankers_attendance','rankers_results','rankers_leave_passes','rankers_inventory_issues','rankers_payments','rankers_fees','rankers_hostel_allocations'] as $t) {
        $wpdb->delete($wpdb->prefix.$t,array('student_id'=>$id));
    }
    $wpdb->delete($wpdb->prefix.'rankers_students',array('id'=>$id));
    $wpdb->delete($wpdb->prefix.'rankers_users',array('id'=>$row->user_id));
    return rest_ensure_response(array('message'=>'Deleted'));
}

function rankers_format_student($row) {
    $c=array();
    if(!empty($row->course_names)){foreach(explode('||',$row->course_names) as $n) $c[]=array('name'=>$n);}
    return array('id'=>$row->id,'regNo'=>$row->reg_no,'status'=>$row->status,'guardianName'=>$row->guardian_name,'dob'=>$row->dob,'gender'=>$row->gender,'phone'=>$row->phone,'address'=>$row->address,'isResidential'=>(bool)$row->is_residential,'user'=>array('name'=>$row->name,'email'=>$row->email),'courses'=>$c);
}
