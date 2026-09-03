"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import DatePicker from "@/components/shared/DatePicker";
import { createAttendance, getAllAttendance } from "@/lib/services/attendanceService";
import type { StudentResponse } from "@/types/entities/student";
import type { AttendanceStatus } from "@/types/entities/attendance";

interface MarkAttendanceDialogProps {
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

export default function MarkAttendanceDialog({
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
}: MarkAttendanceDialogProps) {
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [selectedDate, setSelectedDate] = useState(dateDisplay);
  const [periodNo, setPeriodNo] = useState("1");
  const [status, setStatus] = useState<AttendanceStatus>("PRESENT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setStudentId("");
      setSubjectId("");
      setTeacherId("");
      setSelectedDate(dateDisplay);
      setPeriodNo("1");
      setStatus("PRESENT");
      setError(null);
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [open, dateDisplay]);

  const validationError = (() => {
    if (!studentId) return "Please select a student.";
    if (!subjectId) return "Please select a subject.";
    if (!teacherId) return "Please select a teacher.";
    if (!selectedDate) return "Please select a date.";
    if (!periodNo || Number.isNaN(Number(periodNo)) || Number(periodNo) < 1) return "Please enter a valid period number.";
    return null;
  })();

  const handleSubmit = useCallback(async () => {
    if (validationError || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const apiDate = toISODate(selectedDate);
      const period = Number(periodNo);

      const existing = await getAllAttendance(token, {
        class_id: classId,
        student_id: studentId,
        subject_id: subjectId,
        start_date: apiDate,
        end_date: apiDate,
      });

      const duplicate = existing.find(
        (r) => r.period_no === period && r.student_id === studentId && r.subject_id === subjectId && r.attendance_date === apiDate,
      );

      if (duplicate) {
        setError(
          "Attendance has already been recorded for this student, subject, date, and period. Please use the Edit action to update the existing record.",
        );
        submittingRef.current = false;
        setSubmitting(false);
        return;
      }

      await createAttendance(token, {
        student_id: studentId,
        class_id: classId,
        subject_id: subjectId,
        teacher_id: teacherId,
        attendance_date: apiDate,
        period_no: period,
        status,
        marked_by: markedBy,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark attendance.");
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [validationError, token, studentId, classId, subjectId, teacherId, selectedDate, periodNo, status, markedBy, onSuccess, onClose]);

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || s.admission_no || s.id,
  }));

  return (
    <Modal open={open} onClose={onClose} title="Mark Attendance" maxWidth="max-w-lg">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Student</label>
          <Dropdown
            value={studentId}
            items={studentOptions}
            placeholder="Select Student"
            onChange={setStudentId}
            className="text-sm w-full"
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
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

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Status</label>
          <div className="flex items-center gap-4">
            {(["PRESENT", "ABSENT", "LATE"] as const).map((s) => (
              <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="mark-status"
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="h-4 w-4 accent-[#7c3aed]"
                />
                <span className="text-sm text-slate-600">{s}</span>
              </label>
            ))}
          </div>
        </div>

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
            {submitting ? "Saving…" : "Mark Attendance"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
