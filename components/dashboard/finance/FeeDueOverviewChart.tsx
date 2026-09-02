"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import DonutChart from "@/components/shared/charts/DonutChart";
import Dropdown from "@/components/shared/Dropdown";

const ZERO_DUE_SEGMENTS = [
  { label: "Current Due", value: 0, color: "#f97316" },
  { label: "Overdue", value: 0, color: "#ef4444" },
];

const FEE_DUE_PERIOD_OPTIONS = ["This Month", "This Quarter", "This Year"];

interface FeeDueOverviewChartProps {
  segments?: Array<{ label: string; value: number; color: string }>;
  values?: Record<string, string>;
  total?: string;
}

export default function FeeDueOverviewChart({ segments, values, total }: FeeDueOverviewChartProps) {
  const [period, setPeriod] = useState("This Year");
  const activeSegments = segments && segments.length > 0 ? segments : ZERO_DUE_SEGMENTS;
  const activeTotal = total || "₹ 0";

  const getAmountLabel = (label: string) => {
    if (values && values[label] !== undefined) return values[label];
    return "₹ 0";
  };

  const totalPercentage = activeSegments.reduce((acc, s) => acc + s.value, 0);

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Fee Due Overview</h3>
        <Dropdown
          value={period}
          options={FEE_DUE_PERIOD_OPTIONS}
          onChange={setPeriod}
          className="w-24"
        />
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <DonutChart
            segments={totalPercentage > 0 ? activeSegments : [{ label: "No Due", value: 100, color: "#e2e8f0" }]}
            size={160}
            strokeWidth={14}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-500 font-medium">Total Due</span>
            <span className="text-sm font-bold text-slate-900">{activeTotal}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {activeSegments.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-600 truncate max-w-[140px]">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">{getAmountLabel(item.label)}</span>
              <span className="text-xs text-slate-400 w-10 text-right">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
