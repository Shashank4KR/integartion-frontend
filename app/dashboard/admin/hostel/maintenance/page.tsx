"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import MaintenanceManagementPageHeader from "@/components/dashboard/hostel/maintenance/MaintenanceManagementPageHeader";
import MaintenanceSummaryCards from "@/components/dashboard/hostel/maintenance/MaintenanceSummaryCards";
import { getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import { getMaintenanceDashboard, listMaintenanceRequests } from "@/lib/services/hostelService";

export default function MaintenanceManagementPage() {
  const [summary, setSummary] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoadError("Please log in to view maintenance data.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    Promise.all([getMaintenanceDashboard(token), listMaintenanceRequests(token)])
      .then(([summaryData, requestRows]) => {
        setSummary(summaryData ?? {});
        setRequests(Array.isArray(requestRows) ? requestRows : []);
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Failed to load maintenance data.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const cards = useMemo(
    () => [
      { title: "Total Requests", value: requests.length, footer: "From database", icon: "Wrench", iconBg: "bg-blue-50", iconColor: "text-blue-600", tint: "bg-blue-50/60" },
      { title: "Open Requests", value: summary?.open_requests ?? 0, footer: "Current open requests", icon: "ClipboardCheck", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", tint: "bg-emerald-50/60" },
      { title: "In Progress", value: summary?.in_progress_requests ?? 0, footer: "Work in progress", icon: "Clock", iconBg: "bg-orange-50", iconColor: "text-orange-500", tint: "bg-orange-50/60" },
      { title: "Completed", value: summary?.resolved_requests ?? 0, footer: "Resolved requests", icon: "CheckCircle2", iconBg: "bg-purple-50", iconColor: "text-purple-600", tint: "bg-purple-50/60" },
      { title: "Work Orders", value: summary?.completed_work_orders ?? 0, footer: "Completed work orders", icon: "XCircle", iconBg: "bg-pink-50", iconColor: "text-pink-500", tint: "bg-pink-50/60" },
    ],
    [requests.length, summary],
  );

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <MaintenanceManagementPageHeader onRaiseRequest={() => {}} onWorkOrders={() => {}} onMoreOptions={() => {}} />
          {loadError ? <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div> : null}
          {isLoading ? <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">Loading maintenance data...</div> : null}
          {!isLoading && !loadError ? <MaintenanceSummaryCards cards={cards} /> : null}

          {!isLoading && !loadError ? (
            <section className="rounded-lg border border-slate-200 bg-white mb-6">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-900">Maintenance Requests</h2>
              </div>
              {requests.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500">No maintenance requests found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-100"><th className="px-4 py-3 text-left">Request ID</th><th className="px-4 py-3 text-left">Room ID</th><th className="px-4 py-3 text-left">Issue</th><th className="px-4 py-3 text-left">Priority</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
                    <tbody>{requests.map((row) => <tr key={row.id} className="border-b border-slate-50"><td className="px-4 py-3">{row.id ?? "-"}</td><td className="px-4 py-3">{row.room_id ?? "-"}</td><td className="px-4 py-3">{row.issue_type ?? "-"}</td><td className="px-4 py-3">{row.priority ?? "-"}</td><td className="px-4 py-3">{row.status ?? "-"}</td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>{COMPANY_INFO.copyright}</span>
            <span>Version {COMPANY_INFO.version}</span>
          </footer>
        </div>
      </div>
    </MainLayout>
  );
}
