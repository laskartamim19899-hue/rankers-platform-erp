<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function rankers_auth_login( WP_REST_Request $req ) {
    global $wpdb;
    $email    = sanitize_email( $req->get_param('email') );
    $password = $req->get_param('password');

    $user = $wpdb->get_row( $wpdb->prepare(
        "SELECT u.*, s.id as student_profile_id FROM {$wpdb->prefix}rankers_users u
         LEFT JOIN {$wpdb->prefix}rankers_students s ON s.user_id = u.id
         WHERE u.email = %s", $email
    ) );

    if ( ! $user || ! password_verify( $password, $user->password_hash ) ) {
        return new WP_Error( 'invalid_credentials', 'Invalid credentials', array('status' => 400) );
    }

    $token = bin2hex( random_bytes(32) );
    set_transient( 'rankers_token_' . $token, $user->id, 7 * DAY_IN_SECONDS );

    return rest_ensure_response( array(
        'token' => $token,
        'user'  => array(
            'id'             => $user->id,
            'email'          => $user->email,
            'name'           => $user->name,
            'role'           => $user->role,
            'photoUrl'       => $user->photo_url,
            'studentProfile' => $user->student_profile_id ? array('id' => $user->student_profile_id) : null,
        ),
    ) );
}

function rankers_auth_register( WP_REST_Request $req ) {
    global $wpdb;
    $email    = sanitize_email( $req->get_param('email') );
    $password = $req->get_param('password');
    $name     = sanitize_text_field( $req->get_param('name') );
    $role     = sanitize_text_field( $req->get_param('role') ?: 'STUDENT' );

    $exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}rankers_users WHERE email=%s", $email ) );
    if ( $exists ) return new WP_Error( 'user_exists', 'User already exists', array('status'=>400) );

    $id   = rankers_uuid();
    $hash = password_hash( $password, PASSWORD_BCRYPT );
    $wpdb->insert( $wpdb->prefix.'rankers_users', compact('id','email','name','role') + array('password_hash'=>$hash) );

    $token = bin2hex( random_bytes(32) );
    set_transient( 'rankers_token_'.$token, $id, 7*DAY_IN_SECONDS );

    return new WP_REST_Response( array('token'=>$token, 'user'=>array('id'=>$id,'email'=>$email,'name'=>$name,'role'=>$role)), 201 );
}

function rankers_auth_forgot_password( WP_REST_Request $req ) {
    global $wpdb;
    $email = sanitize_email( $req->get_param('email') );
    $user  = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}rankers_users WHERE email=%s", $email ) );
    if ( ! $user ) return new WP_Error('not_found','User not found',array('status'=>404));

    $token  = strtoupper( bin2hex( random_bytes(4) ) );
    $expiry = gmdate('Y-m-d H:i:s', time() + HOUR_IN_SECONDS );
    $wpdb->update( $wpdb->prefix.'rankers_users', array('reset_token'=>$token,'reset_token_expiry'=>$expiry), array('id'=>$user->id) );

    // Send email via WP mail
    wp_mail( $email, 'Password Reset - Rankers Platform',
        "Your password reset token is: $token\nThis token expires in 1 hour." );

    return rest_ensure_response( array('message'=>'Reset token sent to your email') );
}

function rankers_auth_reset_password( WP_REST_Request $req ) {
    global $wpdb;
    $token    = sanitize_text_field( $req->get_param('token') );
    $new_pass = $req->get_param('newPassword');

    $user = $wpdb->get_row( $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}rankers_users WHERE reset_token=%s AND reset_token_expiry > %s",
        $token, gmdate('Y-m-d H:i:s')
    ) );
    if ( ! $user ) return new WP_Error('invalid_token','Invalid or expired token',array('status'=>400));

    $wpdb->update( $wpdb->prefix.'rankers_users',
        array('password_hash'=>password_hash($new_pass,PASSWORD_BCRYPT),'reset_token'=>null,'reset_token_expiry'=>null),
        array('id'=>$user->id)
    );
    return rest_ensure_response( array('message'=>'Password reset successful') );
}

function rankers_auth_change_password( WP_REST_Request $req ) {
    global $wpdb;
    $current_user = rankers_get_user_from_token($req);
    $old_pass = $req->get_param('oldPassword');
    $new_pass = $req->get_param('newPassword');

    if ( ! password_verify($old_pass, $current_user->password_hash) ) {
        return new WP_Error('wrong_password','Incorrect old password',array('status'=>400));
    }
    $wpdb->update( $wpdb->prefix.'rankers_users',
        array('password_hash'=>password_hash($new_pass,PASSWORD_BCRYPT)),
        array('id'=>$current_user->id)
    );
    return rest_ensure_response( array('message'=>'Password updated') );
}

function rankers_auth_me( WP_REST_Request $req ) {
    global $wpdb;
    $u = rankers_get_user_from_token($req);
    $student = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}rankers_students WHERE user_id=%s",$u->id));
    return rest_ensure_response( array(
        'id'=>$u->id,'email'=>$u->email,'name'=>$u->name,'role'=>$u->role,'photoUrl'=>$u->photo_url,
        'studentProfile'=>$student ? array('id'=>$student->id) : null
    ));
}
