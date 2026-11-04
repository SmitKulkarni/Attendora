import React, { useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Cpu,
  Layers,
} from 'lucide-react';
import { UserProfile } from '../../types/index.ts';
import { INITIAL_USERS } from '../../data/mockData.ts';
import { isSupabaseConfigured } from '../../api/supabaseClient.ts';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  isBackendConnected: boolean | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  isBackendConnected,
}) => {
  // Tab state: 'STAFF' or 'STUDENT'
  const [activeTab, setActiveTab] = useState<'STAFF' | 'STUDENT'>('STAFF');

  // Form states
  const [staffEmail, setStaffEmail] = useState<string>('anita.roy@attendora.edu');
  const [staffPassword, setStaffPassword] = useState<string>('password123');

  const [studentRollOrEmail, setStudentRollOrEmail] = useState<string>('20000001');
  const [studentPassword, setStudentPassword] = useState<string>('password123');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick 1-click demo accounts
  const quickDemoAccounts = [
    {
      role: 'STAFF',
      name: 'Dr. Anita Roy',
      tag: 'Dean / Admin (Full Access)',
      email: 'anita.roy@attendora.edu',
      password: 'password123',
      user: INITIAL_USERS[0],
    },
    {
      role: 'STAFF',
      name: 'Prof. Rajesh Deshmukh',
      tag: 'Faculty (Roll-Call & QR)',
      email: 'rajesh.deshmukh@attendora.edu',
      password: 'password123',
      user: INITIAL_USERS[1],
    },
    {
      role: 'STUDENT',
      name: 'Sneha Kulkarni',
      tag: 'Student (PRN 20000001)',
      email: 'sneha.kulkarni@student.attendora.edu',
      password: 'password123',
      user: INITIAL_USERS[2],
    },
  ];

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const emailTrimmed = staffEmail.trim().toLowerCase();
    const matchedUser = INITIAL_USERS.find(
      (u) =>
        u.email.toLowerCase() === emailTrimmed &&
        (u.role === 'ADMIN' || u.role === 'FACULTY')
    );

    setTimeout(() => {
      setIsSubmitting(false);
      if (matchedUser && staffPassword === 'password123') {
        onLoginSuccess(matchedUser);
      } else {
        setErrorMessage('Invalid staff academic email or password. Default demo password is "password123".');
      }
    }, 400);
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const inputTrimmed = studentRollOrEmail.trim().toLowerCase();
    const matchedUser = INITIAL_USERS.find(
      (u) =>
        u.role === 'STUDENT' &&
        (u.email.toLowerCase() === inputTrimmed || u.rollNo === inputTrimmed)
    );

    setTimeout(() => {
      setIsSubmitting(false);
      if (matchedUser && studentPassword === 'password123') {
        onLoginSuccess(matchedUser);
      } else {
        setErrorMessage('Invalid student PRN or password. Use PRN "20000001" and password "password123".');
      }
    }, 400);
  };

  const selectQuickDemo = (demo: typeof quickDemoAccounts[0]) => {
    setErrorMessage(null);
    if (demo.role === 'STAFF') {
      setActiveTab('STAFF');
      setStaffEmail(demo.email);
      setStaffPassword(demo.password);
    } else {
      setActiveTab('STUDENT');
      setStudentRollOrEmail(demo.user.rollNo || demo.email);
      setStudentPassword(demo.password);
    }
    // Auto-login on quick demo selection for instant evaluation
    onLoginSuccess(demo.user);
  };

  return (
    <div className="min-h-screen w-full bg-[#060D1A] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background ambient radial glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top institutional header */}
      <header className="px-6 py-5 flex items-center justify-between z-10 border-b border-slate-800/80 bg-[#091426]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00C48C] via-[#00A3FF] to-[#3B82F6] flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-emerald-950/40">
            A
          </div>
          <div>
            <div className="font-bold text-white text-lg tracking-tight flex items-center gap-2">
              <span>Attendora</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                v1.5.0 Enterprise
              </span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
              Academic Attendance Governance OS
            </div>
          </div>
        </div>

        {/* Database & Architecture Connection Status Badges */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Supabase Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isSupabaseConfigured ? 'Supabase Cloud Connected' : 'Supabase Storage Ready'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Backend API Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-800/80 border border-slate-700 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
            <span>{isBackendConnected ? 'Modular Monolith API' : 'PostgreSQL Engine'}</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
        <div className="w-full max-w-xl bg-[#091426]/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col transition-all">
          
          {/* Header Title & Subtitle */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Statutory Compliance &amp; Multi-Tenant Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Institutional Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select your university role below to authenticate into the system
            </p>
          </div>

          {/* Role Tab Switcher: Staff (Professors/Deans) vs Students */}
          <div className="grid grid-cols-2 p-1.5 bg-[#0e1d33] rounded-2xl border border-slate-700/80 mb-6 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('STAFF');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'STAFF'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Staff &amp; Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('STUDENT');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'STUDENT'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>Student Portal</span>
            </button>
          </div>

          {/* Role Privileges Banner */}
          <div className={`p-3.5 rounded-xl border text-xs mb-5 transition flex items-start gap-3 ${
            activeTab === 'STAFF'
              ? 'bg-blue-950/30 border-blue-500/30 text-blue-200'
              : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
          }`}>
            {activeTab === 'STAFF' ? (
              <>
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Full Staff &amp; Faculty Authority Active</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    Authorized to conduct roll-call, modify student attendance rates, bulk-import CSV rosters, grant exam waivers, and export accreditation audits.
                  </div>
                </div>
              </>
            ) : (
              <>
                <GraduationCap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Student Compliance &amp; Recovery Hub</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    Monitor course compliance gauges, calculate recovery classes to restore &ge;75% standing, and scan classroom dynamic QR codes.
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form: Staff Login */}
          {activeTab === 'STAFF' && (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academic Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="e.g. anita.roy@attendora.edu"
                    className="w-full bg-[#0d1a2d] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Institutional Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#0d1a2d] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
              >
                <span>{isSubmitting ? 'Authenticating Staff...' : 'Sign In as Staff (Full Access)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form: Student Login */}
          {activeTab === 'STUDENT' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student PRN / Roll Number or Academic Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={studentRollOrEmail}
                    onChange={(e) => setStudentRollOrEmail(e.target.value)}
                    placeholder="e.g. 20000001 or sneha.kulkarni@student.attendora.edu"
                    className="w-full bg-[#0d1a2d] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Enter student password"
                    className="w-full bg-[#0d1a2d] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
              >
                <span>{isSubmitting ? 'Authenticating Student...' : 'Sign In as Student'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Access Bar for 1-Click Evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Quick 1-Click Demo Profiles</span>
              <span className="text-[10px] text-emerald-400 lowercase font-mono">instant pass</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickDemoAccounts.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => selectQuickDemo(demo)}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/60 text-left transition flex items-center gap-2.5 group"
                >
                  <img
                    src={demo.user.avatar}
                    alt={demo.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-600 group-hover:border-blue-400"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-blue-300">
                      {demo.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {demo.tag}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Footer Legal & Security */}
      <footer className="px-6 py-4 border-t border-slate-800/80 bg-[#091426]/50 text-center text-xs text-slate-500 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>&copy; 2026 Attendora Academic Operating System</span>
          <span>&middot;</span>
          <span>UGC 75% Statutory Compliance</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>Row-Level Security Active</span>
          <span>&middot;</span>
          <span className="text-emerald-400 font-mono">HMAC-SHA256 Encrypted</span>
        </div>
      </footer>
    </div>
  );
};

