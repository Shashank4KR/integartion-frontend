"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarEvent {
  day: number;
  title: string;
}

interface CalendarProps {
  initialDate?: Date;
  selectedDate?: Date;
  onSelect?: (date: Date) => void;
  events?: CalendarEvent[];
  showEventDots?: boolean;
  rangeStart?: Date;
  rangeEnd?: Date;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Calendar({
  initialDate,
  selectedDate,
  onSelect,
  events = [],
  showEventDots = false,
  rangeStart,
  rangeEnd,
}: CalendarProps) {
  const base = initialDate ?? selectedDate ?? new Date(2025, 4, 21);
  const [view, setView] = useState(
    new Date(base.getFullYear(), base.getMonth(), 1)
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isSameDay = (a: Date | undefined, d: number) =>
    !!a &&
    a.getFullYear() === year &&
    a.getMonth() === month &&
    a.getDate() === d;

  const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const isInRange = (d: number) => {
    if (!rangeStart || !rangeEnd) return false;
    const current = dateOnly(new Date(year, month, d));
    const start = dateOnly(rangeStart);
    const end = dateOnly(rangeEnd);
    return current >= start && current <= end;
  };

  const eventForDay = (d: number) => events.find((e) => e.day === d);

  const changeMonth = (delta: number) =>
    setView(new Date(year, month + delta, 1));

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-slate-800 tracking-tight">
            {MONTHS[month]}
          </span>
          <select
            value={year}
            onChange={(e) => setView(new Date(Number(e.target.value), month, 1))}
            aria-label="Select year"
            className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-0.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-purple-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="py-1 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
          >
            {w}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="h-8" />;
          const selected = isSameDay(selectedDate, day);
          const inRange = isInRange(day);
          const today = isSameDay(new Date(), day);
          const evt = eventForDay(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect?.(new Date(year, month, day))}
              className={`relative flex h-8 w-8 mx-auto cursor-pointer items-center justify-center rounded-lg text-xs font-medium transition ${
                selected
                  ? "bg-[#7c3aed] font-bold text-white shadow-sm shadow-purple-500/20"
                  : inRange
                  ? "bg-purple-50 text-purple-700"
                  : today
                  ? "border border-purple-300 bg-purple-50/80 font-bold text-[#7c3aed] hover:bg-purple-100"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {day}
              {showEventDots && evt && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-purple-500" />
              )}
            </button>
          );
        })}
      </div>

      {showEventDots && events.length > 0 && (
        <div className="mt-4 space-y-1 border-t border-slate-100 pt-3">
          {events.map((e) => (
            <div key={e.day} className="flex items-center gap-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              <span className="font-medium text-slate-700">
                {MONTHS[month]} {e.day}:
              </span>
              <span className="text-slate-500">{e.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
