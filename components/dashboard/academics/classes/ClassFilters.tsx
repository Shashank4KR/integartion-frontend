"use client";

import { Search } from "lucide-react";
import Card from "@/components/shared/Card";

export default function ClassFilters({
  search,
  onSearchChange,
  academicYear,
  onAcademicYearChange,
  section,
  onSectionChange,
  teacherId,
  onTeacherIdChange,
  classLevel,
  onClassLevelChange,
  status,
  onStatusChange,
  academicYearOptions,
  sectionOptions,
  teacherOptions,
  classLevelOptions,
  onClear,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  academicYear: string;
  onAcademicYearChange: (value: string) => void;
  section: string;
  onSectionChange: (value: string) => void;
  teacherId: string;
  onTeacherIdChange: (value: string) => void;
  classLevel: string;
  onClassLevelChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  academicYearOptions: string[];
  sectionOptions: string[];
  teacherOptions: { id: string; label: string }[];
  classLevelOptions: string[];
  onClear: () => void;
}) {
  const hasFilters = search || academicYear || section || teacherId || classLevel || status;

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by class name, section or academic year..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={academicYear}
              onChange={(e) => onAcademicYearChange(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            >
              <option value="">All Academic Years</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={section}
              onChange={(e) => onSectionChange(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            >
              <option value="">All Sections</option>
              {sectionOptions.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
            <select
              value={teacherId}
              onChange={(e) => onTeacherIdChange(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            >
              <option value="">All Teachers</option>
              {teacherOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={classLevel}
              onChange={(e) => onClassLevelChange(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            >
              <option value="">Class Level</option>
              {classLevelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            >
              <option value="">Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={onClear}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

