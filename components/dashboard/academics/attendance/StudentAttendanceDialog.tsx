"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, UserCheck, Calendar } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import { getAttendanceByStudent } from "@/lib/services/attendanceService";
import type { AttendanceResponse } from "@/types/entities/attendance";
import type { StudentResponse } from "@/types/entities/student";
import type { ClassSubjectSummary } from "@/types/entities/class-subject-summary";

interface StudentAttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  token: string;
  students: StudentResponse[];
  subjects?: ClassSubjectSummary[];
}

export default function StudentAttendanceDialog({
  open,
  onClose,
  token,
  students = [],
  subjects = [],
}: StudentAttendanceDialogProps) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);

  useEffect(() => {
    if (open) {
      if (students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id);
      }
      setError(null);
    }
  }, [open, students, selectedStudentId]);

  const loadStudentAttendance = useCallback(async (studentId: string) => {
    if (!token || !studentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendanceByStudent(token, studentId);
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load student attendance.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (open && selectedStudentId) {
      loadStudentAttendance(selectedStudentId);
    }
  }, [open, selectedStudentId, loadStudentAttendance]);

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || s.admission_no || s.id,
  }));

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const subjectMap = new Map(subjects.map((sub) => [sub.id, sub.subject_name]));

  const total = records.length;
  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;
  const overallPct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <Modal open={open} onClose={onClose} title="Student Attendance History" maxWidth="max-w-3xl">
      <div className="space-y-4">
        {/* Student Selector */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Select Student</label>
            <Dropdown
              value={selectedStudentId}
              items={studentOptions}
              onChange={handleStudentChange}
              placeholder="Select a student"
              className="w-full text-sm"
            />
          </div>
          {selectedStudent && (
            <div className="text-xs text-slate-600 space-y-0.5 sm:text-right">
              <div><span className="font-semibold">Roll No:</span> {selectedStudent.roll_no || "N/A"}</div>
              <div><span className="font-semibold">Admission:</span> {selectedStudent.admission_no || "N/A"}</div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 text-center">
            <span className="text-xs text-purple-600 block font-medium">Overall Attendance</span>
            <span className="text-xl font-bold text-purple-700">{overallPct}%</span>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
            <span className="text-xs text-emerald-600 block font-medium">Present Days</span>
            <span className="text-xl font-bold text-emerald-700">{presentCount}</span>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-center">
            <span className="text-xs text-red-600 block font-medium">Absent Days</span>
            <span className="text-xl font-bold text-red-700">{absentCount}</span>
          </div>
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-center">
            <span className="text-xs text-teal-600 block font-medium">Late Days</span>
            <span className="text-xl font-bold text-teal-700">{lateCount}</span>
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-sm text-slate-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              Loading student attendance records...
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No attendance records found for this student.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {records.map((r) => {
                  const subjectName = subjectMap.get(r.subject_id) || "Subject";
                  const statusColor =
                    r.status === "PRESENT"
                      ? "bg-emerald-100 text-emerald-800"
                      : r.status === "ABSENT"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800";

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-slate-800">{r.attendance_date}</td>
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
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
