<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Rankers_ERP_Activator {

    public static function activate() {
        self::create_tables();
        self::insert_default_settings();
        update_option( 'rankers_erp_db_version', RANKERS_ERP_DB_VERSION );
    }

    public static function deactivate() {
        // Roles are not removed on deactivate (data preserved)
    }

    private static function create_tables() {
        global $wpdb;
        $charset = $wpdb->get_charset_collate();
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        // ── Users ────────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_users (
            id            VARCHAR(36)  NOT NULL,
            email         VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            name          VARCHAR(255) NOT NULL,
            role          VARCHAR(50)  NOT NULL DEFAULT 'STUDENT',
            photo_url     TEXT         NULL,
            reset_token   VARCHAR(100) NULL,
            reset_token_expiry DATETIME NULL,
            created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset;");

        // ── Students ─────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_students (
            id                  VARCHAR(36)  NOT NULL,
            user_id             VARCHAR(36)  NOT NULL UNIQUE,
            reg_no              VARCHAR(50)  NULL UNIQUE,
            status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
            guardian_name       VARCHAR(255) NOT NULL,
            dob                 DATE         NOT NULL,
            gender              VARCHAR(20)  NOT NULL,
            phone               VARCHAR(20)  NOT NULL,
            address             TEXT         NOT NULL,
            school_name         VARCHAR(255) NULL,
            madhyamik_marks     FLOAT        NULL,
            hs_marks_physics    FLOAT        NULL,
            hs_marks_chemistry  FLOAT        NULL,
            hs_marks_biology    FLOAT        NULL,
            prev_neet_marks     FLOAT        NULL,
            is_residential      TINYINT(1)   NOT NULL DEFAULT 0,
            photo_url           TEXT         NULL,
            aadhaar_url         TEXT         NULL,
            scholarship_tier    VARCHAR(20)  NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (user_id) REFERENCES {$wpdb->prefix}rankers_users(id) ON DELETE CASCADE
        ) $charset;");

        // ── Courses ──────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_courses (
            id          VARCHAR(36)  NOT NULL,
            name        VARCHAR(255) NOT NULL,
            description TEXT         NULL,
            duration    VARCHAR(100) NULL,
            created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset;");

        // ── Batches ──────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_batches (
            id          VARCHAR(36)  NOT NULL,
            name        VARCHAR(255) NOT NULL,
            course_id   VARCHAR(36)  NOT NULL,
            teacher_id  VARCHAR(36)  NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (course_id) REFERENCES {$wpdb->prefix}rankers_courses(id) ON DELETE CASCADE
        ) $charset;");

        // ── Student Courses ───────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_student_courses (
            student_id  VARCHAR(36) NOT NULL,
            course_id   VARCHAR(36) NOT NULL,
            batch_id    VARCHAR(36) NULL,
            PRIMARY KEY (student_id, course_id),
            FOREIGN KEY (student_id) REFERENCES {$wpdb->prefix}rankers_students(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id)  REFERENCES {$wpdb->prefix}rankers_courses(id)  ON DELETE CASCADE
        ) $charset;");

        // ── Fees ─────────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_fees (
            id          VARCHAR(36)  NOT NULL,
            student_id  VARCHAR(36)  NOT NULL,
            course_id   VARCHAR(36)  NOT NULL,
            amount      FLOAT        NOT NULL,
            type        VARCHAR(20)  NOT NULL DEFAULT 'ACADEMIC',
            month       VARCHAR(10)  NULL,
            due_date    DATE         NOT NULL,
            late_fee    FLOAT        NOT NULL DEFAULT 0,
            status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
            PRIMARY KEY (id),
            FOREIGN KEY (student_id) REFERENCES {$wpdb->prefix}rankers_students(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id)  REFERENCES {$wpdb->prefix}rankers_courses(id)  ON DELETE CASCADE
        ) $charset;");

        // ── Payments ──────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_payments (
            id              VARCHAR(36)  NOT NULL,
            fee_id          VARCHAR(36)  NOT NULL,
            student_id      VARCHAR(36)  NOT NULL,
            amount          FLOAT        NOT NULL,
            payment_mode    VARCHAR(20)  NOT NULL DEFAULT 'CASH',
            transaction_id  VARCHAR(100) NULL,
            paid_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (fee_id)     REFERENCES {$wpdb->prefix}rankers_fees(id)     ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES {$wpdb->prefix}rankers_students(id) ON DELETE CASCADE
        ) $charset;");

        // ── Attendance ────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_attendance (
            id               VARCHAR(36) NOT NULL,
            student_id       VARCHAR(36) NOT NULL,
            batch_id         VARCHAR(36) NOT NULL,
            timetable_slot_id VARCHAR(36) NULL,
            date             DATE        NOT NULL,
            status           VARCHAR(20) NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (student_id) REFERENCES {$wpdb->prefix}rankers_students(id) ON DELETE CASCADE,
            FOREIGN KEY (batch_id)   REFERENCES {$wpdb->prefix}rankers_batches(id)  ON DELETE CASCADE
        ) $charset;");

        // ── Tests ─────────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_tests (
            id        VARCHAR(36)  NOT NULL,
            title     VARCHAR(255) NOT NULL,
            type      VARCHAR(20)  NOT NULL,
            date      DATE         NOT NULL,
            max_marks FLOAT        NOT NULL,
            PRIMARY KEY (id)
        ) $charset;");

        // ── Results ───────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_results (
            id             VARCHAR(36) NOT NULL,
            test_id        VARCHAR(36) NOT NULL,
            student_id     VARCHAR(36) NOT NULL,
            marks_obtained FLOAT       NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (test_id)    REFERENCES {$wpdb->prefix}rankers_tests(id)    ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES {$wpdb->prefix}rankers_students(id) ON DELETE CASCADE
        ) $charset;");

        // ── Hostels ───────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_hostels (
            id          VARCHAR(36) NOT NULL,
            room_number VARCHAR(20) NOT NULL UNIQUE,
            capacity    INT         NOT NULL,
            occupancy   INT         NOT NULL DEFAULT 0,
            PRIMARY KEY (id)
        ) $charset;");

        // ── Hostel Allocations ────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_hostel_allocations (
            id         VARCHAR(36) NOT NULL,
            student_id VARCHAR(36) NOT NULL UNIQUE,
            hostel_id  VARCHAR(36) NOT NULL,
            join_date  DATE        NOT NULL,
            leave_date DATE        NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (student_id) REFERENCES {$wpdb->prefix}rankers_students(id) ON DELETE CASCADE,
            FOREIGN KEY (hostel_id)  REFERENCES {$wpdb->prefix}rankers_hostels(id)  ON DELETE CASCADE
        ) $charset;");

        // ── Expenses ──────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_expenses (
            id          VARCHAR(36)  NOT NULL,
            title       VARCHAR(255) NOT NULL,
            category    VARCHAR(50)  NOT NULL,
            amount      FLOAT        NOT NULL,
            date        DATE         NOT NULL,
            description TEXT         NULL,
            payee_name  VARCHAR(255) NULL,
            purpose     TEXT         NULL,
            PRIMARY KEY (id)
        ) $charset;");

        // ── Announcements ─────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_announcements (
            id              VARCHAR(36)  NOT NULL,
            title           VARCHAR(255) NOT NULL,
            content         TEXT         NOT NULL,
            type            VARCHAR(30)  NOT NULL DEFAULT 'GENERAL',
            target_audience VARCHAR(30)  NOT NULL DEFAULT 'ALL',
            created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset;");

        // ── Settings ──────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_settings (
            id                VARCHAR(36)  NOT NULL DEFAULT 'singleton',
            late_fee_per_day  FLOAT        NOT NULL DEFAULT 10,
            grace_period_days INT          NOT NULL DEFAULT 0,
            late_fee_enabled  TINYINT(1)   NOT NULL DEFAULT 1,
            institution_name  VARCHAR(255) NOT NULL DEFAULT 'Rankers Platform',
            phone             VARCHAR(30)  NULL,
            email             VARCHAR(255) NULL,
            website           VARCHAR(255) NULL,
            address           TEXT         NULL,
            gst_number        VARCHAR(50)  NULL,
            tagline           VARCHAR(255) NULL,
            principal_name    VARCHAR(255) NULL,
            updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset;");

        // ── Admission Inquiries ───────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_inquiries (
            id              VARCHAR(36)  NOT NULL,
            name            VARCHAR(255) NOT NULL,
            guardian_name   VARCHAR(255) NOT NULL,
            dob             DATE         NOT NULL,
            gender          VARCHAR(20)  NOT NULL,
            phone           VARCHAR(20)  NOT NULL,
            email           VARCHAR(255) NOT NULL,
            address         TEXT         NOT NULL,
            school_name     VARCHAR(255) NULL,
            course_interest VARCHAR(50)  NULL,
            status          VARCHAR(20)  NOT NULL DEFAULT 'NEW',
            created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset;");

        // ── Leave Passes ──────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_leave_passes (
            id          VARCHAR(36)  NOT NULL,
            student_id  VARCHAR(36)  NOT NULL,
            reason      TEXT         NOT NULL,
            destination VARCHAR(255) NOT NULL,
            start_date  DATE         NOT NULL,
            end_date    DATE         NOT NULL,
            status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
            pass_no     VARCHAR(50)  NOT NULL UNIQUE,
            issued_by   VARCHAR(255) NOT NULL,
            issued_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            returned_at DATETIME     NULL,
            notes       TEXT         NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (student_id) REFERENCES {$wpdb->prefix}rankers_students(id) ON DELETE CASCADE
        ) $charset;");

        // ── Timetables ────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_timetables (
            id         VARCHAR(36) NOT NULL,
            batch_id   VARCHAR(36) NOT NULL UNIQUE,
            updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (batch_id) REFERENCES {$wpdb->prefix}rankers_batches(id) ON DELETE CASCADE
        ) $charset;");

        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_timetable_slots (
            id           VARCHAR(36)  NOT NULL,
            timetable_id VARCHAR(36)  NOT NULL,
            day          VARCHAR(5)   NOT NULL,
            start_time   VARCHAR(10)  NOT NULL,
            end_time     VARCHAR(10)  NOT NULL,
            subject      VARCHAR(100) NOT NULL,
            teacher_name VARCHAR(255) NULL,
            room_no      VARCHAR(20)  NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (timetable_id) REFERENCES {$wpdb->prefix}rankers_timetables(id) ON DELETE CASCADE
        ) $charset;");

        // ── Inventory ─────────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_inventory_items (
            id            VARCHAR(36)  NOT NULL,
            name          VARCHAR(255) NOT NULL,
            category      VARCHAR(50)  NOT NULL,
            total_qty     INT          NOT NULL,
            available_qty INT          NOT NULL,
            description   TEXT         NULL,
            created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset;");

        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_inventory_issues (
            id          VARCHAR(36) NOT NULL,
            item_id     VARCHAR(36) NOT NULL,
            student_id  VARCHAR(36) NOT NULL,
            issued_on   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            due_date    DATE        NOT NULL,
            returned_on DATETIME    NULL,
            condition_status VARCHAR(20) NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (item_id)    REFERENCES {$wpdb->prefix}rankers_inventory_items(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES {$wpdb->prefix}rankers_students(id)         ON DELETE CASCADE
        ) $charset;");

        // ── Staff Profiles ────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_staff_profiles (
            id           VARCHAR(36)  NOT NULL,
            user_id      VARCHAR(36)  NOT NULL UNIQUE,
            designation  VARCHAR(100) NOT NULL,
            department   VARCHAR(100) NULL,
            base_salary  FLOAT        NOT NULL DEFAULT 0,
            bank_account VARCHAR(50)  NULL,
            ifsc_code    VARCHAR(20)  NULL,
            joining_date DATE         NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (user_id) REFERENCES {$wpdb->prefix}rankers_users(id) ON DELETE CASCADE
        ) $charset;");

        // ── Salary Records ────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_salary_records (
            id               VARCHAR(36)  NOT NULL,
            staff_profile_id VARCHAR(36)  NOT NULL,
            month            VARCHAR(20)  NOT NULL,
            basic_salary     FLOAT        NOT NULL,
            allowances       FLOAT        NOT NULL DEFAULT 0,
            deductions       FLOAT        NOT NULL DEFAULT 0,
            net_salary       FLOAT        NOT NULL,
            payment_mode     VARCHAR(20)  NOT NULL DEFAULT 'CASH',
            transaction_id   VARCHAR(100) NULL,
            paid_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            remarks          TEXT         NULL,
            status           VARCHAR(20)  NOT NULL DEFAULT 'PAID',
            PRIMARY KEY (id),
            FOREIGN KEY (staff_profile_id) REFERENCES {$wpdb->prefix}rankers_staff_profiles(id) ON DELETE CASCADE
        ) $charset;");

        // ── Guest Teachers ────────────────────────────────────────────────────
        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_guest_teachers (
            id            VARCHAR(36)  NOT NULL,
            name          VARCHAR(255) NOT NULL,
            phone         VARCHAR(20)  NULL,
            email         VARCHAR(255) NULL,
            subject       VARCHAR(100) NOT NULL,
            qualification TEXT         NULL,
            rate_per_class FLOAT       NOT NULL,
            created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset;");

        dbDelta("CREATE TABLE {$wpdb->prefix}rankers_guest_payments (
            id               VARCHAR(36)  NOT NULL,
            guest_teacher_id VARCHAR(36)  NOT NULL,
            month            VARCHAR(20)  NOT NULL,
            classes_held     INT          NOT NULL,
            rate_per_class   FLOAT        NOT NULL,
            class_amount     FLOAT        NOT NULL,
            allowances       FLOAT        NOT NULL DEFAULT 0,
            total_amount     FLOAT        NOT NULL,
            payment_mode     VARCHAR(20)  NOT NULL DEFAULT 'CASH',
            transaction_id   VARCHAR(100) NULL,
            remarks          TEXT         NULL,
            paid_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            status           VARCHAR(20)  NOT NULL DEFAULT 'PAID',
            PRIMARY KEY (id),
            FOREIGN KEY (guest_teacher_id) REFERENCES {$wpdb->prefix}rankers_guest_teachers(id) ON DELETE CASCADE
        ) $charset;");
    }

    private static function insert_default_settings() {
        global $wpdb;
        $table = $wpdb->prefix . 'rankers_settings';
        $exists = $wpdb->get_var( "SELECT id FROM $table WHERE id = 'singleton'" );
        if ( ! $exists ) {
            $wpdb->insert( $table, array(
                'id'               => 'singleton',
                'late_fee_per_day' => 10,
                'grace_period_days'=> 0,
                'late_fee_enabled' => 1,
                'institution_name' => "Rankers' Platform",
                'phone'            => '+91 00000 00000',
                'email'            => 'info@rankersplatform.com',
                'website'          => 'www.rankersplatform.com',
                'address'          => 'Main Campus, City',
                'tagline'          => 'Empowering Future Leaders',
            ) );

            // Seed default courses
            $courses_table = $wpdb->prefix . 'rankers_courses';
            $default_courses = array(
                array( 'id' => 'neet-helix',  'name' => 'Helix Batch (NEET)', 'description' => 'One-year intensive medical prep',       'duration' => '1 Year' ),
                array( 'id' => 'jee-alpha',   'name' => 'Alpha Batch (JEE)',  'description' => 'One-year intensive engineering prep',    'duration' => '1 Year' ),
                array( 'id' => 'crash-2024',  'name' => 'Crash Course 2024',  'description' => 'Fast-track revision batch',              'duration' => 'Crash'  ),
            );
            foreach ( $default_courses as $course ) {
                $wpdb->insert( $courses_table, $course );
            }

            // Seed default hostels
            $hostels_table = $wpdb->prefix . 'rankers_hostels';
            foreach ( array( array('101',2), array('102',3), array('201',4) ) as $h ) {
                $wpdb->insert( $hostels_table, array( 'id' => wp_generate_uuid4(), 'room_number' => $h[0], 'capacity' => $h[1] ) );
            }
        }
    }
}
