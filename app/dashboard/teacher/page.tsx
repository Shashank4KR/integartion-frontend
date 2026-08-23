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
  getCurrentTeacherProfile,
  getTeacherDashboardSummary,
  type TeacherDashboardSummary,
} from "@/lib/services/dashboardService";
import {
  getCurrentTeacher,
  getTeacherClasses,
  getTeacherEvents,
  getTeacherMessages,
  getTeacherPendingSubmissions,
  getTeacherPerformance,
  getTeacherTimetable,
} from "@/lib/services/teacherService";
import { getToken } from "@/lib/auth";
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

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState<{
    employee_id?: string;
  } | null>(null);
  const [summary, setSummary] = useState<TeacherDashboardSummary | null>(null);
  const [classRows, setClassRows] = useState<InfoRow[]>([]);
  const [scheduleRows, setScheduleRows] = useState<InfoRow[]>([]);
  const [reviewRows, setReviewRows] = useState<InfoRow[]>([]);
  const [performanceRows, setPerformanceRows] = useState<InfoRow[]>([]);
  const [messageRows, setMessageRows] = useState<InfoRow[]>([]);
  const [eventRows, setEventRows] = useState<InfoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const token = getToken();
        if (!token) {
          throw new Error("Missing session");
        }

        const teacherProfile = await getCurrentTeacherProfile();
        const currentTeacher = await getCurrentTeacher(token);
        const teacherId = teacherProfile.id || currentTeacher.id;
        const [
          resolvedSummary,
          assignedClassData,
          timetable,
          submissions,
          performance,
          messages,
          events,
        ] = await Promise.all([
          getTeacherDashboardSummary(teacherId),
          getTeacherClasses(token, teacherId),
          getTeacherTimetable(token, teacherId),
          getTeacherPendingSubmissions(token, teacherId),
          getTeacherPerformance(token, teacherId),
          getTeacherMessages(token, teacherId),
          getTeacherEvents(token, teacherId),
        ]);

        if (!mounted) {
          return;
        }

        setTeacher(teacherProfile);
        setSummary(resolvedSummary);
        setClassRows(
          assignedClassData.map((item) => ({
            id: item.id,
            title: item.class_name,
            description: item.section ? `Section ${item.section}` : undefined,
            meta: item.academic_year ?? undefined,
            icon: GraduationCap,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
          })),
        );
        setScheduleRows(
          timetable.slice(0, 6).map((item) => ({
            id: item.id,
            title: item.subject_name ?? "Subject not assigned",
            description: item.class_name ?? undefined,
            meta: `${item.day_of_week} ${item.start_time}-${item.end_time}`,
          })),
        );
        setReviewRows(
          submissions.slice(0, 6).map((item) => ({
            id: item.id,
            title: item.assignment_title,
            description: `${item.student_name}${item.class_name ? ` · ${item.class_name}` : ""}`,
            meta: new Date(item.submitted_on).toLocaleDateString(),
            icon: ClipboardList,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
          })),
        );
        setPerformanceRows(
          performance.slice(0, 6).map((item) => ({
            id: item.class_id,
            title: item.class_name,
            description: "Average marks",
            meta: `${item.average_marks}%`,
          })),
        );
        setMessageRows(
          messages.slice(0, 6).map((item) => ({
            id: item.id,
            title: item.sender_name,
            description: item.message,
            meta: new Date(item.sent_on).toLocaleDateString(),
            icon: MessageSquare,
            iconBg: item.is_read ? "bg-slate-100" : "bg-blue-50",
            iconColor: item.is_read ? "text-slate-500" : "text-blue-500",
          })),
        );
        setEventRows(
          events.slice(0, 6).map((item) => ({
            id: item.id,
            title: item.event_name,
            description: item.description ?? undefined,
            meta: new Date(item.start_date).toLocaleDateString(),
            icon: CalendarClock,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
          })),
        );
      } catch {
        if (mounted) {
          setTeacher(null);
          setSummary(null);
          setClassRows([]);
          setScheduleRows([]);
          setReviewRows([]);
          setPerformanceRows([]);
          setMessageRows([]);
          setEventRows([]);
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

  const dynamicStats = [
    {
      id: "classes",
      label: "Assigned Classes",
      value: summary?.assigned_classes ?? 0,
      change: summary ? "Live backend count" : "No live data loaded",
      icon: iconMap.graduation,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      id: "subjects",
      label: "Assigned Subjects",
      value: summary?.assigned_subjects ?? 0,
      change: summary ? "Live backend count" : "No live data loaded",
      icon: iconMap.book,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      id: "students",
      label: "Students",
      value: summary?.total_students ?? 0,
      change: summary ? "Shared with your classes" : "No live data loaded",
      icon: iconMap.users,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <WelcomeBanner
        title={loading ? "Welcome back" : `Welcome back, ${teacher?.employee_id || "Teacher"}!`}
        subtitle={loading ? "Loading your teaching workload..." : "Your assigned classes, schedule, and updates are loaded from the live system."}
      />

      <StatGrid stats={dynamicStats} columns={4} />

      <div className="mb-8">
        <QuickActions actions={teacherQuickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Assigned Classes">
          {classRows.length ? <InfoList items={classRows} /> : <EmptyState label="No assigned classes found." />}
        </DashboardCard>

        <DashboardCard title="Today's Schedule">
          {scheduleRows.length ? <InfoList items={scheduleRows} showIcon={false} /> : <EmptyState label="No timetable entries found." />}
        </DashboardCard>
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
  return <p className="py-4 text-sm text-slate-500">{label}</p>;
}
