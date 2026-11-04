export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  designation?: string;
  rollNo?: string;
}

export interface StudentRecord {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  section: string;
  avatar: string;
  totalConducted: number;
  totalAttended: number;
  attendanceRate: number;
  status: 'Present' | 'Low Rate';
  notes?: string;
}

export interface CourseDetail {
  id: string;
  code: string;
  name: string;
  shortName: string;
  facultyName: string;
  department: string;
  semester: number;
  totalConducted: number;
  totalAttended: number;
  percentage: number;
  status: 'Safe' | 'Low' | 'Critical';
  room: string;
  nextLectureSlot: string;
}

export interface DailyTrendData {
  day: string;
  scheduled: number;
  attended: number;
  rate: number;
}

export interface SessionRecord {
  studentId: string;
  rollNo: string;
  studentName: string;
  status: 'Present' | 'Absent';
}

export interface AttendanceSession {
  id: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  semester: number;
  section: string;
  facultyId: string;
  facultyName: string;
  date: string;
  timeSlot: string;
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
  records: SessionRecord[];
  createdAt: string;
  modifiedAt?: string;
  modificationReason?: string;
  isLocked?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  role: string;
  action: string;
  targetSessionId: string;
  studentName: string;
  previousStatus: string;
  newStatus: string;
  reason: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'warning' | 'info' | 'success';
  unread: boolean;
  course?: string;
}
