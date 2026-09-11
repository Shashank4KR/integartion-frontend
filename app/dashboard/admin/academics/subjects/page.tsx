"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import { Loader2, BookOpen } from "lucide-react";
import SubjectHeader from "@/components/dashboard/academics/subjects/SubjectHeader";
import SubjectSummaryCards from "@/components/dashboard/academics/subjects/SubjectSummaryCards";
import SubjectFilters from "@/components/dashboard/academics/subjects/SubjectFilters";
import SubjectsTable from "@/components/dashboard/academics/subjects/SubjectsTable";
import SubjectFormModal from "@/components/dashboard/academics/subjects/SubjectFormModal";
import DeleteSubjectDialog from "@/components/dashboard/academics/subjects/DeleteSubjectDialog";
import SubjectViewDrawer from "@/components/dashboard/academics/subjects/SubjectViewDrawer";
import SubjectsByDepartment from "@/components/dashboard/academics/subjects/SubjectsByDepartment";
import PopularSubjects from "@/components/dashboard/academics/subjects/PopularSubjects";
import RecentSubjectUpdates from "@/components/dashboard/academics/subjects/RecentSubjectUpdates";
import SubjectPagination from "@/components/dashboard/academics/subjects/SubjectPagination";
import {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/lib/services/subjectService";
import { listClasses } from "@/lib/services/classService";
import { listClassSubjects, createClassSubject, deleteClassSubject } from "@/lib/services/classSubjectService";
import { listTeachers } from "@/lib/services/teacherService";
import { listUsers } from "@/lib/services/userService";
import { listTeacherSubjects, createTeacherSubject, deleteTeacherSubject } from "@/lib/services/teacherSubjectService";
import { listDepartments } from "@/lib/services/departmentService";
import type {
  SubjectCreate,
  SubjectResponse,
  SubjectUpdate,
} from "@/types/entities/subject";
import type { ClassSubjectResponse } from "@/types/entities/class-subject";
import type { TeacherSubjectResponse } from "@/types/entities/teacher-subject";
import type { UserResponse } from "@/types/entities/user";

const PAGE_SIZE = 8;

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [departments, setDepartments] = useState<{ id: string; department_name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; class_name: string; section: string; academic_year: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; employee_id: string; user_id: string; email?: string }[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectResponse[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  const [search, setSearch] = useState("");
  const [classIdFilter, setClassIdFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubjectResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<SubjectResponse | null>(null);

  const [viewingItem, setViewingItem] = useState<SubjectResponse | null>(null);

  const [page, setPage] = useState(1);

  const [mappingResult, setMappingResult] = useState<{ success: string[]; failed: string[] } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("edtech_access_token");
    if (storedToken) setToken(storedToken);
  }, []);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [subjectData, classData, mappingData, teacherData, teacherMappingData, userData, deptData] = await Promise.allSettled([
        listSubjects(token),
        listClasses(token),
        listClassSubjects(token),
        listTeachers(token),
        listTeacherSubjects(token),
        listUsers(token),
        listDepartments(token),
      ]);

      if (subjectData.status === "fulfilled") {
        setSubjects(subjectData.value);
      }
      if (deptData.status === "fulfilled") {
        setDepartments(deptData.value.map((d) => ({ id: d.id, department_name: d.department_name })));
      }
      if (classData.status === "fulfilled") {
        setClasses(
          classData.value.map((c) => ({
            id: c.id,
            class_name: c.class_name,
            section: c.section,
            academic_year: c.academic_year,
          })),
        );
      }
      if (mappingData.status === "fulfilled") {
        setClassSubjects(mappingData.value);
      } else {
        setClassSubjects([]);
      }
      if (userData.status === "fulfilled") {
        setUsers(userData.value);
      }
      if (teacherData.status === "fulfilled") {
        const emailById = new Map<string, string>();
        if (userData.status === "fulfilled") {
          userData.value.forEach((u) => emailById.set(u.id, u.email));
        }
        setTeachers(
          teacherData.value.map((t) => ({
            id: t.id,
            employee_id: t.employee_id,
            user_id: t.user_id,
            email: emailById.get(t.user_id),
          })),
        );
      }
      if (teacherMappingData.status === "fulfilled") {
        setTeacherSubjects(teacherMappingData.value);
      } else {
        setTeacherSubjects([]);
      }

      const hasAnyFailure =
        subjectData.status === "rejected" &&
        classData.status === "rejected" &&
        mappingData.status === "rejected";
      if (hasAnyFailure) {
        setError("Backend is unreachable.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subjects data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const classCountBySubject = useMemo(() => {
    const map: Record<string, number> = {};
    classSubjects.forEach((cs) => {
      map[cs.subject_id] = (map[cs.subject_id] || 0) + 1;
    });
    return map;
  }, [classSubjects]);

  const teacherCountBySubject = useMemo(() => {
    const map: Record<string, number> = {};
    teacherSubjects.forEach((ts) => {
      map[ts.subject_id] = (map[ts.subject_id] || 0) + 1;
    });
    return map;
  }, [teacherSubjects]);

  const classOptions = useMemo(
    () => classes.map((c) => ({ id: c.id, label: `${c.class_name} — ${c.section}` })),
    [classes],
  );

  const uniqueAcademicYears = useMemo(() => {
    const years = new Set(classes.map((c) => c.academic_year).filter(Boolean));
    return Array.from(years).sort().reverse();
  }, [classes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return subjects.filter((s) => {
      if (term) {
        const haystack = `${s.subject_code} ${s.subject_name}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (classIdFilter) {
        const hasMapping = classSubjects.some(
          (cs) => cs.subject_id === s.id && cs.class_id === classIdFilter,
        );
        if (!hasMapping) return false;
      }
      if (academicYearFilter) {
        const hasMapping = classSubjects.some((cs) => {
          if (cs.subject_id !== s.id) return false;
          const cls = classes.find((c) => c.id === cs.class_id);
          return cls?.academic_year === academicYearFilter;
        });
        if (!hasMapping) return false;
      }
      return true;
    });
  }, [subjects, search, classIdFilter, academicYearFilter, classSubjects, classes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    setPage(1);
  }, [search, classIdFilter, academicYearFilter]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(null), 3000);
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const openAdd = () => {
    setEditingItem(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: SubjectResponse) => {
    setEditingItem(item);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => {
    const found = subjects.find((s) => s.id === id) ?? null;
    setDeletingItem(found);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const openView = (item: SubjectResponse) => {
    setViewingItem(item);
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

  const handleSubmit = async (payload: SubjectCreate | SubjectUpdate) => {
    if (submitting) return;
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateSubject(token, editingItem.id, payload as SubjectUpdate);
        showSuccess("Subject updated successfully.");
      } else {
        await createSubject(token, payload as SubjectCreate);
        showSuccess("Subject created successfully.");
      }
      closeForm();
      await loadAll();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save subject.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || submitting) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await deleteSubject(token, deletingItem.id);
      closeDelete();
      showSuccess("Subject deleted successfully.");
      await loadAll();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete subject.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignClasses = async (selectedClassIds: string[]) => {
    if (!viewingItem) return;
    const results = await Promise.allSettled(
      selectedClassIds.map((classId) =>
        createClassSubject(token, { class_id: classId, subject_id: viewingItem.id }),
      ),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    setMappingResult({ success: Array(succeeded).fill("ok"), failed: Array(failed).fill("err") });
    await loadAll();
  };

  const handleRemoveClassAssignment = async (mappingId: string) => {
    await deleteClassSubject(token, mappingId);
    await loadAll();
  };

  const handleAssignTeachers = async (payload: { teacher_id: string; class_id: string }[]) => {
    if (!viewingItem) return;
    const entry = payload[0];
    if (!entry) return;
    const teacherId = entry.teacher_id.trim();
    const classId = entry.class_id.trim();
    if (!teacherId || !classId) {
      throw new Error("Please select both a Teacher and a Class.");
    }
    await createTeacherSubject(token, {
      teacher_id: teacherId,
      subject_id: viewingItem.id,
      class_id: classId,
    });
    await loadAll();
    showSuccess("Teacher assigned to Subject successfully.");
    setViewingItem(null);
  };

  const handleRemoveTeacherAssignment = async (mappingId: string) => {
    await deleteTeacherSubject(token, mappingId);
    await loadAll();
    showSuccess("Teacher assignment removed successfully.");
  };

  const clearFilters = () => {
    setSearch("");
    setClassIdFilter("");
    setAcademicYearFilter("");
  };

  const refresh = async () => {
    await loadAll();
  };

  const exportCSV = () => {
    const headers = ["Subject Code", "Subject Name", "Subject Type", "Department", "Classes", "Credits / Periods", "Status"];
    const rows = paginated.map((s) => [
      s.subject_code,
      `"${s.subject_name}"`,
      "—",
      "—",
      String(classCountBySubject[s.id] ?? 0),
      "—",
      "—",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "subjects.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const assignedClassesForSubject = useMemo(() => {
    if (!viewingItem) return [];
    return classSubjects
      .filter((cs) => cs.subject_id === viewingItem.id)
      .map((cs) => {
        const cls = classes.find((c) => c.id === cs.class_id);
        return cls
          ? { id: cls.id, class_name: cls.class_name, section: cls.section, academic_year: cls.academic_year }
          : null;
      })
      .filter((c): c is { id: string; class_name: string; section: string; academic_year: string } => c !== null);
  }, [viewingItem, classSubjects, classes]);

  const teacherClassOptions = useMemo(
    () =>
      assignedClassesForSubject.map((c) => ({
        id: c.id,
        label: `${c.class_name} — ${c.section} — ${c.academic_year}`,
      })),
    [assignedClassesForSubject],
  );

  const deletingClassCount = useMemo(
    () => (deletingItem ? (classCountBySubject[deletingItem.id] ?? 0) : 0),
    [deletingItem, classCountBySubject],
  );
  const deletingTeacherCount = useMemo(
    () => (deletingItem ? (teacherCountBySubject[deletingItem.id] ?? 0) : 0),
    [deletingItem, teacherCountBySubject],
  );

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <SubjectHeader
            onAdd={openAdd}
            onRefresh={refresh}
            onExport={exportCSV}
            onResetFilters={clearFilters}
            onAssignClasses={() => setViewingItem((prev) => prev ?? subjects[0] ?? null)}
            onAssignTeachers={() => {
              if (!viewingItem && subjects.length > 0) {
                setViewingItem(subjects[0]);
              }
              setViewingItem((prev) => prev ?? subjects[0] ?? null);
            }}
          />

          {successMessage && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700" role="status" aria-live="polite">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && <SubjectSummaryCards items={filtered} />}

          {!loading && !error && (
            <SubjectFilters
              search={search}
              onSearchChange={setSearch}
              classId={classIdFilter}
              onClassIdChange={setClassIdFilter}
              classOptions={classOptions}
              onClear={clearFilters}
              academicYearFilter={academicYearFilter}
              onAcademicYearChange={setAcademicYearFilter}
              uniqueAcademicYears={uniqueAcademicYears}
            />
          )}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#6d28d9]" aria-label="Loading subjects" />
              </div>
            ) : error ? (
              <div className="py-12 text-center text-sm text-red-600">
                Unable to load subjects. Please try again.
              </div>
            ) : subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-12 w-12 text-slate-300 mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-600">No Subjects have been created yet.</p>
                <button
                  onClick={openAdd}
                  className="mt-3 rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
                >
                  Add Your First Subject
                </button>
              </div>
            ) : (
              <>
                <SubjectsTable
                  items={paginated}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  onView={openView}
                  classCountBySubject={classCountBySubject}
                  onManageAssignments={setViewingItem}
                  departments={departments}
                />
                {filtered.length > 0 && (
                  <SubjectPagination
                    page={safePage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={filtered.length}
                    pageSize={PAGE_SIZE}
                  />
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <SubjectsByDepartment subjects={subjects} departments={departments} />
            <PopularSubjects subjects={subjects} classSubjects={classSubjects} />
            <RecentSubjectUpdates subjects={subjects} />
          </div>

          <SubjectFormModal
            open={isFormOpen}
            onClose={closeForm}
            onSubmit={handleSubmit}
            submitting={submitting}
            formError={formError}
            editingItem={editingItem}
            departments={departments}
          />

          <DeleteSubjectDialog
            open={isDeleteOpen}
            onClose={closeDelete}
            onConfirm={handleDelete}
            submitting={submitting}
            formError={formError}
            item={deletingItem}
            classCount={deletingClassCount}
            teacherCount={deletingTeacherCount}
          />

          <SubjectViewDrawer
            open={!!viewingItem}
            onClose={() => setViewingItem(null)}
            item={viewingItem}
            assignedClasses={assignedClassesForSubject}
            classSubjects={classSubjects}
            teachers={teachers}
            teacherSubjects={teacherSubjects}
            classOptions={classOptions}
            teacherClassOptions={teacherClassOptions}
            onAssignClasses={handleAssignClasses}
            onRemoveClassAssignment={handleRemoveClassAssignment}
            onAssignTeachers={handleAssignTeachers}
            onRemoveTeacherAssignment={handleRemoveTeacherAssignment}
            departments={departments}
          />
        </div>
      </div>
    </MainLayout>
  );
}
