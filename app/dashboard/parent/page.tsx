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
import { getCurrentParentStudents } from "@/lib/services/dashboardService";
import { listAnnouncements } from "@/lib/services/communicationService";
import { getStudentFeedback, type StudentFeedback } from "@/lib/services/academicContentService";
import { getToken } from "@/lib/auth";
import type { InfoRow } from "@/lib/dashboard/role-dashboards/types";
import { BookOpen, GraduationCap, Wallet, Bell, MessageSquare, Award, CheckCircle2 } from "lucide-react";

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [notices, setNotices] = useState<InfoRow[]>([]);
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const token = getToken();
        const childrenData = await getCurrentParentStudents();
        let annList: any[] = [];
        let fbList: StudentFeedback[] = [];

        if (token) {
          annList = await listAnnouncements(token).catch(() => []);
          fbList = await getStudentFeedback(token).catch(() => []);
        }

        if (!mounted) return;

        setChildren(childrenData);
        setFeedbacks(fbList);

        setNotices(
          annList.slice(0, 5).map((ann: any) => ({
            id: ann.id,
            title: ann.title,
            description: ann.content,
            meta: new Date(ann.created_at || Date.now()).toLocaleDateString(),
            icon: Bell,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",
          }))
        );
      } catch {
        if (mounted) {
          setChildren([]);
          setNotices([]);
          setFeedbacks([]);
        }
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
      icon: GraduationCap,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      id: "feedback",
      label: "Teacher Feedback",
      value: feedbacks.length,
      change: "Recorded by teachers",
      icon: MessageSquare,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      id: "notices",
      label: "School Notices",
      value: notices.length,
      change: "Broadcast updates",
      icon: Bell,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.parent}>
      <WelcomeBanner
        title={loading ? "Welcome back" : `Welcome back! 👋`}
        subtitle={loading ? "Loading your child’s academic data..." : `Here is live school progress for ${childLabel}.`}
      />

      <StatGrid stats={dynamicStats} columns={3} />

      <div className="mb-8">
        <QuickActions actions={parentQuickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Linked Child Profiles">
          {children.length > 0 ? (
            <div className="space-y-3">
              {children.map((child: any) => (
                <div key={child.id} className="p-3 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {child.first_name} {child.last_name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Adm: {child.admission_no} · Class: {child.class_name || "Assigned"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-purple-50 text-purple-700 rounded">
                    Enrolled
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4">No linked child profile found.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Teacher Observations & Feedback">
          {feedbacks.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-3 border border-slate-200 rounded-lg text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {fb.feedback_type}
                    </span>
                    <span className="text-slate-400">{fb.feedback_date}</span>
                  </div>
                  <p className="text-slate-800 mt-2">{fb.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4">No teacher feedback recorded yet.</p>
          )}
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <DashboardCard title="School Notices & Updates">
          {notices.length > 0 ? <InfoList items={notices} /> : <p className="text-sm text-slate-500 py-4">No new notices.</p>}
        </DashboardCard>
      </div>

      <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200">
        <span>{COMPANY_INFO.copyright}</span>
        <span>Version {COMPANY_INFO.version}</span>
      </footer>
    </RoleDashboardLayout>
  );
}
