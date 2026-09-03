"use client";

import { X, Printer, Download } from "lucide-react";

interface WeeklyMenuDay {
  dayNum: number;
  day: string;
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  isCurrent?: boolean;
}

interface FullMenuPlanDialogProps {
  open: boolean;
  onClose: () => void;
  plan?: {
    days?: WeeklyMenuDay[];
  };
}

export default function FullMenuPlanDialog({ open, onClose, plan }: FullMenuPlanDialogProps) {
  if (!open) return null;

  const days = plan?.days ?? [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Full Menu Plan</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {days.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No weekly menu plan scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {days.map((day) => (
                <div
                  key={day.dayNum}
                  className={`rounded-xl border p-4 ${
                    day.isCurrent ? "bg-purple-50/60 border-purple-200" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="mb-3">
                    <p className="text-sm font-bold text-slate-900">{day.day}</p>
                    <p className="text-xs text-slate-500">{day.date}</p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold text-[#7c3aed]">Breakfast</p>
                      <p className="text-xs text-slate-700">{day.breakfast || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#7c3aed]">Lunch</p>
                      <p className="text-xs text-slate-700">{day.lunch || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#7c3aed]">Dinner</p>
                      <p className="text-xs text-slate-700">{day.dinner || "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
