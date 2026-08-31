"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import Calendar from "./Calendar";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const formatDisplay = (isoDate: string): string => {
  if (!isoDate) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const day = parseInt(parts[2], 10);
  const month = months[parseInt(parts[1], 10) - 1];
  const year = parts[0];
  if (Number.isNaN(day) || !month) return isoDate;
  return `${day} ${month} ${year}`;
};

const parseToDate = (s: string): Date => {
  const parts = s.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) return new Date(y, m, d);
  }
  return new Date();
};

export default function DatePicker({ value, onChange, open, onOpenChange }: DatePickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selected, setSelected] = useState<Date>(() => parseToDate(value));
  const [openUpward, setOpenUpward] = useState(false);
  const isControlled = open !== undefined;
  const popoverOpen = isControlled ? open : internalOpen;

  const openPopover = useCallback((next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  }, [isControlled, onOpenChange]);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (popoverOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 320 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [popoverOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        openPopover(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPopover]);

  useEffect(() => {
    setSelected(parseToDate(value));
  }, [value]);

  const handleSelect = (date: Date) => {
    setSelected(date);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    openPopover(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => openPopover(!popoverOpen)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 pl-9 pr-4 text-sm font-medium text-slate-700 transition hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100"
      >
        <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c3aed]" />
        <span className="flex-1 text-left">{formatDisplay(value) || "Select date"}</span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
      </button>

      {popoverOpen && (
        <div className={`absolute right-0 z-[60] w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl ${openUpward ? "bottom-full mb-2" : "top-full mt-2"}`}>
          <Calendar
            initialDate={selected}
            selectedDate={selected}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}
