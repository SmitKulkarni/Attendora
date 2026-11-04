import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  Clock,
  Users,
  MapPin,
  RefreshCw,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import { generateRollingQrToken, QrTokenPayload } from '../../utils/qrAttendance.ts';

interface DynamicQrDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseCode?: string;
  courseName?: string;
  room?: string;
}

export const DynamicQrDisplayModal: React.FC<DynamicQrDisplayModalProps> = ({
  isOpen,
  onClose,
  courseCode = 'CS603',
  courseName = 'Database Management Systems & Relational Theory',
  room = 'LH-104',
}) => {
  if (!isOpen) return null;

  const [qrToken, setQrToken] = useState<QrTokenPayload>(() =>
    generateRollingQrToken('sess-live-01', courseCode, 10)
  );
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
  const [scannedStudents, setScannedStudents] = useState<
    { rollNo: string; name: string; time: string; distance: string }[]
  >([
    { rollNo: '20000001', name: 'Heuren Name', time: 'Just now', distance: '12m (Verified)' },
    { rollNo: '20000002', name: 'Kenrii Anay', time: '14s ago', distance: '18m (Verified)' },
    { rollNo: '20000010', name: 'Tanvi Joshi', time: '28s ago', distance: '8m (Verified)' },
  ]);

  // Rolling 10-second TOTP token generator loop
  useEffect(() => {
    const timer = setInterval(() => {
      const updated = generateRollingQrToken('sess-live-01', courseCode, 10);
      setQrToken(updated);
      setSecondsRemaining(updated.timeRemainingSeconds);
    }, 1000);

    return () => clearInterval(timer);
  }, [courseCode]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#091426] text-white rounded-3xl w-full max-w-4xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Dynamic Anti-Proxy Roll-Call Engine</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  10s TOTP Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {courseCode} - {courseName} | Lecture Room: <span className="text-white font-medium">{room}</span>
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

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Projector QR Code Canvas */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-[#0d1c33] border border-slate-700/60 rounded-2xl p-6 relative">
            {/* Live Timer Ring */}
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Token Expiration:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {secondsRemaining}s
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Auto-Rotating</span>
              </div>
            </div>

            {/* Simulated High-Res QR Matrix */}
            <div className="relative p-5 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center">
              {/* Corner Targeting Marks */}
              <div className="w-64 h-64 border-4 border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center relative bg-white">
                <div className="grid grid-cols-6 gap-2 w-full h-full p-2">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs transition-colors duration-300 ${
                        (i * 7 + secondsRemaining) % 3 === 0
                          ? 'bg-slate-950'
                          : (i * 3 + secondsRemaining) % 4 === 0
                          ? 'bg-emerald-600'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#091426] text-white px-3 py-1.5 rounded-lg border-2 border-emerald-400 text-xs font-mono font-black shadow-lg">
                    {qrToken.token}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Geo-Fence Badge */}
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Geo-Fence Active: LH-104 (Lat: 18.5204, Lon: 73.8567 | 50m radius)</span>
            </div>
          </div>

          {/* Right: Live Real-Time Ingestion Feed */}
          <div className="md:col-span-5 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Live Verified Scans</h4>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold font-mono">
                  {scannedStudents.length} / 40 Present
                </span>
              </div>

              {/* Feed items */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {scannedStudents.map((st) => (
                  <div
                    key={st.rollNo}
                    className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{st.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Roll #{st.rollNo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-medium block">{st.distance}</span>
                      <span className="text-[10px] text-slate-500">{st.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Proxy Watermark Notice */}
            <div className="mt-4 p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-[11px] text-blue-200">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Anti-Screenshot Policy Enforced
              </div>
              Tokens rotate every 10 seconds. Students outside the 50-meter classroom radius cannot record attendance via forwarded photos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

