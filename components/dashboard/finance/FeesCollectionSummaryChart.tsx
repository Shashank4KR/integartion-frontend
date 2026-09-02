"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import DonutChart from "@/components/shared/charts/DonutChart";
import Dropdown from "@/components/shared/Dropdown";

const ZERO_SEGMENTS = [
  { label: "Collected", value: 0, color: "#10b981" },
  { label: "Outstanding", value: 0, color: "#f97316" },
];

const FEE_COLLECTION_PERIOD_OPTIONS = ["This Month", "This Quarter", "This Year"];

interface FeesCollectionSummaryChartProps {
  segments?: Array<{ label: string; value: number; color: string }>;
  values?: Record<string, string>;
}

export default function FeesCollectionSummaryChart({ segments, values }: FeesCollectionSummaryChartProps) {
  const [period, setPeriod] = useState("This Year");
  const activeSegments = segments && segments.length > 0 ? segments : ZERO_SEGMENTS;

  const getAmountLabel = (label: string) => {
    if (values && values[label] !== undefined) return values[label];
    return "₹ 0";
  };

  const totalValue = activeSegments.reduce((acc, s) => acc + s.value, 0);

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Fee Collection Summary</h3>
        <Dropdown
          value={period}
          options={FEE_COLLECTION_PERIOD_OPTIONS}
          onChange={setPeriod}
          className="w-24"
        />
      </div>

      <div className="flex items-center justify-center mb-4">
        <DonutChart
          segments={totalValue > 0 ? activeSegments : [{ label: "No Data", value: 100, color: "#e2e8f0" }]}
          size={180}
          strokeWidth={14}
        />
      </div>

      <div className="space-y-2.5">
        {activeSegments.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-medium text-slate-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">{getAmountLabel(item.label)}</span>
              <span className="text-xs text-slate-500 w-12 text-right">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
