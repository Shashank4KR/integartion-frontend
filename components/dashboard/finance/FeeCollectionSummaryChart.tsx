"use client";

import DonutChart from "@/components/shared/charts/DonutChart";
import Card from "@/components/shared/Card";
import { CircleCheck } from "lucide-react";

interface FeeCollectionSummaryChartProps {
  data?: Array<{ label: string; value: number; color: string }>;
  recentCollections?: Array<{ student: string; course: string; status: "Paid" | "Pending" | "Overdue"; amount: string; date: string }>;
}

export default function FeeCollectionSummaryChart({ data = [], recentCollections = [] }: FeeCollectionSummaryChartProps) {
  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Fee Collection Summary</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
          <CircleCheck className="h-3.5 w-3.5" />
          Live backend data
        </span>
      </div>

      <div className="flex items-center justify-center mb-4">
        <DonutChart
          segments={data.length > 0 ? data : []}
          size={180}
        />
      </div>

      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-600">{item.label}</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-700 mb-2">Recent Collections</p>
        <div className="space-y-2">
          {recentCollections.map((item, index) => (
            <div key={`${item.student}-${item.date}-${index}`} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-900">{item.student}</p>
                <p className="text-[11px] text-slate-500">{item.course}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-900">{item.amount}</p>
                <span className={`text-[10px] font-medium ${
                  item.status === "Paid" ? "text-emerald-600" :
                  item.status === "Pending" ? "text-amber-600" : "text-red-600"
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
