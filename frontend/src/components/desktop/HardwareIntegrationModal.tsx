import React, { useState } from 'react';
import {
  X,
  Cpu,
  Radio,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_HARDWARE_MAPPINGS,
  reconcileHardwarePunch,
  ReconciledAttendancePunch,
} from '../../utils/hardwareIntegration.ts';

interface HardwareIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReconcileAttendance?: (punch: ReconciledAttendancePunch) => void;
}

export const HardwareIntegrationModal: React.FC<HardwareIntegrationModalProps> = ({
  isOpen,
  onClose,
  onReconcileAttendance,
}) => {
  if (!isOpen) return null;

  const [activeGate, setActiveGate] = useState<string>('GATE-MAIN-01');
  const [selectedCardUid, setSelectedCardUid] = useState<string>('RFID-9A4B12');
  const [punchTimeSlot, setPunchTimeSlot] = useState<string>('14:02'); // On time for 14:00 lecture
  const [recentPunches, setRecentPunches] = useState<ReconciledAttendancePunch[]>([
    {
      punchId: 'punch-seed-1',
      studentId: 'stu-1',
      rollNo: '20000001',
      studentName: 'Heuren Name',
      courseCode: 'CS603',
      scheduledSlot: '14:00 - 15:00',
      punchTime: '2026-11-04T14:02:18.000Z',
      status: 'RECONCILED_PRESENT',
      remarks: 'Verified on-time gate punch automatically registered as Present.',
    },
    {
      punchId: 'punch-seed-2',
      studentId: 'stu-2',
      rollNo: '20000002',
      studentName: 'Kenrii Anay',
      courseCode: 'CS603',
      scheduledSlot: '14:00 - 15:00',
      punchTime: '2026-11-04T14:18:42.000Z',
      status: 'LATE_ENTRY',
      remarks: 'Student punched in > 10 minutes after lecture start; recorded as Late Entry.',
    },
  ]);

  const handleSimulatePunch = () => {
    // Construct mock punch ISO string matching today and selected time
    const today = new Date().toISOString().split('T')[0];
    const punchIso = `${today}T${punchTimeSlot}:00.000Z`;

    const reconciled = reconcileHardwarePunch(
      selectedCardUid,
      punchIso,
      'CS603',
      '14:00',
      '15:00',
      DEFAULT_HARDWARE_MAPPINGS
    );

    setRecentPunches((prev) => [reconciled, ...prev]);
    if (onReconcileAttendance) {
      onReconcileAttendance(reconciled);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#091426] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Campus Hardware & Turnstile IoT Ingestion
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                  FR-ADM-05
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Automated RFID gate turnstile and biometric fingerprint punch reconciliation
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
          {/* Hardware Punch Simulator Strip */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-600" />
                Physical Turnstile Hardware Event Simulator
              </h4>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                Turnstiles Online (2 Gates Active)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Campus Access Gate</label>
                <select
                  value={activeGate}
                  onChange={(e) => setActiveGate(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="GATE-MAIN-01">Main College Turnstile Gate A</option>
                  <option value="GATE-COMP-02">Computer Dept. Turnstile Gate B</option>
                  <option value="BIO-LAB-03">Lab-3 Biometric Scanner</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Student RFID / Biometric ID</label>
                <select
                  value={selectedCardUid}
                  onChange={(e) => setSelectedCardUid(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                >
                  {DEFAULT_HARDWARE_MAPPINGS.map((m) => (
                    <option key={m.hardwareId} value={m.hardwareId}>
                      {m.studentName} ({m.hardwareId})
                    </option>
                  ))}
                  <option value="RFID-UNMAPPED-99">Unregistered Card (RFID-UNMAPPED-99)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Punch Time (14:00 Lecture)</label>
                <select
                  value={punchTimeSlot}
                  onChange={(e) => setPunchTimeSlot(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="14:02">14:02 (On Time - Present)</option>
                  <option value="14:15">14:15 (Late Entry - 15m late)</option>
                  <option value="15:45">15:45 (Outside Lecture Window)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSimulatePunch}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Simulate Physical RFID Card Tap at Campus Turnstile</span>
            </button>
          </div>

          {/* Reconciled Punches Stream */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
              <span>Automated Attendance Reconciliation Log</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">
                Course: CS603 (14:00 - 15:00)
              </span>
            </h4>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {recentPunches.map((p) => (
                <div
                  key={p.punchId}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        p.status === 'RECONCILED_PRESENT'
                          ? 'bg-emerald-100 text-emerald-700'
                          : p.status === 'LATE_ENTRY'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {p.status === 'RECONCILED_PRESENT' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{p.studentName}</span>
                        <span className="text-[10px] font-mono text-slate-500">Roll: {p.rollNo}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{p.remarks}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'RECONCILED_PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.status === 'LATE_ENTRY'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(p.punchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

