"use client";

import { useState, useMemo } from "react";
import { X, BookOpen, Users, GraduationCap, Info } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Badge from "@/components/shared/Badge";
import type { SubjectResponse } from "@/types/entities/subject";
import type { ClassSubjectResponse } from "@/types/entities/class-subject";
import type { TeacherSubjectResponse } from "@/types/entities/teacher-subject";

type Tab = "overview" | "classes" | "teachers";

type DrawerTeacher = {
  id: string;
  employee_id: string;
  user_id: string;
  email?: string;
};

export default function SubjectViewDrawer({
  open,
  onClose,
  item,
  assignedClasses,
  classSubjects,
  teachers,
  teacherSubjects,
  classOptions,
  teacherClassOptions,
  onAssignClasses,
  onRemoveClassAssignment,
  onAssignTeachers,
  onRemoveTeacherAssignment,
  departments = [],
}: {
  open: boolean;
  onClose: () => void;
  item: SubjectResponse | null;
  assignedClasses: { id: string; class_name: string; section: string; academic_year?: string }[];
  classSubjects: ClassSubjectResponse[];
  teachers: DrawerTeacher[];
  teacherSubjects: TeacherSubjectResponse[];
  classOptions: { id: string; label: string }[];
  teacherClassOptions: { id: string; label: string }[];
  onAssignClasses: (selectedClassIds: string[]) => Promise<void>;
  onRemoveClassAssignment: (mappingId: string) => Promise<void>;
  onAssignTeachers: (payload: { teacher_id: string; class_id: string }[]) => Promise<void>;
  onRemoveTeacherAssignment: (mappingId: string) => Promise<void>;
  departments?: { id: string; department_name: string }[];
}) {
  const [tab, setTab] = useState<Tab>("overview");

  const teacherCount = useMemo(
    () =>
      teacherSubjects.filter((ts) => ts.subject_id === item?.id).length,
    [teacherSubjects, item],
  );

  const assignedTeacherEntries = useMemo(() => {
    if (!item) return [];
    return teacherSubjects
      .filter((ts) => ts.subject_id === item.id)
      .map((ts) => ({
        id: ts.id,
        teacher_id: ts.teacher_id,
        class_id: ts.class_id,
      }));
  }, [teacherSubjects, item]);

  if (!item) return null;

  const tabs: { key: Tab; label: string; count?: number; icon: typeof BookOpen }[] = [
    { key: "overview", label: "Overview", icon: BookOpen },
    { key: "classes", label: "Classes", count: assignedClasses.length, icon: Users },
    { key: "teachers", label: "Teachers", count: teacherCount, icon: GraduationCap },
  ];

  return (
    <Modal open={open} onClose={onClose} title={`${item.subject_name} — Details`} maxWidth="max-w-2xl">
      <div className="flex border-b border-slate-100 -mx-6 px-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-selected={tab === t.key}
            role="tab"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
              tab === t.key
                ? "border-[#6d28d9] text-[#6d28d9]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <t.icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
            {t.count !== undefined && (
              <span className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-[55vh] overflow-y-auto">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Subject ID" value={item.id} mono />
              <InfoField label="Subject Code" value={item.subject_code} />
              <InfoField label="Subject Name" value={item.subject_name} />
              <InfoField label="Subject Type" value="—" unavailable tooltip="Subject Type is not available in the current backend." />
              {departments.find((d) => d.id === item.department_id) ? (
                <InfoField label="Department" value={departments.find((d) => d.id === item.department_id)!.department_name} />
              ) : (
                <InfoField label="Department" value="—" unavailable tooltip="No department assigned to this subject." />
              )}
              <InfoField label="Credits / Periods" value="—" unavailable tooltip="Credits / Periods are not available in the current backend." />
              <InfoField label="Status" value="—" unavailable tooltip="Status is not available in the current backend." />
              <InfoField label="Assigned Classes" value={String(assignedClasses.length)} />
              <InfoField label="Assigned Teachers" value={String(teacherCount)} />
              <InfoField label="Created At" value={item.created_at ? new Date(item.created_at).toLocaleString() : "—"} />
              <InfoField label="Updated At" value={item.updated_at ? new Date(item.updated_at).toLocaleString() : "—"} />
            </div>
          </div>
        )}

        {tab === "classes" && (
          <ClassAssignmentsTab
            assigned={assignedClasses}
            classSubjects={classSubjects}
            classOptions={classOptions}
            subjectId={item.id}
            subjectName={item.subject_name}
            onAssign={onAssignClasses}
            onRemove={onRemoveClassAssignment}
          />
        )}

        {tab === "teachers" && (
          <TeacherAssignmentsTab
            subjectId={item.id}
            subjectName={item.subject_name}
            assigned={assignedTeacherEntries}
            teachers={teachers}
            teacherSubjects={teacherSubjects}
            teacherClassOptions={teacherClassOptions}
            onAssign={onAssignTeachers}
            onRemove={onRemoveTeacherAssignment}
          />
        )}
      </div>
    </Modal>
  );
}

function InfoField({ label, value, mono, unavailable, tooltip }: {
  label: string;
  value: string;
  mono?: boolean;
  unavailable?: boolean;
  tooltip?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className={`text-sm text-slate-900 ${mono ? "font-mono break-all" : "font-medium"}`}>
        {value}
      </p>
      {unavailable && tooltip && (
        <p className="text-[10px] text-slate-400 mt-0.5" title={tooltip}>Not available</p>
      )}
    </div>
  );
}

function ClassAssignmentsTab({
  assigned,
  classSubjects,
  classOptions,
  subjectId,
  subjectName,
  onAssign,
  onRemove,
}: {
  assigned: { id: string; class_name: string; section: string; academic_year?: string }[];
  classSubjects: ClassSubjectResponse[];
  classOptions: { id: string; label: string }[];
  subjectId: string;
  subjectName: string;
  onAssign: (selectedClassIds: string[]) => Promise<void>;
  onRemove: (mappingId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmingClass, setConfirmingClass] = useState<{
    id: string;
    class_name: string;
    section: string;
  } | null>(null);
  const [result, setResult] = useState<{ success: string[]; failed: string[] } | null>(null);

  const available = useMemo(
    () => classOptions.filter((c) => !assigned.some((a) => a.id === c.id)),
    [classOptions, assigned],
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    if (!selected.length || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      await onAssign(selected);
      setSelected([]);
    } catch {
      setResult({ success: [], failed: selected });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!confirmingClass || removingId) return;
    setRemovingId(confirmingClass.id);
    try {
      const mapping = classSubjects.find(
        (cs) => cs.class_id === confirmingClass.id && cs.subject_id === subjectId,
      );
      if (mapping) {
        await onRemove(mapping.id);
      }
    } catch {
      // error handled by parent
    } finally {
      setRemovingId(null);
      setConfirmingClass(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Classes assigned to {subjectName}</h4>
        {assigned.length === 0 ? (
          <p className="text-sm text-slate-500">No Classes are assigned to this Subject yet.</p>
        ) : (
          <div className="space-y-2">
            {assigned.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
              >
                <div>
                  <span className="text-sm font-medium text-slate-800">{cls.class_name} — {cls.section}</span>
                  {cls.academic_year && (
                    <span className="text-xs text-slate-400 ml-2">{cls.academic_year}</span>
                  )}
                </div>
                <button
                  onClick={() => setConfirmingClass(cls)}
                  disabled={removingId !== null}
                  className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                  aria-label={`Remove ${cls.class_name} - ${cls.section} from ${subjectName}`}
                >
                  {removingId === cls.id ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmingClass && (
        <Modal open={!!confirmingClass} onClose={() => setConfirmingClass(null)} title="Remove Assignment" maxWidth="max-w-md">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Remove{" "}
              <span className="font-semibold">{subjectName}</span> from{" "}
              <span className="font-semibold">
                {confirmingClass.class_name} — {confirmingClass.section}
              </span>
              ?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmingClass(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={removingId === confirmingClass.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
              >
                {removingId === confirmingClass.id ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {available.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign Classes</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {available.map((c) => (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                aria-pressed={selected.includes(c.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selected.includes(c.id)
                    ? "border-[#6d28d9] bg-purple-50 text-[#6d28d9]"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <button
              onClick={handleAssign}
              disabled={submitting}
              className="rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
            >
              {submitting ? "Assigning..." : `Assign ${selected.length} Class${selected.length > 1 ? "es" : ""}`}
            </button>
          )}
        </div>
      )}

      {result && (
        <p className="text-xs text-slate-500">
          {result.success.length > 0 && <span className="text-green-600">{result.success.length} succeeded.</span>}
          {result.failed.length > 0 && <span className="text-red-600 ml-2">{result.failed.length} failed.</span>}
        </p>
      )}
    </div>
  );
}

function TeacherAssignmentsTab({
  subjectId,
  subjectName,
  assigned,
  teachers,
  teacherSubjects,
  teacherClassOptions,
  onAssign,
  onRemove,
}: {
  subjectId: string;
  subjectName: string;
  assigned: { id: string; teacher_id: string; class_id: string }[];
  teachers: DrawerTeacher[];
  teacherSubjects: TeacherSubjectResponse[];
  teacherClassOptions: { id: string; label: string }[];
  onAssign: (payload: { teacher_id: string; class_id: string }[]) => Promise<void>;
  onRemove: (mappingId: string) => Promise<void>;
}) {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{
    id: string;
    teacher: DrawerTeacher;
    classLabel: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const classLabelById = useMemo(() => {
    const map = new Map<string, string>();
    teacherClassOptions.forEach((c) => map.set(c.id, c.label));
    return map;
  }, [teacherClassOptions]);

  const teacherLabelById = useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach((t) =>
      map.set(
        t.id,
        t.email ? `${t.employee_id} — ${t.email}` : t.employee_id,
      ),
    );
    return map;
  }, [teachers]);

  const isDuplicate = (teacherId: string, classId: string) =>
    assigned.some((a) => a.teacher_id === teacherId && a.class_id === classId);

  const duplicateSelected =
    selectedTeacherId && selectedClassId && isDuplicate(selectedTeacherId, selectedClassId);

  const handleAssign = async () => {
    if (!selectedTeacherId || !selectedClassId || submitting) return;
    if (isDuplicate(selectedTeacherId, selectedClassId)) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onAssign([
        { teacher_id: selectedTeacherId.trim(), class_id: selectedClassId.trim() },
      ]);
      setSelectedTeacherId("");
      setSelectedClassId("");
    } catch (err) {
      const serviceErr = err as Error & { status?: number };
      if (serviceErr?.status === 409 || serviceErr?.status === 422) {
        setErrorMsg(
          "This Teacher is already assigned to this Subject for the selected Class.",
        );
      } else {
        setErrorMsg(err instanceof Error ? err.message : "Failed to assign teacher.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (mappingId: string) => {
    if (removingId) return;
    setRemovingId(mappingId);
    setErrorMsg(null);
    try {
      await onRemove(mappingId);
      setConfirming(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to remove assignment.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Teachers assigned to {subjectName}</h4>
        {assigned.length === 0 ? (
          <p className="text-sm text-slate-500">No Teachers are assigned to this Subject yet.</p>
        ) : (
          <div className="space-y-2">
            {assigned.map((entry) => {
              const teacher = teachers.find((t) => t.id === entry.teacher_id);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {teacherLabelById.get(entry.teacher_id) || entry.teacher_id}
                    </p>
                    <p className="text-xs text-slate-500">{classLabelById.get(entry.class_id) || entry.class_id}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (teacher) {
                        setConfirming({
                          id: entry.id,
                          teacher,
                          classLabel: classLabelById.get(entry.class_id) || entry.class_id,
                        });
                      } else {
                        void handleRemove(entry.id);
                      }
                    }}
                    disabled={removingId === entry.id}
                    className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors ml-4 flex-shrink-0"
                    aria-label={`Remove teacher assignment`}
                  >
                    {removingId === entry.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirming && (
        <Modal open={!!confirming} onClose={() => setConfirming(null)} title="Remove Teacher Assignment" maxWidth="max-w-md">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Remove{" "}
              <span className="font-semibold">
                {confirming.teacher.email
                  ? `${confirming.teacher.employee_id} — ${confirming.teacher.email}`
                  : confirming.teacher.employee_id}
              </span>{" "}
              from <span className="font-semibold">{subjectName}</span> for{" "}
              <span className="font-semibold">{confirming.classLabel}</span>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirming(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemove(confirming.id)}
                disabled={removingId === confirming.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
              >
                {removingId === confirming.id ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {teacherClassOptions.length === 0 ? (
        <p className="text-sm text-slate-500">This subject is not assigned to any class yet. Assign it to a class first.</p>
      ) : (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign Teacher to {subjectName}</p>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                setErrorMsg(null);
              }}
              aria-label="Select teacher"
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100 transition"
            >
              <option value="">Select teacher...</option>
              {teachers.map((t) => {
                const disabled = !!selectedClassId && isDuplicate(t.id, selectedClassId);
                return (
                  <option key={t.id} value={t.id} disabled={disabled}>
                    {t.email ? `${t.employee_id} — ${t.email}` : t.employee_id}
                    {disabled ? " — Already assigned" : ""}
                  </option>
                );
              })}
            </select>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setErrorMsg(null);
              }}
              aria-label="Select class"
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100 transition"
            >
              <option value="">Select class...</option>
              {teacherClassOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {duplicateSelected && (
            <p className="text-xs text-amber-600 mb-2">
              This teacher is already assigned to {subjectName} for the selected class.
            </p>
          )}

          <button
            onClick={handleAssign}
            disabled={submitting || !selectedTeacherId || !selectedClassId || !!duplicateSelected}
            className="rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
          >
            {submitting ? "Assigning..." : "Assign Teacher"}
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
