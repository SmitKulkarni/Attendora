-- ==============================================================================
-- Attendora Enterprise: Complete Supabase Cloud Migration Schema
-- Run this script in your Supabase Project -> SQL Editor to initialize all tables
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Students Roster Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    roll_no TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL DEFAULT 6,
    section TEXT NOT NULL DEFAULT 'A',
    avatar TEXT,
    total_conducted INTEGER NOT NULL DEFAULT 0,
    total_attended INTEGER NOT NULL DEFAULT 0,
    attendance_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Low Rate')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Courses & Instructional Timetable Table
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    faculty_name TEXT NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL DEFAULT 6,
    total_conducted INTEGER NOT NULL DEFAULT 0,
    total_attended INTEGER NOT NULL DEFAULT 0,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL CHECK (status IN ('Safe', 'Low', 'Critical')),
    room TEXT NOT NULL,
    next_lecture_slot TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Attendance Sessions Table
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL DEFAULT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    faculty_id TEXT NOT NULL,
    faculty_name TEXT NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    time_slot TEXT NOT NULL,
    room TEXT NOT NULL,
    total_enrolled INTEGER NOT NULL DEFAULT 0,
    present_count INTEGER NOT NULL DEFAULT 0,
    absent_count INTEGER NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Session Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Immutable Non-Repudiation Audit Ledger Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_session_id TEXT,
    student_name TEXT,
    previous_status TEXT,
    new_status TEXT,
    reason TEXT NOT NULL
);

-- ==============================================================================
-- Row-Level Security (RLS) Configuration
-- ==============================================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for both demo and authenticated views)
CREATE POLICY "Public Read Students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public Read Courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public Read Sessions" ON public.attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Public Read Records" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Public Read Audit" ON public.audit_logs FOR SELECT USING (true);

-- Allow Staff Full Access for mutations
CREATE POLICY "Staff Full Insert Students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff Full Update Students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Staff Full Delete Students" ON public.students FOR DELETE USING (true);

CREATE POLICY "Staff Insert Sessions" ON public.attendance_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff Update Sessions" ON public.attendance_sessions FOR UPDATE USING (true);

CREATE POLICY "Staff Insert Records" ON public.attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff Insert Audit" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- Baseline Institutional Seed Data
-- ==============================================================================
INSERT INTO public.students (id, roll_no, name, email, department, semester, section, avatar, total_conducted, total_attended, attendance_rate, status, notes)
VALUES
('stu-1', '20000001', 'Sneha Kulkarni', 'sneha.kulkarni@student.attendora.edu', 'Computer Science & Engineering', 6, 'A', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 40, 35, 87.5, 'Present', 'High Academic Compliance'),
('stu-2', '20000002', 'Kenrii Anay', 'kenrii.anay@student.attendora.edu', 'Computer Science & Engineering', 6, 'A', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 40, 31, 77.5, 'Present', 'Satisfactory Attendance'),
('stu-3', '20000003', 'Samoh Baiin', 'samoh.baiin@student.attendora.edu', 'Computer Science & Engineering', 6, 'A', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 40, 27, 67.5, 'Low Rate', 'Critical Defaulter (< 70%)'),
('stu-4', '20000004', 'Danyyl Balo', 'danyyl.balo@student.attendora.edu', 'Computer Science & Engineering', 6, 'A', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 40, 38, 95.0, 'Present', 'Class Representative Candidate'),
('stu-5', '20000005', 'Maksym Yem', 'maksym.yem@student.attendora.edu', 'Computer Science & Engineering', 6, 'A', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 40, 29, 72.5, 'Low Rate', 'Defaulter Warning Tier (70-74%)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courses (id, code, name, short_name, faculty_name, department, semester, total_conducted, total_attended, percentage, status, room, next_lecture_slot)
VALUES
('crs-1', 'CS601', 'Cloud Computing & Distributed Systems', 'Cloud Comp.', 'Prof. Rajesh Deshmukh', 'Computer Science & Engineering', 6, 24, 21, 87.5, 'Safe', 'LH-104', 'Today, 10:00 AM'),
('crs-2', 'CS602', 'Software Engineering & Agile Methodologies', 'Software Eng.', 'Dr. Anita Roy', 'Computer Science & Engineering', 6, 20, 15, 75.0, 'Safe', 'LH-102', 'Today, 11:30 AM'),
('crs-3', 'CS603', 'Database Management Systems & Relational Theory', 'DBMS', 'Prof. Arvind Kulkarni', 'Computer Science & Engineering', 6, 22, 14, 63.6, 'Critical', 'Lab 3', 'Tomorrow, 09:00 AM'),
('crs-4', 'CS604', 'Machine Learning & Predictive Intelligence', 'Machine Learning', 'Dr. Sunita Patil', 'Computer Science & Engineering', 6, 18, 16, 88.9, 'Safe', 'Seminar Hall', 'Thursday, 02:00 PM')
ON CONFLICT (id) DO NOTHING;

