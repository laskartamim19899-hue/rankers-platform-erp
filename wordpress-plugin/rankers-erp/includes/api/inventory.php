<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_inventory_get_all( WP_REST_Request $req ) {
    global $wpdb;
    $items = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}rankers_inventory_items ORDER BY created_at DESC");
    foreach ($items as &$item) {
        $item->issues = $wpdb->get_results($wpdb->prepare(
            "SELECT ii.*, u.name as student_name, s.reg_no FROM {$wpdb->prefix}rankers_inventory_issues ii
             JOIN {$wpdb->prefix}rankers_students s ON s.id=ii.student_id
             JOIN {$wpdb->prefix}rankers_users u ON u.id=s.user_id WHERE ii.item_id=%s",$item->id
        ));
    }
    return rest_ensure_response($items);
}

function rankers_inventory_create( WP_REST_Request $req ) {
    global $wpdb;
    $qty = intval($req->get_param('totalQty'));
    $id  = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_inventory_items', array(
        'id'=>$id,
        'name'         =>sanitize_text_field($req->get_param('name')),
        'category'     =>sanitize_text_field($req->get_param('category')),
        'total_qty'    =>$qty,'available_qty'=>$qty,
        'description'  =>sanitize_textarea_field($req->get_param('description') ?: ''),
    ));
    return new WP_REST_Response(array('message'=>'Item added','id'=>$id),201);
}

function rankers_inventory_issue( WP_REST_Request $req ) {
    global $wpdb;
    $item_id    = sanitize_text_field($req->get_param('itemId'));
    $student_id = sanitize_text_field($req->get_param('studentId'));
    $due_date   = sanitize_text_field($req->get_param('dueDate'));
    $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_inventory_items WHERE id=%s",$item_id));
    if (!$item || $item->available_qty < 1) return new WP_Error('unavailable','Item not available',array('status'=>400));
    $id = rankers_uuid();
    $wpdb->insert($wpdb->prefix.'rankers_inventory_issues',array('id'=>$id,'item_id'=>$item_id,'student_id'=>$student_id,'due_date'=>$due_date));
    $wpdb->update($wpdb->prefix.'rankers_inventory_items',array('available_qty'=>$item->available_qty-1),array('id'=>$item_id));
    return new WP_REST_Response(array('message'=>'Item issued','id'=>$id),201);
}

function rankers_inventory_return( WP_REST_Request $req ) {
    global $wpdb;
    $id    = sanitize_text_field($req->get_param('id'));
    $issue = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_inventory_issues WHERE id=%s",$id));
    if (!$issue || $issue->returned_on) return new WP_Error('invalid','Issue not found or already returned',array('status'=>400));
    $wpdb->update($wpdb->prefix.'rankers_inventory_issues',array('returned_on'=>current_time('mysql'),'condition_status'=>sanitize_text_field($req->get_param('condition') ?: 'GOOD')),array('id'=>$id));
    $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}rankers_inventory_items WHERE id=%s",$issue->item_id));
    $wpdb->update($wpdb->prefix.'rankers_inventory_items',array('available_qty'=>$item->available_qty+1),array('id'=>$issue->item_id));
    return rest_ensure_response(array('message'=>'Returned'));
}
