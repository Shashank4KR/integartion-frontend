"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";
import FinanceDateRangePicker from "@/components/dashboard/finance/FinanceDateRangePicker";

interface FinanceFiltersProps {
  academicYear: string;
  onAcademicYearChange: (value: string) => void;
  academicYearOptions?: string[];
  classGrade: string;
  onClassGradeChange: (value: string) => void;
  classOptions?: string[];
  feeType: string;
  onFeeTypeChange: (value: string) => void;
  feeTypeOptions?: string[];
  paymentStatus: string;
  onPaymentStatusChange: (value: string) => void;
  paymentStatusOptions?: string[];
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

const DEFAULT_PAYMENT_STATUS_OPTIONS = ["All Status", "Paid", "Pending", "Failed", "Refunded"];

export default function FinanceFilters({
  academicYear,
  onAcademicYearChange,
  academicYearOptions = ["All Academic Years"],
  classGrade,
  onClassGradeChange,
  classOptions = ["All Classes"],
  feeType,
  onFeeTypeChange,
  feeTypeOptions = ["All Fee Types", "Tuition Fee", "Transport Fee", "Admission Fee", "Exam Fee", "Hostel Fee", "Other Fees"],
  paymentStatus,
  onPaymentStatusChange,
  paymentStatusOptions = DEFAULT_PAYMENT_STATUS_OPTIONS,
  dateRange,
  onDateRangeChange,
  onFilter,
  onReset,
}: FinanceFiltersProps) {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 items-end gap-3">
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
            label="Payment Status"
            value={paymentStatus}
            options={paymentStatusOptions}
            onChange={onPaymentStatusChange}
          />
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Date Range</label>
            <FinanceDateRangePicker value={dateRange} onChange={onDateRangeChange} />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setFilterPanelOpen((open) => !open);
              }}
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
