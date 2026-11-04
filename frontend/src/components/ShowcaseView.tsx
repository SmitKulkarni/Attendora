import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Plus,
  Copy,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import {
  UserProfile,
  StudentRecord,
  CourseDetail,
  DailyTrendData,
  AttendanceSession,
  AuditLogEntry,
  AppNotification,
} from '../types/index.ts';
import { Sidebar } from './Sidebar.tsx';
import { DesktopDashboard } from './desktop/DesktopDashboard.tsx';
import { MobileStudentApp } from './mobile/MobileStudentApp.tsx';

interface ShowcaseViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  students: StudentRecord[];
  courses: CourseDetail[];
  trendData: DailyTrendData[];
  auditLogs: AuditLogEntry[];
  notifications: AppNotification[];
  onUpdateStudent: (updated: StudentRecord) => void;
  onAddSession: (session: AttendanceSession) => void;
  onImportStudents: (newStudents: StudentRecord[]) => void;
  onSelectDesktopFull: () => void;
  onSelectMobileFull: () => void;
  openRollCall?: () => void;
  openDefaulters?: () => void;
  openAuditLog?: () => void;
  openDynamicQr?: () => void;
  openNotifications?: () => void;
  openHardware?: () => void;
  openAiRetention?: () => void;
  openHallTicket?: () => void;
  openAccreditation?: () => void;
}

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  students,
  courses,
  trendData,
  auditLogs,
  notifications,
  onUpdateStudent,
  onAddSession,
  onImportStudents,
  onSelectDesktopFull,
  onSelectMobileFull,
  openRollCall,
  openDefaulters,
  openAuditLog,
  openDynamicQr,
  openNotifications,
  openHardware,
  openAiRetention,
  openHallTicket,
  openAccreditation,
}) => {
  const [activeSidebarTab, setActiveSidebarTab] = React.useState<string>('dashboard');

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#EFEAE2] via-[#EAE4DC] to-[#DFD8CE] p-3 sm:p-6 lg:p-10 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Top Banner explaining the dual views from the reference image */}
      <div className="w-full max-w-[1720px] mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/60 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-slate-800">Attendora Dual-Screen Ecosystem:</span>
          <span className="text-slate-600 hidden md:inline">
            Authoritative Desktop Administrative Governance (Left) &amp; Student Mobile Real-Time Attendance Hub (Right)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSelectDesktopFull}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Maximize Desktop</span>
          </button>
          <button
            onClick={onSelectMobileFull}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Mobile Solo</span>
          </button>
        </div>
      </div>

      {/* Main Dual Showcase Grid matching the prompt image */}
      <div className="w-full max-w-[1720px] grid grid-cols-1 xl:grid-cols-12 gap-8 items-start justify-center">
        {/* Left Side: Desktop Web Dashboard in Safari/macOS Window Frame (8 cols on large screens) */}
        <div className="xl:col-span-8 w-full bg-white rounded-3xl shadow-2xl border border-slate-300/80 overflow-hidden flex flex-col transition-all">
          {/* macOS Window Titlebar matching screenshot */}
          <div className="h-10 bg-[#f1f2f6] px-4 flex items-center justify-between border-b border-slate-200/90 select-none">
            {/* Window Controls: Red, Yellow, Green dots */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>

            {/* Browser Navigation Arrows & Address Bar */}
            <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
              <div className="flex items-center gap-1 text-slate-400">
                <ChevronLeft className="w-3.5 h-3.5" />
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>

              {/* Centered URL Bar: 'attendora' */}
              <div className="flex-1 bg-white border border-slate-200/80 rounded-md py-1 px-3 text-center text-[11px] font-mono font-medium text-slate-700 shadow-2xs flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>attendora</span>
              </div>
            </div>

            {/* Window Action Icons */}
            <div className="flex items-center gap-3 text-slate-400">
              <Share2 className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer" />
              <Plus className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer" />
              <Copy className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer" />
            </div>
          </div>

          {/* Desktop Dashboard Content: Sidebar + Main Surface */}
          <div className="flex h-[780px] overflow-hidden">
            <Sidebar
              activeTab={activeSidebarTab}
              onSelectTab={setActiveSidebarTab}
              openRollCall={openRollCall || (() => {})}
              openDefaulters={openDefaulters || (() => {})}
              openAuditLog={openAuditLog || (() => {})}
              openDynamicQr={openDynamicQr}
              openNotifications={openNotifications}
              openHardware={openHardware}
              openAiRetention={openAiRetention}
              openHallTicket={openHallTicket}
              openAccreditation={openAccreditation}
            />

            <DesktopDashboard
              currentUser={currentUser}
              allUsers={allUsers}
              onSwitchUser={onSwitchUser}
              students={students}
              courses={courses}
              trendData={trendData}
              auditLogs={auditLogs}
              notifications={notifications}
              onUpdateStudent={onUpdateStudent}
              onAddSession={onAddSession}
              onImportStudents={onImportStudents}
            />
          </div>
        </div>

        {/* Right Side: Smartphone Device Mockup (4 cols on large screens) */}
        <div className="xl:col-span-4 w-full flex flex-col items-center justify-center py-2">
          <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
            {/* Phone Shadow & Glow */}
            <div className="absolute inset-0 bg-black/30 rounded-[50px] filter blur-xl transform translate-y-4 scale-95 pointer-events-none" />

            {/* Student Mobile App Container */}
            <MobileStudentApp
              courses={courses}
              overallAttendance={82}
              notifications={notifications}
              studentName={currentUser.role === 'STUDENT' ? currentUser.name : 'Sneha Kulkarni'}
            />
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs font-semibold text-slate-600 bg-white/60 px-3 py-1 rounded-full border border-slate-300 shadow-2xs">
              Interactive Live Student Mobile Client (Try clicking courses &amp; calculator)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
