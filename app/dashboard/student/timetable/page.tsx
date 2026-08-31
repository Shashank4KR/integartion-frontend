"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentStudentProfile } from "@/lib/services/dashboardService";
import {
  getCurrentStudentTimetable,
  type StudentTimetableResponse,
} from "@/lib/services/timetableService";
import {
  Calendar,
  Clock,
  User,
  DoorOpen,
  BookOpen,
  Sparkles,
  Printer,
  Grid3X3,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  GraduationCap,
  Coffee,
  Utensils,
  Search,
} from "lucide-react";
import { getSubjectColor } from "@/components/dashboard/academics/timetable/timetableColors";
import {
  getMondayOfCurrentWeek,
  getWeekDates,
  formatWeekRange,
  shiftWeek,
} from "@/components/dashboard/academics/timetable/timetableDateUtils";
import { normalizeDay } from "@/components/dashboard/academics/timetable/timetableApiUtils";
import type { WeekDay } from "@/components/dashboard/academics/timetable/timetableDisplayTypes";

const ALL_WEEK_DAYS: WeekDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface TimeSlotRow {
  id: string;
  label: string;
  startTime: string; // e.g. "08:00:00" or "08:00"
  endTime: string;   // e.g. "08:45:00" or "08:45"
  periodNo?: number | null;
  isBreak: boolean;
  breakType?: "short" | "lunch";
}

// Convert "08:00:00" or "08:00" to "08:00 AM" / "01:15 PM"
function formatTo12Hour(timeStr?: string | null): string {
  if (!timeStr) return "—";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  const hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12.toString().padStart(2, "0")}:${minutes} ${period}`;
}

// Format "08:00:00" to "08:00"
function toShortTime(timeStr?: string | null): string {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

// Compute difference in minutes
function computeDurationMinutes(start?: string | null, end?: string | null): number {
  if (!start || !end) return 0;
  const sMatch = start.match(/^(\d{1,2}):(\d{2})/);
  const eMatch = end.match(/^(\d{1,2}):(\d{2})/);
  if (!sMatch || !eMatch) return 0;
  const startMins = parseInt(sMatch[1], 10) * 60 + parseInt(sMatch[2], 10);
  const endMins = parseInt(eMatch[1], 10) * 60 + parseInt(eMatch[2], 10);
  return Math.max(0, endMins - startMins);
}

// Check if a period is ongoing right now
function checkIsLiveNow(dayOfWeek: string, startTime: string, endTime: string): boolean {
  const now = new Date();
  const currentDayName = now.toLocaleDateString("en-US", { weekday: "long" });
  if (dayOfWeek.toLowerCase() !== currentDayName.toLowerCase()) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sMatch = startTime.match(/^(\d{1,2}):(\d{2})/);
  const eMatch = endTime.match(/^(\d{1,2}):(\d{2})/);
  if (!sMatch || !eMatch) return false;

  const startMinutes = parseInt(sMatch[1], 10) * 60 + parseInt(sMatch[2], 10);
  const endMinutes = parseInt(eMatch[1], 10) * 60 + parseInt(eMatch[2], 10);

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

export default function StudentTimetablePage() {
  const router = useRouter();
  const [studentClass, setStudentClass] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<StudentTimetableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI States
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");
  const [selectedDayTab, setSelectedDayTab] = useState<"All" | WeekDay>("All");
  const [selectedEntryModal, setSelectedEntryModal] = useState<StudentTimetableResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [weekMonday, setWeekMonday] = useState<Date>(() => getMondayOfCurrentWeek());

  const todayName = useMemo(() => {
    const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return ALL_WEEK_DAYS.includes(day as WeekDay) ? (day as WeekDay) : "Monday";
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const [profile, entries] = await Promise.all([
          getCurrentStudentProfile().catch(() => null),
          getCurrentStudentTimetable(token).catch(() => []),
        ]);
        if (profile) {
          setStudentClass(profile.class_name ?? null);
          const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
          setStudentName(fullName || profile.admission_no || null);
        }
        setTimetable(entries ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load timetable.");
      } finally {
        setLoading(false);
      }
    };

    void fetchTimetable();
  }, [router]);

  // Normalize entries
  const normalizedEntries = useMemo(() => {
    return timetable.map((item) => {
      const normalizedDay = normalizeDay(item.day_of_week) ?? (item.day_of_week as WeekDay);
      return {
        ...item,
        day_of_week: normalizedDay,
      };
    });
  }, [timetable]);

  // Filter entries based on search
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return normalizedEntries;
    const q = searchQuery.toLowerCase();
    return normalizedEntries.filter((item) => {
      const subject = (item.subject_name ?? "").toLowerCase();
      const teacher = (item.teacher_name ?? "").toLowerCase();
      const room = (item.room_no ?? "").toLowerCase();
      return subject.includes(q) || teacher.includes(q) || room.includes(q);
    });
  }, [normalizedEntries, searchQuery]);

  // Build dynamic TimeSlot rows
  const timeSlotRows = useMemo((): TimeSlotRow[] => {
    if (normalizedEntries.length === 0) return [];

    // Group distinct slots by (period_no, start_time, end_time)
    const slotMap = new Map<string, { periodNo?: number | null; startTime: string; endTime: string }>();

    normalizedEntries.forEach((entry) => {
      const key = `${entry.period_no ?? ""}|${toShortTime(entry.start_time)}|${toShortTime(entry.end_time)}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, {
          periodNo: entry.period_no,
          startTime: toShortTime(entry.start_time),
          endTime: toShortTime(entry.end_time),
        });
      }
    });

    // Sort distinct slots by start time or period number
    const sortedSlots = Array.from(slotMap.values()).sort((a, b) => {
      if (a.periodNo != null && b.periodNo != null) return a.periodNo - b.periodNo;
      return a.startTime.localeCompare(b.startTime);
    });

    // Build the grid rows with standard breaks inserted if gaps exist
    const rows: TimeSlotRow[] = [];

    sortedSlots.forEach((slot, idx) => {
      // Check if this is period 1 or period 2 etc
      const label = slot.periodNo != null ? `Period ${slot.periodNo}` : `Period ${idx + 1}`;

      rows.push({
        id: `period-${slot.periodNo ?? idx + 1}-${slot.startTime}`,
        label,
        startTime: slot.startTime,
        endTime: slot.endTime,
        periodNo: slot.periodNo,
        isBreak: false,
      });

      // Look ahead to check if there is a gap between periods for breaks
      const nextSlot = sortedSlots[idx + 1];
      if (nextSlot) {
        const currentEndMins = computeMinutes(slot.endTime);
        const nextStartMins = computeMinutes(nextSlot.startTime);
        const gap = nextStartMins - currentEndMins;

        if (gap >= 10 && gap <= 25) {
          // Short break
          rows.push({
            id: `break-short-${slot.endTime}`,
            label: "Short Break",
            startTime: slot.endTime,
            endTime: nextSlot.startTime,
            isBreak: true,
            breakType: "short",
          });
        } else if (gap > 25) {
          // Lunch break
          rows.push({
            id: `break-lunch-${slot.endTime}`,
            label: "Lunch Break",
            startTime: slot.endTime,
            endTime: nextSlot.startTime,
            isBreak: true,
            breakType: "lunch",
          });
        }
      }
    });

    return rows;
  }, [normalizedEntries]);

  function computeMinutes(timeStr: string): number {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }

  // Fast map lookup: key `${day}|${periodNo}` or `${day}|${startTime}`
  const entryLookup = useMemo(() => {
    const map = new Map<string, StudentTimetableResponse>();
    filteredEntries.forEach((entry) => {
      const day = entry.day_of_week;
      const shortStart = toShortTime(entry.start_time);
      if (entry.period_no != null) {
        map.set(`${day}|p${entry.period_no}`, entry);
      }
      map.set(`${day}|t${shortStart}`, entry);
    });
    return map;
  }, [filteredEntries]);

  // Unique Subjects summary
  const subjectSummary = useMemo(() => {
    const map = new Map<string, { count: number; teacher?: string }>();
    normalizedEntries.forEach((entry) => {
      const name = entry.subject_name || "General";
      const existing = map.get(name);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(name, { count: 1, teacher: entry.teacher_name || undefined });
      }
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      teacher: data.teacher,
      colors: getSubjectColor(name),
    }));
  }, [normalizedEntries]);

  // Today's classes
  const todayClasses = useMemo(() => {
    return normalizedEntries
      .filter((e) => e.day_of_week.toLowerCase() === todayName.toLowerCase())
      .sort((a, b) => (a.period_no ?? 0) - (b.period_no ?? 0));
  }, [normalizedEntries, todayName]);

  // Find currently active period or upcoming period for today
  const activeOrNextClass = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let currentLive: StudentTimetableResponse | null = null;
    let upcomingNext: StudentTimetableResponse | null = null;

    for (const item of todayClasses) {
      const sMins = computeMinutes(toShortTime(item.start_time));
      const eMins = computeMinutes(toShortTime(item.end_time));

      if (currentMinutes >= sMins && currentMinutes <= eMins) {
        currentLive = item;
        break;
      }
      if (currentMinutes < sMins && !upcomingNext) {
        upcomingNext = item;
      }
    }

    return { currentLive, upcomingNext };
  }, [todayClasses]);

  const weekDates = useMemo(() => getWeekDates(weekMonday), [weekMonday]);
  const weekRangeFormatted = useMemo(() => formatWeekRange(weekMonday), [weekMonday]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (normalizedEntries.length === 0) return;
    const headers = ["Day", "Period", "Start Time", "End Time", "Subject", "Teacher", "Room"];
    const rows = normalizedEntries.map((e) => [
      e.day_of_week,
      e.period_no ?? "—",
      e.start_time,
      e.end_time,
      `"${(e.subject_name ?? "").replace(/"/g, '""')}"`,
      `"${(e.teacher_name ?? "").replace(/"/g, '""')}"`,
      `"${(e.room_no ?? "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Timetable_${studentClass ?? "Class"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-timetable,
          #printable-timetable * {
            visibility: visible;
          }
          #printable-timetable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header section with gradient and quick actions */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white shadow-xl">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-10 right-32 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-purple-200 backdrop-blur-md">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Class Timetable · {studentClass ? `Class ${studentClass}` : "Assigned Class"}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <CalendarDays className="h-7 w-7 text-purple-300" />
                Academic Timetable
              </h1>
              <p className="text-sm text-purple-200/80 max-w-xl">
                Real-time weekly schedule matrix with live period tracking, teacher assignments, and classroom locations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 no-print">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs md:text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95 shadow-sm"
                title="Print Timetable"
              >
                <Printer className="h-4 w-4 text-purple-200" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white transition hover:bg-purple-500 active:scale-95 shadow-md shadow-purple-600/30"
                title="Export Timetable as CSV"
              >
                <Sparkles className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-white/10">
            <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-sm border border-white/5">
              <p className="text-xs font-medium text-purple-200/70">Assigned Class</p>
              <p className="mt-1 text-base md:text-lg font-bold text-white">
                {studentClass ? `Class ${studentClass}` : "Standard"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-sm border border-white/5">
              <p className="text-xs font-medium text-purple-200/70">Weekly Periods</p>
              <p className="mt-1 text-base md:text-lg font-bold text-white">
                {normalizedEntries.length} Classes
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-sm border border-white/5">
              <p className="text-xs font-medium text-purple-200/70">Total Subjects</p>
              <p className="mt-1 text-base md:text-lg font-bold text-white">
                {subjectSummary.length} Subjects
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-sm border border-white/5">
              <p className="text-xs font-medium text-purple-200/70">Today ({todayName})</p>
              <p className="mt-1 text-base md:text-lg font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {todayClasses.length} Classes
              </p>
            </div>
          </div>
        </div>

        {/* Live Period Banner if class is currently ongoing */}
        {activeOrNextClass.currentLive && (
          <div className="no-print flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-5 py-3.5 text-emerald-900 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                <Clock className="h-5 w-5 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Happening Now
                  </span>
                  <p className="text-xs font-medium text-emerald-700">
                    Period {activeOrNextClass.currentLive.period_no ?? ""} · {formatTo12Hour(activeOrNextClass.currentLive.start_time)} – {formatTo12Hour(activeOrNextClass.currentLive.end_time)}
                  </p>
                </div>
                <p className="mt-0.5 text-base font-bold text-emerald-950">
                  {activeOrNextClass.currentLive.subject_name}
                  {activeOrNextClass.currentLive.teacher_name && (
                    <span className="ml-2 font-normal text-xs text-emerald-800">
                      with {activeOrNextClass.currentLive.teacher_name}
                    </span>
                  )}
                  {activeOrNextClass.currentLive.room_no && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      <DoorOpen className="h-3 w-3" /> {activeOrNextClass.currentLive.room_no}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEntryModal(activeOrNextClass.currentLive)}
              className="shrink-0 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition"
            >
              View Class
            </button>
          </div>
        )}

        {/* Main Controls & Timetable Grid Container */}
        <section
          id="printable-timetable"
          className="rounded-3xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm transition-all"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-slate-500">Loading your timetable matrix...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-rose-500" />
                <div>
                  <p className="font-semibold text-base">Unable to load timetable</p>
                  <p className="mt-1 text-sm text-rose-600">{error}</p>
                </div>
              </div>
            </div>
          ) : normalizedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Timetable Published Yet</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-md">
                Your school administration has not published the timetable for {studentClass ? `Class ${studentClass}` : "your class"} yet. Please check back soon or contact your class coordinator.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Navigation and View Controls (no-print) */}
              <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
                {/* Week Navigator */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setWeekMonday((m) => shiftWeek(m, -1))}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition"
                      title="Previous Week"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-3 text-xs font-semibold text-slate-700">
                      {weekRangeFormatted}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWeekMonday((m) => shiftWeek(m, 1))}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition"
                      title="Next Week"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeekMonday(getMondayOfCurrentWeek())}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Current Week
                  </button>
                </div>

                {/* Search and Mode Toggle */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter subject, teacher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-48 rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* View Mode Toggle: Weekly Grid vs Daily Cards */}
                  <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setViewMode("weekly")}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        viewMode === "weekly"
                          ? "bg-white text-purple-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Grid3X3 className="h-3.5 w-3.5" />
                      Weekly Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("daily")}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        viewMode === "daily"
                          ? "bg-white text-purple-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      Daily View
                    </button>
                  </div>
                </div>
              </div>

              {/* Day Selector Tabs */}
              <div className="no-print flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedDayTab("All")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    selectedDayTab === "All"
                      ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  All Days ({ALL_WEEK_DAYS.length})
                </button>
                {ALL_WEEK_DAYS.map((day) => {
                  const isToday = day.toLowerCase() === todayName.toLowerCase();
                  const isSelected = selectedDayTab === day;
                  const dayEntriesCount = normalizedEntries.filter((e) => e.day_of_week === day).length;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDayTab(day)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      <span>{day}</span>
                      {isToday && (
                        <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                          isSelected ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          Today
                        </span>
                      )}
                      <span className={`text-[10px] opacity-75`}>
                        ({dayEntriesCount})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* VIEW 1: REAL TIMETABLE MATRIX (ROW AND COLUMN) */}
              {viewMode === "weekly" && selectedDayTab === "All" && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="min-w-[960px]">
                    {/* TABLE HEADER: Time Slot + Days of Week */}
                    <div className="grid grid-cols-[140px_repeat(6,minmax(130px,1fr))] border-b border-slate-200 bg-slate-50/90 sticky top-0 z-10 backdrop-blur-sm">
                      <div className="flex flex-col justify-center px-4 py-3.5 border-r border-slate-200 bg-slate-100/70 text-left">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Period & Time</span>
                        <span className="text-[10px] font-medium text-slate-400">Schedule</span>
                      </div>

                      {ALL_WEEK_DAYS.map((day) => {
                        const isToday = day.toLowerCase() === todayName.toLowerCase();
                        const dateObj = weekDates[day];
                        const formattedDate = dateObj
                          ? dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "";

                        return (
                          <div
                            key={day}
                            className={`flex flex-col items-center justify-center px-3 py-3 text-center border-r border-slate-200 last:border-r-0 transition ${
                              isToday ? "bg-purple-50/70" : ""
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-bold ${isToday ? "text-purple-900 font-extrabold" : "text-slate-800"}`}>
                                {day}
                              </span>
                              {isToday && (
                                <span className="rounded-md bg-purple-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white shadow-xs">
                                  Today
                                </span>
                              )}
                            </div>
                            <span className={`text-[11px] font-medium ${isToday ? "text-purple-600 font-semibold" : "text-slate-400"}`}>
                              {formattedDate}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* TABLE BODY: Rows of TimeSlots */}
                    <div className="divide-y divide-slate-100">
                      {timeSlotRows.map((slot) => {
                        if (slot.isBreak) {
                          // Break Row (Short Break / Lunch Break)
                          const isLunch = slot.breakType === "lunch";
                          return (
                            <div
                              key={slot.id}
                              className="grid grid-cols-[140px_1fr] border-b border-slate-200/80 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-amber-50/70"
                            >
                              <div className="flex flex-col justify-center border-r border-slate-200 px-4 py-2.5 text-left bg-amber-100/40">
                                <span className="text-xs font-bold text-amber-900">
                                  {formatTo12Hour(slot.startTime)}
                                </span>
                                <span className="text-[10px] font-medium text-amber-700">
                                  {slot.label}
                                </span>
                              </div>
                              <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 text-center">
                                {isLunch ? (
                                  <Utensils className="h-4 w-4 text-amber-600" />
                                ) : (
                                  <Coffee className="h-4 w-4 text-amber-600" />
                                )}
                                <span className="text-xs font-bold tracking-wider uppercase text-amber-900">
                                  {slot.label} ({formatTo12Hour(slot.startTime)} – {formatTo12Hour(slot.endTime)})
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // Regular Period Row
                        return (
                          <div
                            key={slot.id}
                            className="grid grid-cols-[140px_repeat(6,minmax(130px,1fr))] hover:bg-slate-50/40 transition"
                          >
                            {/* Row Label (Period Name & Time) */}
                            <div className="flex flex-col justify-center border-r border-slate-200 px-4 py-3.5 text-left bg-slate-50/40">
                              <span className="text-xs font-bold text-slate-800">{slot.label}</span>
                              <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                                {formatTo12Hour(slot.startTime)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                to {formatTo12Hour(slot.endTime)}
                              </span>
                            </div>

                            {/* 6 Day Columns */}
                            {ALL_WEEK_DAYS.map((day) => {
                              // Look up entry for (day, slot)
                              const entry =
                                (slot.periodNo != null ? entryLookup.get(`${day}|p${slot.periodNo}`) : null) ||
                                entryLookup.get(`${day}|t${slot.startTime}`);

                              const isToday = day.toLowerCase() === todayName.toLowerCase();
                              const isLive = entry ? checkIsLiveNow(day, entry.start_time, entry.end_time) : false;

                              return (
                                <div
                                  key={day}
                                  className={`border-r border-slate-200 last:border-r-0 p-2 flex items-center justify-center min-h-[96px] ${
                                    isToday ? "bg-purple-50/20" : ""
                                  }`}
                                >
                                  {entry ? (
                                    (() => {
                                      const color = getSubjectColor(entry.subject_name || "");
                                      return (
                                        <button
                                          type="button"
                                          onClick={() => setSelectedEntryModal(entry)}
                                          className={`group relative flex h-full w-full flex-col justify-between rounded-xl border p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                                            color.bg
                                          } ${color.border} ${color.text} ${
                                            isLive ? "ring-2 ring-emerald-500 ring-offset-1 shadow-md shadow-emerald-500/20" : ""
                                          }`}
                                        >
                                          {isLive && (
                                            <span className="absolute -top-2 -right-1 flex h-4 items-center gap-1 rounded-full bg-emerald-500 px-1.5 text-[9px] font-bold text-white shadow">
                                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                              LIVE
                                            </span>
                                          )}

                                          <div>
                                            <div className="flex items-start justify-between gap-1">
                                              <span className="text-[13px] font-bold leading-tight line-clamp-1 group-hover:underline">
                                                {entry.subject_name || "Subject"}
                                              </span>
                                            </div>

                                            {entry.teacher_name && (
                                              <div className="mt-1 flex items-center gap-1 text-[11px] font-medium opacity-85">
                                                <User className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{entry.teacher_name}</span>
                                              </div>
                                            )}
                                          </div>

                                          <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-1.5 text-[10px] font-medium opacity-80">
                                            {entry.room_no ? (
                                              <span className="inline-flex items-center gap-1 rounded-md bg-white/60 px-1.5 py-0.5 font-semibold">
                                                <DoorOpen className="h-2.5 w-2.5" />
                                                {entry.room_no}
                                              </span>
                                            ) : (
                                              <span className="text-slate-400">—</span>
                                            )}
                                            <span className="text-[9.5px]">
                                              {toShortTime(entry.start_time)}-{toShortTime(entry.end_time)}
                                            </span>
                                          </div>
                                        </button>
                                      );
                                    })()
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-200/80 bg-slate-50/40 p-2 text-center text-slate-300">
                                      <span className="text-xs font-medium text-slate-300 select-none">
                                        Free
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: SINGLE DAY TIMELINE OR DAILY VIEW */}
              {(viewMode === "daily" || selectedDayTab !== "All") && (
                <div className="space-y-4">
                  {(() => {
                    const activeDays = selectedDayTab === "All" ? ALL_WEEK_DAYS : [selectedDayTab];

                    return activeDays.map((day) => {
                      const dayClasses = normalizedEntries
                        .filter((e) => e.day_of_week.toLowerCase() === day.toLowerCase())
                        .sort((a, b) => {
                          if (a.period_no != null && b.period_no != null) return a.period_no - b.period_no;
                          return a.start_time.localeCompare(b.start_time);
                        });

                      const isToday = day.toLowerCase() === todayName.toLowerCase();
                      const dateObj = weekDates[day];
                      const formattedDate = dateObj
                        ? dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "";

                      return (
                        <div
                          key={day}
                          className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
                        >
                          {/* Day Header */}
                          <div className={`flex items-center justify-between px-5 py-3.5 border-b border-slate-200 ${
                            isToday ? "bg-purple-50/70" : "bg-slate-50/70"
                          }`}>
                            <div className="flex items-center gap-3">
                              <h3 className={`text-base font-bold ${isToday ? "text-purple-950" : "text-slate-800"}`}>
                                {day}
                              </h3>
                              <span className="text-xs font-medium text-slate-500">{formattedDate}</span>
                              {isToday && (
                                <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-xs">
                                  Today
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                              {dayClasses.length} {dayClasses.length === 1 ? "Period" : "Periods"} Scheduled
                            </span>
                          </div>

                          {/* Day Classes Cards */}
                          {dayClasses.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                              <p className="text-sm font-medium">No classes scheduled for {day}.</p>
                              <p className="text-xs mt-1 text-slate-400">Enjoy your free time or use it for revision!</p>
                            </div>
                          ) : (
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                              {dayClasses.map((item) => {
                                const color = getSubjectColor(item.subject_name || "");
                                const isLive = checkIsLiveNow(day, item.start_time, item.end_time);

                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => setSelectedEntryModal(item)}
                                    className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                                      color.bg
                                    } ${color.border} ${color.text} ${
                                      isLive ? "ring-2 ring-emerald-500 shadow-md" : ""
                                    }`}
                                  >
                                    {isLive && (
                                      <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                        LIVE NOW
                                      </span>
                                    )}

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-bold">
                                          Period {item.period_no ?? "—"}
                                        </span>
                                        <span className="text-xs font-medium opacity-85">
                                          {formatTo12Hour(item.start_time)} – {formatTo12Hour(item.end_time)}
                                        </span>
                                      </div>

                                      <h4 className="mt-2.5 text-base font-bold leading-tight">
                                        {item.subject_name}
                                      </h4>

                                      {item.teacher_name && (
                                        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium opacity-90">
                                          <User className="h-3.5 w-3.5 shrink-0" />
                                          <span>Instructor: {item.teacher_name}</span>
                                        </p>
                                      )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-2 text-xs font-medium">
                                      <span className="inline-flex items-center gap-1 font-semibold opacity-85">
                                        <DoorOpen className="h-3.5 w-3.5" />
                                        {item.room_no ? `Room ${item.room_no}` : "Room Unassigned"}
                                      </span>
                                      <span className="text-[11px] opacity-75">
                                        {computeDurationMinutes(item.start_time, item.end_time)} mins
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* Subject Color Legend & Stats Bar */}
              <div className="no-print rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <span>Subjects in Your Timetable</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {subjectSummary.map((subj) => (
                    <div
                      key={subj.name}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold ${subj.colors.bg} ${subj.colors.border} ${subj.colors.text}`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: subj.colors.dot }}
                      />
                      <span>{subj.name}</span>
                      <span className="rounded-md bg-white/60 px-1.5 py-0.2 text-[10px] font-bold">
                        {subj.count} {subj.count === 1 ? "class" : "classes"}/wk
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Class Details Modal */}
      {selectedEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in no-print">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
                  style={{
                    backgroundColor: getSubjectColor(selectedEntryModal.subject_name || "").dot,
                  }}
                >
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                    Period {selectedEntryModal.period_no ?? "—"} · {selectedEntryModal.day_of_week}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedEntryModal.subject_name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntryModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Time Slot
                </span>
                <span className="font-bold text-slate-800">
                  {formatTo12Hour(selectedEntryModal.start_time)} – {formatTo12Hour(selectedEntryModal.end_time)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <User className="h-4 w-4 text-purple-600" />
                  Instructor
                </span>
                <span className="font-bold text-slate-800">
                  {selectedEntryModal.teacher_name ?? "Not Assigned"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <DoorOpen className="h-4 w-4 text-purple-600" />
                  Room Location
                </span>
                <span className="font-bold text-slate-800">
                  {selectedEntryModal.room_no ? `Room ${selectedEntryModal.room_no}` : "Regular Classroom"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Class
                </span>
                <span className="font-bold text-slate-800">
                  {studentClass ? `Class ${studentClass}` : "Your Class"}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedEntryModal(null)}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleDashboardLayout>
  );
}
