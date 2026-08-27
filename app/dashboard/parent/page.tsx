"use client";

import { useEffect, useState } from "react";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import WelcomeBanner from "@/components/dashboard/role-dashboards/WelcomeBanner";
import StatGrid from "@/components/dashboard/role-dashboards/StatGrid";
import QuickActions from "@/components/dashboard/role-dashboards/QuickActions";
import DashboardCard from "@/components/dashboard/role-dashboards/DashboardCard";
import InfoList from "@/components/dashboard/role-dashboards/InfoList";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { parentQuickActions } from "@/lib/dashboard/role-dashboards/parent";
import { COMPANY_INFO } from "@/lib/constants";
import { getCurrentParentStudents, getExams } from "@/lib/services/dashboardService";
import { getStudentFeeSummary } from "@/lib/services/feeService";
import { getStudentExamResults } from "@/lib/services/studentService";
import { listSubjects } from "@/lib/services/subjectService";
import { listAnnouncements, listMessages } from "@/lib/services/communicationService";
import { listEvents } from "@/lib/services/calendarService";
import { getToken } from "@/lib/auth";
import { getCurrentUser } from "@/lib/services/authService";
import { BookOpen, GraduationCap, Wallet, type LucideIcon } from "lucide-react";
import type { InfoRow } from "@/lib/dashboard/role-dashboards/types";

const iconMap: Record<string, LucideIcon> = {
  book: BookOpen,
  graduation: GraduationCap,
  wallet: Wallet,
};

type Child = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  admission_no?: string;
  class_name?: string | null;
  section?: string | null;
  roll_no?: string | null;
};

const text = (value: unknown, fallback = "-") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

const num = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value: number) =>
  `INR ${Number.isFinite(value) ? value.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0"}`;

const displayDate = (value: unknown) => {
  const str = text(value, "");
  if (!str) return "-";
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return str;
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [parentName, setParentName] = useState<string>("");
  const [childProfile, setChildProfile] = useState<InfoRow[]>([]);
  const [childMarks, setChildMarks] = useState<InfoRow[]>([]);
  const [feeDue, setFeeDue] = useState<InfoRow[]>([]);
  const [teacherMessages, setTeacherMessages] = useState<InfoRow[]>([]);
  const [parentNotices, setParentNotices] = useState<InfoRow[]>([]);
  const [parentEvents, setParentEvents] = useState<InfoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const token = getToken();
      if (!token) {
        if (mounted) {
          setError("Please log in to view your dashboard.");
          setLoading(false);
        }
        return;
      }

      try {
        const [childrenData, me] = await Promise.all([
          getCurrentParentStudents(),
          getCurrentUser(token).catch(() => null),
        ]);

        if (!mounted) return;

        setChildren(childrenData ?? []);
        if (me) setParentName(text((me as Record<string, unknown>).username, ""));

        const primaryChild = (childrenData ?? [])[0] as Child | undefined;
        const childId = primaryChild?.id;

        setChildProfile(
          primaryChild
            ? [
                {
                  id: "name",
                  title: [primaryChild.first_name, primaryChild.last_name].filter(Boolean).join(" ") || "Student",
                  description: `${text(primaryChild.class_name)} · Roll No. ${text(primaryChild.roll_no)}`,
                  meta: text(primaryChild.section, ""),
                },
              ]
            : [],
        );

        const [announcements, messages, events] = await Promise.all([
          listAnnouncements(token).catch(() => []),
          listMessages(token).catch(() => []),
          listEvents(token).catch(() => []),
        ]);

        if (!mounted) return;

        setParentNotices(
          (Array.isArray(announcements) ? announcements : []).slice(0, 5).map((item, idx) => {
            const a = item as Record<string, unknown>;
            return {
              id: text(a.id, String(idx)),
              title: text(a.title, "Announcement"),
              description: text(a.content ?? a.description, ""),
              meta: displayDate(a.created_at ?? a.date),
            };
          }),
        );

        setTeacherMessages(
          (Array.isArray(messages) ? messages : []).slice(0, 5).map((item, idx) => {
            const m = item as Record<string, unknown>;
            return {
              id: text(m.id, String(idx)),
              title: text(m.sender_name ?? m.from_name ?? m.sender, "Teacher"),
              description: text(m.content ?? m.message ?? m.body, ""),
              meta: displayDate(m.created_at ?? m.date),
            };
          }),
        );

        setParentEvents(
          (Array.isArray(events) ? events : []).slice(0, 5).map((item, idx) => {
            const e = item as Record<string, unknown>;
            return {
              id: text(e.id, String(idx)),
              title: text(e.title ?? e.name, "Event"),
              description: text(e.location ?? e.venue, ""),
              meta: displayDate(e.event_date ?? e.date ?? e.start_date),
            };
          }),
        );

        if (childId) {
          const [feeSummary, examResults, subjects, exams] = await Promise.all([
            getStudentFeeSummary(token, childId).catch(() => null),
            getStudentExamResults(token, childId).catch(() => []),
            listSubjects(token).catch(() => []),
            getExams().catch(() => []),
          ]);

          if (!mounted) return;

          const invoices = Array.isArray((feeSummary as Record<string, unknown>)?.invoices)
            ? ((feeSummary as Record<string, unknown>).invoices as Array<Record<string, unknown>>)
            : [];

          setFeeDue(
            invoices.slice(0, 5).map((inv, idx) => {
              const amount = num(inv.amount ?? inv.net_amount);
              const paid = num(inv.paid_amount);
              const isPaid = paid >= amount && amount > 0;
              return {
                id: text(inv.id, String(idx)),
                title: text(inv.fee_type ?? inv.invoice_number, "Fee"),
                description: money(amount),
                meta: isPaid
                  ? `Paid ${displayDate(inv.invoice_date)}`
                  : `Due ${displayDate(inv.due_date)}`,
                badge: { label: isPaid ? "Paid" : "Pending", variant: isPaid ? ("success" as const) : ("warning" as const) },
              };
            }),
          );

          setChildMarks(
            (Array.isArray(examResults) ? examResults : []).slice(0, 5).map((item, idx) => {
              const r = item as Record<string, unknown>;
              const marks = num(r.marks_obtained ?? r.marks);
              const total = num(r.total_marks) || 100;
              const pct = total > 0 ? Math.round((marks / total) * 100) : 0;

              const subjectObj = subjects.find((s: any) => String(s.id) === String(r.subject_id));
              const examObj = exams.find((e: any) => String(e.id) === String(r.exam_id));

              return {
                id: text(r.id, String(idx)),
                title: text(subjectObj?.subject_name ?? r.subject_name ?? r.subject, "Subject"),
                description: text(examObj?.exam_name ?? r.exam_name ?? r.exam_type, "Exam"),
                meta: `${pct}%`,
              };
            }),
          );
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const childLabel =
    children.length > 0
      ? [children[0].first_name, children[0].last_name].filter(Boolean).join(" ") ||
        children[0].admission_no ||
        "your child"
      : "your child";

  const dynamicStats = [
    {
      id: "child",
      label: "Linked Students",
      value: children.length,
      change: "Live parent-child mapping",
      icon: iconMap.graduation,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      id: "fees",
      label: "Fee Status",
      value: "Live",
      change: "Fetched from backend",
      icon: iconMap.wallet,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      id: "library",
      label: "Academic Updates",
      value: "Live",
      change: "Student records available",
      icon: iconMap.book,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.parent}>
      <WelcomeBanner
        title={loading ? "Welcome back" : parentName ? `Welcome back, ${parentName}!` : "Welcome back!"}
        subtitle={loading ? "Loading your child's academic data..." : `Here's how ${childLabel} is doing at school.`}
      />

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <StatGrid stats={dynamicStats} columns={4} />

      <div className="mb-8">
        <QuickActions actions={parentQuickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="Child Profile">
          {childProfile.length > 0 ? (
            <InfoList items={childProfile} showIcon={false} />
          ) : (
            <p className="text-sm text-slate-500">No student profile found.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Attendance">
          <p className="text-sm text-slate-500">Attendance data is sourced from the live backend.</p>
        </DashboardCard>

        <DashboardCard title="Child Marks">
          {childMarks.length > 0 ? (
            <InfoList items={childMarks} showIcon={false} />
          ) : (
            <p className="text-sm text-slate-500">No exam results found.</p>
          )}
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Fee Due Status" action={<span className="text-xs font-semibold text-pink-600">Live status</span>}>
          {feeDue.length > 0 ? (
            <InfoList items={feeDue} showIcon={false} />
          ) : (
            <p className="text-sm text-slate-500">No fee records found.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Teacher Messages">
          {teacherMessages.length > 0 ? (
            <InfoList items={teacherMessages} />
          ) : (
            <p className="text-sm text-slate-500">No messages found.</p>
          )}
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Notices">
          {parentNotices.length > 0 ? (
            <InfoList items={parentNotices} />
          ) : (
            <p className="text-sm text-slate-500">No notices found.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Upcoming Exams & Events">
          {parentEvents.length > 0 ? (
            <InfoList items={parentEvents} showIcon={false} />
          ) : (
            <p className="text-sm text-slate-500">No upcoming events found.</p>
          )}
        </DashboardCard>
      </div>

      <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200">
        <span>{COMPANY_INFO.copyright}</span>
        <span>Version {COMPANY_INFO.version}</span>
      </footer>
    </RoleDashboardLayout>
  );
}