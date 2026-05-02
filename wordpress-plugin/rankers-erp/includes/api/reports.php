<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_reports_dashboard( WP_REST_Request $req ) {
    global $wpdb;
    $total_students  = (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}rankers_students WHERE status='APPROVED'");
    $pending_students= (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}rankers_students WHERE status='PENDING'");
    $total_collected = (float)$wpdb->get_var("SELECT COALESCE(SUM(amount),0) FROM {$wpdb->prefix}rankers_payments");
    $total_dues      = (float)$wpdb->get_var("SELECT COALESCE(SUM(amount+late_fee),0) FROM {$wpdb->prefix}rankers_fees WHERE status IN ('PENDING','PARTIAL')");
    $total_expenses  = (float)$wpdb->get_var("SELECT COALESCE(SUM(amount),0) FROM {$wpdb->prefix}rankers_expenses");
    $total_staff     = (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}rankers_staff_profiles");
    $hostel_students = (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}rankers_students WHERE is_residential=1 AND status='APPROVED'");

    $recent_payments = $wpdb->get_results(
        "SELECT p.*, u.name as student_name, s.reg_no, c.name as course_name FROM {$wpdb->prefix}rankers_payments p
         JOIN {$wpdb->prefix}rankers_students s ON s.id=p.student_id
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id
         JOIN {$wpdb->prefix}rankers_fees f ON f.id=p.fee_id
         JOIN {$wpdb->prefix}rankers_courses c ON c.id=f.course_id
         ORDER BY p.paid_at DESC LIMIT 10"
    );

    $monthly_collection = $wpdb->get_results(
        "SELECT DATE_FORMAT(paid_at,'%Y-%m') as month, SUM(amount) as total
         FROM {$wpdb->prefix}rankers_payments
         WHERE paid_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         GROUP BY DATE_FORMAT(paid_at,'%Y-%m') ORDER BY month"
    );

    return rest_ensure_response(array(
        'totalStudents'     =>$total_students,
        'pendingStudents'   =>$pending_students,
        'totalCollected'    =>$total_collected,
        'totalDues'         =>$total_dues,
        'totalExpenses'     =>$total_expenses,
        'totalStaff'        =>$total_staff,
        'hostelStudents'    =>$hostel_students,
        'recentPayments'    =>$recent_payments,
        'monthlyCollection' =>$monthly_collection,
    ));
}

function rankers_reports_attendance( WP_REST_Request $req ) {
    global $wpdb;
    $batch_id = sanitize_text_field($req->get_param('batchId') ?: '');
    $from     = sanitize_text_field($req->get_param('from') ?: gmdate('Y-m-01'));
    $to       = sanitize_text_field($req->get_param('to')   ?: gmdate('Y-m-d'));
    $sql      = $wpdb->prepare(
        "SELECT s.reg_no, u.name as student_name,
                COUNT(*) as total_days,
                SUM(a.status='PRESENT') as present_days,
                ROUND(SUM(a.status='PRESENT')/COUNT(*)*100,1) as percentage
         FROM {$wpdb->prefix}rankers_attendance a
         JOIN {$wpdb->prefix}rankers_students s ON s.id=a.student_id
         JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id
         WHERE a.date BETWEEN %s AND %s", $from, $to
    );
    if ($batch_id) $sql .= $wpdb->prepare(" AND a.batch_id=%s",$batch_id);
    $sql .= " GROUP BY a.student_id ORDER BY percentage DESC";
    return rest_ensure_response($wpdb->get_results($sql));
}

function rankers_reports_finance( WP_REST_Request $req ) {
    global $wpdb;
    $from = sanitize_text_field($req->get_param('from') ?: gmdate('Y-m-01'));
    $to   = sanitize_text_field($req->get_param('to')   ?: gmdate('Y-m-d'));
    $collected = (float)$wpdb->get_var($wpdb->prepare("SELECT COALESCE(SUM(amount),0) FROM {$wpdb->prefix}rankers_payments WHERE DATE(paid_at) BETWEEN %s AND %s",$from,$to));
    $expenses  = (float)$wpdb->get_var($wpdb->prepare("SELECT COALESCE(SUM(amount),0) FROM {$wpdb->prefix}rankers_expenses WHERE date BETWEEN %s AND %s",$from,$to));
    $salary    = (float)$wpdb->get_var($wpdb->prepare("SELECT COALESCE(SUM(net_salary),0) FROM {$wpdb->prefix}rankers_salary_records WHERE DATE(paid_at) BETWEEN %s AND %s",$from,$to));
    $breakdown = $wpdb->get_results($wpdb->prepare("SELECT category, SUM(amount) as total FROM {$wpdb->prefix}rankers_expenses WHERE date BETWEEN %s AND %s GROUP BY category",$from,$to));
    return rest_ensure_response(array('collected'=>$collected,'expenses'=>$expenses,'salary'=>$salary,'net'=>$collected-$expenses-$salary,'expenseBreakdown'=>$breakdown));
}
