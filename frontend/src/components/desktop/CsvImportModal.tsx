import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  Check,
} from 'lucide-react';
import { StudentRecord } from '../../types/index.ts';
import { validateCsvRoster, CsvValidationResult } from '../../utils/attendance.ts';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (newStudents: StudentRecord[]) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
}) => {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState<string>(
`RollNo,FullName,Email,Department,Year,Section
20000012,Ananya Sharma,ananya.sharma@attendora.edu,Computer Sci.,TE,A
20000013,Devendra Patil,devendra.patil@attendora.edu,Computer Sci.,TE,A
20000014,Pooja Hegde,pooja.hegde@attendora.edu,Computer Sci.,TE,A
20000015,Rahul Verma,rahul.verma@attendora.edu,Computer Sci.,TE,A`
  );

  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleValidate = () => {
    const lines = rawText
      .trim()
      .split('\n')
      .map((line) => line.split(',').map((c) => c.trim()));

    const result = validateCsvRoster(lines);
    setValidationResult(result);
  };

  const handleCommit = () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    const newStudentRecords: StudentRecord[] = validationResult.validRows.map((r, i) => ({
      id: `stu-csv-${Date.now()}-${i}`,
      rollNo: r.rollNo,
      name: r.fullName,
      email: r.email,
      department: r.department,
      semester: 6,
      section: r.section,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + (i % 5) * 1000000}?w=120&auto=format&fit=crop&q=80`,
      totalConducted: 40,
      totalAttended: 34,
      attendanceRate: 85.0,
      status: 'Present',
    }));

    onImportStudents(newStudentRecords);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#091426] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                Batch Student & Faculty Roster Ingestion
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                  FR-ADM-01
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                CSV parser with strict syntax verification and duplicate guard
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

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                CSV Data Stream (Paste or edit below):
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Format: RollNo, FullName, Email, Department, Year, Section
              </span>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setValidationResult(null);
              }}
              rows={7}
              className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleValidate}
              className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition shadow-xs flex items-center gap-2"
            >
              <span>Validate CSV Schema</span>
            </button>
            <span className="text-xs text-slate-500">
              Must pass dry-run pre-validation before committing
            </span>
          </div>

          {/* Validation Feedback & Preview */}
          {validationResult && (
            <div className="space-y-3 pt-2">
              {validationResult.errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-900">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Validation Errors Detected ({validationResult.errors.length}):
                  </div>
                  {validationResult.errors.map((err, i) => (
                    <div key={i} className="pl-5 text-[11px]">
                      • Row {err.row}: {err.reason}
                    </div>
                  ))}
                </div>
              )}

              {validationResult.validRows.length > 0 && (
                <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2 text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {validationResult.validRows.length} Valid Records Ready for Onboarding
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto border border-emerald-200/60 rounded-lg bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-emerald-50 text-emerald-900 font-semibold border-b border-emerald-100">
                        <tr>
                          <th className="p-2">Roll No</th>
                          <th className="p-2">Full Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Dept</th>
                          <th className="p-2">Section</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {validationResult.validRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{r.rollNo}</td>
                            <td className="p-2 font-medium text-slate-800">{r.fullName}</td>
                            <td className="p-2 text-slate-500">{r.email}</td>
                            <td className="p-2">{r.department}</td>
                            <td className="p-2 font-mono">{r.section}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {isSuccess && (
            <div className="p-4 bg-emerald-100 text-emerald-900 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
              <Check className="w-4 h-4" />
              <span>Records successfully ingested into institutional database!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            disabled={!validationResult || validationResult.validRows.length === 0}
            onClick={handleCommit}
            className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition shadow-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Commit Roster Ingestion</span>
          </button>
        </div>
      </div>
    </div>
  );
};
