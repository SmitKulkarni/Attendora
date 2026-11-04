import React, { useState } from 'react';
import { DailyTrendData } from '../../types/index.ts';

interface AttendanceTrendChartProps {
  trendData: DailyTrendData[];
}

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ trendData }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const yLabels = [100, 80, 60, 40, 20, 0];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Attendance Trend</h3>
          <p className="text-xs text-slate-400 mt-0.5">Departmental compliance and participation tracking over time</p>
        </div>

        {/* Legend & Toggle matching screenshot */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1.5 transition ${
                viewMode === 'daily' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              <span>Daily</span>
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 transition ${
                viewMode === 'weekly' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C48C]" />
              <span>Weekly</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas with Dual Color Bars */}
      <div className="relative pt-2 pb-4">
        {/* Y Axis Grid lines */}
        <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none pl-8 pr-2">
          {yLabels.map((val) => (
            <div key={val} className="flex items-center gap-3 w-full">
              <span className="text-[11px] font-medium text-slate-400 w-5 text-right shrink-0 tnum">
                {val}
              </span>
              <div className="w-full border-b border-slate-100" />
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative ml-10 h-52 flex items-end justify-between px-2 sm:px-6 pt-4">
          {trendData.map((item, index) => {
            // Height percentages
            const blueHeight = `${item.rate}%`;
            const greenHeight = `${Math.min(95, Math.max(30, item.attended))}%`;

            return (
              <div
                key={index}
                className="relative flex flex-col items-center group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip on hover */}
                {hoveredIdx === index && (
                  <div className="absolute -top-14 bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl z-20 whitespace-nowrap pointer-events-none">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{item.day} Session</span>
                      <span className="text-emerald-400 font-mono">{item.rate}%</span>
                    </div>
                    <div className="text-slate-300 text-[10px]">
                      Conducted: {item.scheduled} | Present: {item.attended}
                    </div>
                  </div>
                )}

                {/* Paired Bar Group matching screenshot: Blue bar + Mint Green bar */}
                <div className="flex items-end gap-1 sm:gap-1.5 h-44">
                  {/* Royal Blue Bar */}
                  <div
                    style={{ height: blueHeight }}
                    className="w-3.5 sm:w-4.5 bg-[#2563EB] rounded-t-sm transition-all duration-300 group-hover:bg-blue-700 group-hover:scale-y-105 origin-bottom"
                  />
                  {/* Mint Green Bar */}
                  <div
                    style={{ height: greenHeight }}
                    className="w-3.5 sm:w-4.5 bg-[#00C48C] rounded-t-sm transition-all duration-300 group-hover:bg-emerald-600 group-hover:scale-y-105 origin-bottom"
                  />
                </div>

                {/* Day Label */}
                <span className="mt-3 text-[11px] font-semibold text-slate-500 group-hover:text-slate-900 transition">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
