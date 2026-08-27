"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import Card from "@/components/shared/Card";
import Modal from "@/components/shared/Modal";
import { Loader2, CalendarClock } from "lucide-react";

import TimetablePageHeader from "@/components/dashboard/academics/timetable/TimetablePageHeader";
import TimetableSummaryCards, {
  type TimetableSummaryValues,
} from "@/components/dashboard/academics/timetable/TimetableSummaryCards";
import TimetableFilters from "@/components/dashboard/academics/timetable/TimetableFilters";
import WeeklyTimetableGrid, { TimetableEmptyHint } from "@/components/dashboard/academics/timetable/WeeklyTimetableGrid";
import TimetableLegend from "@/components/dashboard/academics/timetable/TimetableLegend";
import TimetableOverviewCard from "@/components/dashboard/academics/timetable/TimetableOverviewCard";
import SubjectDistributionCard from "@/components/dashboard/academics/timetable/SubjectDistributionCard";
import UpcomingChangesCard from "@/components/dashboard/academics/timetable/UpcomingChangesCard";
import TimetableQuickActions from "@/components/dashboard/academics/timetable/TimetableQuickActions";
import TimetablePreviewModal, {
  type CreatePeriodDefaults,
  type TimetableClassOption,
  type TimetableOption,
} from "@/components/dashboard/academics/timetable/TimetablePreviewModal";
import TimetablePreviewDetailsDialog from "@/components/dashboard/academics/timetable/TimetablePreviewDetailsDialog";
import TimetableLoadingSkeleton from "@/components/dashboard/academics/timetable/TimetableLoadingSkeleton";
import TimetablePrintView from "@/components/dashboard/academics/timetable/TimetablePrintView";

import { PREVIEW_TIMESLOTS } from "@/components/dashboard/academics/timetable/timetablePreviewData";
import { KNOWN_SUBJECT_COLOR_ORDER } from "@/components/dashboard/academics/timetable/timetableColors";
import {
  getMondayOfCurrentWeek,
  getWeekDates,
  formatWeekRange,
  shiftWeek,
} from "@/components/dashboard/academics/timetable/timetableDateUtils";
import { exportTimetableCSV } from "@/components/dashboard/academics/timetable/timetableExport";
import {
  normalizeDay,
  resolvePeriodLabel,
  toInputTime,
  PERIOD_LABELS,
} from "@/components/dashboard/academics/timetable/timetableApiUtils";
import type {
  PreviewTimetableEntry,
  TimetableFilterState,
  WeekDay,
  TimeSlot,
  PreviewDonutSegment,
  PreviewUpcomingChange,
} from "@/components/dashboard/academics/timetable/timetableDisplayTypes";

import {
  listTimetables,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetable,
  getClassTimetable,
} from "@/lib/services/timetableService";
import { listClasses, getClassSubjects } from "@/lib/services/classService";
import { listSubjects } from "@/lib/services/subjectService";
import { listTeachers } from "@/lib/services/teacherService";
import { listUsers } from "@/lib/services/userService";
import { listTeacherSubjects } from "@/lib/services/teacherSubjectService";

import type { TimetableCreate, TimetableResponse } from "@/types/entities/timetable";
import type { ClassResponse } from "@/types/entities/class";
import type { SubjectResponse } from "@/types/entities/subject";
import type { TeacherResponse } from "@/types/entities/teacher";
import type { UserResponse } from "@/types/entities/user";
import type { ClassSubjectSummary } from "@/types/entities/class-subject-summary";
import type { TeacherSubjectResponse } from "@/types/entities/teacher-subject";

const ALL_CLASSES = "All Classes";
const ALL_SECTIONS = "All Sections";
const ALL_ACADEMIC_YEARS = "All Academic Years";

const DEFAULT_FILTERS: TimetableFilterState = {
  academicYear: ALL_ACADEMIC_YEARS,
  classGrade: ALL_CLASSES,
  section: ALL_SECTIONS,
  viewType: "Weekly View",
  subject: "All Subjects",
  teacher: "All Teachers",
  day: "All Days",
  period: "All Periods",
  room: "All Rooms",
};

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface ToastState {
  type: "success" | "info" | "error";
  message: string;
}

// --- Real analytics helpers -------------------------------------------------

export type SchoolLevel = "Primary" | "Middle" | "Secondary" | "Senior Secondary";

export const LEVEL_ORDER: SchoolLevel[] = ["Primary", "Middle", "Secondary", "Senior Secondary"];

const LEVEL_COLORS: Record<SchoolLevel, string> = {
  Primary: "#7c3aed",
  Middle: "#3b82f6",
  Secondary: "#f59e0b",
  "Senior Secondary": "#10b981",
};

// Map a class name (e.g. "5", "Class 7", "10-A") to its school level using the
// leading grade number. Unparseable values default to Primary.
function parseClassGrade(className?: string | null): number | null {
  if (!className) return null;
  const match = className.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function classLevelOf(className?: string | null): SchoolLevel {
  const grade = parseClassGrade(className);
  if (grade == null) return "Primary";
  if (grade >= 1 && grade <= 5) return "Primary";
  if (grade >= 6 && grade <= 8) return "Middle";
  if (grade >= 9 && grade <= 10) return "Secondary";
  if (grade >= 11 && grade <= 12) return "Senior Secondary";
  return grade > 12 ? "Senior Secondary" : "Primary";
}

export type SubjectCategory = "Core Subjects" | "Languages" | "Electives" | "Others";

export const CATEGORY_ORDER: SubjectCategory[] = [
  "Core Subjects",
  "Languages",
  "Electives",
  "Others",
];

const CATEGORY_COLORS: Record<SubjectCategory, string> = {
  "Core Subjects": "#7c3aed",
  Languages: "#3b82f6",
  Electives: "#f59e0b",
  Others: "#64748b",
};

// Backend SubjectResponse has no category field, so every subject is grouped
// under "Others". If a future category field is added it is honored here.
function subjectCategoryOf(subject?: SubjectResponse): SubjectCategory {
  const cat = (subject as (SubjectResponse & { category?: string }) | undefined)?.category;
  if (cat === "Core Subjects" || cat === "Languages" || cat === "Electives") return cat;
  return "Others";
}

const PRINT_CSS = `@media print {
  body * { visibility: hidden; }
  .tt-print, .tt-print * { visibility: visible; }
  .tt-print { position: absolute; left: 0; top: 0; width: 100%; }
}`;

export default function TimetablePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  const [timetables, setTimetables] = useState<TimetableResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classTimetables, setClassTimetables] = useState<TimetableResponse[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectSummary[]>([]);
  const [allTeacherSubjects, setAllTeacherSubjects] = useState<TeacherSubjectResponse[]>([]);
  const [classDataLoading, setClassDataLoading] = useState(false);

  const [filters, setFilters] = useState<TimetableFilterState>(DEFAULT_FILTERS);
  const [weekMonday, setWeekMonday] = useState<Date>(() => getMondayOfCurrentWeek());
  const [classInit, setClassInit] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableResponse | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<PreviewTimetableEntry | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [managePeriodsOpen, setManagePeriodsOpen] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((type: ToastState["type"], message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("edtech_access_token");
    if (stored) setToken(stored);
  }, []);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [timetableData, classData, subjectData, teacherData, userData, teacherSubjectData] = await Promise.allSettled([
        listTimetables(token),
        listClasses(token),
        listSubjects(token),
        listTeachers(token),
        listUsers(token),
        listTeacherSubjects(token),
      ]);

      if (timetableData.status === "fulfilled") setTimetables(timetableData.value ?? []);
      else setTimetables([]);
      if (classData.status === "fulfilled") setClasses(classData.value ?? []);
      else setClasses([]);
      if (subjectData.status === "fulfilled") setSubjects(subjectData.value ?? []);
      else setSubjects([]);
      if (teacherData.status === "fulfilled") setTeachers(teacherData.value ?? []);
      else setTeachers([]);
      if (userData.status === "fulfilled") setUsers(userData.value ?? []);
      else setUsers([]);
      if (teacherSubjectData.status === "fulfilled") setAllTeacherSubjects(teacherSubjectData.value ?? []);
      else setAllTeacherSubjects([]);

      if (
        timetableData.status === "rejected" &&
        classData.status === "rejected" &&
        subjectData.status === "rejected"
      ) {
        setError("Backend is unreachable. Please try again later.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timetables.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!selectedClassId || !token) {
      setClassTimetables([]);
      setClassSubjects([]);
      setClassDataLoading(false);
      return;
    }
    let cancelled = false;
    setClassDataLoading(true);
    const fetchClassData = async () => {
      try {
        const [ttData, subjData] = await Promise.all([
          getClassTimetable(token, selectedClassId),
          getClassSubjects(token, selectedClassId),
        ]);
        if (!cancelled) {
          setClassTimetables(ttData);
          setClassSubjects(subjData);
        }
      } catch {
        if (!cancelled) {
          setClassTimetables([]);
          setClassSubjects([]);
        }
      } finally {
        if (!cancelled) setClassDataLoading(false);
      }
    };
    fetchClassData();
    return () => {
      cancelled = true;
    };
  }, [selectedClassId, token]);

  const userById = useMemo(() => {
    const m = new Map<string, UserResponse>();
    users.forEach((u) => m.set(u.id, u));
    return m;
  }, [users]);

  const subjectById = useMemo(() => {
    const m = new Map<string, SubjectResponse>();
    subjects.forEach((s) => m.set(s.id, s));
    return m;
  }, [subjects]);

  const teacherById = useMemo(() => {
    const m = new Map<string, TeacherResponse>();
    teachers.forEach((t) => m.set(t.id, t));
    return m;
  }, [teachers]);

  const classById = useMemo(() => {
    const m = new Map<string, ClassResponse>();
    classes.forEach((c) => m.set(c.id, c));
    return m;
  }, [classes]);

  const teacherLabel = useCallback(
    (id?: string | null): string => {
      if (!id) return "—";
      const t = teacherById.get(id);
      if (!t) return id;
      const u = userById.get(t.user_id);
      if (u?.email) return `${t.employee_id} — ${u.email}`;
      return t.employee_id;
    },
    [teacherById, userById],
  );

  const subjectLabel = useCallback(
    (id?: string | null): string => {
      if (!id) return "—";
      return subjectById.get(id)?.subject_name ?? id;
    },
    [subjectById],
  );

  const classLabelOf = useCallback(
    (id?: string | null): string => {
      if (!id) return "—";
      const c = classById.get(id);
      return c ? `${c.class_name} — ${c.section}` : id;
    },
    [classById],
  );

  const matrixTimetables = useMemo(() => {
    return selectedClassId ? classTimetables : timetables;
  }, [selectedClassId, classTimetables, timetables]);

  const displayEntries: PreviewTimetableEntry[] = useMemo(() => {
    return matrixTimetables.map((t): PreviewTimetableEntry => {
      const cls = classById.get(t.class_id);
      const day = normalizeDay(t.day_of_week);
      if (!day) {
        return {
          id: `unmatched-${t.id}`,
          subject: subjectLabel(t.subject_id),
          teacher: teacherLabel(t.teacher_id),
          room: t.room_no ?? undefined,
          day: "Monday",
          periodLabel: resolvePeriodLabel(t.period_no, t.start_time),
          startTime: toInputTime(t.start_time),
          endTime: toInputTime(t.end_time),
          academicYear: cls?.academic_year ?? "—",
          classGrade: cls ? `${cls.class_name} — ${cls.section}` : "—",
          section: cls?.section ?? "—",
          classId: t.class_id,
          subjectId: t.subject_id,
          teacherId: t.teacher_id,
          periodNo: t.period_no,
          unmatched: true,
        } as PreviewTimetableEntry & { unmatched?: boolean };
      }
      return {
        id: t.id,
        subject: subjectLabel(t.subject_id),
        teacher: teacherLabel(t.teacher_id),
        room: t.room_no ?? undefined,
        day,
        periodLabel: resolvePeriodLabel(t.period_no, t.start_time),
        startTime: toInputTime(t.start_time),
        endTime: toInputTime(t.end_time),
        academicYear: cls?.academic_year ?? "—",
        classGrade: cls ? `${cls.class_name} — ${cls.section}` : "—",
        section: cls?.section ?? "—",
        classId: t.class_id,
        subjectId: t.subject_id,
        teacherId: t.teacher_id,
        periodNo: t.period_no,
      };
    });
  }, [matrixTimetables, classById, subjectLabel, teacherLabel]);

  const hasUnmatchedEntries = useMemo(
    () => displayEntries.some((e) => (e as PreviewTimetableEntry & { unmatched?: boolean }).unmatched),
    [displayEntries],
  );

  // Select the first class once data is available (grid is keyed per-class).
  useEffect(() => {
    if (classInit || classes.length === 0) return;
    setClassInit(true);
    const first = classes[0];
    setFilters((f) => (f.classGrade === ALL_CLASSES ? { ...f, classGrade: `${first.class_name} — ${first.section}` } : f));
    setSelectedClassId(first.id);
  }, [classes, classInit]);

  const classOptions: TimetableClassOption[] = useMemo(
    () =>
      classes.map((c) => ({
        id: c.id,
        label: `${c.class_name} — ${c.section}`,
        academicYear: c.academic_year,
        section: c.section,
      })),
    [classes],
  );

  const modalSubjectOptions: TimetableOption[] = useMemo(() => {
    return subjects.map((s) => ({ id: s.id, label: `${s.subject_code} — ${s.subject_name}` }));
  }, [subjects]);

  const modalTeacherOptions: TimetableOption[] = useMemo(() => {
    return teachers.map((t) => ({
      id: t.id,
      label: teacherLabel(t.id),
    }));
  }, [teachers, teacherLabel]);

  const academicYearOptions = useMemo(
    () => [ALL_ACADEMIC_YEARS, ...Array.from(new Set(classes.map((c) => c.academic_year))).sort()],
    [classes],
  );

  const classLabelOptions = useMemo(
    () => [ALL_CLASSES, ...classOptions.map((c) => c.label)],
    [classOptions],
  );

  const sectionOptions = useMemo(
    () => [ALL_SECTIONS, ...Array.from(new Set(classes.map((c) => c.section))).sort()],
    [classes],
  );

  const reflectedFilters = useMemo((): TimetableFilterState => {
    const cls = classOptions.find((c) => c.label === filters.classGrade);
    return {
      ...filters,
      classGrade: cls ? cls.label : ALL_CLASSES,
    };
  }, [filters, classOptions]);

  const selectedClassObject = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const subjectFilterOptions = useMemo(
    () => ["All Subjects", ...Array.from(new Set(displayEntries.map((e) => e.subject))).sort()],
    [displayEntries],
  );

  const teacherFilterOptions = useMemo(
    () => ["All Teachers", ...Array.from(new Set(displayEntries.map((e) => e.teacher))).filter((t) => t !== "—").sort()],
    [displayEntries],
  );

  const dayFilterOptions = useMemo(
    () => ["All Days", ...Array.from(new Set(displayEntries.map((e) => e.day)))],
    [displayEntries],
  );

  const periodFilterOptions = useMemo(
    () => ["All Periods", ...PERIOD_LABELS],
    [],
  );

  const roomFilterOptions = useMemo(
    () => ["All Rooms", ...Array.from(new Set(displayEntries.map((e) => e.room).filter((r): r is string => !!r))).sort()],
    [displayEntries],
  );

  const weekRange = useMemo(() => formatWeekRange(weekMonday), [weekMonday]);
  const weekDates = useMemo(() => getWeekDates(weekMonday), [weekMonday]);

  const visibleEntries = useMemo(() => {
    return displayEntries.filter((e) => {
      if (reflectedFilters.classGrade !== ALL_CLASSES && e.classGrade !== reflectedFilters.classGrade) return false;
      if (reflectedFilters.academicYear !== ALL_ACADEMIC_YEARS && e.academicYear !== reflectedFilters.academicYear) return false;
      if (reflectedFilters.section !== ALL_SECTIONS && e.section !== reflectedFilters.section) return false;
      if (reflectedFilters.subject !== "All Subjects" && e.subject !== reflectedFilters.subject) return false;
      if (reflectedFilters.teacher !== "All Teachers" && e.teacher !== reflectedFilters.teacher) return false;
      if (reflectedFilters.day !== "All Days" && e.day !== reflectedFilters.day) return false;
      if (reflectedFilters.period !== "All Periods" && e.periodLabel !== reflectedFilters.period) return false;
      if (reflectedFilters.room !== "All Rooms" && (e.room ?? "") !== reflectedFilters.room) return false;
      return true;
    });
  }, [displayEntries, reflectedFilters]);

  const representedSubjects = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    KNOWN_SUBJECT_COLOR_ORDER.forEach((s) => {
      if (visibleEntries.some((e) => e.subject === s) && !seen.has(s)) {
        list.push(s);
        seen.add(s);
      }
    });
    visibleEntries.forEach((e) => {
      if (!seen.has(e.subject)) {
        list.push(e.subject);
        seen.add(e.subject);
      }
    });
    return list;
  }, [visibleEntries]);

  const classLabel = reflectedFilters.classGrade;
  const isWeekly = reflectedFilters.viewType === "Weekly View";

  const summaryValues: TimetableSummaryValues = useMemo(() => {
    const total = classes.length;
    const classSet = new Set(timetables.map((t) => t.class_id));
    const teacherSet = new Set(timetables.map((t) => t.teacher_id));
    const distinctPeriodKeys = new Set(
      timetables.map((t) => `${normalizeDay(t.day_of_week) ?? "Monday"}|${resolvePeriodLabel(t.period_no, t.start_time)}`),
    );

    return {
      total,
      // Backend TimetableResponse exposes no status field, so "Active" is not
      // supported. The card renders "—" for this.
      active: null,
      classesScheduled: classSet.size,
      teachersInvolved: teacherSet.size,
      periodsPerWeek: distinctPeriodKeys.size,
    };
  }, [timetables, classes]);

  const overviewSegments: PreviewDonutSegment[] = useMemo(() => {
    const counts: Record<string, number> = {};
    timetables.forEach((t) => {
      const cls = classById.get(t.class_id);
      const level = classLevelOf(cls?.class_name);
      counts[level] = (counts[level] ?? 0) + 1;
    });
    return LEVEL_ORDER.map((lvl) => ({
      label: lvl,
      value: counts[lvl] ?? 0,
      color: LEVEL_COLORS[lvl],
    }));
  }, [timetables, classById]);

  const distributionSegments: PreviewDonutSegment[] = useMemo(() => {
    const counts: Record<string, number> = {};
    timetables.forEach((t) => {
      const subj = subjectById.get(t.subject_id);
      const cat = subjectCategoryOf(subj);
      counts[cat] = (counts[cat] ?? 0) + 1;
    });
    return CATEGORY_ORDER.map((cat) => ({
      label: cat,
      value: counts[cat] ?? 0,
      color: CATEGORY_COLORS[cat],
    }));
  }, [timetables, subjectById]);

  const upcomingChanges: PreviewUpcomingChange[] = useMemo(() => {
    return [...timetables]
      .filter((t) => t.updated_at)
      .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
      .slice(0, 8)
      .map((t) => {
        const date = new Date(t.updated_at);
        const cls = classById.get(t.class_id);
        return {
          id: t.id,
          day: Number.isNaN(date.getDate()) ? 0 : date.getDate(),
          month: Number.isNaN(date.getMonth()) ? "" : MONTHS_SHORT[date.getMonth()],
          title: `Timetable updated: ${subjectLabel(t.subject_id)}`,
          context: `${cls ? `${cls.class_name} — ${cls.section}` : "—"} · ${normalizeDay(t.day_of_week) ?? ""}`,
        };
      });
  }, [timetables, classById, subjectLabel]);

  const createDefaults: CreatePeriodDefaults = useMemo(
    () => ({
      day: "Monday",
      periodLabel: "Period 1",
      startTime: "08:00",
      endTime: "08:45",
    }),
    [],
  );

  const [pendingCell, setPendingCell] = useState<{
    day: WeekDay;
    periodLabel: string;
    startTime: string;
    endTime: string;
  }>({
    day: "Monday",
    periodLabel: "Period 1",
    startTime: "08:00",
    endTime: "08:45",
  });

  const openCreateFromHeader = useCallback(() => {
    setEditingItem(null);
    setFormError(null);
    setPendingCell({ day: "Monday", periodLabel: "Period 1", startTime: "08:00", endTime: "08:45" });
    setCreateOpen(true);
  }, []);

  const handleAddPeriod = useCallback(
    (day: WeekDay, slot: TimeSlot) => {
      setEditingItem(null);
      setFormError(null);
      setPendingCell({
        day,
        periodLabel: slot.label,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      setCreateOpen(true);
    },
    [],
  );

  const effectiveCreateDefaults: CreatePeriodDefaults = useMemo(
    () => ({
      ...createDefaults,
      day: pendingCell.day,
      periodLabel: pendingCell.periodLabel,
      startTime: pendingCell.startTime,
      endTime: pendingCell.endTime,
      classId: selectedClassId ?? undefined,
    }),
    [createDefaults, pendingCell, selectedClassId],
  );

  const closeForm = () => {
    setCreateOpen(false);
    setEditingItem(null);
    setFormError(null);
  };

  const handleSubmit = async (payload: TimetableCreate) => {
    if (submitting) return;
    setFormError(null);

    const sourceList = selectedClassId ? classTimetables : timetables;

    if (selectedClassId && payload.class_id !== selectedClassId) {
      setFormError("The selected Class does not match the current filter.");
      return;
    }

    const classSubjectIds = new Set(classSubjects.map((cs) => cs.id));
    if (selectedClassId && classSubjects.length > 0 && !classSubjectIds.has(payload.subject_id)) {
      setFormError("The selected Subject is not assigned to the selected Class.");
      return;
    }

    const validTeacherIds = new Set(
      allTeacherSubjects
        .filter((ts) => ts.class_id === payload.class_id && ts.subject_id === payload.subject_id)
        .map((ts) => ts.teacher_id),
    );
    if (allTeacherSubjects.length > 0 && !validTeacherIds.has(payload.teacher_id)) {
      setFormError("The selected Teacher is not assigned to this Subject for the selected Class.");
      return;
    }

    if (payload.start_time >= payload.end_time) {
      setFormError("Start time must be before end time.");
      return;
    }

    const dayNorm = normalizeDay(payload.day_of_week) ?? payload.day_of_week;
    const periodNo = payload.period_no;

    const exactDuplicate = sourceList.find(
      (t) =>
        t.id !== editingItem?.id &&
        t.class_id === payload.class_id &&
        normalizeDay(t.day_of_week) === dayNorm &&
        t.period_no === periodNo,
    );
    if (exactDuplicate) {
      setFormError("A timetable period already exists for this Class, Day, and Period.");
      return;
    }

    const classConflict = sourceList.find(
      (t) =>
        t.id !== editingItem?.id &&
        t.class_id === payload.class_id &&
        normalizeDay(t.day_of_week) === dayNorm &&
        t.start_time < payload.end_time &&
        t.end_time > payload.start_time,
    );
    if (classConflict) {
      setFormError("This Class already has a conflicting timetable period at the selected time.");
      return;
    }

    const teacherConflict = sourceList.find(
      (t) =>
        t.id !== editingItem?.id &&
        t.teacher_id === payload.teacher_id &&
        normalizeDay(t.day_of_week) === dayNorm &&
        t.start_time < payload.end_time &&
        t.end_time > payload.start_time,
    );
    if (teacherConflict) {
      setFormError("This Teacher already has a conflicting timetable period at the selected time.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await updateTimetable(token, editingItem.id, payload);
        showToast("success", "Timetable period updated successfully.");
      } else {
        await createTimetable(token, payload);
        showToast("success", "Timetable period created successfully.");
      }
      closeForm();
      await loadAll();
      if (selectedClassId) {
        try {
          const [ttData, subjData] = await Promise.all([
            getClassTimetable(token, selectedClassId),
            getClassSubjects(token, selectedClassId),
          ]);
          setClassTimetables(ttData);
          setClassSubjects(subjData);
        } catch {
          // silent refresh fallback
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save timetable period.");
    } finally {
      setSubmitting(false);
    }
  };

  const openView = async (entry: PreviewTimetableEntry) => {
    setSelectedEntry(entry);
    setViewLoading(true);
    try {
      const fresh = await getTimetable(token, entry.id);
      const cls = classById.get(fresh.class_id);
      const day = normalizeDay(fresh.day_of_week) ?? "Monday";
      setSelectedEntry({
        id: fresh.id,
        subject: subjectLabel(fresh.subject_id),
        teacher: teacherLabel(fresh.teacher_id),
        room: fresh.room_no ?? undefined,
        day,
        periodLabel: resolvePeriodLabel(fresh.period_no, fresh.start_time),
        startTime: toInputTime(fresh.start_time),
        endTime: toInputTime(fresh.end_time),
        academicYear: cls?.academic_year ?? "—",
        classGrade: cls ? `${cls.class_name} — ${cls.section}` : "—",
        section: cls?.section ?? "—",
        classId: fresh.class_id,
        subjectId: fresh.subject_id,
        teacherId: fresh.teacher_id,
        periodNo: fresh.period_no,
      });
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to load timetable period.");
    } finally {
      setViewLoading(false);
    }
  };

  const openEditFromView = (entry: PreviewTimetableEntry) => {
    const src = matrixTimetables.find((t) => t.id === entry.id) ?? null;
    setSelectedEntry(null);
    setEditingItem(src);
    setFormError(null);
    if (src && src.class_id !== selectedClassId) {
      const cls = classOptions.find((c) => c.id === src.class_id);
      if (cls) {
        setFilters((f) => ({ ...f, classGrade: cls.label }));
        setSelectedClassId(src.class_id);
      }
    }
    setCreateOpen(true);
  };

  const openDelete = (entry: PreviewTimetableEntry) => {
    const src = matrixTimetables.find((t) => t.id === entry.id) ?? null;
    setSelectedEntry(null);
    setEditingItem(src);
    setFormError(null);
    if (src && src.class_id !== selectedClassId) {
      const cls = classOptions.find((c) => c.id === src.class_id);
      if (cls) {
        setFilters((f) => ({ ...f, classGrade: cls.label }));
        setSelectedClassId(src.class_id);
      }
    }
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!editingItem || submitting) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await deleteTimetable(token, editingItem.id);
      setDeleteOpen(false);
      setEditingItem(null);
      showToast("success", "Timetable period deleted successfully.");
      await loadAll();
      if (selectedClassId) {
        try {
          const [ttData, subjData] = await Promise.all([
            getClassTimetable(token, selectedClassId),
            getClassSubjects(token, selectedClassId),
          ]);
          setClassTimetables(ttData);
          setClassSubjects(subjData);
        } catch {
          // silent refresh fallback
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete timetable period.");
    } finally {
      setSubmitting(false);
    }
  };

  const refresh = async () => {
    await loadAll();
    showToast("success", "Timetable data refreshed.");
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleDownload = () => {
    const result = exportTimetableCSV(visibleEntries, {
      classGrade: classLabel,
      academicYear: reflectedFilters.academicYear,
      weekRange,
    });
    showToast(result.ok ? "success" : "error", result.message);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePending = (message: string) => {
    showToast("info", message);
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px] space-y-6">
          {toast && (
            <div
              className={`fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl ${
                toast.type === "success"
                  ? "bg-green-600 text-white"
                  : toast.type === "error"
                    ? "bg-red-600 text-white"
                    : "bg-slate-800 text-white"
              }`}
              role="status"
            >
              {toast.message}
            </div>
          )}

          {loading ? (
            <TimetableLoadingSkeleton />
          ) : (
            <>
              <TimetablePageHeader
                onAddPeriod={openCreateFromHeader}
                onRefresh={refresh}
                onDownload={handleDownload}
                onPrint={handlePrint}
                onResetFilters={resetFilters}
                onPending={handlePending}
              />

              {error ? (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                  {error}
                </div>
              ) : (
                <>
                  <TimetableSummaryCards values={summaryValues} />

                  <TimetableFilters
                    filters={reflectedFilters}
                    onAcademicYearChange={(v) => setFilters((f) => ({ ...f, academicYear: v }))}
                    onClassChange={(v) => {
                      const cls = classOptions.find((c) => c.label === v);
                      setSelectedClassId(cls?.id ?? null);
                      setFilters((f) => ({ ...f, classGrade: v }));
                    }}
                    onSectionChange={(v) => setFilters((f) => ({ ...f, section: v }))}
                    onViewTypeChange={(v) => setFilters((f) => ({ ...f, viewType: v as TimetableFilterState["viewType"] }))}
                    onWeekChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
                    weekRange={weekRange}
                    onPrevWeek={() => setWeekMonday((m) => shiftWeek(m, -1))}
                    onNextWeek={() => setWeekMonday((m) => shiftWeek(m, 1))}
                    academicYearOptions={academicYearOptions}
                    classOptions={classLabelOptions}
                    sectionOptions={sectionOptions}
                    subjectOptions={subjectFilterOptions}
                    teacherOptions={teacherFilterOptions}
                    dayOptions={dayFilterOptions}
                    periodOptions={periodFilterOptions}
                    roomOptions={roomFilterOptions}
                  />

                  {/* Timetable matrix card */}
                  <Card className="print:hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
                      <h2 className="text-base font-semibold text-slate-900">
                        {selectedClassObject ? (
                          <>
                            Class:{" "}
                            <span className="text-[#6d28d9]">
                              {selectedClassObject.class_name} — {selectedClassObject.section} — {selectedClassObject.academic_year}
                            </span>
                          </>
                        ) : (
                          <>
                            Class: <span className="text-[#6d28d9]">{reflectedFilters.classGrade}</span>
                          </>
                        )}
                      </h2>
                      <div className="flex items-center gap-3">
                        {isWeekly && (
                          <span className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-[#6d28d9]">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Weekly View
                          </span>
                        )}
                      </div>
                    </div>

                    {!isWeekly ? (
                      <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
                        <CalendarClock className="h-8 w-8 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">{reflectedFilters.viewType}</p>
                        <p className="max-w-sm text-xs text-slate-400">
                          Only the Weekly View is connected to the backend. Switch to Weekly View to manage timetables.
                        </p>
                      </div>
                    ) : !selectedClassId ? (
                      <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                        <CalendarClock className="h-10 w-10 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">Select a Class to view its weekly timetable.</p>
                        <button
                          type="button"
                          onClick={openCreateFromHeader}
                          className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
                        >
                          Create Timetable Period
                        </button>
                      </div>
                    ) : classDataLoading ? (
                      <div className="flex items-center justify-center px-4 py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-[#6d28d9]" />
                      </div>
                    ) : visibleEntries.length === 0 && matrixTimetables.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                        <CalendarClock className="h-10 w-10 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">No Timetables have been created yet.</p>
                        <button
                          type="button"
                          onClick={openCreateFromHeader}
                          className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
                        >
                          Create Timetable Period
                        </button>
                      </div>
                    ) : (
                      <>
                        {hasUnmatchedEntries && (
                          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                            Warning: Some timetable records could not be placed in the grid due to unrecognized day or period values.
                          </div>
                        )}
                        {visibleEntries.length === 0 && (
                          <TimetableEmptyHint onAddPeriod={openCreateFromHeader} />
                        )}
                        <WeeklyTimetableGrid
                          entries={visibleEntries}
                          weekDates={weekDates}
                          onOpenEntry={openView}
                          onAddPeriod={handleAddPeriod}
                        />
                      </>
                    )}
                  </Card>

                  <TimetableLegend
                    subjects={representedSubjects}
                    hasData={visibleEntries.length > 0}
                    onDownload={handleDownload}
                    downloadMessage={null}
                  />

                  {/* Bottom analytics cards */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <TimetableOverviewCard segments={overviewSegments} />
                    <SubjectDistributionCard segments={distributionSegments} />
                    <UpcomingChangesCard items={upcomingChanges} />
                    <TimetableQuickActions
                      onCreate={openCreateFromHeader}
                      onAssignTeachers={() => router.push("/dashboard/admin/academics/subjects")}
                      onManagePeriods={() => setManagePeriodsOpen(true)}
                      onRoomAllocation={() => router.push("/dashboard/admin/academics/timetable")}
                      onCopy={() => router.push("/dashboard/admin/academics/timetable")}
                      onPublish={() => router.push("/dashboard/admin/academics/timetable")}
                      onPrint={handlePrint}
                      onReport={() => router.push("/dashboard/admin/academics/timetable")}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Print-only region */}
      <TimetablePrintView
        entries={visibleEntries}
        classLabel={classLabel}
        academicYear={reflectedFilters.academicYear}
        weekRange={weekRange}
        subjects={representedSubjects}
        weekDates={weekDates}
      />

      {/* Modals */}
      <TimetablePreviewModal
        open={createOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        formError={formError}
        editingItem={editingItem}
        defaults={effectiveCreateDefaults}
        token={token}
        classOptions={classOptions}
        subjectOptions={modalSubjectOptions}
        teacherOptions={modalTeacherOptions}
        classSubjects={classSubjects}
        allTeacherSubjects={allTeacherSubjects}
      />

      <TimetablePreviewDetailsDialog
        open={!!selectedEntry}
        entry={selectedEntry}
        loading={viewLoading}
        onClose={() => setSelectedEntry(null)}
        onEdit={openEditFromView}
        onRemove={openDelete}
      />

      {/* Delete confirmation dialog */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Timetable Period" maxWidth="max-w-md">
        {formError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600" role="alert">
            {formError}
          </p>
        )}
        <p className="text-sm font-medium text-slate-700">
          Delete this timetable period?
        </p>
        <p className="mt-1 text-xs text-slate-400">
          This action cannot be undone.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </Modal>

      {/* Manage Periods (local structure dialog) */}
      <Modal open={managePeriodsOpen} onClose={() => setManagePeriodsOpen(false)} title="Period Settings" maxWidth="max-w-md">
        <div className="space-y-1">
          {PREVIEW_TIMESLOTS.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm odd:bg-slate-50"
            >
              <span className={`font-semibold ${slot.isBreak ? "text-slate-400" : "text-slate-700"}`}>
                {slot.label}
              </span>
              <span className="font-medium text-slate-500">
                {slot.startTime} – {slot.endTime}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setManagePeriodsOpen(false)}
            className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
          >
            Close
          </button>
        </div>
      </Modal>
    </MainLayout>
  );
}
