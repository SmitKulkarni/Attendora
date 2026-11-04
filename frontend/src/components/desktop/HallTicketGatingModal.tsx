import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Award,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  FileText,
  Printer,
  QrCode,
  Check,
} from 'lucide-react';
import { StudentRecord } from '../../types/index.ts';
import {
  evaluateExamClearance,
  HallTicketClearance,
  MedicalWaiverRecord,
} from '../../utils/hallTicketGating.ts';

interface HallTicketGatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
}

export const HallTicketGatingModal: React.FC<HallTicketGatingModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  if (!isOpen) return null;

  const [waivers, setWaivers] = useState<Record<string, MedicalWaiverRecord>>({
    'stu-4': {
      waiverId: 'waiver-seed-01',
      studentId: 'stu-4',
      concessionPercentage: 10.0,
      reasonCategory: 'MEDICAL_HOSPITALIZATION',
      supportingDocumentRef: 'MED-CERT-2026-894',
      approvedByActorName: 'Dr. Anita Roy (Dean)',
      approvalDate: '2026-11-04',
    },
  });

  const [selectedStudentForWaiver, setSelectedStudentForWaiver] = useState<StudentRecord | null>(null);
  const [concessionPct, setConcessionPct] = useState<number>(10.0);
  const [medicalDocRef, setMedicalDocRef] = useState<string>('MED-HOSP-2026-');
  const [activeTicketPreview, setActiveTicketPreview] = useState<HallTicketClearance | null>(null);

  const clearances = students.map((s) => evaluateExamClearance(s, waivers[s.id]));

  const clearedCount = clearances.filter((c) => c.status !== 'BARRED_FROM_EXAMINATION').length;
  const barredCount = clearances.filter((c) => c.status === 'BARRED_FROM_EXAMINATION').length;

  const handleGrantWaiver = () => {
    if (!selectedStudentForWaiver) return;

    const newWaiver: MedicalWaiverRecord = {
      waiverId: `waiver-${Date.now()}`,
      studentId: selectedStudentForWaiver.id,
      concessionPercentage: concessionPct,
      reasonCategory: 'MEDICAL_HOSPITALIZATION',
      supportingDocumentRef: medicalDocRef,
      approvedByActorName: 'Dr. Anita Roy (Dean)',
      approvalDate: new Date().toISOString().split('T')[0],
    };

    setWaivers((prev) => ({
      ...prev,
      [selectedStudentForWaiver.id]: newWaiver,
    }));
    setSelectedStudentForWaiver(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#091426] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Examination Hall-Ticket Gating & Debarment Console
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  FR-ADM-09
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Statutory final examination clearance, debarment barring, and administrative medical waivers
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
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Total Eligible Candidates</span>
              <span className="text-2xl font-bold font-mono text-slate-900">{students.length}</span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs text-emerald-700 block">Hall Tickets Cleared</span>
              <span className="text-2xl font-bold font-mono text-emerald-800">{clearedCount}</span>
              <span className="text-[11px] text-emerald-600 block mt-0.5">≥ 75% or Approved Waiver</span>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-xs text-red-700 block">Statutorily Barred from Finals</span>
              <span className="text-2xl font-bold font-mono text-red-800">{barredCount}</span>
              <span className="text-[11px] text-red-600 block mt-0.5">Tickets Withheld by Dean</span>
            </div>
          </div>

          {/* Roster Clearance Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Candidate Name</th>
                  <th className="p-3">Raw Attendance</th>
                  <th className="p-3">Effective Standing</th>
                  <th className="p-3">Hall-Ticket Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clearances.map((c) => (
                  <tr key={c.studentId} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-slate-800">{c.rollNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{c.studentName}</td>
                    <td className="p-3 font-mono">
                      <span
                        className={`font-bold ${
                          c.rawAttendanceRate >= 75
                            ? 'text-emerald-700'
                            : c.rawAttendanceRate >= 70
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {c.rawAttendanceRate}%
                      </span>
                    </td>
                    <td className="p-3">
                      {c.concessionApplied ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-700 font-mono">
                            {c.effectiveAttendanceRate}%
                          </span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                            +{c.concessionApplied.concessionPercentage}% Waiver
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono">{c.rawAttendanceRate}%</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'CLEARED_FOR_EXAM'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : c.status === 'CONDITIONAL_WAIVER_APPROVED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {c.status === 'BARRED_FROM_EXAMINATION' && (
                        <button
                          onClick={() => {
                            const st = students.find((s) => s.id === c.studentId);
                            if (st) setSelectedStudentForWaiver(st);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition"
                        >
                          Review Medical Waiver
                        </button>
                      )}
                      {c.hallTicketNumber && (
                        <button
                          onClick={() => setActiveTicketPreview(c)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition"
                        >
                          View Hall Ticket
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Medical Waiver Review Dialog */}
          {selectedStudentForWaiver && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <FileText className="w-4 h-4 text-amber-700" />
                  Grant Administrative Compensatory Concession
                </div>
                <button onClick={() => setSelectedStudentForWaiver(null)} className="text-amber-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-amber-800">
                Grant statutory attendance waiver for <span className="font-bold">{selectedStudentForWaiver.name}</span>{' '}
                (Current Rate: <span className="font-bold">{selectedStudentForWaiver.attendanceRate}%</span>).
                Maximum statutory compensatory concession under university rules is 10.0%.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Concession Percentage</label>
                  <select
                    value={concessionPct}
                    onChange={(e) => setConcessionPct(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value={5.0}>5.0% Concession (Minor Medical)</option>
                    <option value={7.5}>7.5% Concession (University Sports)</option>
                    <option value={10.0}>10.0% Concession (Hospitalization with Cert)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Medical Document Reference</label>
                  <input
                    type="text"
                    value={medicalDocRef}
                    onChange={(e) => setMedicalDocRef(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                    placeholder="DOC-REF-000"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedStudentForWaiver(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGrantWaiver}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-xs"
                >
                  Sign & Issue Conditional Clearance
                </button>
              </div>
            </div>
          )}

          {/* Digital Hall Ticket Preview Card */}
          {activeTicketPreview && (
            <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Official Examination Hall Ticket</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {activeTicketPreview.hallTicketNumber}
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveTicketPreview(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Candidate:</span>
                  <span className="font-bold text-white text-sm">{activeTicketPreview.studentName}</span>
                  <span className="text-slate-400 block font-mono text-[10px]">
                    Roll: {activeTicketPreview.rollNo}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Verified Attendance:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {activeTicketPreview.effectiveAttendanceRate}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Statutory clearance verified by Dean
                  </span>
                </div>

                <div className="p-2 bg-white rounded-xl flex items-center justify-center">
                  <div className="text-slate-950 font-mono text-[9px] text-center font-bold">
                    [INVIGILATOR QR STAMP]
                    <br />
                    {activeTicketPreview.qrVerificationPayload?.slice(0, 24)}...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

