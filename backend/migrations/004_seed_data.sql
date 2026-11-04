-- ====================================================================================
-- ATTENDORA - MIGRATION 004: SEED DATA
-- Baseline Maharashtra Engineering College (GCOERC) Environment
-- ====================================================================================

DO $$
DECLARE
    v_tenant_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    v_admin_id UUID := '11111111-1111-1111-1111-111111111111';
    v_faculty_id UUID := '22222222-2222-2222-2222-222222222222';
    v_student_id UUID := '33333333-3333-3333-3333-333333333333';
    v_dept_id UUID := '44444444-4444-4444-4444-444444444444';
    v_batch_id UUID := '55555555-5555-5555-5555-555555555555';
    v_course1_id UUID := '66666666-6666-6666-6666-666666666661';
    v_course2_id UUID := '66666666-6666-6666-6666-666666666662';
    v_course3_id UUID := '66666666-6666-6666-6666-666666666663';
    v_course4_id UUID := '66666666-6666-6666-6666-666666666664';
    v_session_id UUID := '77777777-7777-7777-7777-777777777777';
BEGIN
    -- 1. Insert Institutional Tenant
    INSERT INTO tenants (id, name, slug, custom_domain, subscription_plan, student_quota_limit)
    VALUES (v_tenant_id, 'Government College of Engineering & Research (GCOERC)', 'gcoerc', 'attendance.gcoerc.ac.in', 'INSTITUTIONAL_ENTERPRISE', 3000)
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Platform Superadmin
    INSERT INTO platform_superadmins (id, email, password_hash, full_name)
    VALUES ('00000000-0000-0000-0000-000000000000', 'superadmin@attendora.io', '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQ$abcdefghijklmnopqrstuvwxyz', 'Platform Superadmin')
    ON CONFLICT (email) DO NOTHING;

    -- Set tenant context for initial seeding
    PERFORM set_config('app.current_tenant_id', v_tenant_id::text, true);

    -- 3. Insert Department
    INSERT INTO departments (id, tenant_id, code, name)
    VALUES (v_dept_id, v_tenant_id, 'COMP-ENG', 'Computer Science & Engineering')
    ON CONFLICT (tenant_id, code) DO NOTHING;

    -- 4. Insert Academic Batch (Semester 6, Div A)
    INSERT INTO academic_batches (id, tenant_id, department_id, academic_year, semester, division)
    VALUES (v_batch_id, v_tenant_id, v_dept_id, '2025-2026', 6, 'A')
    ON CONFLICT (tenant_id, department_id, academic_year, semester, division) DO NOTHING;

    -- 5. Insert Users (Admin, Faculty, Student)
    INSERT INTO users (id, tenant_id, email, password_hash, role, full_name, avatar_url)
    VALUES 
    (v_admin_id, v_tenant_id, 'anita.roy@attendora.edu', '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQ$abcdefghijklmnopqrstuvwxyz', 'COLLEGE_ADMIN', 'Dr. Anita Roy', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
    (v_faculty_id, v_tenant_id, 'rajesh.deshmukh@attendora.edu', '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQ$abcdefghijklmnopqrstuvwxyz', 'FACULTY', 'Prof. Rajesh Deshmukh', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    (v_student_id, v_tenant_id, 'sneha.kulkarni@student.attendora.edu', '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQ$abcdefghijklmnopqrstuvwxyz', 'STUDENT', 'Sneha Kulkarni', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150')
    ON CONFLICT (tenant_id, email) DO NOTHING;

    -- 6. Insert Courses
    INSERT INTO courses (id, tenant_id, department_id, course_code, course_name, short_name, default_minimum_attendance_pct)
    VALUES 
    (v_course1_id, v_tenant_id, v_dept_id, 'CS601', 'Mathematics IV & Numerical Analysis', 'Maths', 75.00),
    (v_course2_id, v_tenant_id, v_dept_id, 'CS602', 'Applied Physics & Quantum Optics', 'Physics', 75.00),
    (v_course3_id, v_tenant_id, v_dept_id, 'CS603', 'Database Management Systems & Relational Theory', 'DBMS', 75.00),
    (v_course4_id, v_tenant_id, v_dept_id, 'CS604', 'Data Structures & Algorithms in C++', 'Data Structures', 75.00)
    ON CONFLICT (tenant_id, course_code) DO NOTHING;

    -- 7. Course Faculty Assignments
    INSERT INTO course_faculty_assignments (tenant_id, course_id, faculty_id, batch_id, room_allocation)
    VALUES 
    (v_tenant_id, v_course3_id, v_faculty_id, v_batch_id, 'LH-104')
    ON CONFLICT (tenant_id, course_id, faculty_id, batch_id) DO NOTHING;

    -- 8. Student Enrollment
    INSERT INTO student_enrollments (tenant_id, student_id, batch_id, roll_number, prn_number, total_conducted, total_attended, cached_attendance_rate)
    VALUES 
    (v_tenant_id, v_student_id, v_batch_id, '20000001', 'PRN202300189', 40, 35, 87.50)
    ON CONFLICT (tenant_id, batch_id, roll_number) DO NOTHING;

    -- 9. Sample Attendance Session
    INSERT INTO attendance_sessions (id, tenant_id, course_id, batch_id, faculty_id, session_date, slot_start_time, slot_end_time, total_enrolled, present_count, absent_count, is_locked)
    VALUES 
    (v_session_id, v_tenant_id, v_course3_id, v_batch_id, v_faculty_id, '2026-11-04', '14:00:00', '15:00:00', 1, 1, 0, TRUE)
    ON CONFLICT (tenant_id, course_id, batch_id, session_date, slot_start_time) DO NOTHING;

    -- 10. Sample Attendance Record
    INSERT INTO attendance_records (tenant_id, session_id, student_id, session_date, status)
    VALUES 
    (v_tenant_id, v_session_id, v_student_id, '2026-11-04', 'PRESENT');

    -- 11. Initial Audit Log
    INSERT INTO audit_logs (tenant_id, actor_id, action, entity_type, entity_id, reason)
    VALUES 
    (v_tenant_id, v_faculty_id, 'LECTURE_ROLLCALL_FINALIZATION', 'attendance_sessions', v_session_id::text, 'Initial baseline lecture roll-call conducted');
END $$;

