"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import { Loader2, RefreshCw } from "lucide-react";
import ExaminationsPageHeader from "@/components/dashboard/examinations/ExaminationsPageHeader";
import ExaminationSummaryCards from "@/components/dashboard/examinations/ExaminationSummaryCards";
import ExaminationFilters from "@/components/dashboard/examinations/ExaminationFilters";
import ExaminationsTable from "@/components/dashboard/examinations/ExaminationsTable";
import ExaminationPagination from "@/components/dashboard/examinations/ExaminationPagination";
import UpcomingExamsCard from "@/components/dashboard/examinations/UpcomingExamsCard";
import ExaminationTypesChart from "@/components/dashboard/examinations/ExaminationTypesChart";
import ExaminationOverviewChart from "@/components/dashboard/examinations/ExaminationOverviewChart";
import ResultsStatusChart from "@/components/dashboard/examinations/ResultsStatusChart";
import StudentsAppearedCard from "@/components/dashboard/examinations/StudentsAppearedCard";
import TopSubjectsCard from "@/components/dashboard/examinations/TopSubjectsCard";
import ExaminationQuickActions from "@/components/dashboard/examinations/ExaminationQuickActions";
import ExaminationDetailsDialog from "@/components/dashboard/examinations/ExaminationDetailsDialog";
import ExaminationActionDialog from "@/components/dashboard/examinations/ExaminationActionDialog";
import CreateExaminationDialog from "@/components/dashboard/examinations/CreateExaminationDialog";
import EditExaminationDialog from "@/components/dashboard/examinations/EditExaminationDialog";
import DeleteExaminationDialog from "@/components/dashboard/examinations/DeleteExaminationDialog";
import { getAllExams, createExam, updateExam, deleteExam } from "@/lib/services/examService";
import { listClasses } from "@/lib/services/classService";

function getDisplayCode(id: string): string {
  if (!id) return "-";
  return `EXAM-${id.slice(0, 6).toUpperCase()}`;
}

import type { ExamResponse } from "@/types/entities/exam";
import type { ClassResponse } from "@/types/entities/class";
type ExaminationRow = any;

const ITEMS_PER_PAGE = 10;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

const EXAM_TYPE_CHART_COLORS: Record<string, string> = {
  "Unit Test": "#6366f1",
  "Periodic Test": "#10b981",
  "Half Yearly": "#0ea5e9",
  "Pre Final": "#f97316",
  "Final": "#ef4444",
  "Annual": "#0ea5e9",
  "Others": "#8b5cf6",
};

function showToast(message: string) {
  const toast = document.createElement("div");
  toast.className = "fixed bottom-6 right-6 z-[200] rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-2xl";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
}

export default function ExaminationsPage() {
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [viewRow, setViewRow] = useState<ExaminationRow | null>(null);
  const [editRow, setEditRow] = useState<ExaminationRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<ExaminationRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [upcomingViewAllOpen, setUpcomingViewAllOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [quickActionTitle, setQuickActionTitle] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    academicYear: "",
    examType: "",
    classId: "",
    term: "",
    status: "",
    search: "",
    dateRangeStart: "",
    dateRangeEnd: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("edtech_access_token") : null;

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [examsData, classesData] = await Promise.allSettled([
        getAllExams(token),
        listClasses(token),
      ]);

      if (examsData.status === "fulfilled") {
        setExams(examsData.value);
      }
      if (classesData.status === "fulfilled") {
        setClasses(classesData.value);
      }

      if (examsData.status === "rejected" && classesData.status === "rejected") {
        setError("Backend is unreachable. Please try again.");
      } else if (examsData.status === "rejected") {
        setError(examsData.reason instanceof Error ? examsData.reason.message : "Failed to load examinations.");
      }
    } catch {
      setError("Failed to load examinations.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const classMap = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((c) => {
      map.set(c.id, `${c.class_name} — ${c.section}`);
    });
    return map;
  }, [classes]);

  const rows = useMemo<ExaminationRow[]>(() => {
    return exams.map((exam) => {
      const now = new Date();
      const start = new Date(exam.start_date);
      const end = new Date(exam.end_date);

      let status: "Upcoming" | "Ongoing" | "Completed";
      if (now < start) status = "Upcoming";
      else if (now > end) status = "Completed";
      else status = "Ongoing";

      const schedule = `${formatDate(exam.start_date)} - ${formatDate(exam.end_date)}`;

      return {
        id: exam.id,
        displayCode: getDisplayCode(exam.id),
        examName: exam.exam_name,
        type: exam.exam_type,
        classGrade: classMap.get(exam.class_id) || "—",
        classId: exam.class_id,
        term: "",
        schedule,
        subjects: "",
        students: 0,
        status,
        startDate: exam.start_date,
        endDate: exam.end_date,
        maxMarks: exam.max_marks,
        createdAt: exam.created_at,
        updatedAt: exam.updated_at,
      };
    });
  }, [exams, classMap]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filters.examType && row.type !== filters.examType) return false;
      if (filters.classId && row.classId !== filters.classId) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (filters.dateRangeStart && filters.dateRangeEnd) {
        const examStart = new Date(row.startDate);
        const examEnd = new Date(row.endDate);
        const filterStart = new Date(filters.dateRangeStart);
        const filterEnd = new Date(filters.dateRangeEnd);
        if (examStart > filterEnd || examEnd < filterStart) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        return (
          row.examName.toLowerCase().includes(q) ||
          row.displayCode.toLowerCase().includes(q) ||
          row.type.toLowerCase().includes(q) ||
          row.classGrade.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageRows = filteredRows.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.examType, filters.classId, filters.status, filters.dateRangeStart, filters.dateRangeEnd]);

  const summaryCards = useMemo(() => {
    const total = rows.length;
    const ongoing = rows.filter((r) => r.status === "Ongoing").length;
    const completed = rows.filter((r) => r.status === "Completed").length;

    return [
      {
        title: "Total Examinations",
        value: String(total),
        footer: "All time",
        iconBg: "bg-purple-50",
        iconColor: "text-[#7c3aed]",
        sparkline: [],
        sparkColor: "#7c3aed",
      },
      {
        title: "Active Exams",
        value: String(ongoing),
        footer: "Currently running",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
        sparkline: [],
        sparkColor: "#f97316",
      },
      {
        title: "Completed",
        value: String(completed),
        footer: "All time",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        sparkline: [],
        sparkColor: "#10b981",
      },
      {
        title: "Students Appeared",
        value: "—",
        footer: "No backend metric connected",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        sparkline: [],
        sparkColor: "#3b82f6",
      },
      {
        title: "Average Score",
        value: "—",
        footer: "No backend metric connected",
        iconBg: "bg-pink-50",
        iconColor: "text-pink-500",
        sparkline: [],
        sparkColor: "#ec4899",
      },
    ];
  }, [rows]);

  const examTypeData = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => {
      map.set(r.type, (map.get(r.type) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({
      label,
      value,
      color: EXAM_TYPE_CHART_COLORS[label] || "#6366f1",
    }));
  }, [rows]);

  const upcomingExams = useMemo(
    () =>
      rows
        .filter((r) => r.status === "Upcoming")
        .slice(0, 5)
        .map((r) => ({
          name: r.examName,
          class: r.classGrade,
          date: r.schedule,
        })),
    [rows]
  );

  const handleRetry = () => {
    loadData();
  };

  const resetFilters = () => {
    setFilters({
      academicYear: "",
      examType: "",
      classId: "",
      term: "",
      status: "",
      search: "",
      dateRangeStart: "",
      dateRangeEnd: "",
    });
    setCurrentPage(1);
  };

  const handleQuickAction = (action: string) => {
    setQuickActionTitle(action);
    setQuickActionOpen(true);
  };

  const handleCreate = async (payload: {
    exam_name: string;
    exam_type: string;
    class_id: string;
    start_date: string;
    end_date: string;
    max_marks: number;
  }) => {
    if (!token) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createExam(token, payload);
      showToast("Examination created successfully");
      setCreateOpen(false);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create examination.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (payload: {
    exam_name: string;
    exam_type: string;
    class_id: string;
    start_date: string;
    end_date: string;
    max_marks: number;
  }) => {
    if (!token || !editRow) return;
    setEditing(true);
    setEditError(null);
    try {
      await updateExam(token, editRow.id, payload);
      showToast("Examination updated successfully");
      setEditRow(null);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update examination.";
      setEditError(msg);
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteRow) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteExam(token, deleteRow.id);
      showToast("Examination deleted successfully");
      setDeleteRow(null);
      const remaining = filteredRows.length - 1;
      const totalPagesAfterDelete = Math.max(1, Math.ceil(remaining / ITEMS_PER_PAGE));
      if (safePage > totalPagesAfterDelete) {
        setCurrentPage(totalPagesAfterDelete);
      }
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete examination.";
      const friendly = msg.includes("409")
        ? "This examination cannot be deleted because it has dependent results or report cards. Please remove those first."
        : msg.includes("404")
          ? "Examination not found. It may have already been deleted."
          : msg;
      setDeleteError(friendly);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <ExaminationsPageHeader
            onCreateExamination={() => setCreateOpen(true)}
            onMoreOptions={() => setMoreOptionsOpen(true)}
          />

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          )}

          <ExaminationSummaryCards cards={summaryCards} />

          <ExaminationFilters
            onSearch={() => {}}
            onFilter={() => {}}
            onReset={resetFilters}
            academicYear={filters.academicYear}
            onAcademicYearChange={(value) => setFilters((f) => ({ ...f, academicYear: value, search: "" }))}
            examType={filters.examType}
            onExamTypeChange={(value) => setFilters((f) => ({ ...f, examType: value, search: "" }))}
            classId={filters.classId}
            onClassIdChange={(value) => setFilters((f) => ({ ...f, classId: value, search: "" }))}
            term={filters.term}
            onTermChange={(value) => setFilters((f) => ({ ...f, term: value, search: "" }))}
            status={filters.status}
            onStatusChange={(value) => setFilters((f) => ({ ...f, status: value, search: "" }))}
            searchQuery={filters.search}
            onSearchQueryChange={(value) => setFilters((f) => ({ ...f, search: value }))}
            dateRangeStart={filters.dateRangeStart}
            dateRangeEnd={filters.dateRangeEnd}
            onDateRangeStartChange={(value) => setFilters((f) => ({ ...f, dateRangeStart: value }))}
            onDateRangeEndChange={(value) => setFilters((f) => ({ ...f, dateRangeEnd: value }))}
            onDateRangeClear={() => setFilters((f) => ({ ...f, dateRangeStart: "", dateRangeEnd: "" }))}
            academicYearDisabled
            termDisabled
            classOptions={classes.map((c) => ({ id: c.id, label: `${c.class_name} — ${c.section}` }))}
            examTypeOptions={Array.from(new Set(exams.map((e) => e.exam_type)))}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              {loading ? (
                <div className="bg-white rounded-lg border border-slate-200 mb-6 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-3">Exam ID</th>
                          <th className="px-4 py-3">Examination Name</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Class / Grade</th>
                          <th className="px-4 py-3">Term</th>
                          <th className="px-4 py-3">Schedule</th>
                          <th className="px-4 py-3">Subjects</th>
                          <th className="px-4 py-3">Students</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 w-32 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-100" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-slate-100" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-100" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-12 rounded bg-slate-100" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-slate-100" /></td>
                            <td className="px-4 py-3"><div className="h-7 w-24 rounded bg-slate-100 ml-auto" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
                  <ExaminationsTable
                    rows={pageRows}
                    loading={false}
                    onView={(row) => setViewRow(row)}
                    onEdit={(row) => {
                      setEditRow(row);
                      setEditError(null);
                    }}
                    onDelete={(row) => {
                      setDeleteRow(row);
                      setDeleteError(null);
                    }}
                  />
                  {filteredRows.length > ITEMS_PER_PAGE && (
                    <ExaminationPagination
                      currentPage={safePage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={filteredRows.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  )}
                </>
              )}
            </div>
            <div className="space-y-6">
              <UpcomingExamsCard upcomingExams={upcomingExams} />
              <ExaminationTypesChart examTypes={examTypeData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            <ExaminationOverviewChart exams={exams} comingSoon />
            <ResultsStatusChart />
            <StudentsAppearedCard />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6">
            <ExaminationQuickActions onAction={handleQuickAction} />
            <TopSubjectsCard />
          </div>
        </div>
      </div>

      <CreateExaminationDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        classes={classes}
        loading={submitting}
        error={submitError}
      />

      <EditExaminationDialog
        open={!!editRow}
        onClose={() => setEditRow(null)}
        row={editRow}
        classes={classes}
        onSave={handleEdit}
        loading={editing}
        error={editError}
      />

      <ExaminationDetailsDialog
        open={!!viewRow}
        onClose={() => setViewRow(null)}
        row={viewRow}
        token={token}
      />

      <DeleteExaminationDialog
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        row={deleteRow}
        onConfirm={handleDelete}
        loading={deleting}
        error={deleteError}
      />

      <ExaminationActionDialog
        open={moreOptionsOpen}
        onClose={() => setMoreOptionsOpen(false)}
        title="More Options"
        message="Additional examination management options will be available here in a future update."
      />

      <ExaminationActionDialog
        open={upcomingViewAllOpen}
        onClose={() => setUpcomingViewAllOpen(false)}
        title="Upcoming Exams"
        message="A full calendar view of upcoming examinations will be available here in a future update."
      />

      <ExaminationActionDialog
        open={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        title={quickActionTitle}
        message={`The "${quickActionTitle}" workflow will be connected to the backend in the integration phase.`}
      />
    </MainLayout>
  );
}
