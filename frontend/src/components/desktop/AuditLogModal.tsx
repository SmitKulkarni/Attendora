import React, { useState } from 'react';
import { X, ShieldCheck, Search, Filter, Lock } from 'lucide-react';
import { AuditLogEntry } from '../../types/index.ts';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#091426] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                Audit Trail & Non-Repudiation Ledger
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Immutable
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Non-repudiation log of all post-submission attendance modifications & overrides
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

        {/* Search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 text-xs shrink-0">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by actor, student, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <span className="text-slate-400 text-xs shrink-0 font-mono">
            {filteredLogs.length} Records Logged
          </span>
        </div>

        {/* Audit Log Entries List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No audit records matching criteria
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.actorName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      {log.role}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-blue-600 font-semibold">{log.action}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-400">Target Student:</span>{' '}
                    <strong className="text-slate-900">{log.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Status Transition:</span>{' '}
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded line-through mr-1 font-mono">
                      {log.previousStatus}
                    </span>
                    →
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded ml-1 font-mono font-bold">
                      {log.newStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                  <span className="font-semibold text-slate-800">Mandatory Justification:</span>{' '}
                  <span className="italic">"{log.reason}"</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
