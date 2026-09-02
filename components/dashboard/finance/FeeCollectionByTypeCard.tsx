"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import Dropdown from "@/components/shared/Dropdown";

const FEE_TYPE_PERIOD_OPTIONS = ["This Month", "This Quarter", "This Year"];

interface FeeCollectionByTypeCardProps {
  items?: Array<{ label: string; amount: string; percentage: number; color: string }>;
  total?: string;
}

export default function FeeCollectionByTypeCard({ items = [], total = "₹ 0" }: FeeCollectionByTypeCardProps) {
  const [period, setPeriod] = useState("This Year");

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Fee Collection by Fee Type</h3>
        <Dropdown
          value={period}
          options={FEE_TYPE_PERIOD_OPTIONS}
          onChange={setPeriod}
          className="w-24"
        />
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No fee structures or categories configured yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">{item.amount}</span>
                  <span className="text-xs text-slate-500 w-10 text-right">{item.percentage}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900">Total Structures Fee</span>
          <span className="text-xs font-bold text-slate-900">{total}</span>
        </div>
      </div>
    </Card>
  );
}
