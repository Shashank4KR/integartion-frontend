"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";

interface FeesManagementFiltersProps {
  academicYear: string;
  onAcademicYearChange: (value: string) => void;
  academicYearOptions?: string[];
  classGrade: string;
  onClassGradeChange: (value: string) => void;
  classOptions?: string[];
  feeType: string;
  onFeeTypeChange: (value: string) => void;
  feeTypeOptions?: string[];
  installment: string;
  onInstallmentChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

const DEFAULT_FEE_TYPE_OPTIONS = ["All Fee Types", "Tuition Fee", "Transport Fee", "Admission Fee", "Exam Fee", "Hostel Fee", "Other Fees"];
const INSTALLMENT_OPTIONS = ["All Installments", "Installment 1", "Installment 2", "Installment 3", "Full Payment"];
const STATUS_OPTIONS = ["All Status", "Paid", "Partial", "Overdue", "Pending"];

export default function FeesManagementFilters({
  academicYear,
  onAcademicYearChange,
  academicYearOptions = ["All Academic Years"],
  classGrade,
  onClassGradeChange,
  classOptions = ["All Classes"],
  feeType,
  onFeeTypeChange,
  feeTypeOptions = DEFAULT_FEE_TYPE_OPTIONS,
  installment,
  onInstallmentChange,
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onFilter,
  onReset,
}: FeesManagementFiltersProps) {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 items-end gap-3">
          <Dropdown
            label="Academic Year"
            value={academicYear}
            options={academicYearOptions}
            onChange={onAcademicYearChange}
          />
          <Dropdown
            label="Class / Grade"
            value={classGrade}
            options={classOptions}
            onChange={onClassGradeChange}
          />
          <Dropdown
            label="Fee Type"
            value={feeType}
            options={feeTypeOptions}
            onChange={onFeeTypeChange}
          />
          <Dropdown
            label="Installment"
            value={installment}
            options={INSTALLMENT_OPTIONS}
            onChange={onInstallmentChange}
          />
          <Dropdown
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={onStatusChange}
          />
          <div className="relative">
            <label className="mb-2 block text-xs font-semibold text-slate-700">Date Range</label>
            <button
              type="button"
              onClick={() => setDateMenuOpen((open) => !open)}
              className="flex items-center justify-between gap-2 w-full px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{dateRange || "All Dates"}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
            {dateMenuOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {["All Dates", "This Week", "This Month", "Last 30 Days", "This Term", "Past 90 Days"].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      onDateRangeChange(range === "All Dates" ? "" : range);
                      setDateMenuOpen(false);
                    }}
                    className="block w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-[#7c3aed]"
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilterPanelOpen((open) => !open)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#7c3aed] bg-white px-3 py-2 text-sm font-semibold text-[#7c3aed] hover:bg-purple-50 transition whitespace-nowrap h-10"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {filterPanelOpen && (
        <div className="mt-3 bg-white rounded-lg border border-slate-200 p-4 relative">
          <button
            onClick={() => setFilterPanelOpen(false)}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-xs font-semibold text-slate-700 mb-3">Additional Filters</p>
          <div className="flex flex-wrap gap-3">
            {["High Priority", "Low Balance", "Overdue", "Upcoming"].map((filter) => (
              <button
                key={filter}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-purple-50 hover:text-[#7c3aed] hover:border-[#7c3aed] transition"
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={onReset}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setFilterPanelOpen(false);
                onFilter();
              }}
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

import { ChevronDown } from "lucide-react";
