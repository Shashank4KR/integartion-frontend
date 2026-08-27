"use client";

import { useEffect, useState } from "react";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import WelcomeBanner from "@/components/dashboard/role-dashboards/WelcomeBanner";
import StatGrid from "@/components/dashboard/role-dashboards/StatGrid";
import QuickActions from "@/components/dashboard/role-dashboards/QuickActions";
import DashboardCard from "@/components/dashboard/role-dashboards/DashboardCard";
import InfoList from "@/components/dashboard/role-dashboards/InfoList";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import {
  studentStats,
  studentQuickActions,
  todaysTimetable,
  pendingAssignments,
  recentMarks,
  upcomingExams,
  studentNotices,
} from "@/lib/dashboard/role-dashboards/student";
import { COMPANY_INFO } from "@/lib/constants";
import { getToken } from "@/lib/auth";
import {
  getCurrentStudentProfile,
  getStudentDashboardSummary,
  getStudentTimetable,
  getStudentAssignments,
  getExams,
  getAnnouncements,
  type StudentDashboardSummary,
} from "@/lib/services/dashboardService";
import { getAllExamResults } from "@/lib/services/examResultService";
import {
  BookOpen,
  GraduationCap,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  book: BookOpen,
  graduation: GraduationCap,
  wallet: Wallet,
};

interface InfoRow {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  icon?: any;
  iconBg?: string;
  iconColor?: string;
  badge?: {
    label: string;
    variant?: "success" | "warning" | "error" | "info" | "default";
  };
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [summary, setSummary] = useState<StudentDashboardSummary | null>(null);
  const [timetable, setTimetable] = useState<InfoRow[]>(todaysTimetable);
  const [assignments, setAssignments] = useState<InfoRow[]>(pendingAssignments);
  const [marks, setMarks] = useState<InfoRow[]>(recentMarks);
  const [exams, setExams] = useState<InfoRow[]>(upcomingExams);
  const [notices, setNotices] = useState<InfoRow[]>(studentNotices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const token = getToken();
        if (!token) {
          if (mounted) {
            setError("Please log in to view student dashboard.");
            setLoading(false);
          }
          return;
        }

        const studentProfile = await getCurrentStudentProfile();
        const studentId = studentProfile.id;
        const classId = (studentProfile as any).class_id;

        const [
          studentSummary,
          timetableData,
          assignmentsData,
          examsData,
          announcementsData,
          examResultsData,
        ] = await Promise.all([
          getStudentDashboardSummary(studentId).catch(() => null),
          getStudentTimetable().catch(() => []),
          getStudentAssignments().catch(() => []),
          getExams().catch(() => []),
          getAnnouncements().catch(() => []),
          getAllExamResults(token).catch(() => []),
        ]);

        if (!mounted) return;

        setStudent(studentProfile);
        setSummary(studentSummary);

        // 1. Map timetable
        if (Array.isArray(timetableData) && timetableData.length > 0) {
          const DAYS_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
          const todayName = DAYS_OF_WEEK[new Date().getDay()];
          
          let filtered = timetableData.filter(
            (t: any) => String(t.day_of_week).toUpperCase() === todayName
          );

          if (filtered.length === 0) {
            // Fallback to first day containing schedules
            const firstDay = timetableData[0].day_of_week;
            filtered = timetableData.filter((t: any) => t.day_of_week === firstDay);
          }

          const COLORS = ["purple", "blue", "green", "amber", "pink"];
          setTimetable(
            filtered.map((t: any, index: number) => {
              const color = COLORS[index % COLORS.length];
              return {
                id: String(t.id),
                title: t.subject_name ?? "Lesson",
                description: `Room ${t.room_no ?? "-"} · ${t.teacher_name ?? "Teacher"}`,
                meta: `${t.start_time ?? ""} - ${t.end_time ?? ""}`,
                iconBg: `bg-${color}-50`,
                iconColor: `text-${color}-500`,
              };
            })
          );
        } else {
          setTimetable([]);
        }

        // 2. Map assignments
        if (Array.isArray(assignmentsData)) {
          const pending = assignmentsData.filter((a: any) => !a.submission);
          setAssignments(
            pending.slice(0, 4).map((a: any) => {
              const due = new Date(a.due_date);
              const diffDays = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = diffDays <= 2;
              return {
                id: String(a.id),
                title: a.title,
                description: `${a.subject_name ?? "Subject"} · ${a.teacher_name ?? "Teacher"}`,
                meta: `Due ${a.due_date}`,
                badge: isUrgent 
                  ? { label: "Urgent", variant: "error" as const }
                  : { label: "Pending", variant: "warning" as const },
              };
            })
          );
        }

        // 3. Map marks
        if (Array.isArray(assignmentsData)) {
          const graded = assignmentsData.filter(
            (a: any) => a.submission && a.submission.marks !== null
          );
          
          const mappedGrades = graded.map((a: any) => {
            const marksVal = Number(a.submission.marks);
            let variant: "success" | "warning" | "error" = "success";
            let label = "Passed";
            if (marksVal >= 85) {
              label = "Excellent";
              variant = "success";
            } else if (marksVal >= 50) {
              label = "Good";
              variant = "warning";
            } else {
              label = "Needs Work";
              variant = "error";
            }
            return {
              id: String(a.id),
              title: a.title,
              description: `Score: ${marksVal}/100 · ${a.subject_name ?? "Subject"}`,
              meta: "Graded",
              badge: { label, variant },
            };
          });

          // Add exam results if any
          if (Array.isArray(examResultsData)) {
            const studentExamResults = examResultsData.filter(
              (r: any) => String(r.student_id) === String(studentId)
            );
            studentExamResults.forEach((r: any) => {
              mappedGrades.push({
                id: String(r.id),
                title: "Exam Result",
                description: `Score: ${r.marks_obtained} · Grade: ${r.grade ?? "-"}`,
                meta: r.remarks ?? "Exam Graded",
                badge: { label: r.grade ?? "Graded", variant: "success" as const },
              });
            });
          }

          setMarks(mappedGrades.slice(0, 4));
        }

        // 4. Map exams
        if (Array.isArray(examsData) && classId) {
          const studentExams = examsData.filter(
            (e: any) => String(e.class_id) === String(classId)
          );
          
          const COLORS = ["purple", "green", "blue", "amber"];
          setExams(
            studentExams.slice(0, 4).map((e: any, index: number) => {
              const color = COLORS[index % COLORS.length];
              return {
                id: String(e.id),
                title: e.exam_name,
                description: `Type: ${e.exam_type} · Max Marks: ${e.max_marks}`,
                meta: String(e.start_date),
                iconBg: `bg-${color}-50`,
                iconColor: `text-${color}-500`,
              };
            })
          );
        } else {
          setExams([]);
        }

        // 5. Map announcements
        if (Array.isArray(announcementsData)) {
          const COLORS = ["purple", "blue", "amber", "green"];
          setNotices(
            announcementsData.slice(0, 4).map((a: any, index: number) => {
              const color = COLORS[index % COLORS.length];
              return {
                id: String(a.id),
                title: a.title,
                description: a.content,
                meta: formatTimeAgo(a.created_at),
                iconBg: `bg-${color}-50`,
                iconColor: `text-${color}-500`,
              };
            })
          );
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load student dashboard:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "We could not load your dashboard.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const displayName = [student?.first_name, student?.last_name]
    .filter(Boolean)
    .join(" ") || student?.admission_no || "Student";

  const dynamicStats = summary
    ? [
        {
          id: "attendance",
          label: "Attendance",
          value: `${summary.attendance_percentage}%`,
          change: `${summary.present}/${summary.total_classes} present`,
          icon: iconMap.book,
          iconBg: "bg-purple-50",
          iconColor: "text-purple-500",
        },
        {
          id: "fees",
          label: "Fees Due",
          value: `₹${summary.pending_amount.toLocaleString()}`,
          change: "Outstanding balance",
          icon: iconMap.wallet,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-500",
        },
        {
          id: "classes",
          label: "Classes Attended",
          value: summary.total_classes,
          change: "Live attendance count",
          icon: iconMap.graduation,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-500",
        },
      ]
    : studentStats;

  const welcomeSubtitle = summary
    ? `${summary.attendance_percentage}% attendance • ₹${summary.pending_amount.toLocaleString()} due`
    : "Here's your academic snapshot for today.";

  const pendingCount = assignments.length;

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <WelcomeBanner
        title={loading ? "Welcome back" : `Welcome back, ${displayName}! 👋`}
        subtitle={loading ? "Loading your live academic data..." : welcomeSubtitle}
      />

      {error ? (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          Loading student dashboard...
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <StatGrid stats={dynamicStats} columns={4} />

          <div className="mb-8">
            <QuickActions actions={studentQuickActions} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard title="Today's Timetable">
              {timetable.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No classes scheduled for today.</p>
              ) : (
                <InfoList items={timetable} showIcon={false} />
              )}
            </DashboardCard>

            <DashboardCard title="Attendance Overview">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center">
                <p className="text-3xl font-extrabold text-slate-800">{summary?.attendance_percentage ?? 0}%</p>
                <p className="text-xs font-semibold text-slate-500 mt-2">Overall Class Attendance</p>
                <div className="w-full h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${summary?.attendance_percentage ?? 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-3">{summary?.present ?? 0} out of {summary?.total_classes ?? 0} periods attended</p>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Pending Assignments"
              action={
                <span className={`text-xs font-semibold ${pendingCount > 0 ? "text-amber-600" : "text-slate-500"}`}>
                  {pendingCount} open
                </span>
              }
            >
              {assignments.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No pending assignments!</p>
              ) : (
                <InfoList items={assignments} showIcon={false} />
              )}
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard title="Recent Marks">
              {marks.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No graded assignments or exams found.</p>
              ) : (
                <InfoList items={marks} showIcon={false} />
              )}
            </DashboardCard>

            <DashboardCard title="Upcoming Exams">
              {exams.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No upcoming exams scheduled.</p>
              ) : (
                <InfoList items={exams} showIcon={false} />
              )}
            </DashboardCard>

            <DashboardCard title="Notices">
              {notices.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No new notices.</p>
              ) : (
                <InfoList items={notices} />
              )}
            </DashboardCard>
          </div>
        </>
      ) : null}

      <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200">
        <span>{COMPANY_INFO.copyright}</span>
        <span>Version {COMPANY_INFO.version}</span>
      </footer>
    </RoleDashboardLayout>
  );
}
