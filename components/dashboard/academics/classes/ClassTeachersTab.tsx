"use client";

import { useState } from "react";
import type { ClassResponse } from "@/types/entities/class";
import type { TeacherSubjectResponse } from "@/types/entities/teacher-subject";

type DrawerTeacher = { id: string; employee_id: string; user_id: string };

export default function ClassTeachersTab({
  selectedClass,
  classTeacher,
  teacherSubjects,
  subjects,
  teachers,
  classOptions,
  teacherOptions,
  directClassTeachers,
  onAssignTeacher,
  onRemoveTeacherSubject,
}: {
  selectedClass: ClassResponse;
  classTeacher: DrawerTeacher | undefined;
  teacherSubjects: { id: string; teacher_id: string; subject_id: string; class_id: string }[];
  subjects: { id: string; subject_code: string; subject_name: string }[];
  teachers: DrawerTeacher[];
  classOptions: { id: string; label: string }[];
  teacherOptions: { id: string; label: string }[];
  directClassTeachers: { id: string; employee_id: string }[];
  onAssignTeacher: (classId: string, teacherId: string) => Promise<void>;
  onRemoveTeacherSubject: (mappingId: string) => Promise<void>;
}) {
  const [showAssign, setShowAssign] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const teacherById = new Map(teachers.map((t) => [t.id, t]));
  const teacherLabelById = new Map(teacherOptions.map((t) => [t.id, t.label]));
  const teacherLabel = (id: string) =>
    teacherLabelById.get(id) ?? teacherById.get(id)?.employee_id ?? id;

  const assignedTeacherIds = new Set(directClassTeachers.map((dt) => dt.id));
  const classTeacherSubjects = teacherSubjects.filter(
    (ts) => ts.class_id === selectedClass.id && assignedTeacherIds.has(ts.teacher_id),
  );

  const handleAssign = async () => {
    if (!selectedTeacherId || submitting) return;
    setSubmitting(true);
    try {
      await onAssignTeacher(selectedClass.id, selectedTeacherId);
      setSelectedTeacherId("");
      setShowAssign(false);
    } catch (err) {
      console.warn("[ClassTeachersTab] Assign teacher error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (mappingId: string) => {
    if (removingId) return;
    setRemovingId(mappingId);
    try {
      await onRemoveTeacherSubject(mappingId);
    } catch (err) {
      console.warn("[ClassTeachersTab] Remove teacher error:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const groupedByTeacher = new Map<string, typeof classTeacherSubjects>();
  classTeacherSubjects.forEach((ts) => {
    const existing = groupedByTeacher.get(ts.teacher_id) || [];
    existing.push(ts);
    groupedByTeacher.set(ts.teacher_id, existing);
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Class Teacher</h4>
        {classTeacher ? (
          <p className="text-sm text-slate-700">
            <span className="font-medium">{teacherLabel(classTeacher.id)}</span>
          </p>
        ) : (
          <p className="text-sm text-slate-500">No class teacher assigned.</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-900">Subject Teachers</h4>
          <button
            onClick={() => setShowAssign(!showAssign)}
            className="text-xs font-medium text-[#6d28d9] hover:underline"
          >
            {showAssign ? "Cancel" : "Assign Teacher"}
          </button>
        </div>

        {directClassTeachers.length === 0 && !showAssign && (
          <p className="text-sm text-slate-500">No teachers assigned to subjects in this class yet.</p>
        )}

        {showAssign && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            >
              <option value="">Select teacher...</option>
              {teacherOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={submitting || !selectedTeacherId}
              className="rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
            >
              {submitting ? "Assigning..." : "Assign to All Subjects"}
            </button>
            <p className="text-xs text-slate-400">
              This assigns the teacher to all subjects currently assigned to this class.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {Array.from(groupedByTeacher.entries()).map(([teacherId, entries]) => (
            <div
              key={teacherId}
              className="rounded-lg border border-slate-100 px-4 py-2.5"
            >
              <p className="text-sm font-medium text-slate-900">
                {teacherLabel(teacherId)}
              </p>
              <div className="mt-2 space-y-2">
                {entries.map((e) => {
                  const subj = subjectById.get(e.subject_id);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between rounded bg-purple-50 px-3 py-1.5"
                    >
                      <span className="text-xs font-medium text-[#6d28d9]">
                        {subj ? `${subj.subject_code} — ${subj.subject_name}` : e.subject_id}
                      </span>
                      <button
                        onClick={() => handleRemove(e.id)}
                        disabled={removingId === e.id}
                        className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        {removingId === e.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
