"use client";

import { useState } from "react";
import { CheckCircle, Bus, Clock, Wrench, ChevronDown } from "lucide-react";
import Card from "@/components/shared/Card";
import type { ActivityRow } from "@/lib/fixtures/transport-overview-reference-fixture";

const iconMap: Record<string, React.ReactNode> = {
  "check-circle": <CheckCircle className="h-4 w-4" />,
  bus: <Bus className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
  tools: <Wrench className="h-4 w-4" />,
};

const OVERVIEW_PERIOD_OPTIONS = ["Today", "This Week", "This Month"];

const ACTIVITY_ROWS: ActivityRow[] = [
  { label: "Trips Completed", value: 8, icon: "check-circle", iconBg: "bg-emerald-50", iconColor: "text-emerald-500", progressColor: "bg-emerald-500", progressValue: 80 },
  { label: "Trips Running", value: 16, icon: "bus", iconBg: "bg-blue-50", iconColor: "text-blue-500", progressColor: "bg-blue-500", progressValue: 100 },
];

interface TransportActivityCardProps {
  rows?: ActivityRow[];
  activities?: ActivityRow[];
}

export default function TransportActivityCard({ rows, activities }: TransportActivityCardProps) {
  const [period, setPeriod] = useState("Today");
  const [isOpen, setIsOpen] = useState(false);
  const items = rows ?? activities ?? [];

  return (
    <Card className="p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900">Transport Activity</h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            {period}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {isOpen && (
            <div className="absolute right-0 z-50 mt-2 min-w-max overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {OVERVIEW_PERIOD_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setPeriod(option);
                    setIsOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-purple-50 ${
                    option === period ? "font-semibold text-purple-700" : "text-slate-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <div className={`${row.iconBg} p-2 rounded-lg flex-shrink-0`}>
              <span className={row.iconColor}>{iconMap[row.icon]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 truncate">{row.label}</span>
                <span className="text-sm font-semibold text-slate-900 ml-2">{row.value}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.progressColor}`}
                  style={{ width: `${Math.min(row.progressValue, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-700">Overall Transport Status</span>
        <span className="text-xs font-bold text-emerald-600 ml-auto">Operational</span>
      </div>
    </Card>
  );
}
