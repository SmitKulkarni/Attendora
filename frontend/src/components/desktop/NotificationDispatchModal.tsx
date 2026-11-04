import React, { useState, useMemo } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Mail,
  AlertTriangle,
  Smartphone,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { StudentRecord } from '../../types/index.ts';
import {
  NotificationChannel,
  DispatchRecipient,
  DispatchedNotice,
  dispatchStatutoryNotices,
  formatStatutoryNotice,
} from '../../utils/notifications.ts';
import { calculateRecoveryClasses } from '../../utils/attendance.ts';

interface NotificationDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
}

export const NotificationDispatchModal: React.FC<NotificationDispatchModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  if (!isOpen) return null;

  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>(['SMS', 'WHATSAPP']);
  const [targetTier, setTargetTier] = useState<'ALL_DEFICIT' | 'CRITICAL_ONLY'>('ALL_DEFICIT');
  const [dispatchHistory, setDispatchHistory] = useState<DispatchedNotice[]>([]);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // Filter students falling below statutory 75%
  const candidateRecipients = useMemo<DispatchRecipient[]>(() => {
    return students
      .filter((s) => {
        if (targetTier === 'CRITICAL_ONLY') return s.attendanceRate < 70.0;
        return s.attendanceRate < 75.0;
      })
      .map((s) => ({
        studentId: s.id,
        rollNo: s.rollNo,
        name: s.name,
        email: s.email,
        phone: '+91 98220 12345',
        parentPhone: '+91 94220 54321',
        courseCode: 'CS603',
        courseName: 'DBMS & Relational Theory',
        attendanceRate: s.attendanceRate,
        classesNeeded: calculateRecoveryClasses(s.totalAttended, s.totalConducted, 0.75),
        tier: s.attendanceRate < 70.0 ? 'CRITICAL' : 'WARNING',
      }));
  }, [students, targetTier]);

  const toggleChannel = (channel: NotificationChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleDispatch = () => {
    if (candidateRecipients.length === 0 || selectedChannels.length === 0) return;
    setIsDispatching(true);

    setTimeout(() => {
      const logs = dispatchStatutoryNotices(candidateRecipients, selectedChannels);
      setDispatchHistory((prev) => [...logs, ...prev]);
      setSuccessCount(logs.length);
      setIsDispatching(false);
    }, 600);
  };

  // Preview message for first student
  const previewStudent = candidateRecipients[0];
  const sampleSms = previewStudent ? formatStatutoryNotice(previewStudent, 'SMS') : null;
  const sampleWhatsApp = previewStudent ? formatStatutoryNotice(previewStudent, 'WHATSAPP') : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#091426] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Multi-Channel Statutory Alert Dispatcher
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                  FR-ADM-04
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Automated SMS (Twilio), WhatsApp, and official email warning dispatches
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
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Target Student Cohort</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTargetTier('ALL_DEFICIT')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    targetTier === 'ALL_DEFICIT'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  All Below 75% ({students.filter((s) => s.attendanceRate < 75).length})
                </button>
                <button
                  onClick={() => setTargetTier('CRITICAL_ONLY')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    targetTier === 'CRITICAL_ONLY'
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Critical Below 70% ({students.filter((s) => s.attendanceRate < 70).length})
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Broadcast Channels</label>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleChannel('SMS')}
                  className={`flex items-center justify-center gap-1.5 flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold border transition ${
                    selectedChannels.includes('SMS')
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS</span>
                </button>
                <button
                  onClick={() => toggleChannel('WHATSAPP')}
                  className={`flex items-center justify-center gap-1.5 flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold border transition ${
                    selectedChannels.includes('WHATSAPP')
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => toggleChannel('EMAIL')}
                  className={`flex items-center justify-center gap-1.5 flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold border transition ${
                    selectedChannels.includes('EMAIL')
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          {previewStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                  <span>SMS PREVIEW (TWILIO SIMULATOR)</span>
                  <span>{sampleSms?.content.length} chars</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-lg text-slate-200 font-mono text-[11px] leading-relaxed">
                  {sampleSms?.content}
                </div>
              </div>

              <div className="p-4 bg-[#0c2419] text-white rounded-xl text-xs space-y-2 border border-emerald-900/60">
                <div className="flex items-center justify-between text-emerald-400 font-mono text-[10px]">
                  <span>WHATSAPP STATUTORY NOTICE PREVIEW</span>
                  <span>Parent + Student</span>
                </div>
                <div className="p-3 bg-emerald-950/60 rounded-lg text-emerald-100 font-sans text-[11px] leading-relaxed whitespace-pre-line border border-emerald-800/40">
                  {sampleWhatsApp?.content}
                </div>
              </div>
            </div>
          )}

          {/* Action Strip */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="text-xs text-slate-600">
              Selected: <span className="font-bold text-slate-900">{candidateRecipients.length} students</span> across{' '}
              <span className="font-bold text-slate-900">{selectedChannels.length} channels</span>
            </div>

            <button
              onClick={handleDispatch}
              disabled={isDispatching || candidateRecipients.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{isDispatching ? 'Transmitting Dispatches...' : 'Execute Multi-Channel Dispatch'}</span>
            </button>
          </div>

          {/* Delivery Telemetry Log */}
          {dispatchHistory.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Live Dispatch Telemetry Log ({dispatchHistory.length} sent)
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {dispatchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          item.channel === 'SMS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.channel === 'WHATSAPP'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {item.channel}
                      </span>
                      <span className="font-semibold text-slate-800">{item.recipientName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({item.destination})</span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                      DELIVERED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

