import React, { useState } from 'react';
import {
  Bell,
  Wifi,
  Battery,
  AlertTriangle,
  X,
  Home,
  BookOpen,
  User,
  Calculator,
  ChevronRight,
  CheckCircle2,
  Clock,
  LogOut,
  ArrowRight,
  Calendar,
  Share2,
  Copy,
  Check,
  Link2,
  ChevronDown,
} from 'lucide-react';
import { CourseDetail, AppNotification } from '../../types/index.ts';
import {
  calculateRecoveryClasses,
  calculateAffordableAbsences,
  generateAttendanceReportDeepLink,
} from '../../utils/attendance.ts';
import { calculateSwipeDismiss } from '../../utils/gesture.ts';


interface MobileStudentAppProps {
  courses: CourseDetail[];
  overallAttendance?: number;
  notifications: AppNotification[];
  studentName?: string;
  onOpenCalculator?: () => void;
  onSignOut?: () => void;
}

export const MobileStudentApp: React.FC<MobileStudentAppProps> = ({
  courses,
  overallAttendance = 82,
  notifications,
  studentName = 'Sneha Kulkarni',
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'courses' | 'calc' | 'profile'>('home');
  const [showAlert, setShowAlert] = useState<boolean>(true);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<CourseDetail | null>(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [disputeSuccess, setDisputeSuccess] = useState<string | null>(null);
  const [shareData, setShareData] = useState<{ url: string; course: CourseDetail; copied: boolean } | null>(null);

  // Swipe-to-dismiss gesture state for Course Detail modal
  const [dragY, setDragY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDismissing, setIsDismissing] = useState<boolean>(false);
  const isDraggingRef = React.useRef<boolean>(false);
  const dragStartYRef = React.useRef<number>(0);
  const dragStartTimeRef = React.useRef<number>(0);
  const currentDragYRef = React.useRef<number>(0);

  const openCourseDetail = React.useCallback((course: CourseDetail) => {
    setDragY(0);
    setIsDragging(false);
    isDraggingRef.current = false;
    setIsDismissing(false);
    setSelectedCourseForDetail(course);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsDismissing(true);
    setTimeout(() => {
      setSelectedCourseForDetail(null);
      setShareData(null);
      setDragY(0);
      setIsDragging(false);
      isDraggingRef.current = false;
      setIsDismissing(false);
    }, 220);
  }, []);

  // Keyboard accessibility: Escape key closes modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCourseForDetail) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCourseForDetail, closeModal]);

  const onDragStart = (clientY: number) => {
    isDraggingRef.current = true;
    dragStartYRef.current = clientY;
    dragStartTimeRef.current = Date.now();
    currentDragYRef.current = 0;
    setIsDragging(true);
  };

  const onDragMove = (clientY: number) => {
    if (!isDraggingRef.current) return;
    const currentDelta = clientY - dragStartYRef.current;
    currentDragYRef.current = currentDelta;
    const swipe = calculateSwipeDismiss(currentDelta, 0);
    setDragY(swipe.translateY);
  };

  const onDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const elapsed = Math.max(1, Date.now() - dragStartTimeRef.current);
    const deltaY = currentDragYRef.current;
    const velocity = deltaY / elapsed;
    const swipe = calculateSwipeDismiss(deltaY, velocity);

    if (swipe.shouldDismiss) {
      closeModal();
    } else {
      setDragY(0);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    onDragStart(e.clientY);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onDragMove(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    onDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      onDragStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      onDragMove(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    onDragEnd();
  };

  const handleShareCourse = (course: CourseDetail) => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://attendora.edu';
    const deepLink = generateAttendanceReportDeepLink(origin, '20000001', studentName, course.code);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(deepLink);
      }
    } catch {
      // Fallback
    }

    setShareData({
      url: deepLink,
      course,
      copied: true,
    });
  };


  // Recovery calculator state for student
  const [calcCourseId, setCalcCourseId] = useState<string>(courses[3]?.id || courses[0]?.id || '');
  const activeCalcCourse = courses.find((c) => c.id === calcCourseId) || courses[0];
  const recoveryClassesNeeded = calculateRecoveryClasses(
    activeCalcCourse.totalAttended,
    activeCalcCourse.totalConducted,
    0.75
  );
  const affordableAbsences = calculateAffordableAbsences(
    activeCalcCourse.totalAttended,
    activeCalcCourse.totalConducted,
    0.75
  );

  // SVG Circular Gauge Math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallAttendance / 100) * circumference;

  return (
    <div className="w-full max-w-[390px] h-[820px] bg-[#0c182c] rounded-[48px] p-3 text-white shadow-2xl border-[10px] border-[#1e293b] flex flex-col relative select-none overflow-hidden mx-auto font-sans">
      {/* Dynamic Island / Notch */}
      <div className="absolute top-4 inset-x-0 flex justify-center z-30 pointer-events-none">
        <div className="w-28 h-6 bg-black rounded-full flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111c2e] border border-slate-800" />
        </div>
      </div>

      {/* iPhone Status Bar */}
      <div className="pt-2 px-6 pb-2 flex items-center justify-between text-xs text-slate-300 font-semibold z-20 shrink-0">
        <span className="font-mono text-[13px]">9:41</span>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Mobile App Header */}
      <div className="px-5 py-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00C48C] to-[#00A3FF] flex items-center justify-center shadow-md">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-4 h-4 text-white"
            >
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-4" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Attendora</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Notification Bell matching screenshot with badge "3" */}
          <button
            onClick={() => setShowNotificationsModal(true)}
            className="relative p-2 text-slate-300 hover:text-white rounded-full transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </button>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 text-slate-400 hover:text-red-400 rounded-full transition"
              title="Sign Out to Login Portal"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable View */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 pt-1 space-y-4 scrollbar-none z-10">
        {activeTab === 'home' && (
          <>
            {/* Circular Attendance Ring Showcase Hero Card (Screenshot Match) */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#132847] via-[#0e1f38] to-[#0a1628] p-6 border border-sky-900/40 shadow-xl overflow-hidden text-center flex flex-col items-center">
              {/* Subtle ambient glow behind ring */}
              <div className="absolute w-48 h-48 rounded-full bg-[#00C48C]/15 blur-2xl pointer-events-none" />

              {/* Circular SVG Gauge */}
              <div className="relative w-44 h-44 my-2 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                  {/* Track ring */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="13"
                    fill="transparent"
                  />
                  {/* Glowing progress stroke */}
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00C48C" />
                      <stop offset="60%" stopColor="#00A3FF" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="url(#ringGrad)"
                    strokeWidth="13"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Inner Content matching Screenshot */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight tnum drop-shadow-sm">
                    {overallAttendance}%
                  </span>
                  <span className="text-[11px] font-medium text-slate-300 tracking-wide mt-0.5">
                    Overall Attendance
                  </span>
                </div>
              </div>

              {/* Status pill under gauge */}
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Statutory Safe (≥ 75%)
                </span>
              </div>
            </div>

            {/* Course-wise Attendance Section (Screenshot Match) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Course-wise attendance
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Sem 6</span>
              </div>

              {/* Course Cards matching screenshot */}
              <div className="space-y-2">
                {courses.slice(0, 4).map((course) => {
                  const isPresent = course.percentage >= 75.0;
                  const isCritical = course.percentage < 70.0;

                  return (
                    <div
                      key={course.id}
                      onClick={() => openCourseDetail(course)}
                      className="bg-white rounded-2xl p-3.5 text-slate-900 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <span>
                            {course.shortName} - {course.percentage}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {course.totalAttended} / {course.totalConducted} Lectures Attended
                        </div>
                      </div>

                      {/* Pill Badge matching screenshot */}
                      <div className="flex items-center gap-2">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            Present
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isCritical
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-[#FFF4ED] text-[#EA580C] border border-[#FDBA74]/60'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCritical ? 'bg-red-600' : 'bg-[#EA580C]'
                              }`}
                            />
                            Low
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendance Shortage Alert Card (Matches Screenshot Red Box) */}
            {showAlert && (
              <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-3.5 text-slate-900 relative shadow-sm animate-in fade-in">
                <button
                  onClick={() => setShowAlert(false)}
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-700 p-1 rounded-md"
                  aria-label="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-start gap-3 pr-5">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-red-950">
                      Attendance Shortage Alert
                    </h4>
                    <p className="text-[11px] text-red-900/80 leading-relaxed mt-0.5">
                      Your student attendance in Data Structures (68%) is nearing non to minimum threshold. Attend next 5 classes to reach 75%.
                    </p>
                    <button
                      onClick={() => setActiveTab('calc')}
                      className="mt-2 text-[11px] font-bold text-red-700 hover:underline flex items-center gap-1"
                    >
                      <span>Open Recovery Calculator</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab 2: All Courses with date ledger */}
        {activeTab === 'courses' && (
          <div className="space-y-3 pt-1">
            <h3 className="text-base font-bold text-white">Semester 6 Enrolled Courses</h3>
            <div className="space-y-2.5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => openCourseDetail(course)}
                  className="bg-white rounded-2xl p-4 text-slate-900 shadow-sm cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {course.name}
                      </h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {course.facultyName} · {course.room}
                      </div>
                    </div>
                    <span className="text-xl font-bold font-mono tnum text-slate-900">
                      {course.percentage}%
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Attended {course.totalAttended} of {course.totalConducted} classes
                    </span>
                    <span className="font-semibold text-blue-600 flex items-center gap-1">
                      View Ledger <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Shortage Recovery Calculator (FR-STU-03) */}
        {activeTab === 'calc' && (
          <div className="space-y-4 pt-1">
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-5 rounded-3xl border border-indigo-800/40 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Attendance Deficit Calculator</h3>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                Calculate exactly how many upcoming lectures you must attend to maintain statutory exam eligibility.
              </p>

              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Course to Simulate:
              </label>
              <select
                value={calcCourseId}
                onChange={(e) => setCalcCourseId(e.target.value)}
                className="w-full bg-[#1e293b] text-white border border-slate-700 rounded-xl p-2.5 text-xs mb-4"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortName} ({c.percentage}%)
                  </option>
                ))}
              </select>

              {/* Calculator Output */}
              <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Current Standing:</span>
                  <span className="font-mono font-bold text-white">
                    {activeCalcCourse.totalAttended} / {activeCalcCourse.totalConducted} ({activeCalcCourse.percentage}%)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  {activeCalcCourse.percentage < 75.0 ? (
                    <div>
                      <div className="text-amber-400 font-bold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Shortage Recovery Target:
                      </div>
                      <div className="text-sm font-extrabold text-emerald-400 font-mono">
                        Must attend next {recoveryClassesNeeded} consecutive lectures
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        To bring aggregate above the 75.0% threshold.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Safe Compliance Buffer:
                      </div>
                      <div className="text-sm font-extrabold text-white font-mono">
                        You can afford to miss {affordableAbsences} upcoming classes
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        While staying at or above 75.0%.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Student Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-4 pt-1">
            <div className="bg-white rounded-3xl p-5 text-slate-900 shadow-sm text-center">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                alt="Student Avatar"
                className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-blue-500 shadow-md mb-2"
              />
              <h3 className="font-bold text-base text-slate-900">{studentName}</h3>
              <p className="text-xs text-slate-500 font-mono">PRN: 20000001 · Roll: 01</p>
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                Computer Science & Engineering · Sem 6 (Section A)
              </div>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 text-xs space-y-3">
              <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Statutory Status
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Examination Eligibility:</span>
                <span className="font-bold text-emerald-400">Provisional Clear</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Shortage Fines Applicable:</span>
                <span className="font-mono text-slate-400">₹0.00 (Exempt)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Department Advisor:</span>
                <span className="font-semibold text-white">Prof. Rajesh Deshmukh</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Detail & Date-Wise Ledger Modal (FR-STU-04) with Swipe-to-Dismiss */}
      {selectedCourseForDetail && (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          style={{
            backgroundColor: `rgba(2, 6, 23, ${
              isDismissing ? 0 : 0.8 * calculateSwipeDismiss(dragY, 0).opacityMultiplier
            })`,
          }}
          className="absolute inset-0 z-40 backdrop-blur-sm flex flex-col p-4 animate-in fade-in transition-colors duration-200"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-detail-title"
            data-testid="course-detail-modal"
            style={{
              transform: isDismissing ? 'translateY(110%)' : `translateY(${dragY}px)`,
              transition: isDragging
                ? 'none'
                : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
              opacity: isDismissing ? 0 : 1,
            }}
            className="bg-white rounded-3xl p-5 text-slate-900 flex-1 flex flex-col overflow-hidden shadow-2xl relative"
          >
            {/* Top Drag Handle Bar for Swipe-to-Dismiss */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              data-testid="swipe-handle"
              className="pt-1 pb-2.5 -mt-2 -mx-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none group"
              aria-label="Swipe down to close"
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-150 ${
                  isDragging ? 'w-14 bg-blue-500 scale-y-125' : 'w-11 bg-slate-300 group-hover:bg-slate-400'
                }`}
              />
              <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-1 flex items-center gap-1">
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                    isDragging ? 'translate-y-0.5 text-blue-500' : ''
                  }`}
                />
                <span>{isDragging ? 'Release to dismiss' : 'Swipe down to close'}</span>
              </span>
            </div>

            {/* Modal Header (Also draggable for smooth downward pull) */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex items-start justify-between border-b border-slate-100 pb-3 cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <div>
                <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                  {selectedCourseForDetail.code}
                </span>
                <h3 id="course-detail-title" className="font-bold text-base text-slate-900 mt-1">
                  {selectedCourseForDetail.name}
                </h3>
                <div className="text-xs text-slate-500">
                  {selectedCourseForDetail.facultyName} · {selectedCourseForDetail.percentage}% Current
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg pointer-events-auto"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 flex-1 overflow-y-auto space-y-2 text-xs">
              <div className="font-bold text-slate-700 mb-2 flex items-center justify-between">
                <span>Date-Wise Session History</span>
                <span className="text-[11px] font-normal text-slate-400">Past 4 lectures</span>
              </div>

              {[
                { date: 'Nov 04, 2026', slot: '09:00 - 10:00 AM', status: 'Present' },
                { date: 'Nov 03, 2026', slot: '11:15 - 12:15 PM', status: 'Present' },
                { date: 'Oct 31, 2026', slot: '02:00 - 03:00 PM', status: 'Absent', flagged: true },
                { date: 'Oct 30, 2026', slot: '10:00 - 11:00 AM', status: 'Present' },
              ].map((sess, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    sess.status === 'Present'
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-800">{sess.date}</div>
                    <div className="text-[11px] text-slate-500">{sess.slot}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        sess.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {sess.status}
                    </span>
                    {sess.flagged && (
                      <button
                        onClick={() => {
                          setDisputeSuccess('Dispute ticket #ATD-894 created. Faculty notified.');
                          setTimeout(() => setDisputeSuccess(null), 3000);
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Dispute
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {disputeSuccess && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold rounded-xl">
                  {disputeSuccess}
                </div>
              )}
            </div>

            {/* Share Deep Link Preview Card */}
            {shareData && (
              <div className="mb-3 p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 animate-in fade-in zoom-in-95 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Deep Link Copied to Clipboard</span>
                  </div>
                  <button
                    onClick={() => setShareData(null)}
                    className="text-slate-400 hover:text-white p-0.5"
                    aria-label="Close share preview"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-black/50 p-2 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Link2 className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="font-mono text-[10px] text-slate-300 truncate select-all">
                      {shareData.url}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(shareData.url);
                      setShareData({ ...shareData, copied: true });
                    }}
                    className="shrink-0 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-semibold text-[10px] flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                  <span>Student: {studentName} ({shareData.course.percentage}%)</span>
                  <span className="text-emerald-400 font-mono font-semibold">Verified Token</span>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => handleShareCourse(selectedCourseForDetail)}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-[0.98]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition active:scale-95"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Notifications Drawer Modal */}
      {showNotificationsModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 text-slate-900 flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Attendance Alerts ({notifications.length})
              </h3>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 flex-1 overflow-y-auto space-y-2.5 text-xs">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border ${
                    n.type === 'warning'
                      ? 'bg-red-50/70 border-red-200 text-red-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold">{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] mt-1 text-slate-600 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowNotificationsModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
            >
              Close Alerts
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Screenshot Match) */}
      <div className="absolute bottom-2 inset-x-3 bg-[#0a1628]/95 backdrop-blur-md rounded-3xl p-2 border border-slate-800 flex items-center justify-around z-30">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
            activeTab === 'home' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
            activeTab === 'courses' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px]">Courses</span>
        </button>

        <button
          onClick={() => setActiveTab('calc')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
            activeTab === 'calc' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span className="text-[10px]">Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
            activeTab === 'profile' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="absolute bottom-1 inset-x-0 flex justify-center z-40 pointer-events-none">
        <div className="w-32 h-1 bg-white/40 rounded-full" />
      </div>
    </div>
  );
};
