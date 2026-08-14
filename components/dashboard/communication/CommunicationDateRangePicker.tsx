"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunicationDateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

function formatDisplayDate(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, "0")} ${date.getFullYear()}`;
}

export default function CommunicationDateRangePicker({
  value,
  onChange,
}: CommunicationDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pickerMonth, setPickerMonth] = useState(new Date(2025, 4, 1));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (
        containerRef.current &&
        target instanceof Node &&
        !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartSelect = (date: Date) => {
    setStartDate(date);
    if (endDate && date > endDate) {
      setEndDate(undefined);
    }
  };

  const handleEndSelect = (date: Date) => {
    if (startDate && date < startDate) {
      setStartDate(date);
      setEndDate(undefined);
    } else {
      setEndDate(date);
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onChange(`${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`);
    } else if (startDate) {
      onChange(`${formatDisplayDate(startDate)} - ${formatDisplayDate(startDate)}`);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onChange("12 May 2025 - 18 May 2025");
    setIsOpen(false);
  };

  const displayValue = value || "12 May 2025 - 18 May 2025";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] text-left"
        )}
      >
        <CalendarIcon className="h-4 w-4 text-[#7c3aed] flex-shrink-0" />
        <span className="truncate">{displayValue}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 rounded-xl border border-slate-200 bg-white shadow-xl p-4 w-[340px]">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setPickerMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
              aria-label="Previous month"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-slate-900">
              {pickerMonth.toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => setPickerMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
              aria-label="Next month"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
              <div key={w} className="py-1 text-center text-xs font-medium text-slate-400">
                {w}
              </div>
            ))}
          </div>

          <DateGrid
            month={pickerMonth.getMonth()}
            year={pickerMonth.getFullYear()}
            startDate={startDate}
            endDate={endDate}
            onSelectDay={(day, date) => {
              if (!startDate || (startDate && endDate)) {
                handleStartSelect(date);
              } else {
                handleEndSelect(date);
              }
            }}
            selectedStart={startDate}
            selectedEnd={endDate}
          />

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-[#7c3aed] hover:underline"
            >
              Reset
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="rounded-lg bg-[#7c3aed] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DateGrid({
  month,
  year,
  startDate,
  endDate,
  onSelectDay,
  selectedStart,
  selectedEnd,
}: {
  month: number;
  year: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onSelectDay: (day: number, date: Date) => void;
  selectedStart: Date | undefined;
  selectedEnd: Date | undefined;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isInRange = (day: number) => {
    if (!startDate || !selectedEnd) return false;
    const d = new Date(year, month, day);
    return d >= startDate && d <= selectedEnd;
  };

  const isRangeStart = (day: number) => {
    if (!startDate) return false;
    const d = new Date(year, month, day);
    return d.getTime() === startDate.getTime();
  };

  const isRangeEnd = (day: number) => {
    if (!endDate) return false;
    const d = new Date(year, month, day);
    return d.getTime() === endDate.getTime();
  };

  const isToday = (day: number) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  return (
    <div className="grid grid-cols-7 gap-0.5">
      {cells.map((day, i) => {
        if (day === null) return <div key={`empty-${i}`} className="h-8" />;
        const date = new Date(year, month, day);
        const inRange = isInRange(day);
        const isStart = isRangeStart(day);
        const isEnd = isRangeEnd(day);
        const todayHighlight = isToday(day);

        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDay(day, date)}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-lg text-sm transition",
              isStart || isEnd
                ? "bg-[#7c3aed] font-semibold text-white"
                : inRange
                  ? "bg-purple-100 text-[#7c3aed] font-medium"
                  : todayHighlight
                    ? "font-semibold text-[#7c3aed] bg-purple-50"
                    : "text-slate-700 hover:bg-slate-100"
            )}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}
