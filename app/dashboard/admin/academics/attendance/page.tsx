"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import AttendancePageHeader from "@/components/dashboard/academics/attendance/AttendancePageHeader";
import AttendanceSummaryCards from "@/components/dashboard/academics/attendance/AttendanceSummaryCards";
import AttendanceFilters from "@/components/dashboard/academics/attendance/AttendanceFilters";
import AttendanceTable from "@/components/dashboard/academics/attendance/AttendanceTable";
import AttendancePagination from "@/components/dashboard/academics/attendance/AttendancePagination";
import AttendanceOverviewChart from "@/components/dashboard/academics/attendance/AttendanceOverviewChart";
import AttendanceTrendChart from "@/components/dashboard/academics/attendance/AttendanceTrendChart";
import TopPerformingClasses from "@/components/dashboard/academics/attendance/TopPerformingClasses";
import AttendanceQuickActions from "@/components/dashboard/academics/attendance/AttendanceQuickActions";
import MarkAttendanceDialog from "@/components/dashboard/academics/attendance/MarkAttendanceDialog";
import BulkAttendanceDialog from "@/components/dashboard/academics/attendance/BulkAttendanceDialog";
import Modal from "@/components/shared/Modal";
import { listClasses, getClassSubjects, getClassTeachers, getClassStudents } from "@/lib/services/classService";
import {
  getAllAttendance,
  getClassAttendanceSummary,
  createAttendance,
  createBulkAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByStudent,
} from "@/lib/services/attendanceService";
import { getStoredUser } from "@/lib/auth";
import type { ClassResponse } from "@/types/entities/class";
import type { ClassSubjectSummary } from "@/types/entities/class-subject-summary";
import type { StudentResponse } from "@/types/entities/student";
import type { AttendanceTableRow } from "@/components/dashboard/academics/attendance/AttendanceTable";
import type { AttendanceResponse, AttendanceStatus, ClassAttendanceSummary } from "@/types/entities/attendance";

const ITEMS_PER_PAGE = 10;

function getDailyStudentStatus(records: AttendanceResponse[]): "PRESENT" | "ABSENT" | "LATE" {
  const statuses = new Set(records.map((r) => r.status));
  if (statuses.has("ABSENT")) return "ABSENT";
  if (statuses.has("LATE")) return "LATE";
  if (statuses.has("PRESENT")) return "PRESENT";
  return "ABSENT";
}

function computeDailyStats(records: AttendanceResponse[]): {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendancePct: number;
} {
  const grouped = new Map<string, AttendanceResponse[]>();
  records.forEach((record) => {
    const existing = grouped.get(record.student_id) || [];
    existing.push(record);
    grouped.set(record.student_id, existing);
  });

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;

  grouped.forEach((studentRecords) => {
    const status = getDailyStudentStatus(studentRecords);
    if (status === "PRESENT") presentCount++;
    else if (status === "ABSENT") absentCount++;
    else lateCount++;
  });

  const totalStudents = grouped.size;
  const attendancePct = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return { totalStudents, presentCount, absentCount, lateCount, attendancePct };
}

function toISODate(display: string): string {
  const parts = display.trim().split(" ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const months: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10);
    if (!Number.isNaN(day) && month && !Number.isNaN(year)) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  const d = new Date(display);
  if (!Number.isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return display;
}

function formatDateForDisplay(isoDate: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const day = parseInt(parts[2], 10);
  const month = months[parseInt(parts[1], 10) - 1];
  const year = parts[0];
  if (Number.isNaN(day) || !month) return isoDate;
  return `${day} ${month} ${year}`;
}

const todayISO = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
})();

export default function AttendancePage() {
  const [token, setToken] = useState("");
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectSummary[]>([]);
  const [classTeachers, setClassTeachers] = useState<{ id: string; employee_id: string }[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);

  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDateISO, setSelectedDateISO] = useState(todayISO);
  const [viewType, setViewType] = useState("Daily View");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "">("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceResponse[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [attendanceRetryKey, setAttendanceRetryKey] = useState(0);

  const [classSummary, setClassSummary] = useState<ClassAttendanceSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);
  const [bulkAttendanceOpen, setBulkAttendanceOpen] = useState(false);
  const [quickAction, setQuickAction] = useState<string | null>(null);

  const markedBy = useMemo(() => getStoredUser()?.id ?? "", []);

  useEffect(() => {
    const storedToken = localStorage.getItem("edtech_access_token");
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const loadClasses = async () => {
      setClassesLoading(true);
      setClassesError(null);
      try {
        const data = await listClasses(token);
        if (!cancelled) {
          setClasses(data);
          const years = Array.from(new Set(data.map((c) => c.academic_year).filter(Boolean))).sort().reverse();
          if (years.length > 0 && !selectedAcademicYear) {
            const currentYear = years[0];
            setSelectedAcademicYear(currentYear);
            const classesInYear = data.filter((c) => c.academic_year === currentYear);
            if (classesInYear.length > 0 && !selectedClassId) {
              setSelectedClassId(classesInYear[0].id);
            }
          } else if (years.length > 0 && selectedAcademicYear && !data.some((c) => c.id === selectedClassId)) {
            const classesInYear = data.filter((c) => c.academic_year === selectedAcademicYear);
            if (classesInYear.length > 0) {
              setSelectedClassId(classesInYear[0].id);
            } else {
              setSelectedClassId("");
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setClassesError(err instanceof Error ? err.message : "Unable to load classes.");
        }
      } finally {
        if (!cancelled) setClassesLoading(false);
      }
    };
    loadClasses();
    return () => { cancelled = true; };
  }, [token]);

  const academicYearOptions = useMemo(() => {
    const years = new Set(classes.map((c) => c.academic_year).filter(Boolean));
    return Array.from(years).sort().reverse();
  }, [classes]);

  const filteredClasses = useMemo(() => {
    if (!selectedAcademicYear) return classes;
    return classes.filter((c) => c.academic_year === selectedAcademicYear);
  }, [classes, selectedAcademicYear]);

  const classOptions = useMemo(() => {
    return filteredClasses.map((c) => ({
      value: c.id,
      label: `${c.class_name} — ${c.section}`,
    }));
  }, [filteredClasses]);

  const subjectOptions = useMemo(() => {
    return classSubjects.map((s) => ({
      value: s.id,
      label: s.subject_name,
    }));
  }, [classSubjects]);

  const teacherOptions = useMemo(() => {
    return classTeachers.map((t) => ({
      value: t.id,
      label: t.employee_id,
    }));
  }, [classTeachers]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const selectedDateDisplay = useMemo(() => formatDateForDisplay(selectedDateISO), [selectedDateISO]);

  useEffect(() => {
    if (!token || !selectedClassId) {
      setClassSubjects([]);
      setClassTeachers([]);
      setStudents([]);
      setSelectedSubjectId("");
      return;
    }
    let cancelled = false;
    const loadDependent = async () => {
      setSubjectsLoading(true);
      setTeachersLoading(true);
      setStudentsLoading(true);
      setSubjectsError(null);
      setTeachersError(null);
      setStudentsError(null);
      try {
        const [subjectsData, teachersData, studentsData] = await Promise.allSettled([
          getClassSubjects(token, selectedClassId),
          getClassTeachers(token, selectedClassId),
          getClassStudents(token, selectedClassId),
        ]);

        if (!cancelled) {
          if (subjectsData.status === "fulfilled") {
            setClassSubjects(subjectsData.value);
          } else {
            setClassSubjects([]);
            setSubjectsError("Unable to load subjects.");
          }
          if (teachersData.status === "fulfilled") {
            setClassTeachers(
              (teachersData.value ?? []).map((t) => ({ id: t.id, employee_id: t.employee_id })),
            );
          } else {
            setClassTeachers([]);
            setTeachersError("Unable to load teachers.");
          }
          if (studentsData.status === "fulfilled") {
            setStudents(studentsData.value);
          } else {
            setStudents([]);
            setStudentsError("Unable to load students.");
          }
        }
      } catch {
        if (!cancelled) {
          setSubjectsError("Unable to load subjects.");
          setTeachersError("Unable to load teachers.");
          setStudentsError("Unable to load students.");
        }
      } finally {
        if (!cancelled) {
          setSubjectsLoading(false);
          setTeachersLoading(false);
          setStudentsLoading(false);
        }
      }
    };
    loadDependent();
    return () => { cancelled = true; };
  }, [token, selectedClassId]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const loadAttendance = async () => {
      setAttendanceLoading(true);
      setAttendanceError(null);
      try {
        const params: {
          class_id?: string;
          start_date?: string;
          end_date?: string;
          subject_id?: string;
          status?: AttendanceStatus;
        } = {};

        if (selectedClassId) params.class_id = selectedClassId;
        if (selectedDateISO) {
          params.start_date = selectedDateISO;
          params.end_date = selectedDateISO;
        }
        if (selectedSubjectId) params.subject_id = selectedSubjectId;
        if (statusFilter) params.status = statusFilter;

        const data = await getAllAttendance(token, params);
        if (!cancelled) {
          setAttendanceRecords(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setAttendanceError(err instanceof Error ? err.message : "Unable to load attendance records.");
          setAttendanceRecords([]);
        }
      } finally {
        if (!cancelled) {
          setAttendanceLoading(false);
        }
      }
    };

    loadAttendance();
    return () => { cancelled = true; };
  }, [token, selectedClassId, selectedDateISO, selectedSubjectId, statusFilter, attendanceRetryKey]);

  useEffect(() => {
    if (!token || !selectedClassId) {
      setClassSummary(null);
      return;
    }
    let cancelled = false;
    const loadSummary = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const data = await getClassAttendanceSummary(token, selectedClassId);
        if (!cancelled) {
          setClassSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setSummaryError(err instanceof Error ? err.message : "Unable to load class summary.");
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    };
    loadSummary();
    return () => { cancelled = true; };
  }, [token, selectedClassId]);

  const studentMap = useMemo(() => {
    const map = new Map<string, StudentResponse>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  const tableRows = useMemo<AttendanceTableRow[]>(() => {
    const grouped = new Map<string, AttendanceResponse[]>();
    attendanceRecords.forEach((record) => {
      const existing = grouped.get(record.student_id) || [];
      existing.push(record);
      grouped.set(record.student_id, existing);
    });

    const search = searchTerm.trim().toLowerCase();
    const filteredEntries = search
      ? Array.from(grouped.entries()).filter(([studentId, records]) => {
          const student = studentMap.get(studentId);
          if (!student) return false;
          const fullName = `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim().toLowerCase();
          const rollNo = (student.roll_no ?? "").toLowerCase();
          const admissionNo = (student.admission_no ?? "").toLowerCase();
          return (
            fullName.includes(search) ||
            rollNo.includes(search) ||
            admissionNo.includes(search)
          );
        })
      : Array.from(grouped.entries());

    return filteredEntries.map(([studentId, records]) => {
      const student = studentMap.get(studentId);
      const subjectStatuses: Record<string, "present" | "absent" | "late" | null> = {};
      let presentCount = 0;
      let absentCount = 0;

      records.forEach((r) => {
        const status = r.status.toLowerCase() as "present" | "absent" | "late";
        subjectStatuses[r.subject_id] = status;
        if (r.status === "PRESENT") presentCount++;
        else if (r.status === "ABSENT") absentCount++;
      });

      const total = presentCount + absentCount + records.filter((r) => r.status === "LATE").length;
      const overall = total > 0 ? Math.round((presentCount / total) * 100) : 0;

      const dailyStatus = getDailyStudentStatus(records);
      const dailyStatusLabel = dailyStatus.toLowerCase() as "present" | "absent" | "late";

      return {
        studentId,
        rollNo: student?.roll_no ?? "",
        name:
          student
            ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() || "Unknown"
            : "Unknown",
        initials:
          student
            ? `${student.first_name?.[0] ?? ""}${student.last_name?.[0] ?? ""}`.toUpperCase() || "?"
            : "?",
        subjectStatuses,
        overall,
        presentCount,
        absentCount,
        dailyStatus: dailyStatusLabel,
      };
    });
  }, [attendanceRecords, studentMap, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return tableRows.slice(start, start + ITEMS_PER_PAGE);
  }, [tableRows, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClassId, selectedDateISO, selectedSubjectId, statusFilter, searchTerm]);

  const summaryCards = useMemo(() => {
    const baseCards: { title: string; value: string; footer: string; iconBg: string; iconColor: string; sparkline: number[]; sparkColor: string }[] = [
      { title: "Today's Attendance", value: "—", footer: "No data", iconBg: "bg-purple-50", iconColor: "text-[#7c3aed]", sparkline: [], sparkColor: "#7c3aed" },
      { title: "This Month Average", value: "—", footer: "Unavailable", iconBg: "bg-emerald-50", iconColor: "text-emerald-500", sparkline: [], sparkColor: "#10b981" },
      { title: "Total Students", value: students.length > 0 ? String(students.length) : "—", footer: students.length > 0 ? "Loaded from backend" : "No data", iconBg: "bg-blue-50", iconColor: "text-blue-500", sparkline: [], sparkColor: "#3b82f6" },
      { title: "Present Today", value: "—", footer: "No data", iconBg: "bg-orange-50", iconColor: "text-orange-500", sparkline: [], sparkColor: "#f97316" },
      { title: "Absent Today", value: "—", footer: "No data", iconBg: "bg-red-50", iconColor: "text-red-500", sparkline: [], sparkColor: "#ef4444" },
      { title: "Late Today", value: "—", footer: "No data", iconBg: "bg-teal-50", iconColor: "text-teal-500", sparkline: [], sparkColor: "#14b8a6" },
    ];

    if (selectedClassId && !summaryLoading && !summaryError && attendanceRecords.length > 0) {
      const { totalStudents, presentCount, absentCount, lateCount, attendancePct } = computeDailyStats(attendanceRecords);

      baseCards[0] = {
        ...baseCards[0],
        value: `${attendancePct}%`,
        footer: `Present: ${presentCount} / ${totalStudents}`,
      };
      baseCards[3] = { ...baseCards[3], value: String(presentCount), footer: `${presentCount} of ${totalStudents} students` };
      baseCards[4] = { ...baseCards[4], value: String(absentCount), footer: `${absentCount} of ${totalStudents} students` };
      baseCards[5] = { ...baseCards[5], value: String(lateCount), footer: `${lateCount} of ${totalStudents} students` };
    }

    return baseCards;
  }, [selectedClassId, attendanceRecords, students.length, summaryLoading, summaryError]);

  const showToast = useCallback((message: string) => {
    const toast = document.createElement("div");
    toast.className = "fixed bottom-6 right-6 z-[200] rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-2xl";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const handleFilter = useCallback(() => {
    setFilterPanelOpen((prev) => !prev);
  }, []);

  const handleAcademicYearChange = useCallback((year: string) => {
    setSelectedAcademicYear(year);
    setSelectedClassId("");
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (!selectedAcademicYear || selectedClassId) return;
    const inYear = classes.filter((c) => c.academic_year === selectedAcademicYear);
    if (inYear.length > 0) {
      setSelectedClassId(inYear[0].id);
    }
  }, [selectedAcademicYear, classes, selectedClassId]);

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClassId(classId);
    setCurrentPage(1);
    setStatusFilter("");
  }, []);

  const handleSubjectChange = useCallback((subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setCurrentPage(1);
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDateISO(date);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((status: AttendanceStatus) => {
    setStatusFilter((prev) => (prev === status ? "" : status));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedSubjectId("");
    setStatusFilter("");
    setSearchTerm("");
    if (filteredClasses.length > 0) {
      setSelectedClassId(filteredClasses[0].id);
    } else {
      setSelectedClassId("");
    }
    setSelectedDateISO(todayISO);
    setCurrentPage(1);
  }, [filteredClasses]);

  const handleRetryAttendance = useCallback(() => {
    setAttendanceRetryKey((prev) => prev + 1);
  }, []);

  const refreshAttendance = useCallback(() => {
    setAttendanceRetryKey((prev) => prev + 1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleMarkAttendanceSuccess = useCallback(() => {
    showToast("Attendance marked successfully");
    refreshAttendance();
  }, [showToast, refreshAttendance]);

  const handleBulkAttendanceSuccess = useCallback(() => {
    showToast("Bulk attendance submitted successfully");
    refreshAttendance();
  }, [showToast, refreshAttendance]);

  const handleEditSuccess = useCallback(() => {
    showToast("Attendance updated successfully");
    refreshAttendance();
  }, [showToast, refreshAttendance]);

  const handleDeleteSuccess = useCallback(() => {
    showToast("Attendance mark removed successfully.");
    refreshAttendance();
  }, [showToast, refreshAttendance]);

  const handleQuickActionClick = useCallback(
    (action: { label: string }) => {
      switch (action.label) {
        case "Mark Attendance":
          setMarkAttendanceOpen(true);
          break;
        case "Bulk Attendance":
          setBulkAttendanceOpen(true);
          break;
        default:
          setQuickAction(action.label);
          break;
      }
    },
    [],
  );

  const rowActionsProps = useMemo(
    () => ({
      token,
      classId: selectedClassId,
      dateDisplay: selectedDateDisplay,
      dateISO: selectedDateISO,
      subjects: classSubjects,
      onEditSuccess: handleEditSuccess,
      onDeleteSuccess: handleDeleteSuccess,
    }),
    [token, selectedClassId, selectedDateDisplay, selectedDateISO, classSubjects, handleEditSuccess, handleDeleteSuccess],
  );

  const hasSearchResults = searchTerm.trim().length > 0 && tableRows.length === 0 && !attendanceLoading;

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <AttendancePageHeader onMarkAttendance={() => setMarkAttendanceOpen(true)} />

          <AttendanceSummaryCards cards={summaryCards} />

          <AttendanceFilters
            onSearch={handleSearch}
            onFilter={handleFilter}
            academicYearOptions={academicYearOptions}
            academicYear={selectedAcademicYear}
            onAcademicYearChange={handleAcademicYearChange}
            academicYearLoading={classesLoading}
            classOptions={classOptions}
            classGrade={selectedClassId}
            onClassGradeChange={handleClassChange}
            classLoading={classesLoading}
            date={selectedDateDisplay}
            onDateChange={handleDateChange}
            viewType={viewType}
            onViewTypeChange={setViewType}
            subjectOptions={subjectOptions}
            subject={selectedSubjectId}
            onSubjectChange={handleSubjectChange}
            subjectLoading={subjectsLoading}
            statusFilter={statusFilter}
            onStatusFilter={handleStatusFilter}
            onResetFilters={handleResetFilters}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            calendarOpen={calendarOpen}
            onCalendarOpenChange={setCalendarOpen}
          />

          {attendanceError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
              <span>{attendanceError}</span>
              <button
                type="button"
                onClick={handleRetryAttendance}
                className="ml-4 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
              >
                Retry
              </button>
            </div>
          )}

          {hasSearchResults && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No students found for this search.
            </div>
          )}

          <AttendanceTable
            rows={!hasSearchResults ? paginatedRows : []}
            subjects={classSubjects}
            loading={attendanceLoading}
            error={null}
            emptyMessage={
              !selectedClassId
                ? "Select a class and date to view attendance."
                : searchTerm.trim()
                ? "No students found for this search."
                : "No attendance records found for the selected filters."
            }
            rowActionsProps={rowActionsProps}
          />

          {tableRows.length > 0 && (
            <AttendancePagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={tableRows.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            <AttendanceOverviewChart average={null} present={null} absent={null} late={null} />
            <AttendanceTrendChart comingSoon />
            <TopPerformingClasses comingSoon />
            <AttendanceQuickActions onAction={handleQuickActionClick} />
          </div>
        </div>
      </div>

      <MarkAttendanceDialog
        open={markAttendanceOpen}
        onClose={() => setMarkAttendanceOpen(false)}
        onSuccess={handleMarkAttendanceSuccess}
        token={token}
        classId={selectedClassId}
        dateDisplay={selectedDateDisplay}
        students={students}
        subjects={subjectOptions}
        teachers={teacherOptions}
        markedBy={markedBy}
      />

      <BulkAttendanceDialog
        open={bulkAttendanceOpen}
        onClose={() => setBulkAttendanceOpen(false)}
        onSuccess={handleBulkAttendanceSuccess}
        token={token}
        classId={selectedClassId}
        dateDisplay={selectedDateDisplay}
        students={students}
        subjects={subjectOptions}
        teachers={teacherOptions}
        markedBy={markedBy}
      />

      <Modal
        open={!!quickAction}
        onClose={() => setQuickAction(null)}
        title={quickAction ?? ""}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            &quot;{quickAction}&quot; is a UI-only quick action. Backend integration will be handled in the next phase.
          </p>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            No backend API is connected in this phase.
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setQuickAction(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
