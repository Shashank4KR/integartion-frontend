"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarIcon, Search, X } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";
import DatePicker from "@/components/shared/DatePicker";
import type { AttendanceStatus } from "@/types/entities/attendance";

interface AttendanceFiltersProps {
  onSearch: () => void;
  onFilter: () => void;
  academicYearOptions: string[];
  academicYear: string;
  onAcademicYearChange: (value: string) => void;
  academicYearLoading: boolean;
  classOptions: { value: string; label: string }[];
  classGrade: string;
  onClassGradeChange: (value: string) => void;
  classLoading: boolean;
  date: string;
  onDateChange: (value: string) => void;
  viewType: string;
  onViewTypeChange: (value: string) => void;
  subjectOptions: { value: string; label: string }[];
  subject: string;
  onSubjectChange: (value: string) => void;
  subjectLoading: boolean;
  statusFilter: AttendanceStatus | "";
  onStatusFilter: (status: AttendanceStatus) => void;
  onResetFilters: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  calendarOpen?: boolean;
  onCalendarOpenChange?: (open: boolean) => void;
}

export default function AttendanceFilters({
  onSearch,
  onFilter,
  academicYearOptions,
  academicYear,
  onAcademicYearChange,
  academicYearLoading,
  classOptions,
  classGrade,
  onClassGradeChange,
  classLoading,
  date,
  onDateChange,
  viewType,
  onViewTypeChange,
  subjectOptions,
  subject,
  onSubjectChange,
  subjectLoading,
  statusFilter,
  onStatusFilter,
  onResetFilters,
  searchTerm,
  onSearchChange,
  calendarOpen,
  onCalendarOpenChange,
}: AttendanceFiltersProps) {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dateContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchTerm]);

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[140px]">
            <Dropdown
              label="Academic Year"
              value={academicYear}
              options={academicYearOptions}
              onChange={onAcademicYearChange}
              disabled={academicYearLoading || academicYearOptions.length === 0}
              placeholder="Select academic year"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <Dropdown
              label="Class / Grade"
              value={classGrade}
              items={classOptions}
              onChange={onClassGradeChange}
              disabled={classLoading || classOptions.length === 0}
            />
          </div>
          <div className="flex-1 min-w-[160px]" ref={dateContainerRef}>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Date</label>
            <DatePicker
              value={date}
              onChange={onDateChange}
              open={calendarOpen}
              onOpenChange={onCalendarOpenChange}
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <Dropdown
              label="View Type"
              value={viewType}
              options={["Daily View", "Weekly View", "Monthly View"]}
              onChange={onViewTypeChange}
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <Dropdown
              label="Subject (Optional)"
              value={subject}
              items={subjectOptions}
              onChange={onSubjectChange}
              placeholder="All Subjects"
              disabled={subjectLoading}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex items-center gap-2 rounded-lg border border-[#7c3aed] bg-white px-4 py-2 text-sm font-semibold text-[#7c3aed] hover:bg-purple-50 transition"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </button>
            <button
              type="button"
              onClick={() => { onFilter(); setFilterPanelOpen((p) => !p); }}
              className="inline-flex items-center gap-2 rounded-lg border border-[#7c3aed] bg-white px-4 py-2 text-sm font-semibold text-[#7c3aed] hover:bg-purple-50 transition"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
            </button>
          </div>
        </div>
      </div>

      {filterPanelOpen && (
        <div className="mt-3 bg-white rounded-lg border border-slate-200 p-4 relative">
          <button
            type="button"
            onClick={() => setFilterPanelOpen(false)}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-xs font-semibold text-slate-700 mb-3">Additional Filters</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Present Only", status: "PRESENT" as AttendanceStatus },
              { label: "Absent Only", status: "ABSENT" as AttendanceStatus },
              { label: "Late Only", status: "LATE" as AttendanceStatus },
            ].map(({ label, status }) => (
              <button
                key={label}
                type="button"
                onClick={() => onStatusFilter(status)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === status
                    ? "border-[#7c3aed] bg-purple-50 text-[#7c3aed]"
                    : "border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-[#7c3aed] hover:border-[#7c3aed]"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              disabled
              title="Coming soon"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 opacity-60 cursor-not-allowed transition"
            >
              Low Attendance
            </button>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => { onResetFilters(); setFilterPanelOpen(false); }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setFilterPanelOpen(false)}
              className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
