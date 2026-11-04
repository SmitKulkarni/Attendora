import React, { useState, useMemo } from 'react';
import {
  X,
  FileBadge,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Sparkles,
} from 'lucide-react';
import { StudentRecord, CourseDetail } from '../../types/index.ts';
import {
  AccreditationBody,
  generateAccreditationPackage,
} from '../../utils/accreditationExport.ts';

interface AccreditationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  courses: CourseDetail[];
}

export const AccreditationExportModal: React.FC<AccreditationExportModalProps> = ({
  isOpen,
  onClose,
  students,
  courses,
}) => {
  if (!isOpen) return null;

  const [selectedBody, setSelectedBody] = useState<AccreditationBody>('NBA_CRITERION_2');
  const [academicYear, setAcademicYear] = useState<string>('2025-2026');
  const [department, setDepartment] = useState<string>('Computer Science & Engineering');

  const auditPackage = useMemo(() => {
    return generateAccreditationPackage(selectedBody, students, courses, department, academicYear);
  }, [selectedBody, students, courses, department, academicYear]);

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditPackage, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ATTENDORA_${selectedBody}_COMPLIANCE_${academicYear}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#091426] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <FileBadge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Statutory Accreditation Compliance Export Engine
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                  FR-ADM-10
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Official NBA Criterion 2 & NAAC Self-Study Report (SSR) compliance packages
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
          {/* Accreditation Body Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedBody('NBA_CRITERION_2')}
              className={`p-4 rounded-xl border text-left transition ${
                selectedBody === 'NBA_CRITERION_2'
                  ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">NBA Accreditation</span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                  Criterion 2
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Teaching-Learning Processes: Course-wise student attendance registers, remedial actions & CO attainment.
              </p>
            </button>

            <button
              onClick={() => setSelectedBody('NAAC_CRITERION_2')}
              className={`p-4 rounded-xl border text-left transition ${
                selectedBody === 'NAAC_CRITERION_2'
                  ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">NAAC SSR Ledger</span>
                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                  Key Indicator 2.2
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Student diversity, statutory attendance compliance percentages, and continuous learning benchmarks.
              </p>
            </button>
          </div>

          {/* Institutional Compliance Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{auditPackage.institutionName}</span>
                <span className="text-[11px] font-mono text-slate-500">
                  AISHE Code: {auditPackage.institutionalAisheCode} · Academic Year: {auditPackage.academicYear}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block">
                  Institutional Digital Seal
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {auditPackage.digitalSealHash}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total Evaluated Cohort</span>
                <span className="text-xl font-bold font-mono text-slate-900">{auditPackage.totalStudentsEnrolled}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] text-emerald-700 block">Compliant (≥ 75%)</span>
                <span className="text-xl font-bold font-mono text-emerald-700">{auditPackage.statutoryCompliantCount}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Compliance Rate</span>
                <span className="text-xl font-bold font-mono text-blue-700">{auditPackage.statutoryCompliantPercentage}%</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] text-red-700 block">Defaulter Count</span>
                <span className="text-xl font-bold font-mono text-red-700">{auditPackage.defaultersCount}</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Accreditation audit package generated under UGC/State University rules
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Summary</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Sealed Audit Package (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

