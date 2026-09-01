"use client";

import { useEffect, useState } from "react";
import { Wallet, AlertCircle, Receipt, FileBarChart, Users2, TrendingUp } from "lucide-react";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import WelcomeBanner from "@/components/dashboard/role-dashboards/WelcomeBanner";
import StatGrid from "@/components/dashboard/role-dashboards/StatGrid";
import QuickActions from "@/components/dashboard/role-dashboards/QuickActions";
import DashboardCard from "@/components/dashboard/role-dashboards/DashboardCard";
import InfoList from "@/components/dashboard/role-dashboards/InfoList";
import BarChart from "@/components/shared/charts/BarChart";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import type { RoleStat, RoleQuickAction, InfoRow } from "@/lib/dashboard/role-dashboards/types";
import { COMPANY_INFO } from "@/lib/constants";
import { getToken } from "@/lib/auth";
import {
  getFinanceOverview,
  getFinanceReport,
  listInvoices,
  listPayments,
} from "@/lib/services/financeService";

const text = (value: unknown, fallback = "-") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

const num = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value: number) =>
  `INR ${Number.isFinite(value) ? value.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0"}`;

function studentName(item: Record<string, unknown>): string {
  const s = item.student as Record<string, unknown> | undefined;
  if (s && typeof s === "object") {
    const name = [s.first_name, s.last_name].filter(Boolean).join(" ").trim();
    if (name) return name;
  }
  return text(item.student_name ?? item.student_id, "Student");
}

const accountantQuickActions: RoleQuickAction[] = [
  { id: "invoice", label: "Generate Invoice", icon: Receipt, href: "/dashboard/accountant/invoices" },
  { id: "payment", label: "Record Payment", icon: Wallet, href: "/dashboard/accountant/payments" },
  { id: "dues", label: "View Dues", icon: AlertCircle, href: "/dashboard/accountant/dues" },
  { id: "export", label: "Export Report", icon: FileBarChart, href: "/dashboard/accountant/reports" },
];

export default function AccountantDashboardPage() {
  const [stats, setStats] = useState<RoleStat[]>([]);
  const [recentPayments, setRecentPayments] = useState<InfoRow[]>([]);
  const [invoiceRows, setInvoiceRows] = useState<InfoRow[]>([]);
  const [defaulterRows, setDefaulterRows] = useState<InfoRow[]>([]);
  const [collectionChart, setCollectionChart] = useState<Array<{ label: string; value: number }>>([]);
  const [collectionSummary, setCollectionSummary] = useState<InfoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) {
        setError("Please log in to view the dashboard.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [overview, invoices, payments, outstanding, yearly] = await Promise.all([
          getFinanceOverview(token).catch(() => ({})),
          listInvoices(token).catch(() => []),
          listPayments(token).catch(() => []),
          getFinanceReport(token, "outstanding-fees").catch(() => ({})),
          getFinanceReport(token, "yearly-collection").catch(() => ({})),
        ]);

        const overviewRecord = overview as Record<string, unknown>;
        const summary = overviewRecord?.summary as Record<string, unknown> | undefined;
        const invoiceList = Array.isArray(invoices) ? invoices : [];
        const paymentList = Array.isArray(payments) ? payments : [];
        const outstandingStudents = Array.isArray((outstanding as Record<string, unknown>)?.students)
          ? ((outstanding as Record<string, unknown>).students as Array<Record<string, unknown>>)
          : [];

        const totalOutstanding = num((outstanding as Record<string, unknown>)?.total_outstanding);
        const feeCollected = num(summary?.fee_collected);

        setStats([
          {
            id: "collected",
            label: "Fees Collected",
            value: money(feeCollected),
            change: "From finance overview",
            icon: Wallet,
            iconBg: "bg-green-50",
            iconColor: "text-green-500",
          },
          {
            id: "dues",
            label: "Pending Dues",
            value: money(totalOutstanding),
            change: `${outstandingStudents.length} students`,
            icon: AlertCircle,
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
          },
          {
            id: "invoices",
            label: "Invoices",
            value: invoiceList.length,
            change: "Loaded from backend",
            icon: Receipt,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",
          },
          {
            id: "defaulters",
            label: "Defaulters",
            value: outstandingStudents.length,
            change: "Needs follow-up",
            icon: Users2,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
          },
        ]);

        setRecentPayments(
          paymentList.slice(0, 5).map((item, idx) => {
            const p = item as Record<string, unknown>;
            const amount = num(p.amount_paid ?? p.amount);
            return {
              id: text(p.id, String(idx)),
              title: studentName(p),
              description: `${text(p.payment_method ?? p.payment_mode, "Payment")} - ${money(amount)}`,
              meta: text(p.payment_date ?? p.created_at),
              iconBg: "bg-green-50",
              iconColor: "text-green-500",
              badge: { label: "Paid", variant: "success" as const },
            };
          }),
        );

        setInvoiceRows(
          invoiceList.slice(0, 5).map((item, idx) => {
            const inv = item as Record<string, unknown>;
            const amount = num(inv.net_amount ?? inv.amount);
            const paidAmt = num(inv.paid_amount ?? inv.amount_paid);
            const isPaid = paidAmt >= amount && amount > 0;
            return {
              id: text(inv.id, String(idx)),
              title: text(inv.invoice_number, "Invoice"),
              description: `${text(inv.fee_type ?? inv.fee_type_id, "Fee")} - ${studentName(inv)}`,
              meta: money(amount),
              badge: { label: isPaid ? "Paid" : "Unpaid", variant: isPaid ? ("success" as const) : ("warning" as const) },
            };
          }),
        );

        setDefaulterRows(
          outstandingStudents.slice(0, 5).map((item, idx) => {
            const invoicesArr = Array.isArray(item.invoices) ? item.invoices : [];
            const first = invoicesArr[0] as Record<string, unknown> | undefined;
            const balance = num(item.total_outstanding ?? item.outstanding ?? item.balance);
            let overdueDays = "-";
            if (first?.due_date) {
              const due = new Date(text(first.due_date));
              if (!Number.isNaN(due.getTime())) {
                const days = Math.floor((Date.now() - due.getTime()) / 86400000);
                if (days > 0) overdueDays = `${days} days overdue`;
              }
            }
            return {
              id: text(item.student_id ?? item.id, String(idx)),
              title: text(item.name ?? item.student_name, "Student"),
              description: `${invoicesArr.length} open invoice${invoicesArr.length === 1 ? "" : "s"} - ${money(balance)}`,
              meta: overdueDays,
              badge: { label: "Overdue", variant: "error" as const },
            };
          }),
        );

        const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const yearlyRecord = yearly as Record<string, unknown>;
        const monthlyBreakdown = Array.isArray(yearlyRecord?.monthly_breakdown)
          ? (yearlyRecord.monthly_breakdown as Array<Record<string, unknown>>)
          : [];

        let chartPoints: Array<{ label: string; value: number }> = [];

        if (monthlyBreakdown.length > 0 && monthlyBreakdown.some((m) => num(m.total ?? m.amount ?? m.collection) > 0)) {
          chartPoints = monthlyBreakdown
            .filter((m) => num(m.total ?? m.amount ?? m.collection) > 0 || ["Jul", "Aug", "Sep", "Oct"].includes(text(m.month ?? m.label, "")))
            .map((m) => ({
              label: text(m.month ?? m.label, ""),
              value: num(m.total ?? m.amount ?? m.collection),
            }));
        } else if (paymentList.length > 0) {
          const monthMap: Record<string, number> = {};
          paymentList.forEach((p: any) => {
            const dateStr = p.payment_date || p.created_at;
            const d = dateStr ? new Date(dateStr) : new Date();
            const mName = !isNaN(d.getTime()) ? MONTH_NAMES[d.getMonth()] : "Aug";
            const amt = num(p.amount_paid ?? p.amount);
            monthMap[mName] = (monthMap[mName] || 0) + amt;
          });
          chartPoints = Object.entries(monthMap).map(([mName, val]) => ({
            label: mName,
            value: val,
          }));
        } else if (feeCollected > 0) {
          const currentMonthName = MONTH_NAMES[new Date().getMonth()];
          chartPoints = [{ label: currentMonthName, value: feeCollected }];
        }

        setCollectionChart(chartPoints);

        const totalCollected = num(yearlyRecord?.total_collection ?? yearlyRecord?.total_collected ?? feeCollected);
        const target = num(yearlyRecord?.target);
        setCollectionSummary([
          {
            id: "1",
            title: "Total Collected",
            description: "This academic year",
            meta: money(totalCollected),
            icon: TrendingUp,
            iconBg: "bg-green-50",
            iconColor: "text-green-500",
          },
          ...(target > 0
            ? [
                {
                  id: "2",
                  title: "Target",
                  description: "Annual fee target",
                  meta: money(target),
                  icon: FileBarChart,
                  iconBg: "bg-purple-50",
                  iconColor: "text-purple-500",
                },
                {
                  id: "3",
                  title: "Achievement",
                  description: "vs annual target",
                  meta: `${Math.round((totalCollected / target) * 100)}%`,
                  icon: Wallet,
                  iconBg: "bg-blue-50",
                  iconColor: "text-blue-500",
                },
              ]
            : []),
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.accountant}>
      <WelcomeBanner title="Welcome back!" subtitle="Live data from the finance backend." />

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          Loading dashboard...
        </div>
      ) : (
        <>
          <StatGrid stats={stats} columns={4} />

          <div className="mb-8">
            <QuickActions actions={accountantQuickActions} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard title="Fees Collected (Yearly)" className="lg:col-span-2">
              <div className="h-48">
                {collectionChart.length > 0 ? (
                  <BarChart data={collectionChart} color="#7c3aed" height={192} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No monthly breakdown available.
                  </div>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Collection Summary">
              {collectionSummary.length > 0 ? (
                <InfoList items={collectionSummary} showIcon={false} />
              ) : (
                <p className="text-sm text-slate-500">No summary data available.</p>
              )}
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard title="Recent Payments">
              {recentPayments.length > 0 ? (
                <InfoList items={recentPayments} showIcon={false} />
              ) : (
                <p className="text-sm text-slate-500">No recent payments found.</p>
              )}
            </DashboardCard>

            <DashboardCard title="Invoices">
              {invoiceRows.length > 0 ? (
                <InfoList items={invoiceRows} showIcon={false} />
              ) : (
                <p className="text-sm text-slate-500">No invoices found.</p>
              )}
            </DashboardCard>

            <DashboardCard
              title="Defaulters"
              action={
                <span className="text-xs font-semibold text-red-600">{defaulterRows.length} total</span>
              }
            >
              {defaulterRows.length > 0 ? (
                <InfoList items={defaulterRows} showIcon={false} />
              ) : (
                <p className="text-sm text-slate-500">No defaulters found.</p>
              )}
            </DashboardCard>
          </div>
        </>
      )}

      <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200">
        <span>{COMPANY_INFO.copyright}</span>
        <span>Version {COMPANY_INFO.version}</span>
      </footer>
    </RoleDashboardLayout>
  );
}