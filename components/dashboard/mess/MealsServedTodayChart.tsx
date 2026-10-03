"use client";

import { ChevronDown } from "lucide-react";
import type { MealServedSegment } from "@/lib/fixtures/mess-management-reference-fixture";

interface MealsServedTodayChartProps {
  segments: MealServedSegment[];
  total: number;
  timeframe: string;
  onTimeframeChange: (value: string) => void;
}

export default function MealsServedTodayChart({ segments, total, timeframe, onTimeframeChange }: MealsServedTodayChartProps) {
  const circumference = 2 * Math.PI * 54;
  const totalVal = segments.reduce((sum, s) => sum + s.count, 0);
  let currentOffset = 0;

  const segmentsWithOffset = segments.map((seg) => {
    const angle = totalVal > 0 ? (seg.count / totalVal) * 360 : 0;
    const length = (angle / 360) * circumference;
    const offset = currentOffset;
    currentOffset += length;
    return { ...seg, length, offset };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">Meals Served Today</h2>
        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
          >
            {["Today", "Yesterday", "This Week", "This Month"].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
            <circle cx="80" cy="80" r="54" fill="none" stroke="#f1f5f9" strokeWidth="18" />
            {segmentsWithOffset.map((seg, i) => (
              <circle
                key={i}
                cx="80"
                cy="80"
                r="54"
                fill="none"
                stroke={seg.color}
                strokeWidth="18"
                strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">Total Meals</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 w-full">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-sm font-medium text-slate-700">{seg.label}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {seg.count} <span className="text-slate-400 font-normal">({seg.percentage})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
