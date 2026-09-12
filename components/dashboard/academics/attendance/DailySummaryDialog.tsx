"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, CalendarDays, UserX, UserCheck, Clock } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import DatePicker from "@/components/shared/DatePicker";
import { getAllAttendance } from "@/lib/services/attendanceService";
import type { AttendanceResponse } from "@/types/entities/attendance";
import type { ClassResponse } from "@/types/entities/class";
import type { StudentResponse } from "@/types/entities/student";

interface DailySummaryDialogProps {
  open: boolean;
  onClose: () => void;
  token: string;
  classes: ClassResponse[];
  initialClassId?: string;
  initialDateISO?: string;
  students?: StudentResponse[];
}

export default function DailySummaryDialog({
  open,
  onClose,
  token,
  classes,
  initialClassId = "",
  initialDateISO = "",
  students = [],
}: DailySummaryDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedDateISO, setSelectedDateISO] = useState(initialDateISO || new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);

  useEffect(() => {
    if (open) {
      if (initialClassId) setSelectedClassId(initialClassId);
      if (initialDateISO) setSelectedDateISO(initialDateISO);
      setError(null);
    }
  }, [open, initialClassId, initialDateISO]);

  const loadDailyData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAttendance(token, {
        class_id: selectedClassId || undefined,
        start_date: selectedDateISO,
        end_date: selectedDateISO,
      });
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load daily summary.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [token, selectedClassId, selectedDateISO]);

  useEffect(() => {
    if (open && token) {
      loadDailyData();
    }
  }, [open, token, loadDailyData]);

  const classOptions = [
    { value: "", label: "All Classes" },
    ...classes.map((c) => ({ value: c.id, label: `${c.class_name} — ${c.section}` })),
  ];

  const studentMap = new Map(students.map((s) => [s.id, s]));

  // Compute daily metrics per student
  const studentRecordsMap = new Map<string, AttendanceResponse[]>();
  records.forEach((r) => {
    const list = studentRecordsMap.get(r.student_id) || [];
    list.push(r);
    studentRecordsMap.set(r.student_id, list);
  });

  const absentStudents: { id: string; name: string; rollNo: string; status: string }[] = [];
  const presentStudents: { id: string; name: string; rollNo: string; status: string }[] = [];

  studentRecordsMap.forEach((rList, studentId) => {
    const hasAbsent = rList.some((r) => r.status === "ABSENT");
    const hasLate = rList.some((r) => r.status === "LATE");
    const student = studentMap.get(studentId);
    const name = student
      ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() || student.admission_no
      : "Student";
    const rollNo = student?.roll_no || "N/A";

    if (hasAbsent) {
      absentStudents.push({ id: studentId, name, rollNo, status: "ABSENT" });
    } else if (hasLate) {
      absentStudents.push({ id: studentId, name, rollNo, status: "LATE" });
    } else {
      presentStudents.push({ id: studentId, name, rollNo, status: "PRESENT" });
    }
  });

  const totalTracked = studentRecordsMap.size;
  const presentCount = presentStudents.length;
  const absentCount = absentStudents.filter((s) => s.status === "ABSENT").length;
  const lateCount = absentStudents.filter((s) => s.status === "LATE").length;
  const attendancePct = totalTracked > 0 ? Math.round((presentCount / totalTracked) * 100) : 0;

  return (
    <Modal open={open} onClose={onClose} title="Daily Attendance Summary" maxWidth="max-w-3xl">
      <div className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
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
            <label className="mb-1 block text-xs font-medium text-slate-600">Summary Date</label>
            <DatePicker value={selectedDateISO} onChange={setSelectedDateISO} />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-center">
            <span className="text-xs text-red-600 block font-medium">Daily Attendance %</span>
            <span className="text-xl font-bold text-red-700">{attendancePct}%</span>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
            <span className="text-xs text-emerald-600 block font-medium">Present Students</span>
            <span className="text-xl font-bold text-emerald-700">{presentCount}</span>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-center">
            <span className="text-xs text-rose-600 block font-medium">Absent Students</span>
            <span className="text-xl font-bold text-rose-700">{absentCount}</span>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-center">
            <span className="text-xs text-amber-600 block font-medium">Late Arrivals</span>
            <span className="text-xl font-bold text-amber-700">{lateCount}</span>
          </div>
        </div>

        {/* Absent / Late List */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <UserX className="h-4 w-4 text-red-500" />
            Absent & Late Students List ({absentStudents.length})
          </h4>

          {loading ? (
            <div className="flex items-center justify-center p-6 text-xs text-slate-500 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              Loading daily summary...
            </div>
          ) : absentStudents.length === 0 ? (
            <div className="p-4 text-center text-xs text-emerald-600 bg-emerald-50/50 rounded-lg">
              🎉 All tracked students were present on {selectedDateISO}!
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto divide-y divide-slate-100">
              {absentStudents.map((s) => (
                <div key={s.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{s.name}</span>
                    <span className="text-slate-400 ml-2">(Roll: {s.rollNo})</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.status === "ABSENT" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
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
