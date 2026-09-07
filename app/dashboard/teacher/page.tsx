"use client";

import { useEffect, useState } from "react";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import WelcomeBanner from "@/components/dashboard/role-dashboards/WelcomeBanner";
import StatGrid from "@/components/dashboard/role-dashboards/StatGrid";
import QuickActions from "@/components/dashboard/role-dashboards/QuickActions";
import DashboardCard from "@/components/dashboard/role-dashboards/DashboardCard";
import InfoList from "@/components/dashboard/role-dashboards/InfoList";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { teacherQuickActions } from "@/lib/dashboard/role-dashboards/teacher";
import { COMPANY_INFO } from "@/lib/constants";
import {
  getTeacherDashboardSummary,
  type TeacherDashboardSummary,
} from "@/lib/services/dashboardService";
import {
  getCurrentTeacher,
  getTeacherClasses,
  getTeacherSubjects,
  getTeacherEvents,
  getTeacherMessages,
  getTeacherPendingSubmissions,
  getTeacherPerformance,
  getTeacherTimetable,
} from "@/lib/services/teacherService";
import { getClassStudents } from "@/lib/services/classService";
import { getToken, getStoredUser } from "@/lib/auth";
import type { InfoRow } from "@/lib/dashboard/role-dashboards/types";
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  book: BookOpen,
  graduation: GraduationCap,
  users: Users,
};

function formatDate(val?: string | null): string {
  if (!val) return "";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

export default function TeacherDashboardPage() {
  const [teacherName, setTeacherName] = useState<string>("Teacher");
  const [summary, setSummary] = useState<TeacherDashboardSummary | null>(null);
  const [classRows, setClassRows] = useState<InfoRow[]>([]);
  const [scheduleRows, setScheduleRows] = useState<InfoRow[]>([]);
  const [reviewRows, setReviewRows] = useState<InfoRow[]>([]);
  const [performanceRows, setPerformanceRows] = useState<InfoRow[]>([]);
  const [messageRows, setMessageRows] = useState<InfoRow[]>([]);
  const [eventRows, setEventRows] = useState<InfoRow[]>([]);
  const [totalSubjectsCount, setTotalSubjectsCount] = useState<number>(0);
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const token = getToken();
        if (!token) {
          if (mounted) setLoading(false);
          return;
        }

        // Get stored user name first
        const storedUser = getStoredUser();
        const userName = storedUser?.first_name
          ? `${storedUser.first_name} ${storedUser.last_name || ""}`.trim()
          : storedUser?.username;

        if (userName && mounted) {
          setTeacherName(userName);
        }

        // Fetch live teacher record
        const currentTeacher = await getCurrentTeacher(token).catch((err) => {
          console.error("Failed to fetch teacher profile:", err);
          return null;
        });

        const teacherId = currentTeacher?.id;
        if (!teacherId) {
          console.warn("Teacher ID not found for current user.");
          if (mounted) setLoading(false);
          return;
        }

        if (currentTeacher?.employee_id && !userName && mounted) {
          setTeacherName(currentTeacher.employee_id);
        }

        const [
          resolvedSummary,
          assignedClassData,
          assignedSubjectData,
          timetable,
          submissions,
          performance,
          messages,
          events,
        ] = await Promise.all([
          getTeacherDashboardSummary(teacherId).catch(() => null),
          getTeacherClasses(token, teacherId).catch(() => []),
          getTeacherSubjects(token, teacherId).catch(() => []),
          getTeacherTimetable(token, teacherId).catch(() => []),
          getTeacherPendingSubmissions(token, teacherId).catch(() => []),
          getTeacherPerformance(token, teacherId).catch(() => []),
          getTeacherMessages(token, teacherId).catch(() => []),
          getTeacherEvents(token, teacherId).catch(() => []),
        ]);

        if (!mounted) return;

        // Try getting accurate student count from assigned classes if summary student count is missing
        let computedStudents = resolvedSummary?.total_students ?? 0;
        if (!computedStudents && assignedClassData.length > 0) {
          try {
            const studentLists = await Promise.all(
              assignedClassData.slice(0, 5).map((cls) => getClassStudents(token, cls.id).catch(() => []))
            );
            const uniqueStudentIds = new Set<string>();
            studentLists.flat().forEach((stu: any) => {
              if (stu?.id) uniqueStudentIds.add(stu.id);
            });
            computedStudents = uniqueStudentIds.size;
          } catch {
            // Keep computedStudents as 0
          }
        }

        if (!mounted) return;

        setSummary(resolvedSummary);
        setTotalSubjectsCount(resolvedSummary?.assigned_subjects || assignedSubjectData.length || 0);
        setTotalStudentsCount(computedStudents);

        if (resolvedSummary?.teacher_name && !userName) {
          setTeacherName(resolvedSummary.teacher_name);
        }

        setClassRows(
          (assignedClassData || []).map((item) => ({
            id: item.id,
            title: item.class_name,
            description: item.section ? `Section ${item.section}` : "Main Section",
            meta: item.academic_year ?? undefined,
            icon: GraduationCap,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
          })),
        );

        setScheduleRows(
          (timetable || []).slice(0, 6).map((item) => ({
            id: item.id,
            title: item.class_name ? `${item.class_name} · ${item.subject_name || "Assigned Subject"}` : (item.subject_name ?? "Subject Period"),
            description: [item.day_of_week, item.room_no ? `Room ${item.room_no}` : null].filter(Boolean).join(" · "),
            meta: `${item.start_time} - ${item.end_time}`,
          })),
        );

        setReviewRows(
          (submissions || []).slice(0, 6).map((item) => ({
            id: item.id,
            title: item.assignment_title,
            description: `${item.student_name}${item.class_name ? ` · ${item.class_name}` : ""}`,
            meta: formatDate(item.submitted_on) || "Pending Review",
            icon: ClipboardList,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
          })),
        );

        setPerformanceRows(
          (performance || []).slice(0, 6).map((item) => ({
            id: item.class_id,
            title: item.class_name,
            description: "Average marks",
            meta: `${item.average_marks}%`,
          })),
        );

        setMessageRows(
          (messages || []).slice(0, 6).map((item) => ({
            id: item.id,
            title: item.sender_name,
            description: item.message,
            meta: formatDate(item.sent_on),
            icon: MessageSquare,
            iconBg: item.is_read ? "bg-slate-100" : "bg-blue-50",
            iconColor: item.is_read ? "text-slate-500" : "text-blue-500",
          })),
        );

        setEventRows(
          (events || []).slice(0, 6).map((item) => ({
            id: item.id,
            title: item.event_name,
            description: item.description ?? undefined,
            meta: formatDate(item.start_date),
            icon: CalendarClock,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
          })),
        );
      } catch (err) {
        console.error("Error loading teacher dashboard data:", err);
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

  const totalClasses = summary?.assigned_classes || classRows.length || 0;
  const totalSubjects = summary?.assigned_subjects || totalSubjectsCount || 0;
  const totalStudents = summary?.total_students || totalStudentsCount || 0;

  const dynamicStats = [
    {
      id: "classes",
      label: "Assigned Classes",
      value: totalClasses,
      change: totalClasses > 0 ? `${totalClasses} active classes` : "No current data",
      icon: iconMap.graduation,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      id: "subjects",
      label: "Assigned Subjects",
      value: totalSubjects,
      change: totalSubjects > 0 ? `${totalSubjects} teaching subjects` : "No current data",
      icon: iconMap.book,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      id: "students",
      label: "Students",
      value: totalStudents,
      change: totalStudents > 0 ? `${totalStudents} enrolled students` : "No current data",
      icon: iconMap.users,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <WelcomeBanner
        title={loading ? "Welcome back" : `Welcome back, ${teacherName}!`}
        subtitle={loading ? "Loading your teaching workload..." : "Your assigned classes, schedule, and updates are loaded from the live system."}
      />

      <StatGrid stats={dynamicStats} columns={3} />

      {/* Prominently show Assigned Classes and Today's Schedule right under the stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-8">
        <DashboardCard title="Assigned Classes">
          {classRows.length ? <InfoList items={classRows} /> : <EmptyState label="No assigned classes found." />}
        </DashboardCard>

        <DashboardCard title="Today's Schedule">
          {scheduleRows.length ? <InfoList items={scheduleRows} showIcon={false} /> : <EmptyState label="No timetable entries found." />}
        </DashboardCard>
      </div>

      <div className="mb-8">
        <QuickActions actions={teacherQuickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard
          title="Pending Assignments to Review"
          action={
            <span className="text-xs font-semibold text-amber-600">
              {reviewRows.length} pending
            </span>
          }
        >
          {reviewRows.length ? <InfoList items={reviewRows} /> : <EmptyState label="No pending submissions found." />}
        </DashboardCard>

        <DashboardCard title="Student Performance Overview">
          {performanceRows.length ? <InfoList items={performanceRows} showIcon={false} /> : <EmptyState label="No performance records found." />}
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Recent Messages">
          {messageRows.length ? <InfoList items={messageRows} /> : <EmptyState label="No recent messages found." />}
        </DashboardCard>

        <DashboardCard title="Upcoming Events">
          {eventRows.length ? <InfoList items={eventRows} /> : <EmptyState label="No upcoming events found." />}
        </DashboardCard>
      </div>

      <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200">
        <span>{COMPANY_INFO.copyright}</span>
        <span>Version {COMPANY_INFO.version}</span>
      </footer>
    </RoleDashboardLayout>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-6 text-center">
      <p className="text-sm font-semibold text-slate-600">No current data</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
