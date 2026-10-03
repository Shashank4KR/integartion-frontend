"use client";

import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import Calendar from "@/components/shared/Calendar";

interface MaintenanceDateRangePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function MaintenanceDateRangePicker({
  label = "Date Range",
  value,
  onChange,
}: MaintenanceDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 2));

  useEffect(() => {
    if (value && value.includes("-")) {
      const parts = value.split(" - ");
      if (parts.length === 2) {
        const start = parseDate(parts[0]);
        const end = parseDate(parts[1]);
        if (start && end) {
          setRangeStart(start);
          setRangeEnd(end);
          setCurrentMonth(new Date(start.getFullYear(), start.getMonth(), 1));
        }
      }
    }
  }, [value]);

  const parseDate = (str: string): Date | null => {
    const parts = str.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
    return null;
  };

  const formatDate = (date: Date): string => {
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const handleDateClick = (date: Date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
    } else if (date < rangeStart) {
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      setRangeEnd(date);
    }
  };

  const handleApply = () => {
    if (rangeStart && rangeEnd) {
      onChange(`${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`);
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    setRangeStart(null);
    setRangeEnd(null);
    onChange("");
  };

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  const isInRange = (date: Date): boolean => {
    if (!rangeStart || !rangeEnd) return false;
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
    return d > start && d < end;
  };

  const isStart = (date: Date): boolean => {
    if (!rangeStart) return false;
    return (
      date.getFullYear() === rangeStart.getFullYear() &&
      date.getMonth() === rangeStart.getMonth() &&
      date.getDate() === rangeStart.getDate()
    );
  };

  const isEnd = (date: Date): boolean => {
    if (!rangeEnd) return false;
    return (
      date.getFullYear() === rangeEnd.getFullYear() &&
      date.getMonth() === rangeEnd.getMonth() &&
      date.getDate() === rangeEnd.getDate()
    );
  };

  return (
    <div className="relative">
      {label && (
        <label className="mb-2 block text-xs font-semibold text-slate-700">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition w-full"
      >
        <span className={value ? "" : "text-slate-400"}>{value || "Select date range"}</span>
        <CalendarIcon className="w-4 h-4 text-purple-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 p-4 bg-white rounded-lg border border-slate-200 shadow-lg">
          <div className="flex gap-4 mb-4">
            <Calendar
              initialDate={currentMonth}
              selectedDate={rangeStart ?? undefined}
              onSelect={handleDateClick}
            />
            <Calendar
              initialDate={nextMonth}
              selectedDate={rangeEnd ?? undefined}
              onSelect={handleDateClick}
            />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!rangeStart || !rangeEnd}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#7c3aed] rounded-lg hover:bg-[#6d28d9] transition disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
