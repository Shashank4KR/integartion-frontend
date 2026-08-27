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
  librarianStats,
  librarianQuickActions,
  recentIssues,
  overdueBooks,
  fineSummary,
} from "@/lib/dashboard/role-dashboards/librarian";
import { COMPANY_INFO } from "@/lib/constants";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getLibrarySummary,
  listBookIssues,
  listOverdueBookIssues,
  getFineSummary,
} from "@/lib/services/libraryService";

export default function LibrarianDashboardPage() {
  const [stats, setStats] = useState<any[]>(librarianStats);
  const [issues, setIssues] = useState<any[]>(recentIssues);
  const [overdues, setOverdues] = useState<any[]>(overdueBooks);
  const [fines, setFines] = useState<any[]>(fineSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Anita");

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

        if (summary) {
          setStats([
            {
              id: "total",
              label: "Total Books",
              value: summary.total_books ?? 0,
              change: "Total copies in catalog",
              icon: librarianStats[0].icon,
              iconBg: "bg-purple-50",
              iconColor: "text-purple-500",
            },
            {
              id: "issued",
              label: "Books Issued",
              value: summary.issued_books ?? 0,
              change: "Active loans",
              icon: librarianStats[1].icon,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-500",
            },
            {
              id: "returned",
              label: "Available Books",
              value: summary.available_books ?? 0,
              change: "In library stock",
              icon: librarianStats[2].icon,
              iconBg: "bg-green-50",
              iconColor: "text-green-500",
            },
            {
              id: "overdue",
              label: "Overdue Books",
              value: summary.overdue_books ?? 0,
              change: fineSummaryData ? `₹${fineSummaryData.outstanding ?? 0} outstanding` : "Fines pending",
              icon: librarianStats[3].icon,
              iconBg: "bg-red-50",
              iconColor: "text-red-500",
            },
          ]);
        }

        if (Array.isArray(issuesList)) {
          setIssues(
            issuesList.slice(0, 4).map((item) => ({
              id: String(item.id),
              title: item.book_title ?? "Untitled book",
              description: `${item.student_name ?? "Unknown"} · Class ${item.student_class ?? "-"}`,
              meta: `Issued ${item.issue_date ?? "-"}`,
              iconBg: "bg-purple-50",
              iconColor: "text-purple-500",
              badge: { label: `Due ${item.due_date ?? "-"}`, variant: "warning" as const },
            })),
          );
        }

        if (Array.isArray(overduesList)) {
          setOverdues(
            overduesList.slice(0, 3).map((item) => ({
              id: String(item.id),
              title: item.book_title ?? "Untitled book",
              description: `${item.student_name ?? "Unknown"} · Class ${item.student_class ?? "-"}`,
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
              icon: fineSummary[0].icon,
              iconBg: "bg-green-50",
              iconColor: "text-green-500",
            },
            {
              id: "2",
              title: "Outstanding Fines",
              description: "Fines pending payment",
              meta: `₹${fineSummaryData.outstanding ?? 0}`,
              icon: fineSummary[1].icon,
              iconBg: "bg-red-50",
              iconColor: "text-red-500",
            },
            {
              id: "3",
              title: "Waived Fines",
              description: "Fines waived off",
              meta: `₹${fineSummaryData.waived ?? 0}`,
              icon: fineSummary[2].icon,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-500",
            },
          ]);
        }

        setError(null);
      } catch (err) {
        console.error("Error loading library dashboard stats:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load library statistics.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const totalIssued = stats.find(s => s.id === "issued")?.value ?? 0;
  const totalOverdue = stats.find(s => s.id === "overdue")?.value ?? 0;

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.librarian}>
      <WelcomeBanner
        title={`Welcome back, ${userName}! 👋`}
        subtitle={`${totalIssued} books are on loan and ${totalOverdue} are overdue across the library.`}
      />

      {error ? (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          Loading library dashboard...
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <StatGrid stats={stats} columns={4} />

          <div className="mb-8">
            <QuickActions actions={librarianQuickActions} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DashboardCard title="Recent Book Issues">
              <InfoList items={issues} />
            </DashboardCard>

            <DashboardCard
              title="Overdue Books"
              action={
                <span className="text-xs font-semibold text-red-600">
                  {totalOverdue} overdue
                </span>
              }
            >
              <InfoList items={overdues} />
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DashboardCard title="Library Fine Summary">
              <InfoList items={fines} showIcon={false} />
            </DashboardCard>

            <DashboardCard title="Quick Stats">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-purple-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Total Books</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {(stats.find(s => s.id === "total")?.value ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Active Loans</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {(stats.find(s => s.id === "issued")?.value ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Available Books</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {(stats.find(s => s.id === "returned")?.value ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-red-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Outstanding Fines</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ₹{(fines.find(f => f.id === "2")?.meta ?? "₹0").replace("₹", "")}
                  </p>
                </div>
              </div>
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
