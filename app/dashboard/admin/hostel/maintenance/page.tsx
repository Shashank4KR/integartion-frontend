"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import MaintenanceManagementPageHeader from "@/components/dashboard/hostel/maintenance/MaintenanceManagementPageHeader";
import MaintenanceSummaryCards from "@/components/dashboard/hostel/maintenance/MaintenanceSummaryCards";
import RaiseMaintenanceRequestDialog from "@/components/dashboard/hostel/maintenance/RaiseMaintenanceRequestDialog";
import { clearAuth, getStoredUser, getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import {
  createMaintenanceRequest,
  getMaintenanceDashboard,
  listMaintenanceRequests,
  listRooms,
} from "@/lib/services/hostelService";

export default function MaintenanceManagementPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      clearAuth();
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const [summaryData, requestRows, roomRows] = await Promise.all([
        getMaintenanceDashboard(token).catch(() => ({})),
        listMaintenanceRequests(token).catch(() => []),
        listRooms(token).catch(() => []),
      ]);
      setSummary(summaryData ?? {});
      setRequests(Array.isArray(requestRows) ? requestRows : []);
      setRooms(Array.isArray(roomRows) ? roomRows : []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load maintenance data.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRaiseRequest = async (formData: Record<string, string>) => {
    const token = getToken();
    const user = getStoredUser();
    if (!token || !user) {
      clearAuth();
      router.replace("/login");
      return;
    }

    try {
      // Resolve room UUID from room number or use first available room
      const targetRoom =
        rooms.find(
          (r) =>
            String(r.room_number || r.room_no || "").toLowerCase() ===
            String(formData.roomNumber || "").toLowerCase(),
        ) || rooms[0];

      const priorityMap: Record<string, string> = {
        Low: "LOW",
        Medium: "MEDIUM",
        High: "HIGH",
        Emergency: "URGENT",
      };

      await createMaintenanceRequest(token, {
        requested_by: user.id,
        room_id: targetRoom ? targetRoom.id : formData.roomNumber,
        issue_type: formData.issueTitle || formData.category || "General Repair",
        description: formData.description || "Hostel maintenance request",
        priority: priorityMap[formData.priority] || "MEDIUM",
      });

      await loadData();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to submit maintenance request.");
    }
  };

  const cards = useMemo(
    () => [
      {
        title: "Total Requests",
        value: requests.length,
        footer: "From database",
        icon: "Wrench",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        tint: "bg-blue-50/60",
      },
      {
        title: "Open Requests",
        value: summary?.open_requests ?? requests.filter((r) => r.status === "OPEN" || r.status === "Open").length,
        footer: "Current open requests",
        icon: "ClipboardCheck",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        tint: "bg-emerald-50/60",
      },
      {
        title: "In Progress",
        value:
          summary?.in_progress_requests ??
          requests.filter((r) => r.status === "IN_PROGRESS" || r.status === "In Progress").length,
        footer: "Work in progress",
        icon: "Clock",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
        tint: "bg-orange-50/60",
      },
      {
        title: "Completed",
        value:
          summary?.resolved_requests ??
          requests.filter((r) => r.status === "RESOLVED" || r.status === "Completed").length,
        footer: "Resolved requests",
        icon: "CheckCircle2",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        tint: "bg-purple-50/60",
      },
      {
        title: "Work Orders",
        value: summary?.completed_work_orders ?? 0,
        footer: "Completed work orders",
        icon: "XCircle",
        iconBg: "bg-pink-50",
        iconColor: "text-pink-500",
        tint: "bg-pink-50/60",
      },
    ],
    [requests, summary],
  );

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <MaintenanceManagementPageHeader
            onRaiseRequest={() => setIsRaiseOpen(true)}
            onWorkOrders={() => {}}
            onMoreOptions={() => {}}
          />
          {loadError ? (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}
          {isLoading ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
              Loading maintenance data...
            </div>
          ) : null}
          {!isLoading && !loadError ? <MaintenanceSummaryCards cards={cards} /> : null}

          {!isLoading && !loadError ? (
            <section className="rounded-lg border border-slate-200 bg-white mb-6">
              <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Maintenance Requests</h2>
                <button
                  type="button"
                  onClick={() => setIsRaiseOpen(true)}
                  className="text-xs font-semibold text-[#7c3aed] hover:underline"
                >
                  + Raise Request
                </button>
              </div>
              {requests.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500">No maintenance requests found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left">Request ID</th>
                        <th className="px-4 py-3 text-left">Room ID</th>
                        <th className="px-4 py-3 text-left">Issue</th>
                        <th className="px-4 py-3 text-left">Priority</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((row) => (
                        <tr key={row.id} className="border-b border-slate-50">
                          <td className="px-4 py-3 font-mono text-xs">{row.id ? String(row.id).slice(0, 8) : "-"}</td>
                          <td className="px-4 py-3 font-mono text-xs">{row.room_id ? String(row.room_id).slice(0, 8) : "-"}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{row.issue_type ?? "-"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                String(row.priority).toUpperCase() === "HIGH" || String(row.priority).toUpperCase() === "URGENT"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {row.priority ?? "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                              {row.status ?? "OPEN"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}

          <RaiseMaintenanceRequestDialog
            open={isRaiseOpen}
            onClose={() => setIsRaiseOpen(false)}
            onSave={handleRaiseRequest}
          />

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>{COMPANY_INFO.copyright}</span>
            <span>Version {COMPANY_INFO.version}</span>
          </footer>
        </div>
      </div>
    </MainLayout>
  );
}
