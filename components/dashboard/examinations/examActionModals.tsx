"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/shared/Modal";
import DatePicker from "@/components/shared/DatePicker";
import { Loader2, Trash2, CheckCircle, AlertCircle, Printer } from "lucide-react";
import type { ExamResponse } from "@/types/entities/exam";
import type { ClassResponse } from "@/types/entities/class";
import type { SubjectResponse } from "@/types/entities/subject";
import type { TeacherResponse } from "@/types/entities/teacher";
import type { StudentResponse } from "@/types/entities/student";

// Helper for Toast alerts
function showNotification(message: string) {
  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-6 right-6 z-[250] rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-2xl transition-all duration-300";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
}

// ----------------------------------------------------
// 1. Assign Subjects Modal
// ----------------------------------------------------
interface AssignSubjectsModalProps {
  open: boolean;
  onClose: () => void;
  exams: ExamResponse[];
  classes: ClassResponse[];
  token: string;
}

export function AssignSubjectsModal({ open, onClose, exams, classes, token }: AssignSubjectsModalProps) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [classSubjects, setClassSubjects] = useState<SubjectResponse[]>([]);
  const [assignedSubjectIds, setAssignedSubjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  useEffect(() => {
    if (!open) {
      setSelectedExamId("");
      setClassSubjects([]);
      setAssignedSubjectIds([]);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!selectedExamId || !token) return;
    async function loadSubjects() {
      setLoading(true);
      setError(null);
      try {
        const exam = exams.find((e) => e.id === selectedExamId);
        if (!exam) return;

        // Fetch subjects of this class
        const resClassSubjects = await fetch(`/api/classes/${exam.class_id}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resClassSubjects.ok) throw new Error("Failed to fetch class subjects");
        const classSubjs = (await resClassSubjects.json()) as SubjectResponse[];
        setClassSubjects(classSubjs);

        // Fetch current assigned subjects
        const resAssigned = await fetch(`/api/exams/${selectedExamId}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resAssigned.ok) throw new Error("Failed to fetch assigned subjects");
        const assigned = (await resAssigned.json()) as { subject_id: string }[];
        setAssignedSubjectIds(assigned.map((a) => a.subject_id));
      } catch (err: any) {
        setError(err.message || "Failed to load subjects");
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, [selectedExamId, token, exams]);

  const handleToggleSubject = (subjectId: string) => {
    setAssignedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSave = async () => {
    if (!selectedExamId) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/exams/${selectedExamId}/subjects/batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject_ids: assignedSubjectIds }),
      });
      if (!response.ok) throw new Error("Failed to assign subjects");
      showNotification("Subjects assigned successfully");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save subjects");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Subjects to Exam" maxWidth="max-w-md">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#7c3aed]"
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.exam_name} ({classes.find((c) => c.id === exam.class_id)?.class_name || "Class"})
              </option>
            ))}
          </select>
        </div>

        {selectedExamId && (
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">
              Select Subjects for class:{" "}
              <span className="text-[#7c3aed]">
                {classes.find((c) => c.id === selectedExam?.class_id)?.class_name || ""}
              </span>
            </h4>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-[#7c3aed]" />
              </div>
            ) : classSubjects.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No subjects found for this class.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {classSubjects.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={assignedSubjectIds.includes(sub.id)}
                      onChange={() => handleToggleSubject(sub.id)}
                      className="rounded border-slate-300 text-[#7c3aed] focus:ring-[#7c3aed] h-4 w-4"
                    />
                    <span className="text-sm font-medium text-slate-700">{sub.subject_name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedExamId}
            className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ----------------------------------------------------
// 2. Assign Invigilators Modal
// ----------------------------------------------------
interface AssignInvigilatorsModalProps {
  open: boolean;
  onClose: () => void;
  exams: ExamResponse[];
  token: string;
}

export function AssignInvigilatorsModal({ open, onClose, exams, token }: AssignInvigilatorsModalProps) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [invigDate, setInvigDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedExamId("");
      setTeachers([]);
      setAssigned([]);
      setSelectedTeacherId("");
      setRoomNo("");
      setInvigDate("");
      setError(null);
    }
  }, [open]);

  // Load teachers list
  useEffect(() => {
    if (!open || !token) return;
    async function loadTeachers() {
      try {
        const res = await fetch("/api/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch teachers");
        const data = await res.json();
        setTeachers(data);
      } catch (err: any) {
        setError(err.message || "Failed to load teachers");
      }
    }
    loadTeachers();
  }, [open, token]);

  // Load current invigilators for selected exam
  const loadInvigilators = async () => {
    if (!selectedExamId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/${selectedExamId}/invigilators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch invigilators");
      const data = await res.json();
      setAssigned(data);
    } catch (err: any) {
      setError(err.message || "Failed to load invigilators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      loadInvigilators();
    } else {
      setAssigned([]);
    }
  }, [selectedExamId, token]);

  const handleAssign = async () => {
    if (!selectedExamId || !selectedTeacherId) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/exams/${selectedExamId}/invigilators`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher_id: selectedTeacherId,
          room_no: roomNo || null,
          invigilator_date: invigDate || null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to assign invigilator");
      }
      showNotification("Invigilator assigned successfully");
      setSelectedTeacherId("");
      setRoomNo("");
      setInvigDate("");
      await loadInvigilators();
    } catch (err: any) {
      setError(err.message || "Failed to assign invigilator");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!selectedExamId) return;
    setError(null);
    try {
      const response = await fetch(`/api/exams/${selectedExamId}/invigilators/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to remove invigilator");
      showNotification("Invigilator removed successfully");
      await loadInvigilators();
    } catch (err: any) {
      setError(err.message || "Failed to remove");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Invigilators" maxWidth="max-w-lg">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#7c3aed]"
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.exam_name}
              </option>
            ))}
          </select>
        </div>

        {selectedExamId && (
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-xs font-semibold text-slate-700">Assign New Invigilator</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-500">Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:ring-1 focus:ring-purple-100"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.employee_id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-500">Room No</label>
                <input
                  type="text"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  placeholder="e.g. 104"
                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:ring-1 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-500">Invigilation Date</label>
                <DatePicker value={invigDate} onChange={setInvigDate} />
              </div>
            </div>
            <button
              onClick={handleAssign}
              disabled={submitting || !selectedTeacherId}
              className="w-full h-9 rounded-lg bg-[#7c3aed] text-xs font-semibold text-white hover:brightness-110 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Assign Teacher
            </button>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Assigned Invigilators</h4>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[#7c3aed]" />
                </div>
              ) : assigned.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No invigilators assigned yet.</p>
              ) : (
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="p-2 font-semibold">Teacher Code</th>
                        <th className="p-2 font-semibold">Room</th>
                        <th className="p-2 font-semibold">Date</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {assigned.map((a) => (
                        <tr key={a.id}>
                          <td className="p-2 font-medium text-slate-700">
                            {teachers.find((t) => t.id === a.teacher_id)?.employee_id || a.teacher_id}
                          </td>
                          <td className="p-2 text-slate-600">{a.room_no || "—"}</td>
                          <td className="p-2 text-slate-600">{a.invigilator_date || "—"}</td>
                          <td className="p-2 text-right">
                            <button
                              onClick={() => handleRemove(a.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ----------------------------------------------------
// 3. Exam Timetable Modal
// ----------------------------------------------------
interface ExamTimetableModalProps {
  open: boolean;
  onClose: () => void;
  exams: ExamResponse[];
  token: string;
}

export function ExamTimetableModal({ open, onClose, exams, token }: ExamTimetableModalProps) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedExamId("");
      setSubjects([]);
      setTimetable([]);
      setSelectedSubjectId("");
      setExamDate("");
      setStartTime("");
      setEndTime("");
      setRoomNo("");
      setError(null);
    }
  }, [open]);

  // Load class subjects for the selected exam
  useEffect(() => {
    if (!selectedExamId || !token) return;
    async function loadSubjects() {
      try {
        const exam = exams.find((e) => e.id === selectedExamId);
        if (!exam) return;
        const res = await fetch(`/api/classes/${exam.class_id}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch subjects");
        const data = await res.json();
        setSubjects(data);
      } catch (err: any) {
        setError(err.message || "Failed to load subjects");
      }
    }
    loadSubjects();
  }, [selectedExamId, token, exams]);

  // Load timetable
  const loadTimetable = async () => {
    if (!selectedExamId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/${selectedExamId}/timetable`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch timetable");
      const data = await res.json();
      setTimetable(data);
    } catch (err: any) {
      setError(err.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      loadTimetable();
    } else {
      setTimetable([]);
    }
  }, [selectedExamId, token]);

  const handleAddEntry = async () => {
    if (!selectedExamId || !selectedSubjectId || !examDate || !startTime || !endTime) return;
    setSubmitting(true);
    setError(null);
    try {
      // API expects HH:MM:SS format
      const formattedStart = startTime.includes(":") && startTime.split(":").length === 2 ? `${startTime}:00` : startTime;
      const formattedEnd = endTime.includes(":") && endTime.split(":").length === 2 ? `${endTime}:00` : endTime;

      const response = await fetch(`/api/exams/${selectedExamId}/timetable`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject_id: selectedSubjectId,
          exam_date: examDate,
          start_time: formattedStart,
          end_time: formattedEnd,
          room_no: roomNo || null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to add timetable entry");
      }
      showNotification("Timetable entry added successfully");
      setSelectedSubjectId("");
      setExamDate("");
      setStartTime("");
      setEndTime("");
      setRoomNo("");
      await loadTimetable();
    } catch (err: any) {
      setError(err.message || "Failed to add entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!selectedExamId) return;
    setError(null);
    try {
      const response = await fetch(`/api/exams/${selectedExamId}/timetable/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete entry");
      showNotification("Timetable entry deleted successfully");
      await loadTimetable();
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Manage Exam Timetable" maxWidth="max-w-xl">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#7c3aed]"
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.exam_name}
              </option>
            ))}
          </select>
        </div>

        {selectedExamId && (
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-xs font-semibold text-slate-700">Add Timetable Slot</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-500">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:ring-1 focus:ring-purple-100"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-500">Exam Date</label>
                <DatePicker value={examDate} onChange={setExamDate} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-500">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:ring-1 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-500">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:ring-1 focus:ring-purple-100"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[10px] font-semibold text-slate-500">Room No</label>
                <input
                  type="text"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  placeholder="e.g. Auditorium / Room 102"
                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:ring-1 focus:ring-purple-100"
                />
              </div>
            </div>
            <button
              onClick={handleAddEntry}
              disabled={submitting || !selectedSubjectId || !examDate || !startTime || !endTime}
              className="w-full h-9 rounded-lg bg-[#7c3aed] text-xs font-semibold text-white hover:brightness-110 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Add to Timetable
            </button>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Scheduled Exam Timetable</h4>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[#7c3aed]" />
                </div>
              ) : timetable.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No slots scheduled yet.</p>
              ) : (
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="p-2 font-semibold">Subject</th>
                        <th className="p-2 font-semibold">Date</th>
                        <th className="p-2 font-semibold">Time</th>
                        <th className="p-2 font-semibold">Room</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {timetable.map((entry) => (
                        <tr key={entry.id}>
                          <td className="p-2 font-medium text-slate-700">
                            {subjects.find((s) => s.id === entry.subject_id)?.subject_name || entry.subject_id}
                          </td>
                          <td className="p-2 text-slate-600">{entry.exam_date}</td>
                          <td className="p-2 text-slate-600">
                            {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                          </td>
                          <td className="p-2 text-slate-600">{entry.room_no || "—"}</td>
                          <td className="p-2 text-right">
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ----------------------------------------------------
// 4. Generate Admit Card Modal
// ----------------------------------------------------
interface GenerateAdmitCardModalProps {
  open: boolean;
  onClose: () => void;
  exams: ExamResponse[];
  classes: ClassResponse[];
  token: string;
}

export function GenerateAdmitCardModal({ open, onClose, exams, classes, token }: GenerateAdmitCardModalProps) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [timetable, setTimetable] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  useEffect(() => {
    if (!open) {
      setSelectedExamId("");
      setStudents([]);
      setSelectedStudentId("");
      setTimetable([]);
      setSubjects([]);
      setError(null);
    }
  }, [open]);

  // Load students and timetable when exam changes
  useEffect(() => {
    if (!selectedExamId || !token) return;
    async function loadExamDetails() {
      setLoadingStudents(true);
      setLoadingTimetable(true);
      setError(null);
      try {
        const exam = exams.find((e) => e.id === selectedExamId);
        if (!exam) return;

        // Fetch students for class
        const resStudents = await fetch(`/api/classes/${exam.class_id}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resStudents.ok) throw new Error("Failed to fetch students");
        const studentsList = await resStudents.json();
        setStudents(studentsList);

        // Fetch timetable entries
        const resTimetable = await fetch(`/api/exams/${selectedExamId}/timetable`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resTimetable.ok) throw new Error("Failed to fetch timetable");
        const tt = await resTimetable.json();
        setTimetable(tt);

        // Fetch subjects
        const resSubjects = await fetch(`/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resSubjects.ok) throw new Error("Failed to fetch subjects");
        const subjs = await resSubjects.json();
        setSubjects(subjs);
      } catch (err: any) {
        setError(err.message || "Failed to load admit card data");
      } finally {
        setLoadingStudents(false);
        setLoadingTimetable(false);
      }
    }
    loadExamDetails();
  }, [selectedExamId, token, exams]);

  const handlePrint = () => {
    const printContent = document.getElementById("printable-admit-card")?.innerHTML;
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Admit Card - ${selectedStudent?.first_name || "Student"}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { padding: 20px; background: white; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="p-6 max-w-2xl mx-auto border-2 border-slate-950 rounded-xl bg-white shadow-md">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Student Admit Card" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Select Examination</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#7c3aed]"
            >
              <option value="">Select Exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.exam_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={loadingStudents || !selectedExamId}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#7c3aed] disabled:opacity-50"
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} ({student.admission_no})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedExamId && selectedStudentId && (
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold text-slate-700">Admit Card Preview</h4>
              <button
                onClick={handlePrint}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                Print Admit Card
              </button>
            </div>

            {/* Printable Area */}
            <div
              id="printable-admit-card"
              className="border-2 border-slate-800 rounded-xl bg-white p-6 shadow-sm space-y-6"
            >
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                    Smart Campus ERP
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">Official Student Admit Card</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-[#7c3aed]">{selectedExam?.exam_name}</h3>
                  <p className="text-xs text-slate-500">
                    Term: {selectedExam?.exam_type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-slate-700 font-medium">
                <div>
                  <p>
                    <span className="text-slate-400 font-normal">Student Name:</span>{" "}
                    {selectedStudent?.first_name} {selectedStudent?.last_name}
                  </p>
                  <p>
                    <span className="text-slate-400 font-normal">Admission No:</span>{" "}
                    {selectedStudent?.admission_no}
                  </p>
                  <p>
                    <span className="text-slate-400 font-normal">Roll No:</span>{" "}
                    {selectedStudent?.roll_no || "—"}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="text-slate-400 font-normal">Class:</span>{" "}
                    {classes.find((c) => c.id === selectedExam?.class_id)?.class_name || ""}
                  </p>
                  <p>
                    <span className="text-slate-400 font-normal">Academic Year:</span>{" "}
                    {classes.find((c) => c.id === selectedExam?.class_id)?.academic_year || "—"}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h5 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                  Exam Schedule Timetable
                </h5>
                {loadingTimetable ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-[#7c3aed]" />
                  </div>
                ) : timetable.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No exam slots scheduled yet.</p>
                ) : (
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-2 font-semibold">Subject</th>
                        <th className="p-2 font-semibold">Date</th>
                        <th className="p-2 font-semibold">Time</th>
                        <th className="p-2 font-semibold">Room No</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {timetable.map((entry) => (
                        <tr key={entry.id}>
                          <td className="p-2 font-semibold text-slate-800">
                            {subjects.find((s) => s.id === entry.subject_id)?.subject_name || entry.subject_id}
                          </td>
                          <td className="p-2 text-slate-600 font-medium">{entry.exam_date}</td>
                          <td className="p-2 text-slate-600 font-medium">
                            {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                          </td>
                          <td className="p-2 text-slate-600 font-medium">{entry.room_no || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="border-t-2 border-slate-800 pt-6 flex justify-between text-xs text-slate-400 font-medium">
                <div>
                  <p className="border-t border-slate-400 w-32 text-center pt-1 text-slate-500 mt-6">
                    Student Signature
                  </p>
                </div>
                <div>
                  <p className="border-t border-slate-400 w-32 text-center pt-1 text-slate-500 mt-6">
                    Invigilator Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ----------------------------------------------------
// 5. Enter Marks Modal
// ----------------------------------------------------
interface EnterMarksModalProps {
  open: boolean;
  onClose: () => void;
  exams: ExamResponse[];
  classes: ClassResponse[];
  token: string;
}

export function EnterMarksModal({ open, onClose, exams, classes, token }: EnterMarksModalProps) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [marksState, setMarksState] = useState<Record<string, { resultId?: string; marks: string }>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  useEffect(() => {
    if (!open) {
      setSelectedExamId("");
      setSubjects([]);
      setSelectedSubjectId("");
      setStudents([]);
      setMarksState({});
      setError(null);
    }
  }, [open]);

  // Load exam subjects
  useEffect(() => {
    if (!selectedExamId || !token) return;
    async function loadSubjects() {
      setLoadingSubjects(true);
      setError(null);
      try {
        const exam = exams.find((e) => e.id === selectedExamId);
        if (!exam) return;

        // Fetch subjects assigned to exam
        const resExamSub = await fetch(`/api/exams/${selectedExamId}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resExamSub.ok) throw new Error("Failed to fetch exam subjects");
        const assignedSubIds = (await resExamSub.json()) as { subject_id: string }[];

        // Fetch all subjects
        const resSubjects = await fetch(`/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resSubjects.ok) throw new Error("Failed to fetch subjects");
        const allSubjects = (await resSubjects.json()) as SubjectResponse[];

        const mapped = allSubjects.filter((s) => assignedSubIds.some((as) => as.subject_id === s.id));
        setSubjects(mapped.length > 0 ? mapped : allSubjects);
      } catch (err: any) {
        setError(err.message || "Failed to load subjects");
      } finally {
        setLoadingSubjects(false);
      }
    }
    loadSubjects();
  }, [selectedExamId, token, exams]);

  // Load students & results for class/subject
  const loadStudentsAndMarks = async () => {
    if (!selectedExamId || !selectedSubjectId || !token) return;
    setLoadingStudents(true);
    setError(null);
    try {
      const exam = exams.find((e) => e.id === selectedExamId);
      if (!exam) return;

      // Fetch students
      const resStudents = await fetch(`/api/classes/${exam.class_id}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resStudents.ok) throw new Error("Failed to fetch students");
      const studentsList = (await resStudents.json()) as StudentResponse[];
      setStudents(studentsList);

      // Fetch all exam results
      const resResults = await fetch(`/api/exam-results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resResults.ok) throw new Error("Failed to fetch results");
      const allResults = await resResults.json();

      const initialState: Record<string, { resultId?: string; marks: string }> = {};
      studentsList.forEach((s) => {
        const found = allResults.find(
          (res: any) =>
            res.student_id === s.id &&
            res.exam_id === selectedExamId &&
            res.subject_id === selectedSubjectId
        );
        initialState[s.id] = {
          resultId: found?.id,
          marks: found ? String(found.marks_obtained) : "",
        };
      });
      setMarksState(initialState);
    } catch (err: any) {
      setError(err.message || "Failed to load students and marks");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedExamId && selectedSubjectId) {
      loadStudentsAndMarks();
    } else {
      setStudents([]);
      setMarksState({});
    }
  }, [selectedExamId, selectedSubjectId, token]);

  const handleMarkChange = (studentId: string, val: string) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], marks: val },
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId || !selectedSubjectId) return;
    setSaving(true);
    setError(null);
    try {
      const maxM = selectedExam?.max_marks || 100;
      // Perform sequential saves
      for (const studentId of Object.keys(marksState)) {
        const { resultId, marks } = marksState[studentId];
        if (!marks.trim()) continue;

        const obtained = parseFloat(marks);
        if (Number.isNaN(obtained) || obtained < 0 || obtained > maxM) {
          throw new Error(`Marks for all students must be between 0 and ${maxM}`);
        }

        if (resultId) {
          // Update
          const res = await fetch(`/api/exam-results/${resultId}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ marks_obtained: obtained }),
          });
          if (!res.ok) throw new Error("Failed to update student result");
        } else {
          // Create new
          const res = await fetch(`/api/exam-results`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              exam_id: selectedExamId,
              student_id: studentId,
              subject_id: selectedSubjectId,
              marks_obtained: obtained,
            }),
          });
          if (!res.ok) throw new Error("Failed to create student result");
        }
      }
      showNotification("Student marks saved successfully");
      await loadStudentsAndMarks();
    } catch (err: any) {
      setError(err.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Enter Examination Marks" maxWidth="max-w-xl">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Select Examination</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#7c3aed]"
            >
              <option value="">Select Exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.exam_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={loadingSubjects || !selectedExamId}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#7c3aed] disabled:opacity-50"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedExamId && selectedSubjectId && (
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Max Marks: {selectedExam?.max_marks}</span>
              <span>Total Class Students: {students.length}</span>
            </div>

            {loadingStudents ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#7c3aed]" />
              </div>
            ) : students.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No students enrolled in this class.</p>
            ) : (
              <div className="border border-slate-150 rounded-xl overflow-hidden max-h-72 overflow-y-auto pr-1">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-150">
                    <tr>
                      <th className="p-3 font-semibold text-slate-600">Student Roll / Code</th>
                      <th className="p-3 font-semibold text-slate-600">Student Name</th>
                      <th className="p-3 font-semibold text-slate-600 w-32">Obtained Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="p-3 font-medium text-slate-700">
                          {student.roll_no || student.admission_no}
                        </td>
                        <td className="p-3 text-slate-800 font-semibold">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            max={selectedExam?.max_marks}
                            value={marksState[student.id]?.marks || ""}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                            className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-purple-100"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveMarks}
            disabled={saving || !selectedExamId || !selectedSubjectId}
            className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Marks
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ----------------------------------------------------
// 6. Publish Results Modal
// ----------------------------------------------------
interface PublishResultsModalProps {
  open: boolean;
  onClose: () => void;
  exams: ExamResponse[];
  token: string;
}

export function PublishResultsModal({ open, onClose, exams, token }: PublishResultsModalProps) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedExamId("");
      setPublishing(false);
      setSuccessMsg(null);
      setError(null);
    }
  }, [open]);

  const handlePublish = async () => {
    if (!selectedExamId || !token) return;
    setPublishing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await fetch(`/api/report-cards/publish/${selectedExamId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to publish results");
      }
      const data = await response.json();
      setSuccessMsg(data.message || "Results calculated and published successfully!");
      showNotification("Exam results published successfully");
    } catch (err: any) {
      setError(err.message || "Failed to publish results");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Publish Examination Results" maxWidth="max-w-md">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-700 flex items-start gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold">Publish Complete</p>
              <p className="mt-1 font-medium">{successMsg}</p>
            </div>
          </div>
        )}

        {!successMsg && (
          <>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">Select Examination</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#7c3aed]"
              >
                <option value="">Select Exam</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.exam_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Class-wide Final Calculations
              </p>
              <p className="font-medium text-amber-700 leading-relaxed">
                Publishing calculations will automatically compute aggregate scores, percentage, PASS/FAIL result, and ranks for all students enrolled in the class for this examination.
              </p>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {successMsg ? "Close" : "Cancel"}
          </button>
          {!successMsg && (
            <button
              onClick={handlePublish}
              disabled={publishing || !selectedExamId}
              className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-50 inline-flex items-center gap-2"
            >
              {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish Results
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ----------------------------------------------------
// 7. Exam Report Modal
// ----------------------------------------------------
interface ExamReportModalProps {
  open: boolean;
  onClose: () => void;
  exams: ExamResponse[];
  classes: ClassResponse[];
  token: string;
}

export function ExamReportModal({ open, onClose, exams, classes, token }: ExamReportModalProps) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [toppers, setToppers] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedExamId("");
      setReportCards([]);
      setToppers([]);
      setStudents([]);
      setError(null);
    }
  }, [open]);

  // Load report data
  const loadReportData = async () => {
    if (!selectedExamId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const exam = exams.find((e) => e.id === selectedExamId);
      if (!exam) return;

      // 1. Fetch class students
      const resStudents = await fetch(`/api/classes/${exam.class_id}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resStudents.ok) throw new Error("Failed to fetch students");
      const studentsList = await resStudents.json();
      setStudents(studentsList);

      // 2. Fetch exam report cards
      const resReportCards = await fetch(`/api/report-cards/exam/${selectedExamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resReportCards.ok) throw new Error("Failed to fetch report cards");
      const rCards = await resReportCards.json();
      setReportCards(rCards);

      // 3. Fetch exam toppers
      const resToppers = await fetch(`/api/exams/${selectedExamId}/toppers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resToppers.ok) {
        const tps = await resToppers.json();
        setToppers(tps);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load report metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      loadReportData();
    } else {
      setReportCards([]);
      setToppers([]);
      setStudents([]);
    }
  }, [selectedExamId, token]);

  const totalAppeared = reportCards.length;
  const totalPassed = reportCards.filter((rc) => rc.result === "PASS").length;
  const totalFailed = totalAppeared - totalPassed;
  const avgPercentage =
    totalAppeared > 0
      ? (reportCards.reduce((acc, curr) => acc + parseFloat(curr.percentage), 0) / totalAppeared).toFixed(2)
      : "—";

  return (
    <Modal open={open} onClose={onClose} title="Examination Analytics & Reports" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#7c3aed]"
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.exam_name}
              </option>
            ))}
          </select>
        </div>

        {selectedExamId && (
          <div className="border-t border-slate-100 pt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#7c3aed]" />
              </div>
            ) : (
              <>
                {/* Metrics Summary */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Appeared</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{totalAppeared}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Passed</p>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{totalPassed}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Failed</p>
                    <p className="text-xl font-bold text-red-500 mt-1">{totalFailed}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Percentage</p>
                    <p className="text-xl font-bold text-[#7c3aed] mt-1">{avgPercentage}%</p>
                  </div>
                </div>

                {/* Toppers Section */}
                {toppers.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-slate-700 mb-2">Class Toppers Rank</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {toppers.slice(0, 3).map((topper) => (
                        <div
                          key={topper.rank}
                          className="rounded-lg border border-purple-100 bg-purple-50/50 p-2.5 flex items-center gap-2"
                        >
                          <div className="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {topper.rank}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 line-clamp-1">
                              {topper.student_name}
                            </p>
                            <p className="text-[10px] font-semibold text-purple-600">
                              {parseFloat(topper.percentage).toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Results List */}
                <div>
                  <h5 className="text-xs font-semibold text-slate-700 mb-2">Detailed Report Cards</h5>
                  {reportCards.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 bg-slate-50 text-center rounded-lg">
                      No report cards published for this exam yet. Use "Publish Results" action first.
                    </p>
                  ) : (
                    <div className="border border-slate-150 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-150">
                          <tr>
                            <th className="p-2 font-semibold">Rank</th>
                            <th className="p-2 font-semibold">Student</th>
                            <th className="p-2 font-semibold">Obtained / Total</th>
                            <th className="p-2 font-semibold">Percentage</th>
                            <th className="p-2 font-semibold">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {reportCards.map((rc) => {
                            const student = students.find((s) => s.id === rc.student_id);
                            return (
                              <tr key={rc.id}>
                                <td className="p-2 font-bold text-slate-500">
                                  #{rc.rank || "—"}
                                </td>
                                <td className="p-2 text-slate-800 font-semibold">
                                  {student ? `${student.first_name} ${student.last_name}` : rc.student_id}
                                </td>
                                <td className="p-2 text-slate-600">
                                  {rc.obtained_marks} / {rc.total_marks}
                                </td>
                                <td className="p-2 font-semibold text-slate-700">
                                  {parseFloat(rc.percentage).toFixed(2)}%
                                </td>
                                <td className="p-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      rc.result === "PASS"
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                        : "bg-red-50 text-red-500 border border-red-100"
                                    }`}
                                  >
                                    {rc.result}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
