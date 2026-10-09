"use client";

import { Sun, Flame, Moon } from "lucide-react";
import type { MealRow } from "@/lib/fixtures/mess-management-reference-fixture";

interface TodaysMenuCardProps {
  rows: MealRow[];
  onRowClick: (row: MealRow) => void;
}

const mealIconMap: Record<string, React.ReactNode> = {
  Sun: <Sun className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Moon: <Moon className="w-4 h-4" />,
};

export default function TodaysMenuCard({ rows, onRowClick }: TodaysMenuCardProps) {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const dateStr = today.toLocaleDateString("en-US", options);
  const dayStr = today.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-base font-bold text-slate-900 mb-4">
        Today&apos;s Menu ({dateStr} - {dayStr})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Meal</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Menu</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">Time</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">
                  No meals scheduled for today.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row)}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer transition"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`${row.iconBg} p-1.5 rounded-full flex-shrink-0`}>
                        <span className={row.iconColor}>{mealIconMap[row.mealIcon]}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{row.meal}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{row.menu}</td>
                  <td className="px-3 py-3 text-slate-700">{row.time}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Served: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Upcoming: "bg-blue-50 text-blue-700 border-blue-200",
    Scheduled: "bg-purple-50 text-purple-700 border-purple-200",
    Cancelled: "bg-pink-50 text-pink-700 border-pink-200",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}
