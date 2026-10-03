"use client";

import type { ExpenseHeadRow } from "@/lib/fixtures/mess-management-reference-fixture";

interface TopExpenseHeadsCardProps {
  rows: ExpenseHeadRow[];
  month: string;
}

export default function TopExpenseHeadsCard({ rows, month }: TopExpenseHeadsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full">
      <h2 className="text-base font-bold text-slate-900 mb-3">Top Expense Heads ({month})</h2>
      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No expense head records found for this period.
          </div>
        ) : (
          rows.map((row, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{row.category}</span>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">{row.amount}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${row.barWidth}%`, backgroundColor: row.barColor }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
