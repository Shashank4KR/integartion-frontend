"use client";

import { useState, useEffect } from "react";
import type { ClassResponse } from "@/types/entities/class";
import ClassOverviewTab from "./ClassOverviewTab";
import ClassStudentsTab from "./ClassStudentsTab";
import ClassSubjectsTab from "./ClassSubjectsTab";
import ClassTeachersTab from "./ClassTeachersTab";
import ClassAttendanceTab from "./ClassAttendanceTab";

type Tab = "overview" | "students" | "subjects" | "teachers" | "attendance";

interface ClassDetailsPanelProps {
  selectedClass: ClassResponse;
  initialTab?: Tab;
  classSubjects: { id: string; subject_id: string }[];
  subjects: { id: string; subject_code: string; subject_name: string }[];
  teachers: { id: string; employee_id: string; user_id: string }[];
  teacherSubjects: { id: string; teacher_id: string; subject_id: string; class_id: string }[];
  students: { id: string; admission_no: string; first_name: string | null; last_name: string | null; roll_no: string | null; class_id: string }[];
  classOptions: { id: string; label: string }[];
  subjectOptions: { id: string; label: string }[];
  teacherOptions: { id: string; label: string }[];
  timetables: { day_of_week: string; start_time: string; end_time: string; room_no: string | null; period_no: number | null; subject_id: string; teacher_id: string }[];
  directClassSubjects: { id: string; subject_name: string }[];
  directClassTeachers: { id: string; employee_id: string }[];
  onAssignSubjects: (classId: string, subjectIds: string[]) => Promise<void>;
  onRemoveSubject: (mappingId: string) => Promise<void>;
  onAssignTeacher: (classId: string, teacherId: string) => Promise<void>;
  onRemoveTeacherSubject: (mappingId: string) => Promise<void>;
  onClose: () => void;
}

export default function ClassDetailsPanel({
  selectedClass,
  initialTab = "overview",
  classSubjects,
  subjects,
  teachers,
  teacherSubjects,
  students,
  classOptions,
  subjectOptions,
  teacherOptions,
  timetables,
  directClassSubjects,
  directClassTeachers,
  onAssignSubjects,
  onRemoveSubject,
  onAssignTeacher,
  onRemoveTeacherSubject,
  onClose,
}: ClassDetailsPanelProps) {
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab, selectedClass.id]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "students", label: `Students (${students.length})` },
    { key: "subjects", label: `Subjects (${classSubjects.length})` },
    { key: "teachers", label: "Teachers" },
    { key: "attendance", label: "Attendance Overview" },
  ];

  const classTeacher = teachers.find((t) => t.id === selectedClass.class_teacher_id);

  return (
    <div className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {selectedClass.class_name} — {selectedClass.section}
            </h3>
            <span className="text-xs text-slate-500">{selectedClass.academic_year}</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Close
          </button>
        </div>

        <div className="flex border-b border-slate-200 bg-white px-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium transition border-b-2 whitespace-nowrap ${
                tab === t.key
                  ? "border-[#6d28d9] text-[#6d28d9]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "overview" && (
            <ClassOverviewTab
              selectedClass={selectedClass}
              classTeacher={classTeacher}
              students={students}
              classSubjects={classSubjects}
              subjects={subjects}
              teachers={teachers}
              teacherSubjects={teacherSubjects}
              timetables={timetables}
              subjectOptions={subjectOptions}
              onAssignSubjects={onAssignSubjects}
              onAssignTeacher={onAssignTeacher}
            />
          )}
          {tab === "students" && (
            <ClassStudentsTab students={students} classOptions={classOptions} />
          )}
          {tab === "subjects" && (
            <ClassSubjectsTab
              classId={selectedClass.id}
              classSubjects={classSubjects}
              subjects={subjects}
              teacherSubjects={teacherSubjects}
              teachers={teachers}
              subjectOptions={subjectOptions}
              directClassSubjects={directClassSubjects}
              onAssign={onAssignSubjects}
              onRemove={onRemoveSubject}
            />
          )}
          {tab === "teachers" && (
            <ClassTeachersTab
              selectedClass={selectedClass}
              classTeacher={classTeacher}
              teacherSubjects={teacherSubjects}
              subjects={subjects}
              teachers={teachers}
              classOptions={classOptions}
              teacherOptions={teacherOptions}
              directClassTeachers={directClassTeachers}
              onAssignTeacher={onAssignTeacher}
              onRemoveTeacherSubject={onRemoveTeacherSubject}
            />
          )}
          {tab === "attendance" && (
            <ClassAttendanceTab classId={selectedClass.id} />
          )}
        </div>
      </div>
    </div>
  );
}
