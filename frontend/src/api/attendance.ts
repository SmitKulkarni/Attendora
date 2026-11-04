import { apiClient } from './client.ts';
import { AttendanceSession, CourseDetail } from '../types/index.ts';

export async function fetchCourses(): Promise<CourseDetail[]> {
  const res = await apiClient.get<{ success: boolean; courses: CourseDetail[] }>('/courses');
  if (res.data?.success) {
    return res.data.courses;
  }
  return [];
}

export async function fetchAttendanceSessions(): Promise<AttendanceSession[]> {
  const res = await apiClient.get<{ success: boolean; sessions: AttendanceSession[] }>('/attendance/sessions');
  if (res.data?.success) {
    return res.data.sessions;
  }
  return [];
}

export async function submitAttendanceSession(sessionData: Omit<AttendanceSession, 'id' | 'createdAt' | 'isLocked'>): Promise<AttendanceSession | null> {
  const res = await apiClient.post<{ success: boolean; session: AttendanceSession }>('/attendance/sessions', sessionData);
  if (res.data?.success) {
    return res.data.session;
  }
  return null;
}

export async function overrideAttendanceSession(
  sessionId: string,
  reason: string,
  records: AttendanceSession['records']
): Promise<AttendanceSession | null> {
  const res = await apiClient.patch<{ success: boolean; session: AttendanceSession }>(`/attendance/sessions/${sessionId}`, {
    reason,
    records,
  });
  if (res.data?.success) {
    return res.data.session;
  }
  return null;
}

