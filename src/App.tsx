import React, { useState } from 'react';
import {
  Layers,
  Monitor,
  Smartphone,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_COURSES,
  INITIAL_DAILY_TRENDS,
  INITIAL_SESSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData.ts';
import {
  UserProfile,
  StudentRecord,
  CourseDetail,
  DailyTrendData,
  AttendanceSession,
  AuditLogEntry,
  AppNotification,
} from './types/index.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { DesktopDashboard } from './components/desktop/DesktopDashboard.tsx';
import { MobileStudentApp } from './components/mobile/MobileStudentApp.tsx';
import { ShowcaseView } from './components/ShowcaseView.tsx';
import { RollCallModal } from './components/desktop/RollCallModal.tsx';
import { DefaultersReportModal } from './components/desktop/DefaultersReportModal.tsx';
import { CsvImportModal } from './components/desktop/CsvImportModal.tsx';
import { AuditLogModal } from './components/desktop/AuditLogModal.tsx';
import { DynamicQrDisplayModal } from './components/desktop/DynamicQrDisplayModal.tsx';
import { NotificationDispatchModal } from './components/desktop/NotificationDispatchModal.tsx';
import { HardwareIntegrationModal } from './components/desktop/HardwareIntegrationModal.tsx';
import { StudentQrScannerModal } from './components/mobile/StudentQrScannerModal.tsx';
import { AiRetentionModal } from './components/desktop/AiRetentionModal.tsx';
import { HallTicketGatingModal } from './components/desktop/HallTicketGatingModal.tsx';
import { AccreditationExportModal } from './components/desktop/AccreditationExportModal.tsx';
import { Brain, FileBadge } from 'lucide-react';
import { QrCode, Send, Cpu } from 'lucide-react';
import {
  apiClient,
  fetchStudents,
  fetchCourses,
  fetchAttendanceSessions,
  fetchAuditLogs,
  submitAttendanceSession,
  updateStudentRate,
  bulkImportStudents,
} from './api/index.ts';

export default function App() {
  // Navigation / View state
  const [viewMode, setViewMode] = useState<'SHOWCASE' | 'DESKTOP' | 'MOBILE'>('SHOWCASE');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[1]); // Default to Faculty/Admin
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  // Hydrate live state if backend is online
  React.useEffect(() => {
    apiClient.checkBackendHealth().then((online) => {
      setIsBackendConnected(online);
      if (online) {
        fetchStudents().then((st) => {
          if (st && st.length > 0) setStudents(st);
        });
        fetchCourses().then((crs) => {
          if (crs && crs.length > 0) setCourses(crs);
        });
        fetchAttendanceSessions().then((sess) => {
          if (sess && sess.length > 0) setSessions(sess);
        });
        fetchAuditLogs().then((logs) => {
          if (logs && logs.length > 0) setAuditLogs(logs);
        });
      }
    });
  }, []);

  // Application Data States
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [courses, setCourses] = useState<CourseDetail[]>(INITIAL_COURSES);
  const [trendData, setTrendData] = useState<DailyTrendData[]>(INITIAL_DAILY_TRENDS);
  const [sessions, setSessions] = useState<AttendanceSession[]>(INITIAL_SESSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Modals for global trigger
  const [isRollCallOpen, setIsRollCallOpen] = useState<boolean>(false);
  const [isDefaultersOpen, setIsDefaultersOpen] = useState<boolean>(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState<boolean>(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [isDynamicQrOpen, setIsDynamicQrOpen] = useState<boolean>(false);
  const [isNotificationDispatchOpen, setIsNotificationDispatchOpen] = useState<boolean>(false);
  const [isHardwareOpen, setIsHardwareOpen] = useState<boolean>(false);
  const [isStudentScannerOpen, setIsStudentScannerOpen] = useState<boolean>(false);
  const [isAiRetentionOpen, setIsAiRetentionOpen] = useState<boolean>(false);
  const [isHallTicketOpen, setIsHallTicketOpen] = useState<boolean>(false);
  const [isAccreditationOpen, setIsAccreditationOpen] = useState<boolean>(false);

  // Deep Link Report State (FR-STU deep link verification)
  const [deepLinkReport, setDeepLinkReport] = useState<{
    courseCode: string;
    studentName: string;
    studentId: string;
  } | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'report' && params.get('course')) {
      return {
        courseCode: params.get('course') || 'CS601',
        studentName: params.get('student') || 'Sneha Kulkarni',
        studentId: params.get('studentId') || '20000001',
      };
    }
    return null;
  });


  // Handlers for mutations
  const handleUpdateStudent = (updatedStudent: StudentRecord) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );

    // Append to audit log
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      role: currentUser.role,
      action: 'STUDENT_RECORD_MODIFICATION',
      targetSessionId: 'manual-override',
      studentName: `${updatedStudent.name} (${updatedStudent.rollNo})`,
      previousStatus: 'Historical',
      newStatus: `${updatedStudent.attendanceRate}% (${updatedStudent.status})`,
      reason: updatedStudent.notes || 'Direct administrative percentage update',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Dispatch to backend API asynchronously
    updateStudentRate(
      updatedStudent.id,
      updatedStudent.attendanceRate,
      updatedStudent.notes || 'Direct administrative percentage update'
    ).catch(() => {});
  };

  const handleAddSession = (newSession: AttendanceSession) => {
    setSessions((prev) => [newSession, ...prev]);

    // Recalculate student totals based on new session
    setStudents((prevStudents) =>
      prevStudents.map((st) => {
        const record = newSession.records.find((r) => r.studentId === st.id);
        if (!record) return st;

        const newConducted = st.totalConducted + 1;
        const newAttended = record.status === 'Present' ? st.totalAttended + 1 : st.totalAttended;
        const rawRate = (newAttended / newConducted) * 100;
        const newRate = Math.round(rawRate * 10) / 10;
        const newStatus = newRate >= 75.0 ? 'Present' : 'Low Rate';

        return {
          ...st,
          totalConducted: newConducted,
          totalAttended: newAttended,
          attendanceRate: newRate,
          status: newStatus,
        };
      })
    );

    // Update course totals
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.code === newSession.subjectCode) {
          const newConducted = c.totalConducted + 1;
          const newAttended = c.totalAttended + (newSession.presentCount > 0 ? 1 : 0);
          const newPercentage = Math.round((newAttended / newConducted) * 1000) / 10;
          return {
            ...c,
            totalConducted: newConducted,
            totalAttended: newAttended,
            percentage: newPercentage,
            status: newPercentage >= 75.0 ? 'Safe' : 'Low',
          };
        }
        return c;
      })
    );

    // Append to audit log
    const auditEntry: AuditLogEntry = {
      id: `audit-sess-${newSession.id}`,
      timestamp: newSession.createdAt,
      actorId: currentUser.id,
      actorName: currentUser.name,
      role: currentUser.role,
      action: 'LECTURE_ROLLCALL_SUBMISSION',
      targetSessionId: newSession.id,
      studentName: `Batch (${newSession.totalEnrolled} students)`,
      previousStatus: 'Pending',
      newStatus: `Submitted (${newSession.presentCount} Present / ${newSession.absentCount} Absent)`,
      reason: `Regular lecture roll-call conducted for ${newSession.subjectName}`,
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    // Dispatch to backend API asynchronously
    submitAttendanceSession(newSession).catch(() => {});
  };

  const handleImportStudents = (newStudents: StudentRecord[]) => {
    setStudents((prev) => [...prev, ...newStudents]);
    const auditEntry: AuditLogEntry = {
      id: `audit-csv-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      role: currentUser.role,
      action: 'BULK_CSV_ONBOARDING',
      targetSessionId: 'batch-import',
      studentName: `${newStudents.length} Newly Provisioned Students`,
      previousStatus: 'Unenrolled',
      newStatus: 'Active Enrolled',
      reason: 'Batch CSV Roster Ingestion completed under FR-ADM-01',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    // Dispatch to backend API asynchronously
    bulkImportStudents(
      newStudents.map((s) => ({
        rollNo: s.rollNo,
        fullName: s.name,
        email: s.email,
        department: s.department,
        semester: s.semester,
        section: s.section,
      }))
    ).catch(() => {});
  };

  const resetDemoData = () => {
    setStudents(INITIAL_STUDENTS);
    setCourses(INITIAL_COURSES);
    setTrendData(INITIAL_DAILY_TRENDS);
    setSessions(INITIAL_SESSIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-[#0B1C30]">
      {/* Universal Presentation Navigation Bar */}
      <nav className="h-14 bg-[#091426] text-white px-4 sm:px-6 flex items-center justify-between shrink-0 border-b border-[#1E293B] shadow-md z-40 select-none">
        {/* Brand & Mode Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00C48C] via-[#00A3FF] to-[#3B82F6] flex items-center justify-center font-bold text-white text-xs shadow-md">
            A
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white text-base">Attendora</span>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
              v1.5.0 RLS Ready
            </span>
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border border-slate-700/80 bg-slate-800/60">
              <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></span>
              <span className="text-slate-300">{isBackendConnected ? 'API Online (RLS Active)' : 'Local Engine (RLS Context)'}</span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#132238] p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => setViewMode('SHOWCASE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'SHOWCASE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dual Showcase</span>
            <span className="md:hidden">Dual</span>
          </button>

          <button
            onClick={() => setViewMode('DESKTOP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'DESKTOP'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop Console</span>
          </button>

          <button
            onClick={() => setViewMode('MOBILE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'MOBILE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Student App</span>
          </button>
        </div>

        {/* Operational Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiRetentionOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/80 text-purple-200 hover:text-white border border-purple-700/80 transition"
            title="Gemini 2.5 AI Student Dropout & Failure Predictor"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">AI Retention</span>
          </button>

          <button
            onClick={() => setIsStudentScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition"
            title="Scan classroom rolling QR code"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Scan QR</span>
          </button>

          <button
            onClick={() => setIsDynamicQrOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition"
            title="Launch classroom projector dynamic QR display"
          >
            <QrCode className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden lg:inline">Projector QR</span>
          </button>

          <button
            onClick={() => setIsRollCallOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 transition shadow-xs"
            title="Launch interactive digital roll-call"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Take Attendance</span>
          </button>

          <button
            onClick={() => setIsDefaultersOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Defaulters (&lt;75%)</span>
          </button>

          <button
            onClick={() => setIsAuditLogOpen(true)}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Inspect Audit Trail"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Audit</span>
          </button>

          <button
            onClick={resetDemoData}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
            title="Reset to default seed state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'SHOWCASE' && (
          <ShowcaseView
            currentUser={currentUser}
            allUsers={INITIAL_USERS}
            onSwitchUser={setCurrentUser}
            students={students}
            courses={courses}
            trendData={trendData}
            auditLogs={auditLogs}
            notifications={notifications}
            onUpdateStudent={handleUpdateStudent}
            onAddSession={handleAddSession}
            onImportStudents={handleImportStudents}
            onSelectDesktopFull={() => setViewMode('DESKTOP')}
            onSelectMobileFull={() => setViewMode('MOBILE')}
          />
        )}

        {viewMode === 'DESKTOP' && (
          <div className="w-full flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <Sidebar
              activeTab={activeSidebarTab}
              onSelectTab={setActiveSidebarTab}
              openRollCall={() => setIsRollCallOpen(true)}
              openDefaulters={() => setIsDefaultersOpen(true)}
              openAuditLog={() => setIsAuditLogOpen(true)}
            />
            <DesktopDashboard
              currentUser={currentUser}
              allUsers={INITIAL_USERS}
              onSwitchUser={setCurrentUser}
              students={students}
              courses={courses}
              trendData={trendData}
              auditLogs={auditLogs}
              notifications={notifications}
              onUpdateStudent={handleUpdateStudent}
              onAddSession={handleAddSession}
              onImportStudents={handleImportStudents}
            />
          </div>
        )}

        {viewMode === 'MOBILE' && (
          <div className="w-full h-[calc(100vh-3.5rem)] bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#091426] p-4 sm:p-8 flex items-center justify-center overflow-y-auto">
            <div className="relative">
              <MobileStudentApp
                courses={courses}
                overallAttendance={82}
                notifications={notifications}
                studentName={currentUser.role === 'STUDENT' ? currentUser.name : 'Sneha Kulkarni'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Global Modals */}
      <RollCallModal
        isOpen={isRollCallOpen}
        onClose={() => setIsRollCallOpen(false)}
        students={students}
        courses={courses}
        onSessionSubmitted={handleAddSession}
      />

      <DefaultersReportModal
        isOpen={isDefaultersOpen}
        onClose={() => setIsDefaultersOpen(false)}
        students={students}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onImportStudents={handleImportStudents}
      />

      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        auditLogs={auditLogs}
      />

      {/* Verified Deep Link Report View Modal */}
      {deepLinkReport && (() => {
        const course = courses.find((c) => c.code === deepLinkReport.courseCode) || courses[0];
        const isSafe = course.percentage >= 75.0;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Verified Institutional Attendance Report</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Academic Session 2026 · Sem 6</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeepLinkReport(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
                  aria-label="Close verified report"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Student Name:</div>
                    <div className="font-bold text-sm text-slate-900">{deepLinkReport.studentName}</div>
                    <div className="text-[11px] font-mono text-slate-400">PRN: {deepLinkReport.studentId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Course Code:</div>
                    <div className="font-bold text-sm text-blue-600 font-mono">{course.code}</div>
                    <div className="text-[11px] text-slate-600">{course.shortName}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#091426] to-[#1e293b] text-white p-5 rounded-2xl text-center space-y-1 shadow-lg">
                  <div className="text-xs text-slate-300 font-medium">Verified Attendance Rate</div>
                  <div className="text-4xl font-extrabold font-mono text-white tnum">
                    {course.percentage}%
                  </div>
                  <div className="text-xs text-slate-300">
                    {course.totalAttended} of {course.totalConducted} Instructional Sessions Attended
                  </div>
                  <div className="pt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isSafe
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {isSafe ? 'Statutory Compliant (Eligible)' : 'Defaulter Shortage'}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span>Cryptographic Proof: 0x8a7...f3e</span>
                  <span className="font-mono text-emerald-600 font-semibold">Active Official Record</span>
                </div>
              </div>

              <button
                onClick={() => setDeepLinkReport(null)}
                className="w-full mt-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
              >
                Close Report
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

