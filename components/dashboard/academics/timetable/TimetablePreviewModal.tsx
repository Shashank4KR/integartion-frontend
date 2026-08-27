"use client";

import { useState, useEffect, useMemo } from "react";
import Modal from "@/components/shared/Modal";
import { getClassSubjects } from "@/lib/services/classService";
import type { TimetableCreate, TimetableResponse } from "@/types/entities/timetable";
import type { ClassSubjectSummary } from "@/types/entities/class-subject-summary";
import type { TeacherSubjectResponse } from "@/types/entities/teacher-subject";
import { PREVIEW_TIMESLOTS } from "./timetablePreviewData";
import {
  PERIOD_LABELS,
  normalizeDay,
  parsePeriodNo,
  resolvePeriodLabel,
  toApiTime,
  toInputTime,
} from "./timetableApiUtils";
import { WEEK_DAYS, type WeekDay } from "./timetableDisplayTypes";

export interface CreatePeriodDefaults {
  day: WeekDay;
  periodLabel: string;
  startTime: string;
  endTime: string;
  classId?: string;
}

export interface TimetableClassOption {
  id: string;
  label: string;
  academicYear: string;
  section: string;
}

export interface TimetableOption {
  id: string;
  label: string;
}

interface TimetablePreviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: TimetableCreate) => void;
  submitting: boolean;
  formError: string | null;
  editingItem: TimetableResponse | null;
  defaults: CreatePeriodDefaults;
  token: string;
  classOptions: TimetableClassOption[];
  subjectOptions: TimetableOption[];
  teacherOptions: TimetableOption[];
  classSubjects: ClassSubjectSummary[];
  allTeacherSubjects: TeacherSubjectResponse[];
}

function slotForPeriod(label: string) {
  return PREVIEW_TIMESLOTS.find((s) => s.label === label);
}

export default function TimetablePreviewModal({
  open,
  onClose,
  onSubmit,
  submitting,
  formError,
  editingItem,
  defaults,
  token,
  classOptions,
  subjectOptions,
  teacherOptions,
  classSubjects,
  allTeacherSubjects,
}: TimetablePreviewModalProps) {
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [day, setDay] = useState<WeekDay>(defaults.day);
  const [periodLabel, setPeriodLabel] = useState(defaults.periodLabel);
  const [startTime, setStartTime] = useState(defaults.startTime);
  const [endTime, setEndTime] = useState(defaults.endTime);
  const [room, setRoom] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [rawClassSubjectIds, setRawClassSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setLocalError(null);
    setRawClassSubjectIds([]);
    if (editingItem) {
      setClassId(editingItem.class_id);
      setSubjectId(editingItem.subject_id);
      setTeacherId(editingItem.teacher_id);
      setDay(normalizeDay(editingItem.day_of_week) ?? defaults.day);
      setPeriodLabel(
        resolvePeriodLabel(editingItem.period_no, editingItem.start_time),
      );
      setStartTime(toInputTime(editingItem.start_time));
      setEndTime(toInputTime(editingItem.end_time));
      setRoom(editingItem.room_no ?? "");
    } else {
      const defaultClassId = defaults.classId ?? classOptions[0]?.id ?? "";
      setClassId(defaultClassId);
      setSubjectId("");
      setTeacherId("");
      setDay(defaults.day);
      setPeriodLabel(defaults.periodLabel);
      setStartTime(defaults.startTime);
      setEndTime(defaults.endTime);
      setRoom("");
    }
  }, [open, editingItem, defaults, classOptions]);

  const selectedClass = classOptions.find((c) => c.id === classId);

  // Load the Subjects assigned to the selected Class from the backend so the
  // dropdown only ever receives real Subject UUIDs (never labels).
  useEffect(() => {
    if (!open || editingItem || !classId) {
      setRawClassSubjectIds([]);
      setSubjectsLoading(false);
      setTeachersLoading(false);
      return;
    }
    let cancelled = false;
    setSubjectsLoading(true);
    setTeachersLoading(true);
    setSubjectId("");
    setTeacherId("");
    getClassSubjects(token, classId)
      .then((data) => {
        if (!cancelled) setRawClassSubjectIds(data.map((d) => d.id));
      })
      .catch(() => {
        if (!cancelled) setRawClassSubjectIds([]);
      })
      .finally(() => {
        if (!cancelled) {
          setSubjectsLoading(false);
          setTeachersLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, editingItem, classId, token]);

  // Subject options for the current Class, keyed by real Subject UUIDs.
  const localSubjects = useMemo(() => {
    if (editingItem) return [];
    if (rawClassSubjectIds.length === 0) return [];
    const validIds = new Set(rawClassSubjectIds);
    return subjectOptions.filter((s) => validIds.has(s.id));
  }, [editingItem, rawClassSubjectIds, subjectOptions]);

  const subjectOptionsForRender = editingItem ? subjectOptions : localSubjects;

  // Auto-select the first valid Subject once it has loaded.
  useEffect(() => {
    if (editingItem || subjectsLoading) return;
    if (localSubjects.length > 0) {
      setSubjectId((prev) => (localSubjects.some((s) => s.id === prev) ? prev : localSubjects[0].id));
    } else {
      setSubjectId("");
    }
  }, [editingItem, subjectsLoading, localSubjects]);

  // Teacher options valid for the exact Class + Subject relationship.
  const validTeacherOptions = useMemo(() => {
    if (editingItem) return teacherOptions;
    if (!classId || !subjectId) return [];
    const validTeacherIds = new Set(
      allTeacherSubjects
        .filter((ts) => ts.class_id === classId && ts.subject_id === subjectId)
        .map((ts) => ts.teacher_id),
    );
    return teacherOptions.filter((t) => validTeacherIds.has(t.id));
  }, [editingItem, classId, subjectId, allTeacherSubjects, teacherOptions]);

  // Auto-select the first valid Teacher once the relationship has resolved.
  useEffect(() => {
    if (editingItem || teachersLoading) return;
    if (validTeacherOptions.length > 0) {
      setTeacherId((prev) =>
        validTeacherOptions.some((t) => t.id === prev) ? prev : validTeacherOptions[0].id,
      );
    } else {
      setTeacherId("");
    }
  }, [editingItem, teachersLoading, validTeacherOptions]);

  const onPeriodChange = (label: string) => {
    setPeriodLabel(label);
    const slot = PREVIEW_TIMESLOTS.find((s) => s.label === label);
    if (slot) {
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
    }
  };

  const handleClassChange = (value: string) => {
    setClassId(value);
    setSubjectId("");
    setTeacherId("");
  };

  const handleSubjectChange = (value: string) => {
    setSubjectId(value);
    setTeacherId("");
  };

  const handleSubmit = () => {
    if (
      classId.trim() === "" ||
      subjectId.trim() === "" ||
      teacherId.trim() === ""
    ) {
      setLocalError("Please select a class, subject, and teacher.");
      return;
    }
    if (startTime.trim() === "" || endTime.trim() === "") {
      setLocalError("Please provide a start and end time.");
      return;
    }
    setLocalError(null);
    const payload: TimetableCreate = {
      class_id: classId,
      subject_id: subjectId,
      teacher_id: teacherId,
      day_of_week: day,
      start_time: toApiTime(startTime),
      end_time: toApiTime(endTime),
      room_no: room.trim() ? room.trim() : null,
      period_no: parsePeriodNo(periodLabel),
    };
    onSubmit(payload);
  };

  // Clear the stale "select a class, subject, and teacher" message as soon as
  // real relationship IDs are present in form state.
  useEffect(() => {
    if (
      classId.trim() !== "" &&
      subjectId.trim() !== "" &&
      teacherId.trim() !== "" &&
      localError === "Please select a class, subject, and teacher."
    ) {
      setLocalError(null);
    }
  }, [classId, subjectId, teacherId, localError]);

  const fieldClass =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100";
  const disabledFieldClass =
    "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500";
  const labelClass = "mb-1.5 block text-xs font-semibold text-slate-700";

  const shownError = localError ?? formError;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingItem ? "Edit Timetable Period" : "Add Timetable Period"}
      maxWidth="max-w-2xl"
    >
      {shownError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600" role="alert">
          {shownError}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Class / Grade</label>
          <select className={fieldClass} value={classId} onChange={(e) => handleClassChange(e.target.value)}>
            {classOptions.length === 0 && <option value="">No classes available</option>}
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Academic Year</label>
          <input className={disabledFieldClass} value={selectedClass?.academicYear ?? "—"} disabled readOnly />
        </div>
        <div>
          <label className={labelClass}>Section</label>
          <input className={disabledFieldClass} value={selectedClass?.section ?? "—"} disabled readOnly />
        </div>
        <div>
          <label className={labelClass}>Subject</label>
          <select className={fieldClass} value={subjectId} disabled={subjectsLoading} onChange={(e) => handleSubjectChange(e.target.value)}>
            {subjectsLoading && <option value="">Loading subjects...</option>}
            {!subjectsLoading && subjectOptionsForRender.length === 0 && (
              <option value="">No Subjects are assigned to this Class</option>
            )}
            {!subjectsLoading &&
              subjectOptionsForRender.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
          </select>
          {!subjectsLoading && subjectOptionsForRender.length === 0 && classId && (
            <p className="mt-1 text-[11px] text-slate-400">
              Assign subjects from the <button type="button" onClick={onClose} className="text-[#7c3aed] underline">Subjects page</button>.
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Teacher</label>
          <select className={fieldClass} value={teacherId} disabled={teachersLoading} onChange={(e) => setTeacherId(e.target.value)}>
            {teachersLoading && <option value="">Loading teachers...</option>}
            {!teachersLoading && validTeacherOptions.length === 0 && (
              <option value="">No Teacher is assigned to this Subject for the selected Class</option>
            )}
            {!teachersLoading &&
              validTeacherOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
          </select>
          {!teachersLoading && validTeacherOptions.length === 0 && classId && subjectId && (
            <p className="mt-1 text-[11px] text-slate-400">
              Assign teachers from the <button type="button" onClick={onClose} className="text-[#7c3aed] underline">Subjects page</button>.
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Day</label>
          <select className={fieldClass} value={day} onChange={(e) => setDay(e.target.value as WeekDay)}>
            {WEEK_DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Period</label>
          <select className={fieldClass} value={periodLabel} onChange={(e) => onPeriodChange(e.target.value)}>
            {PERIOD_LABELS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Room</label>
          <input
            type="text"
            className={fieldClass}
            value={room}
            placeholder="e.g. Room 101"
            onChange={(e) => setRoom(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Start Time</label>
          <input type="time" className={fieldClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>End Time</label>
          <input type="time" className={fieldClass} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || subjectsLoading || teachersLoading}
          className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d28d9] disabled:opacity-60"
        >
          {submitting
            ? editingItem
              ? "Saving..."
              : "Adding..."
            : editingItem
              ? "Save Changes"
              : "Add Period"}
        </button>
      </div>
    </Modal>
  );
}
