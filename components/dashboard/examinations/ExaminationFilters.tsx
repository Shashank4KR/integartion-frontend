"use client";

import { useState } from "react";
import { Search, CalendarIcon, X } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";
import DateRangePicker from "@/components/shared/DateRangePicker";

interface ExaminationFiltersProps {
  onSearch: () => void;
  onFilter: () => void;
  onReset: () => void;
  academicYear: string;
  onAcademicYearChange: (value: string) => void;
  examType: string;
  onExamTypeChange: (value: string) => void;
  classId: string;
  onClassIdChange: (value: string) => void;
  term: string;
  onTermChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  dateRangeStart: string;
  dateRangeEnd: string;
  onDateRangeStartChange: (value: string) => void;
  onDateRangeEndChange: (value: string) => void;
  onDateRangeClear: () => void;
  academicYearDisabled?: boolean;
  termDisabled?: boolean;
  classOptions?: { id: string; label: string }[];
  examTypeOptions?: string[];
}

export default function ExaminationFilters({
  onSearch,
  onFilter,
  onReset,
  academicYear,
  onAcademicYearChange,
  examType,
  onExamTypeChange,
  classId,
  onClassIdChange,
  term,
  onTermChange,
  status,
  onStatusChange,
  searchQuery,
  onSearchQueryChange,
  dateRangeStart,
  dateRangeEnd,
  onDateRangeStartChange,
  onDateRangeEndChange,
  onDateRangeClear,
  academicYearDisabled,
  termDisabled,
  classOptions,
  examTypeOptions,
}: ExaminationFiltersProps) {

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] items-end gap-3">
          <div className="col-span-2">
            <label className="mb-2 block text-xs font-semibold text-slate-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search examinations..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>
          <div className="col-span-1">
            <Dropdown
              label="Academic Year"
              value={academicYear}
              options={["2025-26", "2024-25", "2023-24"]}
              onChange={onAcademicYearChange}
            />
          </div>
          <div className="col-span-1">
            <Dropdown
              label="Exam Type"
              value={examType}
              options={examTypeOptions ?? [
                "Unit Test",
                "Periodic Test",
                "Half Yearly",
                "Pre Final",
                "Final",
                "Annual",
                "Others",
              ]}
              onChange={onExamTypeChange}
            />
          </div>
          <div className="col-span-1">
            <Dropdown
              label="Class / Grade"
              value={classId}
              items={classOptions?.map((c) => ({ value: c.id, label: c.label }))}
              onChange={onClassIdChange}
            />
          </div>
          <div className="col-span-1">
            <Dropdown
              label="Term"
              value={term}
              options={["Term 1", "Term 2", "Annual"]}
              onChange={onTermChange}
            />
          </div>
          <div className="col-span-1">
            <Dropdown
              label="Status"
              value={status}
              options={["Upcoming", "Ongoing", "Completed"]}
              onChange={onStatusChange}
            />
          </div>
          <div className="col-span-1">
            <DateRangePicker
              startDate={dateRangeStart}
              endDate={dateRangeEnd}
              onStartDateChange={onDateRangeStartChange}
              onEndDateChange={onDateRangeEndChange}
              onClear={onDateRangeClear}
            />
          </div>
          <div className="col-span-1">
            <button
              onClick={onSearch}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#7c3aed] bg-white px-3 py-2 text-sm font-semibold text-[#7c3aed] hover:bg-purple-50 transition whitespace-nowrap h-10"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
          <div className="col-span-1">
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition whitespace-nowrap h-10"
            >
              <X className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
