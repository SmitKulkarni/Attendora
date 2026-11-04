import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Pencil,
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  FileDown,
  Plus,
} from 'lucide-react';
import { StudentRecord } from '../../types/index.ts';

interface StudentRosterTableProps {
  students: StudentRecord[];
  onUpdateStudent: (updated: StudentRecord) => void;
  openRollCall: () => void;
  openCsvImport: () => void;
}

export const StudentRosterTable: React.FC<StudentRosterTableProps> = ({
  students,
  onUpdateStudent,
  openRollCall,
  openCsvImport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LOW'>('ALL');
  const [sortField, setSortField] = useState<'name' | 'rollNo' | 'attendanceRate'>('rollNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [editRateValue, setEditRateValue] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  // Filtering & Sorting
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rollNo.includes(searchTerm) ||
          s.department.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === 'PRESENT') return s.attendanceRate >= 75.0;
        if (statusFilter === 'LOW') return s.attendanceRate < 75.0;
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [students, searchTerm, statusFilter, sortField, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (field: 'name' | 'rollNo' | 'attendanceRate') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const openEditModal = (student: StudentRecord) => {
    setEditingStudent(student);
    setEditRateValue(student.attendanceRate);
    setEditNotes(student.notes || '');
  };

  const saveStudentEdit = () => {
    if (!editingStudent) return;
    const newRate = Number(editRateValue);
    const newStatus = newRate >= 75.0 ? 'Present' : 'Low Rate';
    const updated: StudentRecord = {
      ...editingStudent,
      attendanceRate: newRate,
      status: newStatus,
      totalAttended: Math.round((newRate / 100) * editingStudent.totalConducted),
      notes: editNotes,
    };
    onUpdateStudent(updated);
    setEditingStudent(null);
  };

  const handleBulkMark = (newStatus: 'Present' | 'Low Rate') => {
    selectedIds.forEach((id) => {
      const student = students.find((s) => s.id === id);
      if (student) {
        const newRate = newStatus === 'Present' ? Math.max(student.attendanceRate, 85.0) : Math.min(student.attendanceRate, 65.0);
        onUpdateStudent({
          ...student,
          status: newStatus,
          attendanceRate: newRate,
          totalAttended: Math.round((newRate / 100) * student.totalConducted),
        });
      }
    });
    setSelectedIds([]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
      {/* Table Header Controls matching Screenshot */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Student Roster Management</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {filteredStudents.length} enrolled students for Computer Sci. (Semester 6)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setStatusFilter((prev) => (prev === 'ALL' ? 'LOW' : prev === 'LOW' ? 'PRESENT' : 'ALL'));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {statusFilter === 'ALL' ? 'Filter: All' : statusFilter === 'LOW' ? 'Filter: Defaulters' : 'Filter: Compliant'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Search Input from screenshot */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-36 sm:w-48 transition"
            />
          </div>

          {/* Quick Action Buttons */}
          <button
            onClick={openRollCall}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:brightness-110 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Roll Call</span>
          </button>

          <button
            onClick={openCsvImport}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium transition"
            title="Import student roster via CSV"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Actions Bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900 animate-fadeIn">
          <span className="font-semibold">{selectedIds.length} student(s) selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkMark('Present')}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition"
            >
              <UserCheck className="w-3 h-3" />
              <span>Mark Compliant (85%)</span>
            </button>
            <button
              onClick={() => handleBulkMark('Low Rate')}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 text-white rounded font-medium hover:bg-amber-700 transition"
            >
              <UserX className="w-3 h-3" />
              <span>Mark Low Rate (65%)</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-500 hover:text-slate-700 ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table Surface */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={
                    filteredStudents.length > 0 &&
                    selectedIds.length === filteredStudents.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Student Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('rollNo')}
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1.5">
                  <span>Department</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('attendanceRate')}
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Attendance Rate</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No matching student records found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                const isLowRate = student.attendanceRate < 75.0 || student.status === 'Low Rate';

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(student.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Student Name with Avatar */}
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-semibold text-slate-900">
                          {student.name}
                        </span>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-3 px-4 font-mono text-slate-600 tnum">
                      {student.rollNo}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-600">
                      {student.department}
                    </td>

                    {/* Attendance Rate Pill - Matches Screenshot ("Present" green or "Low Rate" orange) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isLowRate ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF4ED] text-[#EA580C] border border-[#FDBA74]/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                            Low Rate
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            Present
                          </span>
                        )}
                        <span className="text-[11px] font-mono font-medium text-slate-400 tnum">
                          {student.attendanceRate}%
                        </span>
                      </div>
                    </td>

                    {/* Action Buttons: Pencil & Dots */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                          title="Edit Attendance Rate"
                          aria-label={`Edit ${student.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                          title="More options"
                          aria-label="More options"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Override Student Attendance
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Modify statutory ledger for {editingStudent.name} (Roll: {editingStudent.rollNo})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attendance Percentage (%):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={editRateValue}
                    onChange={(e) => setEditRateValue(Number(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="w-14 text-center font-mono font-bold text-sm bg-slate-100 py-1 rounded">
                    {editRateValue}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compliance Tier:
                </label>
                <div className="text-xs">
                  {editRateValue >= 75.0 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Compliant (Eligible for Examinations)
                    </span>
                  ) : editRateValue >= 70.0 ? (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Warning / Conditional Probation
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Critical Defaulter (&lt;70% Debarred)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modification Justification (FR-FAC-04):
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g., Medical leave approved by Dean, Event duty representation..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={saveStudentEdit}
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-xs"
              >
                Commit & Log Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
