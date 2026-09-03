"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import DatePicker from "@/components/shared/DatePicker";
import { createBulkAttendance, getAllAttendance } from "@/lib/services/attendanceService";
import type { StudentResponse } from "@/types/entities/student";
import type { AttendanceStatus } from "@/types/entities/attendance";

interface BulkAttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  classId: string;
  dateDisplay: string;
  students: StudentResponse[];
  subjects: { value: string; label: string }[];
  teachers: { value: string; label: string }[];
  markedBy: string;
}

function toISODate(display: string): string {
  const d = new Date(display);
  if (Number.isNaN(d.getTime())) return display;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; className: string }[] = [
  { value: "PRESENT", label: "Present", className: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200" },
  { value: "ABSENT", label: "Absent", className: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200" },
  { value: "LATE", label: "Late", className: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200" },
];

export default function BulkAttendanceDialog({
  open,
  onClose,
  onSuccess,
  token,
  classId,
  dateDisplay,
  students,
  subjects,
  teachers,
  markedBy,
}: BulkAttendanceDialogProps) {
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [selectedDate, setSelectedDate] = useState(dateDisplay);
  const [periodNo, setPeriodNo] = useState("1");
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setSubjectId("");
      setTeacherId("");
      setSelectedDate(dateDisplay);
      setPeriodNo("1");
      setStatuses({});
      setError(null);
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [open, dateDisplay]);

  const validationError = (() => {
    if (!subjectId) return "Please select a subject.";
    if (!teacherId) return "Please select a teacher.";
    if (!selectedDate) return "Please select a date.";
    if (!periodNo || Number.isNaN(Number(periodNo)) || Number(periodNo) < 1) return "Please enter a valid period number.";
    const unmarked = students.filter((s) => !statuses[s.id]);
    if (unmarked.length > 0) {
      return `Please mark attendance for all students. ${unmarked.length} student(s) remaining.`;
    }
    return null;
  })();

  const setStudentStatus = useCallback((studentId: string, s: AttendanceStatus) => {
    setStatuses((prev) => {
      const next = { ...prev };
      if (next[studentId] === s) {
        delete next[studentId];
      } else {
        next[studentId] = s;
      }
      return next;
    });
  }, []);

  const markAll = useCallback((s: AttendanceStatus) => {
    setStatuses((prev) => {
      const next: Record<string, AttendanceStatus> = {};
      students.forEach((st) => {
        next[st.id] = s;
      });
      return next;
    });
  }, [students]);

  const handleSubmit = useCallback(async () => {
    if (validationError || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const records = students
        .filter((s) => statuses[s.id])
        .map((s) => ({
          student_id: s.id,
          status: statuses[s.id]!,
        }));

      const apiDate = toISODate(selectedDate);
      const period = Number(periodNo);

      const existing = await getAllAttendance(token, {
        class_id: classId,
        subject_id: subjectId,
        start_date: apiDate,
        end_date: apiDate,
      });

      const duplicates = existing.filter(
        (r) => r.period_no === period && records.some((rec) => rec.student_id === r.student_id),
      );

      if (duplicates.length > 0) {
        const studentNames = duplicates
          .map((r) => {
            const student = students.find((s) => s.id === r.student_id);
            return student
              ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() || student.admission_no || r.student_id
              : r.student_id;
          })
          .join(", ");
        setError(
          `Attendance has already been recorded for the following student(s), subject, date, and period: ${studentNames}. Please use the Edit action to update existing records.`,
        );
        submittingRef.current = false;
        setSubmitting(false);
        return;
      }

      await createBulkAttendance(token, {
        class_id: classId,
        subject_id: subjectId,
        teacher_id: teacherId,
        attendance_date: apiDate,
        period_no: period,
        marked_by: markedBy,
        records,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit bulk attendance.");
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [validationError, token, classId, subjectId, teacherId, selectedDate, periodNo, markedBy, students, statuses, onSuccess, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="Bulk Attendance" maxWidth="max-w-4xl">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Subject</label>
            <Dropdown
              value={subjectId}
              items={subjects}
              placeholder="Select Subject"
              onChange={setSubjectId}
              className="text-sm w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Teacher</label>
            <Dropdown
              value={teacherId}
              items={teachers}
              placeholder="Select Teacher"
              onChange={setTeacherId}
              className="text-sm w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Date</label>
            <DatePicker value={selectedDate} onChange={setSelectedDate} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Period</label>
            <input
              type="number"
              min={1}
              value={periodNo}
              onChange={(e) => setPeriodNo(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100"
              placeholder="Period no."
            />
          </div>
        </div>

        {students.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            No students found in the selected class.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 px-4 py-2 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-700">
                Students ({students.length})
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => markAll("PRESENT")} className="text-xs text-green-600 hover:underline">
                  Mark All Present
                </button>
                <button type="button" onClick={() => markAll("ABSENT")} className="text-xs text-red-600 hover:underline">
                  Mark All Absent
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const selectedStatus = statuses[student.id];
                    return (
                      <tr key={student.id} className="border-b border-slate-50">
                        <td className="px-4 py-3 text-slate-700">{student.roll_no || student.admission_no || "—"}</td>
                        <td className="px-4 py-3 text-slate-900">
                          {`${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() || student.admission_no || "Unknown"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setStudentStatus(student.id, opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                                  selectedStatus === opt.value ? opt.className : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!!validationError || submitting}
            className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
          >
            {submitting ? "Saving…" : "Save Bulk Attendance"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
