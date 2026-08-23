"use client";

import { useEffect, useState } from "react";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import WelcomeBanner from "@/components/dashboard/role-dashboards/WelcomeBanner";
import StatGrid from "@/components/dashboard/role-dashboards/StatGrid";
import QuickActions from "@/components/dashboard/role-dashboards/QuickActions";
import DashboardCard from "@/components/dashboard/role-dashboards/DashboardCard";
import InfoList from "@/components/dashboard/role-dashboards/InfoList";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { teacherQuickActions, teacherStats } from "@/lib/dashboard/role-dashboards/teacher";
import { COMPANY_INFO } from "@/lib/constants";
import {
  getCurrentTeacherProfile,
  getTeacherDashboardSummary,
  getTeacherTimetable,
  getTeacherPendingSubmissions,
  getTeacherPerformance,
  getTeacherMessages,
  getTeacherEvents,
  type TeacherDashboardSummary,
} from "@/lib/services/dashboardService";
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { InfoRow } from "@/lib/dashboard/role-dashboards/types";

const iconMap: Record<string, LucideIcon> = {
  book: BookOpen,
  graduation: GraduationCap,
  users: Users,
};

const COLORS = [
  { iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { iconBg: "bg-green-50", iconColor: "text-green-500" },
  { iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { iconBg: "bg-pink-50", iconColor: "text-pink-500" },
];

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState<{ id: string; employee_id?: string } | null>(null);
  const [summary, setSummary] = useState<TeacherDashboardSummary | null>(null);
  const [timetable, setTimetable] = useState<InfoRow[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<InfoRow[]>([]);
  const [performance, setPerformance] = useState<InfoRow[]>([]);
  const [messages, setMessages] = useState<InfoRow[]>([]);
  const [events, setEvents] = useState<InfoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const profile = await getCurrentTeacherProfile();
        const [resolvedSummary, tt, subs, perf, msgs, evts] = await Promise.all([
          getTeacherDashboardSummary(profile.id),
          getTeacherTimetable(profile.id),
          getTeacherPendingSubmissions(profile.id),
          getTeacherPerformance(profile.id),
          getTeacherMessages(profile.id),
          getTeacherEvents(profile.id),
        ]);

        if (!mounted) return;

        setTeacher(profile);
        setSummary(resolvedSummary);

        setTimetable(
          tt.map((t: any, i: number) => ({
            id: t.id,
            title: t.class_name ?? "Class",
            description: `${t.subject_name ?? "Subject"} · Room ${t.room_no ?? "-"}`,
            meta: `${t.start_time} - ${t.end_time}`,
            ...COLORS[i % COLORS.length],
          }))
        );

        setPendingSubmissions(
          subs.map((s: any) => ({
            id: s.id,
            title: s.assignment_title,
            description: `${s.class_name} · ${s.subject_name} · ${s.student_name}`,
            meta: `Submitted ${s.submitted_on?.slice(0, 10) ?? "-"}`,
            badge: { label: "Pending", variant: "warning" as const },
          }))
        );

        setPerformance(
          perf.map((p: any) => ({
            id: p.class_id,
            title: p.class_name,
            description: `Avg ${p.average_marks}%`,
            meta: p.average_marks >= 80 ? "Good" : p.average_marks >= 60 ? "Average" : "Needs attention",
            badge: {
              label: `${p.average_marks}%`,
              variant: (p.average_marks >= 80 ? "success" : p.average_marks >= 60 ? "warning" : "error") as "success" | "warning" | "error",
            },
          }))
        );

        setMessages(
          msgs.map((m: any, i: number) => ({
            id: m.id,
            title: m.sender_name,
            description: m.message?.slice(0, 60) ?? "",
            meta: m.sent_on?.slice(0, 10) ?? "-",
            icon: MessageSquare,
            ...COLORS[i % COLORS.length],
          }))
        );

        setEvents(
          evts.map((e: any, i: number) => ({
            id: e.id,
            title: e.event_name,
            description: e.description ?? "",
            meta: e.start_date?.slice(0, 10) ?? "-",
            icon: CalendarClock,
            ...COLORS[i % COLORS.length],
          }))
        );
      } catch {
        if (mounted) {
          setTeacher(null);
          setSummary(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => { mounted = false; };
  }, []);

  const dynamicStats = summary
    ? [
        {
          id: "classes",
          label: "Assigned Classes",
          value: summary.assigned_classes,
          change: "Live backend count",
          icon: iconMap.graduation,
          iconBg: "bg-purple-50",
          iconColor: "text-purple-500",
        },
        {
          id: "subjects",
          label: "Assigned Subjects",
          value: summary.assigned_subjects,
          change: "Live backend count",
          icon: iconMap.book,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-500",
        },
        {
          id: "students",
          label: "Students",
          value: summary.total_students,
          change: "Shared with your classes",
          icon: iconMap.users,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-500",
        },
        {
          id: "pending",
          label: "Pending Reviews",
          value: pendingSubmissions.length,
          change: "Assignments to grade",
          icon: ClipboardList,
          iconBg: "bg-rose-50",
          iconColor: "text-rose-500",
        },
      ]
    : teacherStats;

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <WelcomeBanner
        title={loading ? "Welcome back" : `Welcome back, ${teacher?.employee_id ?? "Teacher"}! 👋`}
        subtitle={loading ? "Loading your teaching workload..." : "Your teaching workload is live from the backend."}
      />

      <StatGrid stats={dynamicStats} columns={4} />

      <div className="mb-8">
        <QuickActions actions={teacherQuickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Today's Timetable">
          <InfoList items={timetable.length ? timetable : [{ id: "empty", title: "No timetable entries", description: "No periods assigned yet" }]} />
        </DashboardCard>

        <DashboardCard title="Pending Submissions">
          <InfoList
            items={pendingSubmissions.length ? pendingSubmissions : [{ id: "empty", title: "No pending submissions", description: "All caught up!" }]}
            showIcon={false}
          />
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Student Performance Overview">
          <InfoList
            items={performance.length ? performance : [{ id: "empty", title: "No performance data", description: "No exam results yet" }]}
            showIcon={false}
          />
        </DashboardCard>

        <DashboardCard title="Recent Messages">
          <InfoList
            items={messages.length ? messages : [{ id: "empty", title: "No messages", description: "Your inbox is empty", icon: MessageSquare, iconBg: "bg-slate-50", iconColor: "text-slate-400" }]}
          />
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Upcoming Events">
          <InfoList
            items={events.length ? events : [{ id: "empty", title: "No upcoming events", description: "Check back later", icon: CalendarClock, iconBg: "bg-slate-50", iconColor: "text-slate-400" }]}
          />
        </DashboardCard>
      </div>

      <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200">
        <span>{COMPANY_INFO.copyright}</span>
        <span>Version {COMPANY_INFO.version}</span>
      </footer>
    </RoleDashboardLayout>
  );
}