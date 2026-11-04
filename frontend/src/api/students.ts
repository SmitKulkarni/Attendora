import { apiClient } from './client.ts';
import { StudentRecord } from '../types/index.ts';

export async function fetchStudents(params?: { q?: string; department?: string; status?: string }): Promise<StudentRecord[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.department) query.set('department', params.department);
  if (params?.status) query.set('status', params.status);

  const endpoint = `/students${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await apiClient.get<{ success: boolean; students: StudentRecord[] }>(endpoint);
  if (res.data?.success) {
    return res.data.students;
  }
  return [];
}

export async function updateStudentRate(studentId: string, attendanceRate: number, reason: string): Promise<StudentRecord | null> {
  const res = await apiClient.patch<{ success: boolean; student: StudentRecord }>(`/students/${studentId}/rate`, {
    attendanceRate,
    reason,
  });
  if (res.data?.success) {
    return res.data.student;
  }
  return null;
}

export async function bulkImportStudents(rows: { rollNo: string; fullName: string; email: string; department: string; semester?: number; section?: string }[]): Promise<{ importedCount: number; errors?: { row: number; reason: string }[]; students?: StudentRecord[] }> {
  const res = await apiClient.post<{ success: boolean; importedCount: number; errors?: { row: number; reason: string }[]; students?: StudentRecord[] }>('/students/bulk', { rows });
  if (res.data) {
    return {
      importedCount: res.data.importedCount || 0,
      errors: res.data.errors,
      students: res.data.students,
    };
  }
  return { importedCount: 0, errors: [{ row: 0, reason: res.error?.message || 'Server error during import' }] };
}

