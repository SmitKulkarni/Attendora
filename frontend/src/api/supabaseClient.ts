import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentRecord, CourseDetail, AttendanceSession, AuditLogEntry } from '../types/index.ts';

// Read credentials from Vite environment variables
const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref') && 
  !supabaseAnonKey.includes('your-anon-public-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Fetch all students from Supabase database (with offline/local fallback)
 */
export async function getSupabaseStudents(): Promise<StudentRecord[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('roll_no', { ascending: true });

    if (error || !data) {
      console.warn('[Supabase] Failed to fetch students, using local engine:', error?.message);
      return null;
    }

    return data.map((row) => ({
      id: row.id,
      rollNo: row.roll_no,
      name: row.name,
      email: row.email,
      department: row.department,
      semester: row.semester,
      section: row.section,
      avatar: row.avatar,
      totalConducted: row.total_conducted,
      totalAttended: row.total_attended,
      attendanceRate: row.attendance_rate,
      status: row.status,
      notes: row.notes,
    }));
  } catch (err) {
    console.warn('[Supabase Error]:', err);
    return null;
  }
}

/**
 * Update student attendance rate directly in Supabase (Staff Full Access)
 */
export async function updateSupabaseStudent(
  studentId: string,
  newRate: number,
  notes: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const status = newRate >= 75.0 ? 'Present' : 'Low Rate';
    const { error } = await supabase
      .from('students')
      .update({
        attendance_rate: newRate,
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId);

    if (error) {
      console.error('[Supabase Update Error]:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Create or bulk-insert students into Supabase (Staff Full Access)
 */
export async function insertSupabaseStudent(student: StudentRecord): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('students').insert({
      id: student.id,
      roll_no: student.rollNo,
      name: student.name,
      email: student.email,
      department: student.department,
      semester: student.semester,
      section: student.section,
      avatar: student.avatar,
      total_conducted: student.totalConducted,
      total_attended: student.totalAttended,
      attendance_rate: student.attendanceRate,
      status: student.status,
      notes: student.notes,
    });

    return !error;
  } catch {
    return false;
  }
}

/**
 * Log audit record into Supabase immutable ledger
 */
export async function logSupabaseAudit(entry: AuditLogEntry): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('audit_logs').insert({
      id: entry.id,
      timestamp: entry.timestamp,
      actor_id: entry.actorId,
      actor_name: entry.actorName,
      role: entry.role,
      action: entry.action,
      target_session_id: entry.targetSessionId,
      student_name: entry.studentName,
      previous_status: entry.previousStatus,
      new_status: entry.newStatus,
      reason: entry.reason,
    });

    return !error;
  } catch {
    return false;
  }
}

