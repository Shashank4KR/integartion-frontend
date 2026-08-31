"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarIcon, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Dropdown from "@/components/shared/Dropdown";
import Calendar from "@/components/shared/Calendar";

const ACADEMIC_YEAR_OPTIONS = ["2024-25", "2025-26"];
const INVOICE_TYPE_OPTIONS = ["All Types", "Fee Invoice", "Salary Invoice", "Expense Invoice", "Other Invoice"];
const CLASS_GRADE_OPTIONS = ["All Classes", "VIII - A", "VI - B", "IX - A", "VIII - B", "IX - B", "VI - A", "V - B", "VIII - C"];
const STATUS_OPTIONS = ["All Status", "Paid", "Partial", "Overdue", "Pending"];

function formatDate(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, "0")}, ${date.getFullYear()}`;
}

interface InvoiceFiltersProps {
  academicYear: string;
  onAcademicYearChange: (value: string) => void;
  invoiceType: string;
  onInvoiceTypeChange: (value: string) => void;
  classGrade: string;
  onClassGradeChange: (value: string) => void;
  classOptions?: string[];
  status: string;
  onStatusChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

export default function InvoiceFilters({
  academicYear,
  onAcademicYearChange,
  invoiceType,
  onInvoiceTypeChange,
  classGrade,
  onClassGradeChange,
  classOptions,
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  search,
  onSearchChange,
  onFilter,
  onReset,
}: InvoiceFiltersProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateContainerRef = useRef<HTMLDivElement>(null);

  const availableClassOptions = classOptions && classOptions.length > 0 ? classOptions : CLASS_GRADE_OPTIONS;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateContainerRef.current && !dateContainerRef.current.contains(event.target as Node)) {
        setDateOpen(false);
      }
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(undefined);
    } else if (date < startDate) {
      setStartDate(date);
    } else {
      setEndDate(date);
      const formatted = `${formatDate(startDate)} - ${formatDate(date)}`;
      onDateRangeChange(formatted);
      setDateOpen(false);
    }
  };

  const displayValue = dateRange || (startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : "Select date range");

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Academic Year</label>
          <Dropdown value={academicYear} options={ACADEMIC_YEAR_OPTIONS} onChange={onAcademicYearChange} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Invoice Type</label>
          <Dropdown value={invoiceType} options={INVOICE_TYPE_OPTIONS} onChange={onInvoiceTypeChange} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Class / Grade</label>
          <Dropdown value={classGrade} options={availableClassOptions} onChange={onClassGradeChange} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
          <Dropdown value={status} options={STATUS_OPTIONS} onChange={onStatusChange} />
        </div>
        <div className="flex-1 min-w-[180px]" ref={dateContainerRef}>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Date Range</label>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal text-xs gap-2",
              !displayValue && "text-slate-500"
            )}
            onClick={() => setDateOpen((open) => !open)}
          >
            <CalendarIcon className="h-4 w-4 text-[#7c3aed]" />
            <span className="truncate">{displayValue}</span>
          </Button>
          {dateOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 rounded-md border border-slate-200 bg-white shadow-lg p-3">
              <Calendar
                selectedDate={startDate}
                onSelect={handleDateSelect}
              />
              {startDate && !endDate && (
                <p className="text-xs text-slate-500 mt-2 text-center">Select end date</p>
              )}
              {startDate && endDate && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setStartDate(undefined);
                      setEndDate(undefined);
                      onDateRangeChange("");
                    }}
                    className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      onDateRangeChange(displayValue);
                      setDateOpen(false);
                    }}
                    className="flex-1 rounded-md bg-[#7c3aed] px-2 py-1.5 text-xs font-medium text-white hover:brightness-110 transition"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by invoice no., student..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2" ref={containerRef}>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-[#7c3aed] text-[#7c3aed] hover:bg-purple-50"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            {filtersOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                    <Dropdown value={academicYear} options={ACADEMIC_YEAR_OPTIONS} onChange={onAcademicYearChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Type</label>
                    <Dropdown value={invoiceType} options={INVOICE_TYPE_OPTIONS} onChange={onInvoiceTypeChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Grade</label>
                    <Dropdown value={classGrade} options={CLASS_GRADE_OPTIONS} onChange={onClassGradeChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <Dropdown value={status} options={STATUS_OPTIONS} onChange={onStatusChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date Range</label>
                    <input
                      type="text"
                      value={dateRange}
                      onChange={(e) => onDateRangeChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                      placeholder="Select date range"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={onReset}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        onFilter();
                        setFiltersOpen(false);
                      }}
                      className="flex-1 rounded-lg bg-[#7c3aed] px-3 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
