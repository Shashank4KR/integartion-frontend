"use client";

import { useState } from "react";
import { BookOpen, Clock, UserCheck } from "lucide-react";
import type { ClassResponse } from "@/types/entities/class";
import type { TeacherResponse } from "@/types/entities/teacher";
import type { StudentResponse } from "@/types/entities/student";
import type { ClassSubjectResponse } from "@/types/entities/class-subject";
import type { TeacherSubjectResponse } from "@/types/entities/teacher-subject";
import type { TimetableResponse } from "@/types/entities/timetable";

export default function ClassOverviewTab({
  selectedClass,
  classTeacher,
  students,
  classSubjects,
  subjects,
  teachers,
  teacherSubjects,
  timetables,
  subjectOptions,
  onAssignSubjects,
  onAssignTeacher,
}: {
  selectedClass: ClassResponse;
  classTeacher: { id: string; employee_id: string; user_id: string } | undefined;
  students: { id: string; admission_no: string; first_name: string | null; last_name: string | null; roll_no: string | null; class_id: string }[];
  classSubjects: { id: string; subject_id: string }[];
  subjects: { id: string; subject_code: string; subject_name: string }[];
  teachers: { id: string; employee_id: string; user_id: string }[];
  teacherSubjects: { id: string; teacher_id: string; subject_id: string; class_id: string }[];
  timetables: { day_of_week: string; start_time: string; end_time: string; room_no: string | null; period_no: number | null; subject_id: string; teacher_id: string }[];
  subjectOptions: { id: string; label: string }[];
  onAssignSubjects: (classId: string, subjectIds: string[]) => Promise<void>;
  onAssignTeacher: (classId: string, teacherId: string) => Promise<void>;
}) {
  const [showAssignSubjects, setShowAssignSubjects] = useState(false);
  const [showAssignTeacher, setShowAssignTeacher] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availableSubjects = subjectOptions.filter(
    (s) => !classSubjects.some((cs) => cs.subject_id === s.id),
  );

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const teacherById = new Map(teachers.map((t) => [t.id, t]));

  const periodsByDay = new Map<string, typeof timetables>();
  timetables.forEach((t) => {
    const existing = periodsByDay.get(t.day_of_week) || [];
    existing.push(t);
    periodsByDay.set(t.day_of_week, existing);
  });

  const totalPeriods = timetables.length;

  const handleAssignSubjects = async () => {
    if (!selectedSubjectIds.length || submitting) return;
    setSubmitting(true);
    try {
      await onAssignSubjects(selectedClass.id, selectedSubjectIds);
      setSelectedSubjectIds([]);
      setShowAssignSubjects(false);
    } catch {
      // handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId || submitting) return;
    setSubmitting(true);
    try {
      await onAssignTeacher(selectedClass.id, selectedTeacherId);
      setSelectedTeacherId("");
      setShowAssignTeacher(false);
    } catch {
      // handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Class Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Class ID</span>
              <span className="font-mono text-xs text-slate-700">{selectedClass.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Class Name</span>
              <span className="font-medium text-slate-900">{selectedClass.class_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Section</span>
              <span className="text-slate-900">{selectedClass.section}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Academic Year</span>
              <span className="text-slate-900">{selectedClass.academic_year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Class Teacher</span>
              <span className="text-slate-900">
                {classTeacher ? classTeacher.employee_id : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Room Number</span>
              <span className="font-medium text-slate-900">
                {selectedClass.room_number || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                (selectedClass.status || "ACTIVE").toUpperCase() === "ACTIVE"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>
                {(selectedClass.status || "ACTIVE").toUpperCase() === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 italic">
            This is {selectedClass.class_name} — {selectedClass.section} for the academic year {selectedClass.academic_year}.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Timetable Summary</h4>
          {timetables.length === 0 ? (
            <p className="text-sm text-slate-500">Timetable data is not available yet.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>{totalPeriods} periods this week</span>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Array.from(periodsByDay.entries()).map(([day, periods]) => (
                  <div key={day} className="text-xs">
                    <p className="font-semibold text-slate-700 mb-1">{day}</p>
                    <div className="space-y-1 pl-3">
                      {periods
                        .sort((a, b) => String(a.period_no ?? 0).localeCompare(String(b.period_no ?? 0)))
                        .map((p, idx) => {
                          const subj = subjectById.get(p.subject_id);
                          const tch = teacherById.get(p.teacher_id);
                          return (
                            <div key={idx} className="flex items-center gap-2 text-slate-600">
                              <span className="font-medium text-slate-500">P{p.period_no ?? idx + 1}</span>
                              <span>{subj?.subject_code || "—"}</span>
                              <span className="text-slate-400">|</span>
                              <span>{tch?.employee_id || "—"}</span>
                              {p.room_no && <span className="text-slate-400">| {p.room_no}</span>}
                              <span className="text-slate-400">
                                {p.start_time.slice(0, 5)}–{p.end_time.slice(0, 5)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-900">Subjects in this Class</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAssignSubjects(!showAssignSubjects)}
              className="text-xs font-medium text-[#6d28d9] hover:underline"
            >
              Manage Subjects
            </button>
          </div>
        </div>
        {classSubjects.length === 0 ? (
          <p className="text-sm text-slate-500">No Subjects are assigned to this Class yet.</p>
        ) : (
          <div className="space-y-2">
            {classSubjects.map((cs) => {
              const subj = subjectById.get(cs.subject_id);
              const classTeacherForSubject = teacherSubjects.find(
                (ts) => ts.subject_id === cs.subject_id && ts.class_id === selectedClass.id,
              );
              const assignedTeacher = classTeacherForSubject
                ? teacherById.get(classTeacherForSubject.teacher_id)
                : undefined;
              return (
                <div
                  key={cs.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2.5"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-900">{subj?.subject_code || "—"}</span>
                    <span className="text-sm text-slate-600 ml-2">{subj?.subject_name || "—"}</span>
                    {assignedTeacher && (
                      <span className="text-xs text-slate-400 ml-2">| {assignedTeacher.employee_id}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showAssignSubjects && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Assign Subjects</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {availableSubjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    setSelectedSubjectIds((prev) =>
                      prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id],
                    )
                  }
                  className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                    selectedSubjectIds.includes(s.id)
                      ? "border-[#6d28d9] bg-purple-50 text-[#6d28d9]"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {selectedSubjectIds.length > 0 && (
              <button
                onClick={handleAssignSubjects}
                disabled={submitting}
                className="rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
              >
                {submitting ? "Assigning..." : `Assign ${selectedSubjectIds.length} Subject${selectedSubjectIds.length > 1 ? "s" : ""}`}
              </button>
            )}
            {availableSubjects.length === 0 && (
              <p className="text-xs text-slate-400">All available subjects are already assigned.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
