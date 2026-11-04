import React from 'react';
import { Users, ArrowUpRight, ArrowDownRight, Building2, Filter } from 'lucide-react';

interface DashboardMetricsProps {
  activeDeptCount?: number;
  totalStudentsCount?: number;
  dailyAttendanceRate?: number;
  defaulterRate?: number;
  selectedFilter: string;
  onFilterChange: (val: string) => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  activeDeptCount = 1,
  totalStudentsCount = 232,
  dailyAttendanceRate = 82,
  defaulterRate = 18,
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Section Header with Department Analytics & Filter Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Department Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time statutory attendance compliance across active batches</p>
        </div>

        {/* Filter Dropdown from screenshot ("Faculty/adoms") */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold py-2 pl-3 pr-8 rounded-lg shadow-xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">Faculty / Admin View</option>
              <option value="cs">Computer Sci. (Dept)</option>
              <option value="sem6">Semester 6 - Section A</option>
              <option value="defaulters">Defaulters Only (&lt;75%)</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4 Cards Grid - Matches the Screenshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Departments */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="text-4xl font-bold text-slate-900 tnum tracking-tight">
              {activeDeptCount}
            </div>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-md">
              20
            </span>
          </div>
          <div className="mt-3 text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Active Departments</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Computer Science & Engineering
          </div>
        </div>

        {/* Card 2: Total Students */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="text-4xl font-bold text-slate-900 tnum tracking-tight">
              {totalStudentsCount}
            </div>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-xs font-medium text-slate-500">
            Total Students
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            100% Rosters Enrolled & Active
          </div>
        </div>

        {/* Card 3: Daily Attendance (Primary Metric with Up Arrow) */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="text-4xl font-bold text-slate-900 tnum tracking-tight flex items-baseline gap-1">
              <span>{dailyAttendanceRate}</span>
              <span className="text-2xl font-semibold text-slate-500">%</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-xs font-medium text-slate-500">
            Daily Attendance
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            +3.4% vs Previous Term Baseline
          </div>
        </div>

        {/* Card 4: Defaulter / Attendance Threshold Warning */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="text-4xl font-bold text-slate-900 tnum tracking-tight flex items-baseline gap-1">
              <span>{defaulterRate}</span>
              <span className="text-2xl font-semibold text-slate-500">%</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-xs font-medium text-slate-500">
            Defaulter Ratio (&lt;75%)
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">
            14 Students Nearing Debarment
          </div>
        </div>
      </div>
    </div>
  );
};
