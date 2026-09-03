"use client";

import WeeklyTimetableGrid from "./WeeklyTimetableGrid";
import { COMPANY_INFO } from "@/lib/constants";
import { getSubjectColor } from "./timetableColors";
import { type PreviewTimetableEntry, type TimeSlot, type WeekDay } from "./timetableDisplayTypes";

interface TimetablePrintViewProps {
  entries: PreviewTimetableEntry[];
  classLabel: string;
  academicYear: string;
  weekRange: string;
  subjects: string[];
  weekDates: Record<WeekDay, Date>;
  onOpenEntry?: (entry: PreviewTimetableEntry) => void;
  onAddPeriod?: (day: WeekDay, slot: TimeSlot) => void;
}

// Rendered only for printing. Hidden on screen. The page injects print CSS
// that makes this the only visible region when printing.
export default function TimetablePrintView({
  entries,
  classLabel,
  academicYear,
  weekRange,
  subjects,
  weekDates,
  onOpenEntry,
  onAddPeriod,
}: TimetablePrintViewProps) {
  return (
    <div className="tt-print hidden bg-white p-8 text-slate-900 print:block">
      <h1 className="text-lg font-bold">{COMPANY_INFO.name} Smart Campus</h1>
      <h2 className="mt-1 text-2xl font-bold">Timetable</h2>
      <div className="mt-2 flex flex-wrap gap-x-8 gap-y-1 text-sm text-slate-600">
        <span>
          <span className="font-semibold">Class:</span> {classLabel}
        </span>
        <span>
          <span className="font-semibold">Academic Year:</span> {academicYear}
        </span>
        <span>
          <span className="font-semibold">Week:</span> {weekRange}
        </span>
      </div>

      <div className="mt-4">
        <WeeklyTimetableGrid
          entries={entries}
          weekDates={weekDates}
          onOpenEntry={onOpenEntry || (() => {})}
          onAddPeriod={onAddPeriod || (() => {})}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 pt-3">
        {subjects.map((subject) => {
          const color = getSubjectColor(subject);
          return (
            <span key={subject} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color.dot }}
              />
              {subject}
            </span>
          );
        })}
      </div>
    </div>
  );
}
