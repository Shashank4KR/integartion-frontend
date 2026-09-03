"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import WelcomeBanner from "@/components/dashboard/role-dashboards/WelcomeBanner";
import StatGrid from "@/components/dashboard/role-dashboards/StatGrid";
import QuickActions from "@/components/dashboard/role-dashboards/QuickActions";
import DashboardCard from "@/components/dashboard/role-dashboards/DashboardCard";
import InfoList from "@/components/dashboard/role-dashboards/InfoList";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { librarianQuickActions } from "@/lib/dashboard/role-dashboards/librarian";
import { COMPANY_INFO } from "@/lib/constants";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getLibrarySummary,
  listBookIssues,
  listOverdueBookIssues,
  getFineSummary,
} from "@/lib/services/libraryService";
import { BookOpen, BookMarked, BookCheck, AlertTriangle, IndianRupee } from "lucide-react";

export default function LibrarianDashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [overdues, setOverdues] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Librarian");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const token = getToken();
        const user = getStoredUser();
        if (!token || !user) {
          if (mounted) {
            setError("Please log in to view library dashboard.");
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUserName(user.username ?? "Librarian");
        }

        const [summary, issuesList, overduesList, fineSummaryData] = await Promise.all([
          getLibrarySummary(token).catch(() => null),
          listBookIssues(token).catch(() => []),
          listOverdueBookIssues(token).catch(() => []),
          getFineSummary(token).catch(() => null),
        ]);

        if (!mounted) return;

        setStats([
          {
            id: "total",
            label: "Total Books",
            value: summary?.total_books ?? 0,
            change: "Total copies in catalog",
            icon: BookOpen,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",
          },
          {
            id: "issued",
            label: "Books Issued",
            value: summary?.issued_books ?? (Array.isArray(issuesList) ? issuesList.length : 0),
            change: "Active loans",
            icon: BookMarked,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
          },
          {
            id: "returned",
            label: "Available Books",
            value: summary?.available_books ?? 0,
            change: "In library stock",
            icon: BookCheck,
            iconBg: "bg-green-50",
            iconColor: "text-green-500",
          },
          {
            id: "overdue",
            label: "Overdue Books",
            value: summary?.overdue_books ?? (Array.isArray(overduesList) ? overduesList.length : 0),
            change: fineSummaryData ? `₹${fineSummaryData.outstanding ?? 0} outstanding` : "Fines pending",
            icon: AlertTriangle,
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
          },
        ]);

        if (Array.isArray(issuesList)) {
          setIssues(
            issuesList.slice(0, 4).map((item) => ({
              id: String(item.id),
              title: item.book_title ?? "Untitled book",
              description: `${item.student_name ?? "Student"} · Class ${item.student_class ?? "-"}`,
              meta: `Issued ${item.issue_date ?? "-"}`,
              iconBg: "bg-purple-50",
              iconColor: "text-purple-500",
              badge: { label: `Due ${item.due_date ?? "-"}`, variant: "warning" as const },
            })),
          );
        }

        if (Array.isArray(overduesList)) {
          setOverdues(
            overduesList.slice(0, 4).map((item) => ({
              id: String(item.id),
              title: item.book_title ?? "Untitled book",
              description: `${item.student_name ?? "Student"} · Class ${item.student_class ?? "-"}`,
              meta: `${item.overdue_days ?? 0} days late`,
              iconBg: "bg-red-50",
              iconColor: "text-red-500",
              badge: { label: `₹${item.fine_amount ?? 0}`, variant: "error" as const },
            })),
          );
        }

        if (fineSummaryData) {
          setFines([
            {
              id: "1",
              title: "Collected Fines",
              description: "Late return charges collected",
              meta: `₹${fineSummaryData.collected ?? 0}`,
              icon: IndianRupee,
              iconBg: "bg-green-50",
              iconColor: "text-green-500",
            },
            {
              id: "2",
              title: "Outstanding Fines",
              description: "Fines pending payment",
              meta: `₹${fineSummaryData.outstanding ?? 0}`,
              icon: IndianRupee,
              iconBg: "bg-red-50",
              iconColor: "text-red-500",
            },
            {
              id: "3",
              title: "Waived Fines",
              description: "Fines waived off",
              meta: `₹${fineSummaryData.waived ?? 0}`,
              icon: IndianRupee,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-500",
            },
          ]);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load library dashboard data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.librarian}>
      <WelcomeBanner
        title={loading ? "Welcome back" : `Welcome back, ${userName}! 📚`}
        subtitle="Here is the live circulation and catalog summary for the library."
      />

      {error ? (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white p-5 animate-pulse" />
          ))}
        </div>
      ) : (
        <StatGrid stats={stats} columns={4} />
      )}

      <div className="mb-8">
        <QuickActions actions={librarianQuickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard
          title="Recent Book Issues"
          action={
            <Link
              href="/dashboard/librarian/issue"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              Issue Book →
            </Link>
          }
        >
          {loading ? (
            <p className="text-sm text-slate-400 py-4">Loading issues...</p>
          ) : issues.length > 0 ? (
            <InfoList items={issues} />
          ) : (
            <p className="text-sm text-slate-500 py-4">No active book issues recorded.</p>
          )}
        </DashboardCard>

        <DashboardCard
          title="Overdue Returns"
          action={
            <Link
              href="/dashboard/librarian/overdue"
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              View All →
            </Link>
          }
        >
          {loading ? (
            <p className="text-sm text-slate-400 py-4">Loading overdue books...</p>
          ) : overdues.length > 0 ? (
            <InfoList items={overdues} />
          ) : (
            <p className="text-sm text-slate-500 py-4">No overdue books at this time.</p>
          )}
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <DashboardCard
            title="Fine Collection Summary"
            action={
              <Link
                href="/dashboard/librarian/fines"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Fine Payments →
              </Link>
            }
          >
            {loading ? (
              <p className="text-sm text-slate-400 py-4">Loading fines...</p>
            ) : fines.length > 0 ? (
              <InfoList items={fines} />
            ) : (
              <p className="text-sm text-slate-500 py-4">No fine records available.</p>
            )}
          </DashboardCard>
        </div>

        <div>
          <DashboardCard title="Quick Circulation Status">
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700 font-semibold">Catalog Health</p>
                <p className="text-sm font-medium text-slate-900 mt-1">Live synchronized</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-700 font-semibold">Barcode & Search</p>
                <p className="text-sm font-medium text-slate-900 mt-1">Active indexing</p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200">
        <span>{COMPANY_INFO.copyright}</span>
        <span>Version {COMPANY_INFO.version}</span>
      </footer>
    </RoleDashboardLayout>
  );
}
