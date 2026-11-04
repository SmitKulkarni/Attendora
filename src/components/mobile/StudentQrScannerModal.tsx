import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  generateRollingQrToken,
  validateStudentQrScan,
  ScanValidationResult,
  QrTokenPayload,
} from '../../utils/qrAttendance.ts';

interface StudentQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  courseCode?: string;
  onAttendanceVerified?: (courseCode: string) => void;
}

export const StudentQrScannerModal: React.FC<StudentQrScannerModalProps> = ({
  isOpen,
  onClose,
  studentId = 'stu-1',
  studentName = 'Sneha Kulkarni',
  courseCode = 'CS603',
  onAttendanceVerified,
}) => {
  if (!isOpen) return null;

  const [scanResult, setScanResult] = useState<ScanValidationResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [simulatedDistance, setSimulatedDistance] = useState<'INSIDE' | 'OUTSIDE'>('INSIDE');

  const handleSimulateScan = () => {
    // Generate the active token on the projector
    const liveProjectorToken: QrTokenPayload = generateRollingQrToken('sess-live-01', courseCode, 10);

    const classroomLocation = {
      latitude: 18.5204,
      longitude: 73.8567,
      allowedRadiusMeters: 50,
    };

    const studentLocation =
      simulatedDistance === 'INSIDE'
        ? { latitude: 18.5205, longitude: 73.8567 } // 11 meters away
        : { latitude: 18.5240, longitude: 73.8567 }; // 400 meters away (proxy attempt)

    const result = validateStudentQrScan(
      liveProjectorToken.token,
      liveProjectorToken,
      studentId,
      studentLocation,
      classroomLocation
    );

    setScanResult(result);
    setIsScanning(false);

    if (result.isValid && onAttendanceVerified) {
      onAttendanceVerified(courseCode);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h3 className="font-bold text-sm text-white">Classroom Attendance Scanner</h3>
          <p className="text-[11px] text-slate-400">{courseCode} | GPS Geo-Fence Active</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Camera Reticle / Scanning Window */}
      <div className="flex flex-col items-center justify-center my-auto">
        {isScanning ? (
          <div className="relative flex flex-col items-center">
            {/* Camera Viewfinder Box */}
            <div className="w-64 h-64 border-2 border-dashed border-emerald-400 rounded-3xl relative flex items-center justify-center overflow-hidden bg-slate-900/60 shadow-2xl">
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

              {/* Scanning Laser Beam */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

              <Camera className="w-10 h-10 text-emerald-400/60 animate-bounce" />
            </div>

            <p className="text-xs text-slate-300 mt-4 text-center max-w-xs">
              Point camera at the dynamic rotating QR code on the lecture hall projector screen.
            </p>

            {/* Geo-Location Simulation Switcher */}
            <div className="mt-6 flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSimulatedDistance('INSIDE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  simulatedDistance === 'INSIDE'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inside LH-104 (12m)
              </button>
              <button
                onClick={() => setSimulatedDistance('OUTSIDE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  simulatedDistance === 'OUTSIDE'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Outside Classroom (400m)
              </button>
            </div>

            <button
              onClick={handleSimulateScan}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition"
            >
              Simulate Camera QR Scan
            </button>
          </div>
        ) : (
          /* Scan Result Display */
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                scanResult?.isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {scanResult?.isValid ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <AlertTriangle className="w-10 h-10" />
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                {scanResult?.isValid ? 'Attendance Verified!' : 'Verification Failed'}
              </h4>
              <p className="text-xs text-slate-300 mt-1">{scanResult?.message}</p>
            </div>

            {scanResult?.distanceMeters !== undefined && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 p-2 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Distance: {Math.round(scanResult.distanceMeters)} meters from room</span>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Scan Again</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Security Banner */}
      <div className="text-center pb-2 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        <span>Cryptographic Anti-Proxy Protection Active | TOTP Window: 10s</span>
      </div>
    </div>
  );
};

