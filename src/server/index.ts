import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_COURSES,
  INITIAL_SESSIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData.ts';
import { StudentRecord, AttendanceSession, AuditLogEntry } from '../types/index.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// CORS Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Tenant-ID');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// In-Memory Database Store (Simulating PostgreSQL with Tenant Isolation)
let students: StudentRecord[] = [...INITIAL_STUDENTS];
const courses = [...INITIAL_COURSES];
let sessions: AttendanceSession[] = [...INITIAL_SESSIONS];
let auditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];

// Tenant Context Middleware (Simulating PostgreSQL RLS)
interface AuthenticatedRequest extends Request {
  tenantId?: string;
  userRole?: string;
  userId?: string;
}

app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  req.tenantId = tenantId;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.userRole = 'FACULTY';
    req.userId = 'user-faculty';
  } else {
    req.userRole = 'ADMIN';
    req.userId = 'user-admin';
  }
  next();
});

// --------------------------------------------------------------------------------------
// Health Check Endpoint
// --------------------------------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Attendora Modular Monolith Server',
    version: '1.5.0',
    complianceEngine: 'UGC-75-Statutory',
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------------------------------------------------------
// Authentication Routes (/api/v1/auth)
// --------------------------------------------------------------------------------------
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = INITIAL_USERS.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user || password !== 'password123') {
    res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid academic email or password' },
    });
    return;
  }

  const token = `jwt-token-${user.id}-${Date.now()}`;
  res.json({
    success: true,
    access_token: token,
    user: {
      ...user,
      tenant_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    },
  });
});

app.post('/api/v1/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/v1/auth/me', (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, user: INITIAL_USERS[1] });
});

// --------------------------------------------------------------------------------------
// Academic Roster & Student Routes (/api/v1/students)
// --------------------------------------------------------------------------------------
app.get('/api/v1/students', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').toLowerCase().trim();
  const department = req.query.department as string;
  const status = req.query.status as string;

  let filtered = students;
  if (q) {
    filtered = filtered.filter((s) => s.name.toLowerCase().includes(q) || s.rollNo.includes(q));
  }
  if (department && department !== 'All') {
    filtered = filtered.filter((s) => s.department === department);
  }
  if (status && status !== 'All') {
    filtered = filtered.filter((s) => s.status === status);
  }

  res.json({ success: true, students: filtered, total: filtered.length });
});

app.patch('/api/v1/students/:id/rate', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { attendanceRate, reason } = req.body;

  if (attendanceRate === undefined || attendanceRate < 0 || attendanceRate > 100) {
    res.status(400).json({ error: { code: 'INVALID_RATE', message: 'Rate must be between 0 and 100' } });
    return;
  }
  if (!reason || !reason.trim()) {
    res.status(400).json({ error: { code: 'MISSING_REASON', message: 'Written justification is mandatory for rate modifications.' } });
    return;
  }

  const student = students.find((s) => s.id === id);
  if (!student) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Student not found' } });
    return;
  }

  student.attendanceRate = Math.round(Number(attendanceRate) * 10) / 10;
  student.status = student.attendanceRate >= 75.0 ? 'Present' : 'Low Rate';
  student.notes = reason;

  // Append audit trail
  const log: AuditLogEntry = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorId: req.userId || 'user-admin',
    actorName: 'Administrator',
    role: req.userRole || 'ADMIN',
    action: 'STUDENT_PERCENTAGE_OVERRIDE',
    targetSessionId: id,
    studentName: `${student.name} (${student.rollNo})`,
    previousStatus: 'Historical',
    newStatus: `${student.attendanceRate}% (${student.status})`,
    reason,
  };
  auditLogs.unshift(log);

  res.json({ success: true, student });
});

app.post('/api/v1/students/bulk', (req: AuthenticatedRequest, res: Response) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ error: { code: 'EMPTY_PAYLOAD', message: 'No student rows provided' } });
    return;
  }

  const errors: { row: number; reason: string }[] = [];
  const validStudents: StudentRecord[] = [];
  const seenRolls = new Set(students.map((s) => s.rollNo));
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  rows.forEach((row, idx) => {
    const rollNo = (row.rollNo || '').trim();
    const fullName = (row.fullName || '').trim();
    const email = (row.email || '').trim();
    const department = (row.department || '').trim();

    if (!rollNo) {
      errors.push({ row: idx + 1, reason: 'Roll Number is missing' });
      return;
    }
    if (seenRolls.has(rollNo)) {
      errors.push({ row: idx + 1, reason: `Duplicate Roll Number: ${rollNo}` });
      return;
    }
    if (!fullName) {
      errors.push({ row: idx + 1, reason: 'Full Name is missing' });
      return;
    }
    if (!email || !emailRegex.test(email)) {
      errors.push({ row: idx + 1, reason: `Invalid email address syntax: ${email}` });
      return;
    }
    if (!department) {
      errors.push({ row: idx + 1, reason: 'Department is missing' });
      return;
    }

    seenRolls.add(rollNo);
    validStudents.push({
      id: `stu-imp-${Date.now()}-${rollNo}`,
      rollNo,
      name: fullName,
      email,
      department,
      semester: Number(row.year === 'TE' ? 6 : 6),
      section: row.section || 'A',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      totalConducted: 40,
      totalAttended: 40,
      attendanceRate: 100.0,
      status: 'Present',
    });
  });

  if (errors.length > 0) {
    res.status(422).json({ success: false, importedCount: 0, errors });
    return;
  }

  students = [...students, ...validStudents];

  // Audit log for bulk onboarding
  auditLogs.unshift({
    id: `audit-bulk-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorId: req.userId || 'user-admin',
    actorName: 'Administrator',
    role: req.userRole || 'ADMIN',
    action: 'BULK_CSV_ONBOARDING',
    targetSessionId: 'batch-import',
    studentName: `${validStudents.length} Students Provisioned`,
    previousStatus: 'Unenrolled',
    newStatus: 'Active Enrolled',
    reason: 'Roster batch CSV file processed under FR-ADM-01',
  });

  res.status(201).json({ success: true, importedCount: validStudents.length, students: validStudents });
});

// --------------------------------------------------------------------------------------
// Course Routes (/api/v1/courses)
// --------------------------------------------------------------------------------------
app.get('/api/v1/courses', (req: Request, res: Response) => {
  res.json({ success: true, courses, total: courses.length });
});

// --------------------------------------------------------------------------------------
// Attendance Session Routes (/api/v1/attendance)
// --------------------------------------------------------------------------------------
app.get('/api/v1/attendance/sessions', (req: Request, res: Response) => {
  res.json({ success: true, sessions, total: sessions.length });
});

app.post('/api/v1/attendance/sessions', (req: AuthenticatedRequest, res: Response) => {
  const { subjectCode, subjectName, department, semester, section, timeSlot, date, records } = req.body;
  if (!subjectCode || !Array.isArray(records) || records.length === 0) {
    res.status(400).json({ error: { code: 'INVALID_DATA', message: 'Subject and records are mandatory' } });
    return;
  }

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.length - presentCount;
  const sessionId = `sess-${Date.now()}`;

  const newSession: AttendanceSession = {
    id: sessionId,
    subjectCode,
    subjectName: subjectName || 'Subject',
    department: department || 'Computer Sci.',
    semester: semester || 6,
    section: section || 'A',
    facultyId: req.userId || 'user-faculty',
    facultyName: 'Faculty Member',
    date: date || new Date().toISOString().split('T')[0],
    timeSlot: timeSlot || '10:00 AM - 11:00 AM',
    totalEnrolled: records.length,
    presentCount,
    absentCount,
    isLocked: true, // Auto-lock on submission under ADR-007
    records,
    createdAt: new Date().toISOString(),
  };

  sessions.unshift(newSession);

  // Recalculate student totals
  students = students.map((st) => {
    const rec = records.find((r) => r.studentId === st.id);
    if (!rec) return st;
    const newConducted = st.totalConducted + 1;
    const newAttended = rec.status === 'Present' ? st.totalAttended + 1 : st.totalAttended;
    const newRate = Math.round((newAttended / newConducted) * 1000) / 10;
    return {
      ...st,
      totalConducted: newConducted,
      totalAttended: newAttended,
      attendanceRate: newRate,
      status: newRate >= 75.0 ? 'Present' : 'Low Rate',
    };
  });

  // Audit log for roll-call submission
  auditLogs.unshift({
    id: `audit-sess-${sessionId}`,
    timestamp: newSession.createdAt,
    actorId: req.userId || 'user-faculty',
    actorName: 'Faculty Member',
    role: req.userRole || 'FACULTY',
    action: 'LECTURE_ROLLCALL_SUBMISSION',
    targetSessionId: sessionId,
    studentName: `Cohort (${newSession.totalEnrolled} students)`,
    previousStatus: 'Pending',
    newStatus: `Submitted (${presentCount} Present / ${absentCount} Absent)`,
    reason: `Lecture roll-call finalized for ${newSession.subjectName}`,
  });

  res.status(201).json({ success: true, session: newSession });
});

app.patch('/api/v1/attendance/sessions/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason, records } = req.body;

  if (!reason || !reason.trim()) {
    res.status(400).json({ error: { code: 'MISSING_REASON', message: 'Modifying a locked attendance session requires a written justification.' } });
    return;
  }

  const session = sessions.find((s) => s.id === id);
  if (!session) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Session not found' } });
    return;
  }

  if (Array.isArray(records)) {
    session.records = records;
    session.presentCount = records.filter((r) => r.status === 'Present').length;
    session.absentCount = records.length - session.presentCount;
  }
  session.modifiedAt = new Date().toISOString();
  session.modificationReason = reason;

  auditLogs.unshift({
    id: `audit-override-${Date.now()}`,
    timestamp: session.modifiedAt,
    actorId: req.userId || 'user-admin',
    actorName: 'Academic Administrator',
    role: req.userRole || 'ADMIN',
    action: 'SESSION_RECORD_OVERRIDE',
    targetSessionId: id,
    studentName: `${session.subjectName} (${session.date})`,
    previousStatus: 'Finalized',
    newStatus: 'Administrative Override Applied',
    reason,
  });

  res.json({ success: true, session });
});

// --------------------------------------------------------------------------------------
// Defaulters & Reports Routes (/api/v1/reports)
// --------------------------------------------------------------------------------------
app.get('/api/v1/reports/defaulters', (req: Request, res: Response) => {
  const threshold = parseFloat((req.query.threshold as string) || '75.0');
  const department = req.query.department as string;

  let cohort = students;
  if (department && department !== 'All') {
    cohort = cohort.filter((s) => s.department === department);
  }

  const defaulters = cohort
    .filter((s) => s.attendanceRate < threshold)
    .map((s) => {
      const required = Math.round((threshold / 100) * s.totalConducted);
      const shortfall = Math.max(0, required - s.totalAttended);
      return {
        ...s,
        shortfall,
        statutoryThreshold: threshold,
        tier: s.attendanceRate < 70.0 ? 'CRITICAL' : 'WARNING',
      };
    });

  res.json({
    success: true,
    threshold,
    totalEvaluated: cohort.length,
    defaultersCount: defaulters.length,
    defaulters,
  });
});

app.post('/api/v1/reports/export-csv', (req: Request, res: Response) => {
  const threshold = parseFloat(req.body.threshold || '75.0');
  const defaulters = students.filter((s) => s.attendanceRate < threshold);

  const lines = [
    'RollNo,FullName,Email,Department,Semester,Conducted,Attended,AttendanceRate,Shortfall,Status',
    ...defaulters.map((s) => {
      const required = Math.round((threshold / 100) * s.totalConducted);
      const shortfall = Math.max(0, required - s.totalAttended);
      const status = s.attendanceRate < 70.0 ? 'CRITICAL' : 'WARNING';
      return `${s.rollNo},"${s.name}",${s.email},${s.department},${s.semester},${s.totalConducted},${s.totalAttended},${s.attendanceRate}%,${shortfall},${status}`;
    }),
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=attendora_defaulters_report.csv');
  res.send(lines.join('\n'));
});

// --------------------------------------------------------------------------------------
// Audit Log Routes (/api/v1/audit)
// --------------------------------------------------------------------------------------
app.get('/api/v1/audit/logs', (req: Request, res: Response) => {
  res.json({ success: true, logs: auditLogs, total: auditLogs.length });
});

app.post('/api/v1/audit/logs', (req: AuthenticatedRequest, res: Response) => {
  const { action, targetSessionId, studentName, previousStatus, newStatus, reason } = req.body;
  if (!reason || !reason.trim()) {
    res.status(400).json({ error: { code: 'MISSING_REASON', message: 'Justification is mandatory' } });
    return;
  }

  const log: AuditLogEntry = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorId: req.userId || 'user-admin',
    actorName: 'Administrator',
    role: req.userRole || 'ADMIN',
    action: action || 'MANUAL_ENTRY',
    targetSessionId: targetSessionId || 'system',
    studentName: studentName || 'System',
    previousStatus: previousStatus || 'N/A',
    newStatus: newStatus || 'N/A',
    reason,
  };

  auditLogs.unshift(log);
  res.status(201).json({ success: true, log });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Attendora API] Modular Monolith Server running at http://localhost:${PORT}`);
    console.log(`[Attendora API] Row-Level Security context active with X-Tenant-ID header`);
  });
}

export default app;

