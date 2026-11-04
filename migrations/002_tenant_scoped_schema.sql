-- ====================================================================================
-- ATTENDORA - MIGRATION 002: TENANT-SCOPED SCHEMA & RANGE PARTITIONING
-- Target Database: PostgreSQL 16+
-- ====================================================================================

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('COLLEGE_ADMIN', 'FACULTY', 'STUDENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status_type AS ENUM ('PRESENT', 'ABSENT', 'EXCUSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------------
-- TABLE: users
-- All college administrators, professors, and enrolled students.
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_type NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);

-- ------------------------------------------------------------------------------------
-- TABLE: departments
-- Academic departments within a college (e.g., Computer Engineering, Mechanical).
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_departments_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON departments(tenant_id);

-- ------------------------------------------------------------------------------------
-- TABLE: academic_batches
-- Academic years, semesters, and division cohorts (e.g. 2025-2026, Semester 6, Div A).
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academic_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 12),
    division VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_batches_cohort UNIQUE (tenant_id, department_id, academic_year, semester, division)
);

CREATE INDEX IF NOT EXISTS idx_batches_tenant_dept ON academic_batches(tenant_id, department_id);

-- ------------------------------------------------------------------------------------
-- TABLE: courses
-- Subject courses offered by departments.
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    short_name VARCHAR(50),
    default_minimum_attendance_pct NUMERIC(5,2) NOT NULL DEFAULT 75.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_courses_tenant_code UNIQUE (tenant_id, course_code)
);

CREATE INDEX IF NOT EXISTS idx_courses_tenant_dept ON courses(tenant_id, department_id);

-- ------------------------------------------------------------------------------------
-- TABLE: course_faculty_assignments
-- Mapping courses and academic batches to faculty instructors.
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_faculty_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES academic_batches(id) ON DELETE CASCADE,
    room_allocation VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_course_faculty_batch UNIQUE (tenant_id, course_id, faculty_id, batch_id)
);

CREATE INDEX IF NOT EXISTS idx_cfa_tenant_faculty ON course_faculty_assignments(tenant_id, faculty_id);

-- ------------------------------------------------------------------------------------
-- TABLE: student_enrollments
-- Enrolled students mapped to their batch, roll number, and university PRN.
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES academic_batches(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) NOT NULL,
    prn_number VARCHAR(50),
    total_conducted INTEGER NOT NULL DEFAULT 0,
    total_attended INTEGER NOT NULL DEFAULT 0,
    cached_attendance_rate NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_enrollments_tenant_roll UNIQUE (tenant_id, batch_id, roll_number),
    CONSTRAINT uq_enrollments_student_batch UNIQUE (tenant_id, student_id, batch_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_tenant_student ON student_enrollments(tenant_id, student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_tenant_rate ON student_enrollments(tenant_id, cached_attendance_rate);

-- ------------------------------------------------------------------------------------
-- TABLE: attendance_sessions
-- Individual lecture slots conducted by faculty.
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES academic_batches(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    session_date DATE NOT NULL,
    slot_start_time TIME NOT NULL,
    slot_end_time TIME NOT NULL,
    total_enrolled INTEGER NOT NULL DEFAULT 0,
    present_count INTEGER NOT NULL DEFAULT 0,
    absent_count INTEGER NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT TRUE,
    modification_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_session_slot UNIQUE (tenant_id, course_id, batch_id, session_date, slot_start_time)
);

CREATE INDEX IF NOT EXISTS idx_sessions_tenant_date ON attendance_sessions(tenant_id, session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_course ON attendance_sessions(tenant_id, course_id);

-- ------------------------------------------------------------------------------------
-- TABLE: attendance_records (PARTITIONED BY RANGE on session_date)
-- Sub-second time-range queries over millions of attendance marks.
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    status attendance_status_type NOT NULL DEFAULT 'PRESENT',
    marked_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (id, session_date)
) PARTITION BY RANGE (session_date);

-- Partitions for Academic Year 2026-2027
CREATE TABLE IF NOT EXISTS attendance_records_2026_10 PARTITION OF attendance_records
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE IF NOT EXISTS attendance_records_2026_11 PARTITION OF attendance_records
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE IF NOT EXISTS attendance_records_2026_12 PARTITION OF attendance_records
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE TABLE IF NOT EXISTS attendance_records_2027_01 PARTITION OF attendance_records
    FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');

CREATE TABLE IF NOT EXISTS attendance_records_default PARTITION OF attendance_records
    DEFAULT;

CREATE INDEX IF NOT EXISTS idx_att_records_tenant_student ON attendance_records(tenant_id, student_id);
CREATE INDEX IF NOT EXISTS idx_att_records_session ON attendance_records(session_id);

-- ------------------------------------------------------------------------------------
-- TABLE: audit_logs (IMMUTABLE APPEND-ONLY)
-- Complete tamper-resistant accountability trail for statutory audits.
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent VARCHAR(255),
    old_state JSONB,
    new_state JSONB,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_actor ON audit_logs(tenant_id, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(tenant_id, created_at DESC);

