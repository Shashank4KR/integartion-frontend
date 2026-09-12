"use client";

import { ChevronRight } from "lucide-react";
import type { WeeklyMenuPlan } from "@/lib/fixtures/mess-management-reference-fixture";
import WeeklyMenuDayCard from "./WeeklyMenuDayCard";

interface WeeklyMenuPlanProps {
  plan: WeeklyMenuPlan;
  onViewFull: () => void;
  onDayClick: (day: WeeklyMenuPlan["days"][number]) => void;
}

export default function WeeklyMenuPlan({ plan, onViewFull, onDayClick }: WeeklyMenuPlanProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">
          This Week&apos;s Menu Plan {plan.title ? `(${plan.title})` : ""}
        </h2>
        {plan.days && plan.days.length > 0 && (
          <button
            type="button"
            onClick={onViewFull}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c3aed] hover:underline"
          >
            View Full Menu Plan
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {!plan.days || plan.days.length === 0 ? (
          <p className="py-6 text-sm text-slate-500 text-center w-full">
            No mess menu items scheduled for this week.
          </p>
        ) : (
          plan.days.map((day) => (
            <WeeklyMenuDayCard key={day.dayNum} day={day} onClick={onDayClick} />
          ))
        )}
      </div>
    </div>
  );
}
