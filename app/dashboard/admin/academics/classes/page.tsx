"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import { Loader2 } from "lucide-react";
import ClassHeader from "@/components/dashboard/academics/classes/ClassHeader";
import ClassSummaryCards from "@/components/dashboard/academics/classes/ClassSummaryCards";
import ClassFilters from "@/components/dashboard/academics/classes/ClassFilters";
import ClassesTable from "@/components/dashboard/academics/classes/ClassesTable";
import ClassFormModal from "@/components/dashboard/academics/classes/ClassFormModal";
import DeleteClassDialog from "@/components/dashboard/academics/classes/DeleteClassDialog";
import ClassDetailsPanel from "@/components/dashboard/academics/classes/ClassDetailsPanel";
import {
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassSubjects,
  getClassTeachers,
} from "@/lib/services/classService";
import { listTeachers } from "@/lib/services/teacherService";
import { listUsers } from "@/lib/services/userService";
import { listClassSubjects, createClassSubject, deleteClassSubject } from "@/lib/services/classSubjectService";
import { listTeacherSubjects, createTeacherSubject, deleteTeacherSubject } from "@/lib/services/teacherSubjectService";
import { listStudents } from "@/lib/services/studentService";
import { listSubjects } from "@/lib/services/subjectService";
import type {
  ClassCreate,
  ClassResponse,
  ClassUpdate,
} from "@/types/entities/class";
import type { TeacherResponse } from "@/types/entities/teacher";
import type { UserResponse } from "@/types/entities/user";
import type { ClassSubjectResponse } from "@/types/entities/class-subject";
import type { TeacherSubjectResponse } from "@/types/entities/teacher-subject";
import type { TimetableResponse } from "@/types/entities/timetable";

const PAGE_SIZE = 8;

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectResponse[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubjectResponse[]>([]);
  const [students, setStudents] = useState<{ id: string; admission_no: string; first_name: string | null; last_name: string | null; roll_no: string | null; class_id: string }[]>([]);
  const [timetables, setTimetables] = useState<TimetableResponse[]>([]);
  const [allSubjects, setAllSubjects] = useState<{ id: string; subject_code: string; subject_name: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [section, setSection] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ClassResponse | null>(null);

  const [selectedClass, setSelectedClass] = useState<ClassResponse | null>(null);
  const [detailsTab, setDetailsTab] = useState<"overview" | "students" | "subjects" | "teachers" | "attendance">("overview");
  const [statusFilter, setStatusFilter] = useState("");
  const [directClassSubjects, setDirectClassSubjects] = useState<{ id: string; subject_name: string }[]>([]);
  const [directClassTeachers, setDirectClassTeachers] = useState<{ id: string; employee_id: string }[]>([]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleViewClass = (
    item: ClassResponse,
    tab: "overview" | "students" | "subjects" | "teachers" | "attendance" = "overview",
  ) => {
    setSelectedClass(item);
    setDetailsTab(tab);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("edtech_access_token");
    if (storedToken) setToken(storedToken);
  }, []);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [classData, teacherData, userData, mappingData, teacherMappingData, studentData, timetableData, subjectData] = await Promise.allSettled([
        listClasses(token),
        listTeachers(token),
        listUsers(token),
        listClassSubjects(token),
        listTeacherSubjects(token),
        listStudents(token),
        fetch(`/api/timetables`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(async (res) => {
          if (!res.ok) return [];
          const text = await res.text();
          if (!text) return [];
          return JSON.parse(text) as TimetableResponse[];
        }),
        listSubjects(token),
      ]);

      if (classData.status === "fulfilled") setClasses(classData.value);
      if (teacherData.status === "fulfilled") setTeachers(teacherData.value);
      if (userData.status === "fulfilled") setUsers(userData.value);
      if (mappingData.status === "fulfilled") setClassSubjects(mappingData.value);
      else setClassSubjects([]);
      if (teacherMappingData.status === "fulfilled") setTeacherSubjects(teacherMappingData.value);
      else setTeacherSubjects([]);
      if (studentData.status === "fulfilled") {
        setStudents(
          studentData.value.map((s) => ({
            id: s.id,
            admission_no: s.admission_no,
            first_name: s.first_name ?? null,
            last_name: s.last_name ?? null,
            roll_no: s.roll_no ?? null,
            class_id: s.class_id || "",
          })),
        );
      }
      if (timetableData.status === "fulfilled") setTimetables(timetableData.value);
      else setTimetables([]);
      if (subjectData.status === "fulfilled") {
        setAllSubjects(subjectData.value);
      }

      const hasAnyFailure =
        classData.status === "rejected" &&
        teacherData.status === "rejected" &&
        userData.status === "rejected";
      if (hasAnyFailure) {
        setError("Backend is unreachable.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load classes data.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!selectedClass || !token) {
      setDirectClassSubjects([]);
      setDirectClassTeachers([]);
      return;
    }
    let cancelled = false;
    const loadDirect = async () => {
      try {
        const [subjectsData, teachersData] = await Promise.all([
          getClassSubjects(token, selectedClass.id),
          getClassTeachers(token, selectedClass.id),
        ]);
        if (!cancelled) {
          setDirectClassSubjects(subjectsData);
          setDirectClassTeachers(teachersData);
        }
      } catch {
        if (!cancelled) {
          setDirectClassSubjects([]);
          setDirectClassTeachers([]);
        }
      }
    };
    loadDirect();
    return () => {
      cancelled = true;
    };
  }, [selectedClass?.id, token]);

  const userEmailById = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => map.set(u.id, u.email));
    return map;
  }, [users]);

  const teacherById = useMemo(() => {
    const map = new Map<string, TeacherResponse>();
    teachers.forEach((t) => map.set(t.id, t));
    return map;
  }, [teachers]);

  const teacherLabel = useCallback(
    (id?: string | null): string => {
      if (!id) return "—";
      const teacher = teacherById.get(id);
      if (!teacher) return id;
      const email = userEmailById.get(teacher.user_id);
      return email ? `${teacher.employee_id} — ${email}` : teacher.employee_id;
    },
    [teacherById, userEmailById],
  );

  const teacherOptions = useMemo(
    () =>
      teachers.map((t) => ({
        id: t.id,
        label: (() => {
          const email = userEmailById.get(t.user_id);
          return email ? `${t.employee_id} — ${email}` : t.employee_id;
        })(),
      })),
    [teachers, userEmailById],
  );

  const academicYearOptions = useMemo(
    () => Array.from(new Set(classes.map((c) => c.academic_year))).sort(),
    [classes],
  );

  const sectionOptions = useMemo(
    () => Array.from(new Set(classes.map((c) => c.section))).sort(),
    [classes],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return classes.filter((c) => {
      if (academicYear && c.academic_year !== academicYear) return false;
      if (section && c.section !== section) return false;
      if (teacherId && c.class_teacher_id !== teacherId) return false;
      if (statusFilter && (c.status || "ACTIVE") !== statusFilter) return false;
      if (term) {
        const haystack = [
          c.class_name,
          c.section,
          c.academic_year,
          c.room_number || "",
          c.status || "",
          teacherLabel(c.class_teacher_id),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [classes, academicYear, section, teacherId, statusFilter, search, teacherLabel]);

  const classSubjectCount = useMemo(() => {
    const map: Record<string, number> = {};
    classSubjects.forEach((cs) => {
      map[cs.class_id] = (map[cs.class_id] || 0) + 1;
    });
    return map;
  }, [classSubjects]);

  const classStudentCount = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((s) => {
      if (s.class_id) {
        map[s.class_id] = (map[s.class_id] || 0) + 1;
      }
    });
    return map;
  }, [students]);

  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    setPage(1);
  }, [search, academicYear, section, teacherId, statusFilter]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(null), 3000);
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: ClassResponse) => {
    setEditingItem(item);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => {
    const found = classes.find((c) => c.id === id) ?? null;
    setDeletingItem(found);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormError(null);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeletingItem(null);
    setFormError(null);
  };

  const handleSubmit = async (payload: ClassCreate | ClassUpdate) => {
    if (submitting) return;
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateClass(token, editingItem.id, payload as ClassUpdate);
        showSuccess("Class updated successfully.");
      } else {
        await createClass(token, payload as ClassCreate);
        showSuccess("Class created successfully.");
      }
      closeForm();
      await loadAll();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save class.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || submitting) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await deleteClass(token, deletingItem.id);
      closeDelete();
      showSuccess("Class deleted successfully.");
      await loadAll();
      if (selectedClass?.id === deletingItem.id) {
        setSelectedClass(null);
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to delete class.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setAcademicYear("");
    setSection("");
    setTeacherId("");
    setStatusFilter("");
  };

  const refresh = async () => {
    await loadAll();
  };

  const exportCSV = () => {
    const headers = ["Class Name", "Section", "Academic Year", "Class Teacher", "Students", "Subjects", "Room No.", "Status"];
    const rows = paginated.map((c) => [
      `"${c.class_name}"`,
      c.section,
      c.academic_year,
      `"${teacherLabel(c.class_teacher_id)}"`,
      String(classStudentCount[c.id] ?? 0),
      String(classSubjectCount[c.id] ?? 0),
      `"${c.room_number || "—"}"`,
      c.status || "ACTIVE",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "classes.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAssignSubjects = async (classId: string, subjectIds: string[]) => {
    await Promise.allSettled(
      subjectIds.map((sid) => createClassSubject(token, { class_id: classId, subject_id: sid })),
    );
    await loadAll();
  };

  const handleRemoveSubject = async (mappingId: string) => {
    await deleteClassSubject(token, mappingId);
    await loadAll();
  };

  const handleAssignTeacher = async (classId: string, teacherIdToAssign: string) => {
    const classSubjIds = classSubjects
      .filter((cs) => cs.class_id === classId)
      .map((cs) => cs.subject_id);
    await Promise.allSettled(
      classSubjIds.map((sid) =>
        createTeacherSubject(token, {
          teacher_id: teacherIdToAssign,
          subject_id: sid,
          class_id: classId,
        }),
      ),
    );
    await loadAll();
  };

  const handleRemoveTeacherSubject = async (mappingId: string) => {
    await deleteTeacherSubject(token, mappingId);
    await loadAll();
  };

  const selectedClassSubjects = useMemo(
    () => classSubjects.filter((cs) => cs.class_id === selectedClass?.id),
    [classSubjects, selectedClass],
  );

  const selectedClassTeacherSubjects = useMemo(
    () => teacherSubjects.filter((ts) => ts.class_id === selectedClass?.id),
    [teacherSubjects, selectedClass],
  );

  const selectedClassStudents = useMemo(
    () => students.filter((s) => s.class_id === selectedClass?.id),
    [students, selectedClass],
  );

  const selectedClassTimetables = useMemo(
    () => timetables.filter((t) => t.class_id === selectedClass?.id),
    [timetables, selectedClass],
  );

  const subjectOptions = useMemo(
    () =>
      allSubjects.map((s) => ({
        id: s.id,
        label: `${s.subject_code} — ${s.subject_name}`,
      })),
    [allSubjects],
  );

  const classOptions = useMemo(
    () => classes.map((c) => ({ id: c.id, label: `${c.class_name} — ${c.section}` })),
    [classes],
  );

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <ClassHeader
            onAdd={openAdd}
            onRefresh={refresh}
            onExport={exportCSV}
            onResetFilters={clearFilters}
            onAssignSubjects={() => {
              const target = selectedClass || filtered[0] || classes[0];
              if (target) handleViewClass(target, "subjects");
            }}
            onAssignTeacher={() => {
              const target = selectedClass || filtered[0] || classes[0];
              if (target) handleViewClass(target, "teachers");
            }}
          />

          {successMessage && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && (
            <ClassSummaryCards items={filtered} studentCount={Object.values(classStudentCount).reduce((a, b) => a + b, 0)} />
          )}

          {!loading && !error && (
            <ClassFilters
              search={search}
              onSearchChange={setSearch}
              academicYear={academicYear}
              onAcademicYearChange={setAcademicYear}
              section={section}
              onSectionChange={setSection}
              teacherId={teacherId}
              onTeacherIdChange={setTeacherId}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              academicYearOptions={academicYearOptions}
              sectionOptions={sectionOptions}
              teacherOptions={teacherOptions}
              onClear={clearFilters}
            />
          )}

          <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[#6d28d9]" />
              </div>
            ) : error ? (
              <div className="py-12 text-center text-sm text-red-600">
                Unable to load classes. Please try again.
              </div>
            ) : classes.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No Classes have been created yet.
              </div>
            ) : (
              <ClassesTable
                items={paginated}
                onEdit={openEdit}
                onDelete={openDelete}
                onView={handleViewClass}
                teacherLabel={teacherLabel}
                classSubjectCount={classSubjectCount}
                classStudentCount={classStudentCount}
              />
            )}
          </div>

          {!loading && !error && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Showing {(safePage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} Classes
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                      p === safePage
                        ? "bg-[#6d28d9] text-white"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {selectedClass && (
            <ClassDetailsPanel
              initialTab={detailsTab}
              selectedClass={selectedClass}
              classSubjects={selectedClassSubjects}
              subjects={allSubjects}
              teachers={teachers.map((t) => ({ id: t.id, employee_id: t.employee_id, user_id: t.user_id }))}
              teacherSubjects={selectedClassTeacherSubjects}
              students={selectedClassStudents}
              classOptions={classOptions}
              subjectOptions={subjectOptions}
              teacherOptions={teacherOptions}
              timetables={selectedClassTimetables}
              directClassSubjects={directClassSubjects}
              directClassTeachers={directClassTeachers}
              onAssignSubjects={handleAssignSubjects}
              onRemoveSubject={handleRemoveSubject}
              onAssignTeacher={handleAssignTeacher}
              onRemoveTeacherSubject={handleRemoveTeacherSubject}
              onClose={() => setSelectedClass(null)}
            />
          )}

          <ClassFormModal
            open={isFormOpen}
            onClose={closeForm}
            onSubmit={handleSubmit}
            submitting={submitting}
            formError={formError}
            editingItem={editingItem}
            teacherOptions={teacherOptions}
          />

          <DeleteClassDialog
            open={isDeleteOpen}
            onClose={closeDelete}
            onConfirm={handleDelete}
            submitting={submitting}
            formError={formError}
            item={deletingItem}
          />
        </div>
      </div>
    </MainLayout>
  );
}
