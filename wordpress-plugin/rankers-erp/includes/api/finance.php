<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_finance_get_fees( WP_REST_Request $req ) {
    global $wpdb;
    $sid      = sanitize_text_field($req->get_param('studentId'));
    $settings = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}rankers_settings WHERE id='singleton'");
    $lpd  = $settings ? floatval($settings->late_fee_per_day) : 10;
    $gpd  = $settings ? intval($settings->grace_period_days)  : 0;
    $lfe  = $settings ? (bool)$settings->late_fee_enabled      : true;

    $fees = $wpdb->get_results($wpdb->prepare(
        "SELECT f.*, c.name as course_name FROM {$wpdb->prefix}rankers_fees f
         JOIN {$wpdb->prefix}rankers_courses c ON c.id=f.course_id
         WHERE f.student_id=%s ORDER BY f.due_date", $sid
    ));
    $today = strtotime(gmdate('Y-m-d'));
    foreach ( $fees as &$fee ) {
        $fee->payments = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_payments WHERE fee_id=%s",$fee->id));
        if ( $lfe && $fee->status !== 'PAID' ) {
            $due  = strtotime($fee->due_date);
            $days = max(0, (int)(($today - $due) / 86400) - $gpd);
            $calc = $days > 0 ? $days * $lpd : 0;
            if ( floatval($fee->late_fee) !== $calc ) {
                $wpdb->update($wpdb->prefix.'rankers_fees',array('late_fee'=>$calc),array('id'=>$fee->id));
                $fee->late_fee = $calc;
            }
        }
    }
    return rest_ensure_response($fees);
}

function rankers_finance_allocate_fee( WP_REST_Request $req ) {
    global $wpdb;
    $student_ids = $req->get_param('studentIds');
    $course_id   = sanitize_text_field($req->get_param('courseId'));
    $amount      = floatval($req->get_param('amount'));
    $type        = sanitize_text_field($req->get_param('type') ?: 'ACADEMIC');
    $month       = sanitize_text_field($req->get_param('month') ?: '');
    $due_date    = sanitize_text_field($req->get_param('dueDate'));
    $count = 0;
    foreach ( (array)$student_ids as $sid ) {
        $wpdb->insert($wpdb->prefix.'rankers_fees', array(
            'id'=>rankers_uuid(),'student_id'=>sanitize_text_field($sid),
            'course_id'=>$course_id,'amount'=>$amount,'type'=>$type,
            'month'=>$month,'due_date'=>$due_date,'status'=>'PENDING'
        ));
        $count++;
    }
    return new WP_REST_Response(array('message'=>"$count fees allocated"),201);
}

function rankers_finance_record_payment( WP_REST_Request $req ) {
    global $wpdb;
    $fee_ids     = (array)$req->get_param('feeIds');
    $student_id  = sanitize_text_field($req->get_param('studentId'));
    $amount      = $req->get_param('amount');
    $mode        = sanitize_text_field($req->get_param('paymentMode') ?: 'CASH');
    $txn_id      = sanitize_text_field($req->get_param('transactionId') ?: 'TXN-'.time());

    if ( empty($fee_ids) ) return new WP_Error('invalid','feeIds required',array('status'=>400));

    // Pre-calc remaining per fee
    $fee_details = array();
    $total_remaining = 0;
    foreach ( $fee_ids as $fid ) {
        $fee  = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_fees WHERE id=%s",$fid));
        if (!$fee) continue;
        $paid = (float)$wpdb->get_var($wpdb->prepare("SELECT COALESCE(SUM(amount),0) FROM {$wpdb->prefix}rankers_payments WHERE fee_id=%s",$fid));
        $due  = $fee->amount + $fee->late_fee;
        $rem  = max(0,$due-$paid);
        $fee_details[] = array('id'=>$fid,'remaining'=>$rem);
        $total_remaining += $rem;
    }
    $pay_amount = ($amount && is_numeric($amount)) ? min(floatval($amount),$total_remaining) : $total_remaining;
    if ($pay_amount <= 0) return new WP_Error('invalid','Invalid amount',array('status'=>400));

    $left = $pay_amount; $payments = array();
    foreach ($fee_details as $fd) {
        if ($left<=0) break;
        $p = min($left,$fd['remaining']);
        $left -= $p;
        $wpdb->insert($wpdb->prefix.'rankers_payments', array('id'=>rankers_uuid(),'fee_id'=>$fd['id'],'student_id'=>$student_id,'amount'=>$p,'payment_mode'=>$mode,'transaction_id'=>$txn_id));
        $payments[] = $fd['id'];
        // Recalc status
        $fee  = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_fees WHERE id=%s",$fd['id']));
        $paid = (float)$wpdb->get_var($wpdb->prepare("SELECT COALESCE(SUM(amount),0) FROM {$wpdb->prefix}rankers_payments WHERE fee_id=%s",$fd['id']));
        $due  = $fee->amount + $fee->late_fee;
        $status = $paid >= $due ? 'PAID' : ($paid > 0 ? 'PARTIAL' : 'PENDING');
        $wpdb->update($wpdb->prefix.'rankers_fees',array('status'=>$status),array('id'=>$fd['id']));
    }
    return new WP_REST_Response(array('message'=>count($payments).' payments recorded','transactionId'=>$txn_id),201);
}

function rankers_finance_get_payment( WP_REST_Request $req ) {
    global $wpdb;
    $id  = sanitize_text_field($req->get_param('id'));
    $pay = $wpdb->get_row($wpdb->prepare(
        "SELECT p.*, s.reg_no, u.name as student_name, f.amount as fee_amount, f.type as fee_type, c.name as course_name
         FROM {$wpdb->prefix}rankers_payments p
         JOIN {$wpdb->prefix}rankers_students s ON s.id=p.student_id
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id
         JOIN {$wpdb->prefix}rankers_fees f ON f.id=p.fee_id
         JOIN {$wpdb->prefix}rankers_courses c ON c.id=f.course_id
         WHERE p.id=%s", $id
    ));
    if (!$pay) return new WP_Error('not_found','Payment not found',array('status'=>404));
    $pay->siblings = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_payments WHERE transaction_id=%s",$pay->transaction_id));
    return rest_ensure_response($pay);
}

function rankers_finance_delete_payment( WP_REST_Request $req ) {
    global $wpdb;
    $id  = sanitize_text_field($req->get_param('id'));
    $pay = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_payments WHERE id=%s",$id));
    if (!$pay) return new WP_Error('not_found','Not found',array('status'=>404));
    $wpdb->delete($wpdb->prefix.'rankers_payments',array('id'=>$id));
    $fee  = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_fees WHERE id=%s",$pay->fee_id));
    $paid = (float)$wpdb->get_var($wpdb->prepare("SELECT COALESCE(SUM(amount),0) FROM {$wpdb->prefix}rankers_payments WHERE fee_id=%s",$pay->fee_id));
    $due  = $fee ? $fee->amount + $fee->late_fee : 0;
    $st   = $paid >= $due && $due > 0 ? 'PAID' : ($paid > 0 ? 'PARTIAL' : 'PENDING');
    $wpdb->update($wpdb->prefix.'rankers_fees',array('status'=>$st),array('id'=>$pay->fee_id));
    return rest_ensure_response(array('message'=>'Deleted'));
}

function rankers_finance_get_dues( WP_REST_Request $req ) {
    global $wpdb;
    $fees = $wpdb->get_results(
        "SELECT f.*, u.name as student_name, s.reg_no, c.name as course_name,
                COALESCE(SUM(p.amount),0) as total_paid
         FROM {$wpdb->prefix}rankers_fees f
         JOIN {$wpdb->prefix}rankers_students s ON s.id=f.student_id
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id
         JOIN {$wpdb->prefix}rankers_courses c ON c.id=f.course_id
         LEFT JOIN {$wpdb->prefix}rankers_payments p ON p.fee_id=f.id
         WHERE f.status IN ('PENDING','PARTIAL') AND f.due_date <= CURDATE()
         GROUP BY f.id ORDER BY f.due_date"
    );
    return rest_ensure_response($fees);
}

function rankers_finance_get_ledger( WP_REST_Request $req ) {
    global $wpdb;
    $q = sanitize_text_field($req->get_param('q'));
    if (!$q) return new WP_Error('invalid','Query required',array('status'=>400));
    $like = '%'.$wpdb->esc_like($q).'%';
    $students = $wpdb->get_results($wpdb->prepare(
        "SELECT s.*, u.name, u.email FROM {$wpdb->prefix}rankers_students s
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id
         WHERE s.reg_no LIKE %s OR u.name LIKE %s LIMIT 10", $like, $like
    ));
    $out = array();
    foreach ($students as $s) {
        $fees = $wpdb->get_results($wpdb->prepare(
            "SELECT f.*, c.name as course_name FROM {$wpdb->prefix}rankers_fees f
             JOIN {$wpdb->prefix}rankers_courses c ON c.id=f.course_id WHERE f.student_id=%s ORDER BY f.due_date",$s->id
        ));
        $total_alloc = 0; $total_paid_sum = 0;
        foreach ($fees as &$fee) {
            $fee->payments = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_payments WHERE fee_id=%s",$fee->id));
            $p = array_sum(array_column((array)$fee->payments,'amount'));
            $g = $fee->amount + $fee->late_fee;
            $fee->totalPaid  = $p;
            $fee->remaining  = max(0,$g-$p);
            $total_alloc    += $g;
            $total_paid_sum += $p;
        }
        $out[] = array(
            'student'=>array('id'=>$s->id,'regNo'=>$s->reg_no,'status'=>$s->status,'guardianName'=>$s->guardian_name,'phone'=>$s->phone,'user'=>array('name'=>$s->name,'email'=>$s->email)),
            'summary'=>array('totalAllocated'=>$total_alloc,'totalPaid'=>$total_paid_sum,'totalRemaining'=>max(0,$total_alloc-$total_paid_sum)),
            'academicFees'=>array_values(array_filter($fees,fn($f)=>$f->type==='ACADEMIC')),
            'hostelFees'  =>array_values(array_filter($fees,fn($f)=>$f->type==='HOSTEL')),
        );
    }
    return rest_ensure_response($out);
}
