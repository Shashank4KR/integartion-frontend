"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, Pencil, History, Loader2, Trash2 } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import {
  getAttendanceByStudent,
  updateAttendance,
  deleteAttendance,
} from "@/lib/services/attendanceService";
import type { AttendanceTableRow } from "./AttendanceTable";
import type { ClassSubjectSummary } from "@/types/entities/class-subject-summary";
import type { AttendanceStatus } from "@/types/entities/attendance";

export interface AttendanceRowActionsProps {
  student: AttendanceTableRow;
  token?: string;
  classId?: string;
  dateDisplay?: string;
  dateISO?: string;
  subjects?: ClassSubjectSummary[];
  onEditSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

function toISODate(display: string): string {
  const d = new Date(display);
  if (Number.isNaN(d.getTime())) return display;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const subjectName = (subjects: ClassSubjectSummary[] | undefined, id: string) =>
  subjects?.find((s) => s.id === id)?.subject_name ?? id;

export default function AttendanceRowActions({
  student,
  token,
  classId,
  dateDisplay,
  dateISO: dateISOProp,
  subjects,
  onEditSuccess,
  onDeleteSuccess,
}: AttendanceRowActionsProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [records, setRecords] = useState<{ id: string; subject_id: string; period_no: number; status: AttendanceStatus }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>("PRESENT");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const dateISO = dateISOProp ?? (dateDisplay ? toISODate(dateDisplay) : "");

  const loadRecords = useCallback(async () => {
    if (!token || !student.studentId || !classId || !dateISO) return;
    setLoading(true);
    setError(null);
    try {
      const all = await getAttendanceByStudent(token, student.studentId);
      const filtered = all.filter(
        (r) => r.class_id === classId && r.attendance_date === dateISO,
      );
      setRecords(
        filtered.map((r) => ({
          id: r.id,
          subject_id: r.subject_id,
          period_no: r.period_no,
          status: r.status,
        })),
      );
      if (filtered.length > 0) {
        setSelectedId(filtered[0].id);
        setEditStatus(filtered[0].status);
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  }, [token, student.studentId, classId, dateISO]);

  useEffect(() => {
    if (editOpen || deleteOpen) {
      loadRecords();
    }
  }, [editOpen, deleteOpen, loadRecords]);

  useEffect(() => {
    if (editOpen && records.length > 0 && !selectedId) {
      setSelectedId(records[0].id);
      setEditStatus(records[0].status);
    }
  }, [editOpen, records, selectedId]);

  useEffect(() => {
    if (editOpen && selectedId) {
      const rec = records.find((r) => r.id === selectedId);
      if (rec) setEditStatus(rec.status);
    }
  }, [editOpen, selectedId, records]);

  const handleEditSave = async () => {
    if (!token || !selectedId) return;
    setSaving(true);
    setError(null);
    try {
      await updateAttendance(token, selectedId, { status: editStatus });
      setEditOpen(false);
      onEditSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update attendance.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !selectedId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAttendance(token, selectedId);
      setDeleteOpen(false);
      onDeleteSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to unmark attendance.";
      if (err instanceof Error && (err as Error & { status?: number }).status) {
        const status = (err as Error & { status?: number }).status;
        if (status === 404) setDeleteError("Attendance record not found. It may have already been removed.");
        else if (status === 403) setDeleteError("You don't have permission to unmark this attendance record.");
        else if (status === 422) setDeleteError("This attendance record cannot be unmarked due to a validation error.");
        else setDeleteError(msg);
      } else {
        setDeleteError(msg);
      }
    } finally {
      setDeleting(false);
    }
  };

  const selectedRecord = records.find((r) => r.id === selectedId);

  const canEdit = Boolean(token && classId && dateDisplay);
  const canDelete = Boolean(token && classId && dateDisplay);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setViewOpen(true)}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-purple-50 text-[#7c3aed] hover:bg-purple-100 transition"
          aria-label={`View attendance for ${student.name}`}
          title="View"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setHistoryOpen(true)}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          aria-label={`View history for ${student.name}`}
          title="History"
        >
          <History className="h-3.5 w-3.5" />
        </button>
      </div>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title={`Attendance — ${student.name}`} maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-[#7c3aed]">
              {student.initials}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{student.name}</p>
              <p className="text-xs text-slate-500">Roll No. {student.rollNo}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Present</p>
              <p className="text-lg font-bold text-emerald-600">{student.presentCount}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Absent</p>
              <p className="text-lg font-bold text-red-600">{student.absentCount}</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Overall Attendance</p>
            <p className="text-2xl font-bold text-slate-900">{student.overall}%</p>
          </div>
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit Attendance — ${student.name}`} maxWidth="max-w-md">
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#7c3aed]" />
              Loading records…
            </div>
          ) : records.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">
              <p>No attendance records found for this student on the selected date.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">Record</label>
                <Dropdown
                  value={selectedId ?? ""}
                  items={records.map((r) => ({
                    value: r.id,
                    label: `${subjectName(subjects, r.subject_id)} · Period ${r.period_no}`,
                  }))}
                  placeholder="Select record"
                  onChange={(v) => {
                    const rec = records.find((r) => r.id === v);
                    setSelectedId(v);
                    if (rec) setEditStatus(rec.status);
                  }}
                  className="text-sm w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">Status</label>
                <div className="flex items-center gap-4">
                  {(["PRESENT", "ABSENT", "LATE"] as const).map((s) => (
                    <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="edit-status"
                        checked={editStatus === s}
                        onChange={() => setEditStatus(s)}
                        className="h-4 w-4 accent-[#7c3aed]"
                        disabled={!selectedId}
                      />
                      <span className="text-sm text-slate-600">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSave}
                  disabled={saving || !selectedId}
                  className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={`Unmark Attendance — ${student.name}`} maxWidth="max-w-md">
        <div className="space-y-4">
          {deleteError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {deleteError}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#7c3aed]" />
              Loading records…
            </div>
          ) : records.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">
              <p>No attendance records found for this student on the selected date.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                Unmarking will permanently remove the attendance record below. The student will have no attendance status recorded for{" "}
                <span className="font-semibold text-slate-800">{selectedRecord ? `${subjectName(subjects, selectedRecord.subject_id)} on ${dateDisplay} Period ${selectedRecord.period_no}` : "this date"}</span>.
                This action cannot be undone.
              </p>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">Record to Unmark</label>
                <Dropdown
                  value={selectedId ?? ""}
                  items={records.map((r) => ({
                    value: r.id,
                    label: `${subjectName(subjects, r.subject_id)} · Period ${r.period_no} · ${r.status}`,
                  }))}
                  placeholder="Select record"
                  onChange={setSelectedId}
                  className="text-sm w-full"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting || !selectedId}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-70"
                >
                  {deleting ? "Removing…" : "Unmark Attendance"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title={`Attendance History — ${student.name}`} maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Attendance history will be populated from the backend in a future update.
          </p>
          <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
            <div className="px-4 py-2.5 text-sm text-slate-500 text-center">
              No history records available for this view.
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={() => setHistoryOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
