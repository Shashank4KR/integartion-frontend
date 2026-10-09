"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import Calendar from "./Calendar";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "left" | "right" | "auto";
  direction?: "down" | "up" | "auto";
  placeholder?: string;
  className?: string;
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

export default function DatePicker({
  value,
  onChange,
  open,
  onOpenChange,
  align = "auto",
  direction = "down",
  placeholder = "Select date",
  className = "",
}: DatePickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selected, setSelected] = useState<Date>(() => parseToDate(value));
  const [placement, setPlacement] = useState<{
    vertical: "down" | "up";
    horizontal: "left" | "right";
  }>({ vertical: direction === "up" ? "up" : "down", horizontal: align === "right" ? "right" : "left" });

  const isControlled = open !== undefined;
  const popoverOpen = isControlled ? open : internalOpen;

  const openPopover = useCallback(
    (next: boolean) => {
      if (isControlled) {
        onOpenChange?.(next);
      } else {
        setInternalOpen(next);
      }
    },
    [isControlled, onOpenChange]
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popoverOpen || !ref.current) return;

    const computePlacement = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      let vertical: "down" | "up" = "down";
      if (direction === "up") {
        vertical = "up";
      } else if (direction === "down") {
        vertical = "down";
      } else {
        // "auto": only flip upward if space below is severely cramped and space above is ample
        if (spaceBelow < 280 && spaceAbove > 330) {
          vertical = "up";
        } else {
          vertical = "down";
        }
      }

      let horizontal: "left" | "right" = "left";
      if (align === "left") {
        horizontal = "left";
      } else if (align === "right") {
        horizontal = "right";
      } else {
        // "auto": check parent modal / container alignment
        const container = ref.current.closest("[role='dialog'], .max-w-lg, .max-w-md, .max-w-xl, .max-w-2xl, .max-w-3xl, .max-w-4xl, .rounded-2xl");
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const buttonCenter = rect.left + rect.width / 2;
          const containerCenter = containerRect.left + containerRect.width / 2;
          if (buttonCenter > containerCenter + 16) {
            horizontal = "right";
          } else {
            horizontal = "left";
          }
        } else {
          if (rect.left + 300 > window.innerWidth && rect.right >= 300) {
            horizontal = "right";
          } else {
            horizontal = "left";
          }
        }
      }

      setPlacement({ vertical, horizontal });
    };

    computePlacement();
    window.addEventListener("resize", computePlacement);
    return () => window.removeEventListener("resize", computePlacement);
  }, [popoverOpen, align, direction]);

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
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => openPopover(!popoverOpen)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 pl-9 pr-4 text-sm font-medium text-slate-700 transition hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100"
      >
        <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c3aed]" />
        <span className="flex-1 text-left">{formatDisplay(value) || placeholder}</span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
      </button>

      {popoverOpen && (
        <div
          className={`absolute z-[120] w-72 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xl ring-1 ring-black/5 ${
            placement.vertical === "up" ? "bottom-full mb-2" : "top-full mt-2"
          } ${placement.horizontal === "right" ? "right-0" : "left-0"}`}
        >
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
