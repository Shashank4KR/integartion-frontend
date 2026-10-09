"use client";

import { useState } from "react";

export default function ClassSubjectsTab({
  classId,
  classSubjects,
  subjects,
  teacherSubjects,
  teachers,
  subjectOptions,
  directClassSubjects,
  onAssign,
  onRemove,
}: {
  classId: string;
  classSubjects: { id: string; subject_id: string }[];
  subjects: { id: string; subject_code: string; subject_name: string }[];
  teacherSubjects: { id: string; teacher_id: string; subject_id: string; class_id: string }[];
  teachers: { id: string; employee_id: string; user_id: string }[];
  subjectOptions: { id: string; label: string }[];
  directClassSubjects: { id: string; subject_name: string }[];
  onAssign: (classId: string, subjectIds: string[]) => Promise<void>;
  onRemove: (mappingId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const teacherCountBySubject: Record<string, number> = {};
  teacherSubjects.forEach((ts) => {
    teacherCountBySubject[ts.subject_id] = (teacherCountBySubject[ts.subject_id] || 0) + 1;
  });

  const mappingBySubjectId = new Map(
    classSubjects.map((cs) => [cs.subject_id, cs.id]),
  );

  const directSubjects = directClassSubjects.filter((ds) => {
    const subj = subjectById.get(ds.id);
    return !!subj;
  });

  const available = subjectOptions.filter(
    (s) => !classSubjects.some((cs) => cs.subject_id === s.id),
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    if (!selected.length || submitting) return;
    setSubmitting(true);
    try {
      await onAssign(classId, selected);
      setSelected([]);
    } catch (err) {
      console.warn("[ClassSubjectsTab] Assign error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (mappingId: string) => {
    try {
      await onRemove(mappingId);
    } catch (err) {
      console.warn("[ClassSubjectsTab] Remove error:", err);
    }
  };

  return (
    <div className="space-y-4">
      {directSubjects.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">
          No Subjects are assigned to this Class yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                <th className="px-4 py-3">Subject Code</th>
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3">Subject Type</th>
                <th className="px-4 py-3">Teachers</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {directSubjects.map((ds) => {
                const subj = subjectById.get(ds.id);
                const mappingId = mappingBySubjectId.get(ds.id);
                const teacherCount = teacherCountBySubject[ds.id] || 0;
                return (
                  <tr key={ds.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">{subj?.subject_code || "—"}</td>
                    <td className="px-4 py-3">{subj?.subject_name || ds.subject_name}</td>
                    <td className="px-4 py-3 text-slate-600">—</td>
                    <td className="px-4 py-3 text-slate-600">{teacherCount}</td>
                    <td className="px-4 py-3 text-right">
                      {mappingId ? (
                        <button
                          onClick={() => handleRemove(mappingId)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {available.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500 mb-2">Assign Subjects</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {available.map((s) => (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  selected.includes(s.id)
                    ? "border-[#6d28d9] bg-purple-50 text-[#6d28d9]"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <button
              onClick={handleAssign}
              disabled={submitting}
              className="rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
            >
              {submitting ? "Assigning..." : `Assign ${selected.length} Subject${selected.length > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
