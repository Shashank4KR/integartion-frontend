"use client";

import DonutChart from "@/components/shared/charts/DonutChart";
import Card from "@/components/shared/Card";
import { CircleCheck } from "lucide-react";

interface FeeCollectionByTypeChartProps {
  segments?: Array<{ label: string; value: number; color: string }>;
  recentPayments?: Array<{ student: string; status: string; amount: string }>;
}

export default function FeeCollectionByTypeChart({ segments = [], recentPayments = [] }: FeeCollectionByTypeChartProps) {
  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Fee Collection by Type</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
          <CircleCheck className="h-3.5 w-3.5" />
          Live backend breakdown
        </span>
      </div>

      <div className="flex items-center justify-center mb-3">
        <DonutChart
          segments={segments}
          size={150}
        />
      </div>

      <div className="space-y-1.5 mb-4">
        {segments.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-600">{item.label}</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-700 mb-2">Recent Payments</p>
        <div className="space-y-2">
          {recentPayments.map((item, index) => (
            <div key={`${item.student}-${index}`} className="flex items-center justify-between">
              <p className="text-xs text-slate-900">{item.student}</p>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-900">{item.amount}</p>
                <span className={`text-[10px] font-medium ${
                  item.status === "Complete" ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
