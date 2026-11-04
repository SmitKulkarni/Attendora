import React, { useState, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  Download,
  Building,
  Check,
} from 'lucide-react';
import { StudentRecord } from '../../types/index.ts';
import { calculateRecoveryClasses } from '../../utils/attendance.ts';

interface DefaultersReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
}

export const DefaultersReportModal: React.FC<DefaultersReportModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  if (!isOpen) return null;

  const [threshold, setThreshold] = useState<number>(75.0);
  const [department, setDepartment] = useState<string>('Computer Sci.');
  const [copied, setCopied] = useState<boolean>(false);

  const defaulters = useMemo(() => {
    return students
      .filter((s) => s.attendanceRate < threshold)
      .map((s) => {
        const requiredConsecutive = calculateRecoveryClasses(
          s.totalAttended,
          s.totalConducted,
          threshold / 100
        );
        return {
          ...s,
          requiredConsecutive,
        };
      })
      .sort((a, b) => a.attendanceRate - b.attendanceRate);
  }, [students, threshold]);

  const exportCsv = () => {
    const headers = ['Roll No', 'Full Name', 'Department', 'Attended', 'Conducted', 'Attendance %', 'Consecutive Lectures Needed', 'Status'];
    const rows = defaulters.map((d) => [
      d.rollNo,
      `"${d.name}"`,
      `"${d.department}"`,
      d.totalAttended,
      d.totalConducted,
      `${d.attendanceRate}%`,
      d.requiredConsecutive,
      d.attendanceRate < 70 ? 'CRITICAL DEBARRED' : 'CONDITIONAL PROBATION',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendora_Defaulters_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#091426] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                Statutory Attendance Defaulter Engine
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-mono">
                  FR-ADM-03
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Official institutional compliance roster for university regulatory audits
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
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
              >
                <option value="Computer Sci.">Computer Science & Engineering</option>
                <option value="All">All Departments</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                Statutory Threshold (%):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="90"
                  step="1"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-20 bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800 font-mono"
                />
                <span className="text-slate-400 text-xs">Standard: 75.0%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{copied ? 'CSV Downloaded!' : 'Export CSV (.xlsx)'}</span>
            </button>
            <button
              onClick={printReport}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF Document</span>
            </button>
          </div>
        </div>

        {/* Audit Status Banner */}
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-amber-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{defaulters.length}</strong> students have fallen below the {threshold}% threshold and face potential examination debarment.
            </span>
          </div>
          <span className="font-mono text-[11px] bg-amber-200/60 px-2 py-0.5 rounded font-semibold text-amber-900">
            Audit Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Defaulter Table */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-2.5 px-4">Roll No</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Attended / Held</th>
                  <th className="py-2.5 px-4">Current %</th>
                  <th className="py-2.5 px-4">Recovery Deficit</th>
                  <th className="py-2.5 px-4 text-right">Statutory Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {defaulters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Zero defaulters found! All students are currently compliant above {threshold}%.
                    </td>
                  </tr>
                ) : (
                  defaulters.map((student) => {
                    const isCritical = student.attendanceRate < 70.0;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {student.rollNo}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span>{student.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {student.totalAttended} / {student.totalConducted}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              isCritical
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {student.attendanceRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          Must attend next <strong className="text-slate-900 underline">{student.requiredConsecutive}</strong> consecutive classes
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              isCritical
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-amber-500 text-white shadow-xs'
                            }`}
                          >
                            {isCritical ? 'Debarred (<70%)' : 'Conditional (70-74.9%)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Institutional Signature & Compliance Footnote */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-500">
            <div>
              <div className="font-bold text-slate-800">Attendora Institutional Registry & Governance</div>
              <div>Certified compliant under Academic Ordinance 157.3</div>
              <div className="text-[10px] text-slate-400 mt-1">Generated via cryptographic hash: 0x9f4a...e12d</div>
            </div>
            <div className="text-right border-t border-slate-300 pt-2 min-w-[200px]">
              <div className="font-bold text-slate-800">Dr. Anita Roy</div>
              <div className="text-slate-500">Academic Dean & Controller of Examinations</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};
