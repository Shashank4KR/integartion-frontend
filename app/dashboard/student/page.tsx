"use client";

import { useEffect, useState } from "react";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import WelcomeBanner from "@/components/dashboard/role-dashboards/WelcomeBanner";
import StatGrid from "@/components/dashboard/role-dashboards/StatGrid";
import QuickActions from "@/components/dashboard/role-dashboards/QuickActions";
import DashboardCard from "@/components/dashboard/role-dashboards/DashboardCard";
import InfoList from "@/components/dashboard/role-dashboards/InfoList";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { studentQuickActions } from "@/lib/dashboard/role-dashboards/student";
import { COMPANY_INFO } from "@/lib/constants";
import { getToken } from "@/lib/auth";
import {
  getCurrentStudent,
  getCurrentStudentTimetable,
  getCurrentStudentAssignments,
  getCurrentStudentExamResults,
  getCurrentStudentAttendance,
  getCurrentStudentFees,
  getCurrentStudentSubjects,
} from "@/lib/services/studentService";
import { listAnnouncements } from "@/lib/services/communicationService";
import { BookOpen, GraduationCap, Wallet, Calendar, AlertCircle } from "lucide-react";

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [fees, setFees] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAllData() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [
          profData,
          ttData,
          assignData,
          examData,
          attData,
          feeData,
          subjData,
          annData,
        ] = await Promise.all([
          getCurrentStudent(token).catch(() => null),
          getCurrentStudentTimetable(token).catch(() => []),
          getCurrentStudentAssignments(token).catch(() => []),
          getCurrentStudentExamResults(token).catch(() => []),
          getCurrentStudentAttendance(token).catch(() => null),
          getCurrentStudentFees(token).catch(() => null),
          getCurrentStudentSubjects(token).catch(() => []),
          listAnnouncements(token).catch(() => []),
        ]);

        if (!mounted) return;

        setProfile(profData);
        setTimetable(ttData || []);
        setAssignments(assignData || []);
        setExamResults(examData || []);
        setAttendance(attData);
        setFees(feeData);
        setSubjects(subjData || []);
        setNotices(annData || []);
      } catch (err) {
        console.error("Error loading student dashboard data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadAllData();
    return () => {
      mounted = false;
    };
  }, []);

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.admission_no
    : "Student";

  const dynamicStats = [
    {
      id: "attendance",
      label: "Attendance",
      value: attendance ? `${attendance.attendance_percentage}%` : "0%",
      change: attendance ? `${attendance.present}/${attendance.total_classes} present` : "No data",
      icon: BookOpen,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      id: "fees",
      label: "Fees Due",
      value: fees ? `₹${(fees.pending_amount || 0).toLocaleString("en-IN")}` : "₹0",
      change: fees?.outstanding_invoices ? `${fees.outstanding_invoices} invoice(s)` : "Up to date",
      icon: Wallet,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      id: "subjects",
      label: "My Subjects",
      value: subjects.length,
      change: "Enrolled subjects",
      icon: GraduationCap,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      id: "assignments",
      label: "Open Assignments",
      value: assignments.filter((a) => !a.submission).length,
      change: "Pending submission",
      icon: Calendar,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
  ];

  const timetableItems = timetable.slice(0, 5).map((t: any) => ({
    id: t.id,
    title: t.subject_name || t.subject_id || "Subject",
    description: `${t.day_of_week} • ${t.start_time} - ${t.end_time}`,
    meta: t.room_no ? `Room ${t.room_no}` : t.teacher_name || "",
  }));

  const assignmentItems = assignments
    .filter((a) => !a.submission)
    .slice(0, 5)
    .map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.subject_name || "Assignment",
      meta: a.due_date ? `Due: ${new Date(a.due_date).toLocaleDateString()}` : "Pending",
    }));

  const marksItems = examResults.slice(0, 5).map((r: any) => ({
    id: r.id || Math.random().toString(),
    title: r.exam_name || "Exam Result",
    description: `${r.subject_name || "Subject"}: ${r.marks_obtained}/${r.total_marks}`,
    meta: r.grade ? `Grade: ${r.grade}` : "",
  }));

  const noticeItems = notices.slice(0, 5).map((n: any) => ({
    id: n.id,
    title: n.title,
    description: n.content || n.message || "",
    meta: n.created_at ? new Date(n.created_at).toLocaleDateString() : "",
  }));

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <WelcomeBanner
        title={loading ? "Welcome back" : `Welcome back, ${displayName}! 👋`}
        subtitle={
          profile
            ? `Class: ${profile.class_name || "N/A"} • Roll No: ${profile.roll_no || "N/A"} • Admission: ${profile.admission_no}`
            : "Here's your academic dashboard."
        }
      />

      <StatGrid stats={dynamicStats} columns={4} />

      <div className="mb-8">
        <QuickActions actions={studentQuickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="Today's Timetable">
          {timetableItems.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No timetable entries found for your class.</p>
          ) : (
            <InfoList items={timetableItems} showIcon={false} />
          )}
        </DashboardCard>

        <DashboardCard
          title="Pending Assignments"
          action={
            <span className="text-xs font-semibold text-amber-600">
              {assignmentItems.length} open
            </span>
          }
        >
          {assignmentItems.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No pending assignments.</p>
          ) : (
            <InfoList items={assignmentItems} showIcon={false} />
          )}
        </DashboardCard>

        <DashboardCard title="My Enrolled Subjects">
          {subjects.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No subjects assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {subjects.map((sub: any) => (
                <div
                  key={sub.id}
                  className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-sm"
                >
                  <span className="font-semibold text-slate-800">{sub.subject_name}</span>
                  <span className="text-xs text-slate-500 font-mono">{sub.subject_code}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="Recent Marks & Results">
          {marksItems.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No exam results published yet.</p>
          ) : (
            <InfoList items={marksItems} showIcon={false} />
          )}
        </DashboardCard>

        <DashboardCard title="Attendance Summary">
          {attendance ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Classes</span>
                <span className="font-semibold text-slate-900">{attendance.total_classes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Present</span>
                <span className="font-semibold text-emerald-600">{attendance.present}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Absent</span>
                <span className="font-semibold text-rose-600">{attendance.absent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Percentage</span>
                <span className="font-bold text-purple-600">{attendance.attendance_percentage}%</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-2">No attendance data recorded yet.</p>
          )}
        </DashboardCard>

        <DashboardCard title="School Notices & Announcements">
          {noticeItems.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No announcements currently published.</p>
          ) : (
            <InfoList items={noticeItems} />
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

