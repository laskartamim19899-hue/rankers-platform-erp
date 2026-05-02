<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_salary_get_staff( WP_REST_Request $req ) {
    global $wpdb;
    $rows = $wpdb->get_results(
        "SELECT sp.*, u.name, u.email, u.role FROM {$wpdb->prefix}rankers_staff_profiles sp
         JOIN {$wpdb->prefix}rankers_users u ON u.id=sp.user_id ORDER BY sp.joining_date DESC"
    );
    foreach ($rows as &$r) {
        $r->salary_records = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_salary_records WHERE staff_profile_id=%s ORDER BY paid_at DESC LIMIT 12",$r->id));
    }
    return rest_ensure_response($rows);
}

function rankers_salary_create_staff( WP_REST_Request $req ) {
    global $wpdb;
    $user_id = sanitize_text_field($req->get_param('userId'));
    $exists  = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}rankers_staff_profiles WHERE user_id=%s",$user_id));
    if ($exists) return new WP_Error('exists','Staff profile already exists',array('status'=>400));
    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_staff_profiles', array(
        'id'=>$id,'user_id'=>$user_id,
        'designation'  =>sanitize_text_field($req->get_param('designation')),
        'department'   =>sanitize_text_field($req->get_param('department') ?: ''),
        'base_salary'  =>floatval($req->get_param('baseSalary')),
        'bank_account' =>sanitize_text_field($req->get_param('bankAccount') ?: ''),
        'ifsc_code'    =>sanitize_text_field($req->get_param('ifscCode') ?: ''),
        'joining_date' =>sanitize_text_field($req->get_param('joiningDate') ?: gmdate('Y-m-d')),
    ));
    return new WP_REST_Response(array('message'=>'Staff profile created','id'=>$id),201);
}

function rankers_salary_pay( WP_REST_Request $req ) {
    global $wpdb;
    $id     = rankers_uuid();
    $basic  = floatval($req->get_param('basicSalary'));
    $allow  = floatval($req->get_param('allowances') ?: 0);
    $deduct = floatval($req->get_param('deductions')  ?: 0);
    $net    = $basic + $allow - $deduct;
    $wpdb->insert($wpdb->prefix.'rankers_salary_records', array(
        'id'=>$id,
        'staff_profile_id'=>sanitize_text_field($req->get_param('staffProfileId')),
        'month'           =>sanitize_text_field($req->get_param('month')),
        'basic_salary'    =>$basic,'allowances'=>$allow,'deductions'=>$deduct,'net_salary'=>$net,
        'payment_mode'    =>sanitize_text_field($req->get_param('paymentMode') ?: 'CASH'),
        'transaction_id'  =>sanitize_text_field($req->get_param('transactionId') ?: ''),
        'remarks'         =>sanitize_textarea_field($req->get_param('remarks') ?: ''),
        'status'          =>'PAID',
    ));
    return new WP_REST_Response(array('message'=>'Salary paid','id'=>$id,'netSalary'=>$net),201);
}

function rankers_salary_get_records( WP_REST_Request $req ) {
    global $wpdb;
    $month = sanitize_text_field($req->get_param('month') ?: '');
    $sql   = "SELECT sr.*, u.name, sp.designation FROM {$wpdb->prefix}rankers_salary_records sr
              JOIN {$wpdb->prefix}rankers_staff_profiles sp ON sp.id=sr.staff_profile_id
              JOIN {$wpdb->prefix}rankers_users u ON u.id=sp.user_id";
    if ($month) $sql .= $wpdb->prepare(" WHERE sr.month=%s",$month);
    $sql .= " ORDER BY sr.paid_at DESC";
    return rest_ensure_response($wpdb->get_results($sql));
}

function rankers_salary_get_slip( WP_REST_Request $req ) {
    global $wpdb;
    $id  = sanitize_text_field($req->get_param('id'));
    $row = $wpdb->get_row($wpdb->prepare(
        "SELECT sr.*, u.name, u.email, sp.designation, sp.department, sp.bank_account, sp.ifsc_code
         FROM {$wpdb->prefix}rankers_salary_records sr
         JOIN {$wpdb->prefix}rankers_staff_profiles sp ON sp.id=sr.staff_profile_id
         JOIN {$wpdb->prefix}rankers_users u ON u.id=sp.user_id WHERE sr.id=%s",$id
    ));
    if (!$row) return new WP_Error('not_found','Slip not found',array('status'=>404));
    return rest_ensure_response($row);
}
