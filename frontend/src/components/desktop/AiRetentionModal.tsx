import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Brain,
  ShieldAlert,
  UserCheck,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { StudentRecord, CourseDetail } from '../../types/index.ts';
import {
  analyzeCohortRetention,
  StudentRiskAssessment,
} from '../../utils/aiRetention.ts';

interface AiRetentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  courses: CourseDetail[];
}

export const AiRetentionModal: React.FC<AiRetentionModalProps> = ({
  isOpen,
  onClose,
  students,
  courses,
}) => {
  if (!isOpen) return null;

  const [selectedAssessment, setSelectedAssessment] = useState<StudentRiskAssessment | null>(null);

  const cohortSummary = useMemo(() => {
    return analyzeCohortRetention(students, courses);
  }, [students, courses]);

  const activeAssessment = selectedAssessment || cohortSummary.assessments[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#091426] text-white rounded-3xl w-full max-w-5xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-950/50">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Gemini 2.5 AI Student Retention & Dropout Predictor</h3>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                  FR-ADM-07
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Machine learning trajectory models predicting statutory debarment weeks before semester finals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Cohort KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 block mb-1">Evaluated Cohort</span>
              <span className="text-2xl font-bold font-mono text-white">{cohortSummary.totalEvaluated}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Active Enrolled</span>
            </div>

            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-2xl">
              <span className="text-xs text-red-300 block mb-1">Critical Dropout Risk</span>
              <span className="text-2xl font-bold font-mono text-red-400">{cohortSummary.criticalCount}</span>
              <span className="text-[11px] text-red-300/70 block mt-0.5">&gt; 80% Debarment Probability</span>
            </div>

            <div className="p-4 bg-amber-950/30 border border-amber-900/50 rounded-2xl">
              <span className="text-xs text-amber-300 block mb-1">Elevated Deficit Tier</span>
              <span className="text-2xl font-bold font-mono text-amber-400">{cohortSummary.elevatedCount}</span>
              <span className="text-[11px] text-amber-300/70 block mt-0.5">Warning 70% - 74.9%</span>
            </div>

            <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-2xl">
              <span className="text-xs text-emerald-300 block mb-1">Stable Compliance</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">{cohortSummary.stableCount}</span>
              <span className="text-[11px] text-emerald-300/70 block mt-0.5">Clear for Finals</span>
            </div>
          </div>

          {/* Master-Detail AI Inspection View */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Student List Sidebar */}
            <div className="md:col-span-5 space-y-2 max-h-96 overflow-y-auto pr-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Student Risk Profiles
              </span>
              {cohortSummary.assessments.map((a) => (
                <button
                  key={a.studentId}
                  onClick={() => setSelectedAssessment(a)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    activeAssessment?.studentId === a.studentId
                      ? 'bg-purple-900/30 border-purple-500/60 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs text-white">{a.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Roll #{a.rollNo} | Attendance: <span className="font-semibold text-white">{a.overallAttendanceRate}%</span>
                    </p>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      a.riskLevel === 'CRITICAL_DROPOUT_RISK'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : a.riskLevel === 'ELEVATED_DEFICIT'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {a.riskLevel === 'CRITICAL_DROPOUT_RISK' ? 'CRITICAL' : a.riskLevel === 'ELEVATED_DEFICIT' ? 'WARNING' : 'SAFE'}
                  </span>
                </button>
              ))}
            </div>

            {/* AI Deep Analysis Drawer */}
            {activeAssessment && (
              <div className="md:col-span-7 bg-[#0d1c33] border border-slate-700/70 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-white">{activeAssessment.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Roll #{activeAssessment.rollNo} · {activeAssessment.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Predicted Risk Score</span>
                    <span className="text-xl font-bold font-mono text-purple-400">
                      {Math.round(activeAssessment.riskProbabilityScore * 100)}%
                    </span>
                  </div>
                </div>

                {/* AI Trajectory Insights */}
                <div className="p-3.5 bg-purple-950/40 border border-purple-800/50 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Gemini Trajectory Diagnosis</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeAssessment.aiInsightsSummary}
                  </p>
                </div>

                {/* Weakest Subject Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Primary Deficit Course</span>
                    <span className="font-bold text-white block mt-0.5">{activeAssessment.weakestCourse.courseCode}</span>
                    <span className="text-[11px] text-slate-300">{activeAssessment.weakestCourse.courseName}</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Course Attendance</span>
                    <span className="font-bold text-red-400 text-sm block mt-0.5">
                      {activeAssessment.weakestCourse.rate}%
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Needs {activeAssessment.weakestCourse.classesNeededFor75} consecutive lectures
                    </span>
                  </div>
                </div>

                {/* Recommended Mentor Counseling Action */}
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>Faculty Mentor Counseling Action</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeAssessment.recommendedIntervention}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

