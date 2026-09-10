"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, CalendarClock, Download } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import { getAllAttendance } from "@/lib/services/attendanceService";
import type { AttendanceResponse } from "@/types/entities/attendance";
import type { ClassResponse } from "@/types/entities/class";
import type { StudentResponse } from "@/types/entities/student";

interface MonthlyReportDialogProps {
  open: boolean;
  onClose: () => void;
  token: string;
  classes: ClassResponse[];
  initialClassId?: string;
  students?: StudentResponse[];
}

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const YEARS = [
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
];

export default function MonthlyReportDialog({
  open,
  onClose,
  token,
  classes,
  initialClassId = "",
  students = [],
}: MonthlyReportDialogProps) {
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const currentYear = String(new Date().getFullYear());

  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);

  useEffect(() => {
    if (open) {
      if (initialClassId) setSelectedClassId(initialClassId);
      setError(null);
    }
  }, [open, initialClassId]);

  const loadMonthlyData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const year = parseInt(selectedYear, 10);
    const month = parseInt(selectedMonth, 10);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    try {
      const data = await getAllAttendance(token, {
        class_id: selectedClassId || undefined,
        start_date: startDate,
        end_date: endDate,
      });
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load monthly attendance report.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [token, selectedClassId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (open && token) {
      loadMonthlyData();
    }
  }, [open, token, loadMonthlyData]);

  const classOptions = [
    { value: "", label: "All Classes" },
    ...classes.map((c) => ({ value: c.id, label: `${c.class_name} — ${c.section}` })),
  ];

  const studentMap = new Map(students.map((s) => [s.id, s]));

  // Compute monthly stats per student
  const studentStatsMap = new Map<
    string,
    { present: number; absent: number; late: number; dates: Set<string> }
  >();

  const uniqueDates = new Set<string>();

  records.forEach((r) => {
    uniqueDates.add(r.attendance_date);
    const existing = studentStatsMap.get(r.student_id) || {
      present: 0,
      absent: 0,
      late: 0,
      dates: new Set<string>(),
    };
    existing.dates.add(r.attendance_date);
    if (r.status === "PRESENT") existing.present++;
    else if (r.status === "ABSENT") existing.absent++;
    else if (r.status === "LATE") existing.late++;
    studentStatsMap.set(r.student_id, existing);
  });

  const totalWorkingDays = uniqueDates.size;

  const studentRows = Array.from(studentStatsMap.entries()).map(([studentId, stats]) => {
    const student = studentMap.get(studentId);
    const name = student
      ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() || student.admission_no
      : "Student";
    const rollNo = student?.roll_no || "N/A";
    const totalRecorded = stats.present + stats.absent + stats.late;
    const percentage = totalRecorded > 0 ? Math.round((stats.present / totalRecorded) * 100) : 0;

    return {
      studentId,
      name,
      rollNo,
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      activeDays: stats.dates.size,
      percentage,
    };
  });

  return (
    <Modal open={open} onClose={onClose} title="Monthly Attendance Report" maxWidth="max-w-4xl">
      <div className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Class</label>
            <Dropdown
              value={selectedClassId}
              items={classOptions}
              onChange={setSelectedClassId}
              className="w-full text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Month</label>
            <Dropdown
              value={selectedMonth}
              items={MONTHS}
              onChange={setSelectedMonth}
              className="w-full text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Year</label>
            <Dropdown
              value={selectedYear}
              items={YEARS}
              onChange={setSelectedYear}
              className="w-full text-xs"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-center">
            <span className="text-xs text-teal-600 block font-medium">Working Days Recorded</span>
            <span className="text-xl font-bold text-teal-700">{totalWorkingDays}</span>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-center">
            <span className="text-xs text-blue-600 block font-medium">Students Tracked</span>
            <span className="text-xl font-bold text-blue-700">{studentRows.length}</span>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-purple-600 block font-medium">Monthly Avg Attendance</span>
            <span className="text-xl font-bold text-purple-700">
              {studentRows.length > 0
                ? Math.round(
                    studentRows.reduce((acc, curr) => acc + curr.percentage, 0) / studentRows.length
                  )
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Student Monthly Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white max-h-[350px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-sm text-slate-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              Calculating monthly attendance report...
            </div>
          ) : studentRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No monthly attendance records found for this period.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll No</th>
                  <th className="p-3 text-center">Present</th>
                  <th className="p-3 text-center">Absent</th>
                  <th className="p-3 text-center">Late</th>
                  <th className="p-3 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {studentRows.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800">{row.name}</td>
                    <td className="p-3">{row.rollNo}</td>
                    <td className="p-3 text-center font-semibold text-emerald-600">{row.present}</td>
                    <td className="p-3 text-center font-semibold text-red-600">{row.absent}</td>
                    <td className="p-3 text-center font-semibold text-amber-600">{row.late}</td>
                    <td className="p-3 text-right font-bold text-slate-800">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md ${
                          row.percentage >= 75
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
