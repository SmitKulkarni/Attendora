-- ====================================================================================
-- ATTENDORA - MIGRATION 003: ROW-LEVEL SECURITY (RLS) POLICIES & COMPLIANCE TRIGGERS
-- Target Database: PostgreSQL 16+
-- ====================================================================================

-- Enable Row-Level Security on all tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_faculty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to extract current session tenant UUID safely
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function to verify superadmin bypass
CREATE OR REPLACE FUNCTION is_platform_superadmin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(current_setting('app.is_superadmin', true) = 'true', false);
END;
$$ LANGUAGE plpgsql STABLE;

-- ------------------------------------------------------------------------------------
-- RLS POLICIES: MULTI-TENANT ISOLATION
-- ------------------------------------------------------------------------------------

-- users
DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
    FOR ALL
    USING (is_platform_superadmin() OR tenant_id = get_current_tenant_id())
    WITH CHECK (is_platform_superadmin() OR tenant_id = get_current_tenant_id());

-- departments
DROP POLICY IF EXISTS tenant_isolation_departments ON departments;
CREATE POLICY tenant_isolation_departments ON departments
    FOR ALL
    USING (is_platform_superadmin() OR tenant_id = get_current_tenant_id())
    WITH CHECK (is_platform_superadmin() OR tenant_id = get_current_tenant_id());

-- academic_batches
DROP POLICY IF EXISTS tenant_isolation_batches ON academic_batches;
CREATE POLICY tenant_isolation_batches ON academic_batches
    FOR ALL
    USING (is_platform_superadmin() OR tenant_id = get_current_tenant_id())
    WITH CHECK (is_platform_superadmin() OR tenant_id = get_current_tenant_id());

-- courses
DROP POLICY IF EXISTS tenant_isolation_courses ON courses;
CREATE POLICY tenant_isolation_courses ON courses
    FOR ALL
    USING (is_platform_superadmin() OR tenant_id = get_current_tenant_id())
    WITH CHECK (is_platform_superadmin() OR tenant_id = get_current_tenant_id());

-- course_faculty_assignments
DROP POLICY IF EXISTS tenant_isolation_cfa ON course_faculty_assignments;
CREATE POLICY tenant_isolation_cfa ON course_faculty_assignments
    FOR ALL
    USING (is_platform_superadmin() OR tenant_id = get_current_tenant_id())
    WITH CHECK (is_platform_superadmin() OR tenant_id = get_current_tenant_id());

-- student_enrollments
DROP POLICY IF EXISTS tenant_isolation_enrollments ON student_enrollments;
CREATE POLICY tenant_isolation_enrollments ON student_enrollments
    FOR ALL
    USING (is_platform_superadmin() OR tenant_id = get_current_tenant_id())
    WITH CHECK (is_platform_superadmin() OR tenant_id = get_current_tenant_id());

-- attendance_sessions
DROP POLICY IF EXISTS tenant_isolation_sessions ON attendance_sessions;
CREATE POLICY tenant_isolation_sessions ON attendance_sessions
    FOR ALL
    USING (is_platform_superadmin() OR tenant_id = get_current_tenant_id())
    WITH CHECK (is_platform_superadmin() OR tenant_id = get_current_tenant_id());

-- attendance_records
DROP POLICY IF EXISTS tenant_isolation_records ON attendance_records;
CREATE POLICY tenant_isolation_records ON attendance_records
    FOR ALL
    USING (is_platform_superadmin() OR tenant_id = get_current_tenant_id())
    WITH CHECK (is_platform_superadmin() OR tenant_id = get_current_tenant_id());

-- audit_logs
DROP POLICY IF EXISTS tenant_isolation_audit ON audit_logs;
CREATE POLICY tenant_isolation_audit ON audit_logs
    FOR ALL
    USING (is_platform_superadmin() OR tenant_id = get_current_tenant_id())
    WITH CHECK (is_platform_superadmin() OR tenant_id = get_current_tenant_id());

-- ------------------------------------------------------------------------------------
-- COMPLIANCE TRIGGER: IMMUTABLE AUDIT LOGS (NO UPDATE / DELETE)
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are immutable and cannot be updated or deleted under compliance rules.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_audit_logs ON audit_logs;
CREATE TRIGGER trg_immutable_audit_logs
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_tampering();

-- ------------------------------------------------------------------------------------
-- COMPLIANCE TRIGGER: RECALCULATE STUDENT ENROLLMENT TOTALS
-- Automatically keeps cached_attendance_rate in sync after session inserts
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_student_attendance_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_total_conducted INTEGER;
    v_total_attended INTEGER;
    v_new_rate NUMERIC(5,2);
BEGIN
    -- Count sessions conducted for this student's enrolled courses/batch
    SELECT 
        COUNT(ar.id),
        COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END)
    INTO v_total_conducted, v_total_attended
    FROM attendance_records ar
    WHERE ar.student_id = NEW.student_id
      AND ar.tenant_id = NEW.tenant_id;

    IF v_total_conducted > 0 THEN
        v_new_rate := ROUND((v_total_attended::NUMERIC / v_total_conducted::NUMERIC) * 100, 1);
    ELSE
        v_new_rate := 100.00;
    END IF;

    UPDATE student_enrollments
    SET total_conducted = v_total_conducted,
        total_attended = v_total_attended,
        cached_attendance_rate = v_new_rate,
        updated_at = clock_timestamp()
    WHERE student_id = NEW.student_id
      AND tenant_id = NEW.tenant_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_attendance_summary ON attendance_records;
CREATE TRIGGER trg_sync_attendance_summary
    AFTER INSERT OR UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION sync_student_attendance_summary();

