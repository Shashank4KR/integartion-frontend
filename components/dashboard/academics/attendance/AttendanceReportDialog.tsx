"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, FileText, Calendar, Filter } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import DatePicker from "@/components/shared/DatePicker";
import { getAllAttendance } from "@/lib/services/attendanceService";
import type { AttendanceResponse } from "@/types/entities/attendance";
import type { ClassResponse } from "@/types/entities/class";
import type { StudentResponse } from "@/types/entities/student";
import type { ClassSubjectSummary } from "@/types/entities/class-subject-summary";

interface AttendanceReportDialogProps {
  open: boolean;
  onClose: () => void;
  token: string;
  classes: ClassResponse[];
  initialClassId?: string;
  initialDateISO?: string;
  subjects?: ClassSubjectSummary[];
  students?: StudentResponse[];
}

export default function AttendanceReportDialog({
  open,
  onClose,
  token,
  classes,
  initialClassId = "",
  initialDateISO = "",
  subjects = [],
  students = [],
}: AttendanceReportDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [startDateISO, setStartDateISO] = useState(initialDateISO || new Date().toISOString().split("T")[0]);
  const [endDateISO, setEndDateISO] = useState(initialDateISO || new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);

  useEffect(() => {
    if (open) {
      if (initialClassId) setSelectedClassId(initialClassId);
      if (initialDateISO) {
        setStartDateISO(initialDateISO);
        setEndDateISO(initialDateISO);
      }
      setSelectedSubjectId("");
      setError(null);
    }
  }, [open, initialClassId, initialDateISO]);

  const loadReport = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAttendance(token, {
        class_id: selectedClassId || undefined,
        subject_id: selectedSubjectId || undefined,
        start_date: startDateISO,
        end_date: endDateISO,
      });
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attendance report.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [token, selectedClassId, selectedSubjectId, startDateISO, endDateISO]);

  useEffect(() => {
    if (open && token) {
      loadReport();
    }
  }, [open, token, loadReport]);

  const studentMap = new Map(students.map((s) => [s.id, s]));
  const classMap = new Map(classes.map((c) => [c.id, `${c.class_name} - ${c.section}`]));
  const subjectMap = new Map(subjects.map((sub) => [sub.id, sub.subject_name]));

  const total = records.length;
  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;
  const presentPct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const classOptions = [
    { value: "", label: "All Classes" },
    ...classes.map((c) => ({ value: c.id, label: `${c.class_name} — ${c.section}` })),
  ];

  const subjectOptions = [
    { value: "", label: "All Subjects" },
    ...subjects.map((s) => ({ value: s.id, label: s.subject_name })),
  ];

  return (
    <Modal open={open} onClose={onClose} title="Attendance Report" maxWidth="max-w-4xl">
      <div className="space-y-5">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
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
            <label className="mb-1 block text-xs font-medium text-slate-600">Subject</label>
            <Dropdown
              value={selectedSubjectId}
              items={subjectOptions}
              onChange={setSelectedSubjectId}
              className="w-full text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Start Date</label>
            <DatePicker value={startDateISO} onChange={setStartDateISO} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">End Date</label>
            <DatePicker value={endDateISO} onChange={setEndDateISO} />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <span className="text-xs text-slate-500 block">Total Records</span>
            <span className="text-xl font-bold text-slate-800">{total}</span>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
            <span className="text-xs text-emerald-600 block">Present Rate</span>
            <span className="text-xl font-bold text-emerald-700">{presentPct}%</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">{presentCount} present</span>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-center">
            <span className="text-xs text-red-600 block">Absent Count</span>
            <span className="text-xl font-bold text-red-700">{absentCount}</span>
          </div>
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-center">
            <span className="text-xs text-teal-600 block">Late Count</span>
            <span className="text-xl font-bold text-teal-700">{lateCount}</span>
          </div>
        </div>

        {/* Report Data Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white max-h-[350px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-sm text-slate-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              Loading attendance report data from database...
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No attendance records found for the selected filter criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {records.map((r) => {
                  const student = studentMap.get(r.student_id);
                  const name = student
                    ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() || student.admission_no
                    : "Student";
                  const className = classMap.get(r.class_id) || "—";
                  const subjectName = subjectMap.get(r.subject_id) || "—";
                  const statusColor =
                    r.status === "PRESENT"
                      ? "bg-emerald-100 text-emerald-800"
                      : r.status === "ABSENT"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800";

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-slate-800">{r.attendance_date}</td>
                      <td className="p-3 font-medium">{name}</td>
                      <td className="p-3">{className}</td>
                      <td className="p-3">{subjectName}</td>
                      <td className="p-3">Period {r.period_no}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
            Close Report
          </button>
        </div>
      </div>
    </Modal>
  );
}
