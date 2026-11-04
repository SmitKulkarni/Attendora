import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  BookOpen,
  Send,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { StudentRecord, CourseDetail, AttendanceSession } from '../../types/index.ts';

interface RollCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  courses: CourseDetail[];
  onSessionSubmitted: (newSession: AttendanceSession) => void;
}

export const RollCallModal: React.FC<RollCallModalProps> = ({
  isOpen,
  onClose,
  students,
  courses,
  onSessionSubmitted,
}) => {
  if (!isOpen) return null;

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[2]?.id || courses[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM - 11:00 AM');
  const [section, setSection] = useState<string>('A');

  // Student statuses: Map studentId -> 'Present' | 'Absent'
  // Default is "Mark All Present" as required by FR-FAC-02!
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent'>>(() => {
    const initial: Record<string, 'Present' | 'Absent'> = {};
    students.forEach((s) => {
      initial[s.id] = 'Present';
    });
    return initial;
  });

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Dynamic live tallies
  const totalCount = students.length;
  const presentCount = Object.values(attendanceMap).filter((st) => st === 'Present').length;
  const absentCount = totalCount - presentCount;

  // Toggle single student row
  const toggleStudent = (studentId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const markAll = (status: 'Present' | 'Absent') => {
    const updated: Record<string, 'Present' | 'Absent'> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);

    const sessionId = `sess-${Date.now().toString().slice(-6)}`;
    const records = students.map((s) => ({
      studentId: s.id,
      rollNo: s.rollNo,
      studentName: s.name,
      status: attendanceMap[s.id] || 'Present',
    }));

    const session: AttendanceSession = {
      id: sessionId,
      subjectCode: selectedCourse.code,
      subjectName: selectedCourse.name,
      department: selectedCourse.department,
      semester: selectedCourse.semester,
      section,
      facultyId: 'user-faculty',
      facultyName: selectedCourse.facultyName || 'Prof. Rajesh Deshmukh',
      date: selectedDate,
      timeSlot: selectedSlot,
      totalEnrolled: totalCount,
      presentCount,
      absentCount,
      records,
      createdAt: new Date().toISOString(),
      isLocked: false,
    };

    setTimeout(() => {
      onSessionSubmitted(session);
      setIsSubmitting(false);
      setShowConfirmModal(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#091426] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                Digital Roll-Call Console
                <span className="text-[11px] font-mono font-normal bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Under 45s Flow
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Single-tap row toggle. All students default to Present.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Subject / Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.shortName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Lecture Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Time Slot
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
              <option value="11:15 AM - 12:15 PM">11:15 AM - 12:15 PM</option>
              <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
              <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Section / Batch
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="A">Section A (Regular)</option>
              <option value="B">Section B</option>
              <option value="Lab-1">Lab Batch 1</option>
            </select>
          </div>
        </div>

        {/* Quick Bulk Actions Bar */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Tap student row to toggle presence:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAll('Present')}
              className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md font-semibold transition"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll('Absent')}
              className="px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md font-semibold transition"
            >
              Mark All Absent
            </button>
            <button
              onClick={() => {
                const reset: Record<string, 'Present' | 'Absent'> = {};
                students.forEach((s) => (reset[s.id] = 'Present'));
                setAttendanceMap(reset);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Student List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {students.map((student) => {
            const status = attendanceMap[student.id] || 'Present';
            const isPresent = status === 'Present';

            return (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                  isPresent
                    ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                    : 'bg-red-50/70 border-red-300 hover:bg-red-100/70 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Status Indicator Icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      isPresent
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-red-600 text-white shadow-md'
                    }`}
                  >
                    {isPresent ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{student.name}</span>
                      <span className="font-mono text-xs font-normal text-slate-500 tnum">
                        #{student.rollNo}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Overall Rate: <strong className="font-mono">{student.attendanceRate}%</strong>
                      {student.attendanceRate < 75.0 && (
                        <span className="text-amber-600 ml-1.5 font-semibold">
                          (Defaulter Risk)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isPresent
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-600 text-white shadow-sm'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* FR-FAC-02 Sticky Footer with Live Counts */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-xs font-mono font-semibold">
            <span className="text-slate-300">
              Total Enrolled: <strong className="text-white font-bold">{totalCount}</strong>
            </span>
            <span className="text-emerald-400">
              Present: <strong className="font-bold">{presentCount}</strong>
            </span>
            <span className="text-red-400">
              Absent: <strong className="font-bold">{absentCount}</strong>
            </span>
            <span className="hidden sm:inline text-slate-400">
              ({Math.round((presentCount / (totalCount || 1)) * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition shadow-lg shadow-emerald-950/40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal (FR-FAC-03) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h4 className="text-center font-bold text-base mb-1">
              Finalize Lecture Session?
            </h4>
            <p className="text-center text-xs text-slate-500 mb-4">
              You are committing attendance for <strong>{selectedCourse.shortName}</strong> on {selectedDate}.
            </p>

            <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1.5 mb-5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Enrolled:</span>
                <strong>{totalCount}</strong>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Total Present:</span>
                <strong>{presentCount}</strong>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Total Absent:</span>
                <strong>{absentCount}</strong>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                <span>Session Rate:</span>
                <strong>{Math.round((presentCount / (totalCount || 1)) * 100)}%</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Review Again
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="flex-1 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Committing...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
