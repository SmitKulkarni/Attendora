import React, { useState } from 'react';
import {
  Plus,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import {
  UserProfile,
  StudentRecord,
  CourseDetail,
  DailyTrendData,
  AttendanceSession,
  AuditLogEntry,
  AppNotification,
} from '../../types/index.ts';
import { DashboardMetrics } from './DashboardMetrics.tsx';
import { AttendanceTrendChart } from './AttendanceTrendChart.tsx';
import { StudentRosterTable } from './StudentRosterTable.tsx';
import { RollCallModal } from './RollCallModal.tsx';
import { DefaultersReportModal } from './DefaultersReportModal.tsx';
import { CsvImportModal } from './CsvImportModal.tsx';
import { AuditLogModal } from './AuditLogModal.tsx';

interface DesktopDashboardProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  students: StudentRecord[];
  courses: CourseDetail[];
  trendData: DailyTrendData[];
  auditLogs: AuditLogEntry[];
  notifications: AppNotification[];
  onUpdateStudent: (updated: StudentRecord) => void;
  onAddStudent?: (newStudent: StudentRecord) => void;
  onAddSession: (session: AttendanceSession) => void;
  onImportStudents: (newStudents: StudentRecord[]) => void;
  onSignOut?: () => void;
}

export const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  students,
  courses,
  trendData,
  auditLogs,
  notifications,
  onUpdateStudent,
  onAddStudent,
  onAddSession,
  onImportStudents,
  onSignOut,
}) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [isRollCallOpen, setIsRollCallOpen] = useState<boolean>(false);
  const [isDefaultersOpen, setIsDefaultersOpen] = useState<boolean>(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState<boolean>(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSessionSubmitted = (session: AttendanceSession) => {
    onAddSession(session);
    setToastMessage(`Roll-call submitted! Session #${session.id} recorded with ${session.presentCount} present.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
      {/* Top Application Bar matching Desktop Window in Screenshot */}
      <header className="h-16 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Live Term Sem 6
          </span>
        </div>

        {/* Right Topbar Icons matching Screenshot: [+] button, Bell (2), User Avatar with "Faculty/admin" */}
        <div className="flex items-center gap-3">
          {/* Quick Add Session Button (+) */}
          <button
            onClick={() => setIsRollCallOpen(true)}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition border border-slate-200"
            title="Create Roll-Call Session"
            aria-label="New Session"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Notification Bell with Red Badge "2" */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsMenu((prev) => !prev)}
              className="relative w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition border border-slate-200"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
            </button>

            {/* Notification Dropdown */}
            {showNotificationsMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                  <span>Administrative Alerts</span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                    2 Unresolved
                  </span>
                </div>
                <div className="py-2 space-y-2">
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="font-bold text-amber-900">Missing Attendance Reminder</div>
                    <div className="text-slate-600 mt-0.5">
                      Timetable slot for CS603 (11:00 AM) concluded without submitted attendance.
                    </div>
                  </div>
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-bold text-red-900">Critical Shortage Breach</div>
                    <div className="text-slate-600 mt-0.5">
                      Student Samoh Baiin dropped to 67.5% in Department of Computer Sci.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Role Dropdown from Screenshot ("Faculty/admin") */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown((prev) => !prev)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-300 shadow-2xs"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Faculty/admin
                </div>
                <div className="text-[10px] text-slate-400 leading-none">
                  {currentUser.name}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Switcher Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Persona
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition ${
                      currentUser.id === u.id ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-semibold">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.designation || u.role}</div>
                    </div>
                  </button>
                ))}

                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out to Login Portal</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="mx-6 mt-4 p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-200 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Dashboard Body */}
      <main className="p-6 space-y-6">
        {/* Metric Cards Row */}
        <DashboardMetrics
          activeDeptCount={1}
          totalStudentsCount={students.length}
          dailyAttendanceRate={82}
          defaulterRate={18}
          selectedFilter={filterMode}
          onFilterChange={setFilterMode}
        />

        {/* Attendance Trend Chart */}
        <AttendanceTrendChart trendData={trendData} />

        {/* Student Roster Management Table */}
        <StudentRosterTable
          students={students}
          onUpdateStudent={onUpdateStudent}
          onAddStudent={onAddStudent || ((s) => onImportStudents([s]))}
          openRollCall={() => setIsRollCallOpen(true)}
          openCsvImport={() => setIsCsvImportOpen(true)}
        />
      </main>

      {/* Modals */}
      <RollCallModal
        isOpen={isRollCallOpen}
        onClose={() => setIsRollCallOpen(false)}
        students={students}
        courses={courses}
        onSessionSubmitted={handleSessionSubmitted}
      />

      <DefaultersReportModal
        isOpen={isDefaultersOpen}
        onClose={() => setIsDefaultersOpen(false)}
        students={students}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onImportStudents={onImportStudents}
      />

      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        auditLogs={auditLogs}
      />
    </div>
  );
};
