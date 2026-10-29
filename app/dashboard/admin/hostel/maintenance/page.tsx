"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import MaintenanceManagementPageHeader from "@/components/dashboard/hostel/maintenance/MaintenanceManagementPageHeader";
import MaintenanceSummaryCards from "@/components/dashboard/hostel/maintenance/MaintenanceSummaryCards";
import MaintenanceRequestsTable from "@/components/dashboard/hostel/maintenance/MaintenanceRequestsTable";
import MaintenanceQuickActions from "@/components/dashboard/hostel/maintenance/MaintenanceQuickActions";
import RecentWorkOrdersTable from "@/components/dashboard/hostel/maintenance/RecentWorkOrdersTable";
import RaiseMaintenanceRequestDialog from "@/components/dashboard/hostel/maintenance/RaiseMaintenanceRequestDialog";
import WorkOrdersDialog from "@/components/dashboard/hostel/maintenance/WorkOrdersDialog";
import MaintenanceRequestDetailsDialog from "@/components/dashboard/hostel/maintenance/MaintenanceRequestDetailsDialog";
import WorkOrderDetailsDialog from "@/components/dashboard/hostel/maintenance/WorkOrderDetailsDialog";
import RequestHistoryDialog from "@/components/dashboard/hostel/maintenance/RequestHistoryDialog";
import MaintenanceStaffDialog from "@/components/dashboard/hostel/maintenance/MaintenanceStaffDialog";
import MaintenanceInventoryDialog from "@/components/dashboard/hostel/maintenance/MaintenanceInventoryDialog";
import MaintenanceReportDialog from "@/components/dashboard/hostel/maintenance/MaintenanceReportDialog";
import { clearAuth, getStoredUser, getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import {
  createMaintenanceRequest,
  getMaintenanceDashboard,
  listMaintenanceRequests,
  listRooms,
  listWorkOrders,
} from "@/lib/services/hostelService";
import {
  QUICK_ACTIONS,
  type MaintenanceRequest,
  type WorkOrder,
  type QuickActionItem,
} from "@/lib/fixtures/maintenance-management-reference-fixture";

export default function MaintenanceManagementPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [rawWorkOrders, setRawWorkOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog states
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);
  const [isWorkOrdersOpen, setIsWorkOrdersOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Table pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      const [summaryData, requestRows, roomRows, workOrderRows] = await Promise.all([
        getMaintenanceDashboard(token).catch(() => ({})),
        listMaintenanceRequests(token).catch(() => []),
        listRooms(token).catch(() => []),
        listWorkOrders(token).catch(() => []),
      ]);
      setSummary(summaryData ?? {});
      setRequests(Array.isArray(requestRows) ? requestRows : []);
      setRooms(Array.isArray(roomRows) ? roomRows : []);
      setRawWorkOrders(Array.isArray(workOrderRows) ? workOrderRows : []);
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

    setActionError(null);
    setSuccessMessage(null);

    try {
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

      setSuccessMessage("Maintenance request created successfully.");
      await loadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to submit maintenance request.");
    }
  };

  const handleQuickAction = (action: QuickActionItem) => {
    switch (action.label) {
      case "Raise Request":
        setIsRaiseOpen(true);
        break;
      case "View Work Orders":
        setIsWorkOrdersOpen(true);
        break;
      case "Request History":
        setIsHistoryOpen(true);
        break;
      case "Maintenance Staff":
        setIsStaffOpen(true);
        break;
      case "Inventory":
        setIsInventoryOpen(true);
        break;
      case "Reports":
        setIsReportOpen(true);
        break;
      default:
        break;
    }
  };

  const mappedRequests: MaintenanceRequest[] = useMemo(() => {
    return requests.map((r, idx) => {
      const roomMatch = rooms.find((rm) => rm.id === r.room_id);
      const roomDisplay = roomMatch
        ? `Room ${roomMatch.room_no || roomMatch.room_number}`
        : r.room_id
        ? `Room #${String(r.room_id).slice(0, 8)}`
        : "Main Hostel";

      const rawPriority = String(r.priority || "MEDIUM").toUpperCase();
      const priority =
        rawPriority === "URGENT" || rawPriority === "EMERGENCY"
          ? "Emergency"
          : rawPriority === "HIGH"
          ? "High"
          : rawPriority === "LOW"
          ? "Low"
          : "Medium";

      const rawStatus = String(r.status || "OPEN").toUpperCase();
      const status =
        rawStatus === "RESOLVED" || rawStatus === "COMPLETED"
          ? "Completed"
          : rawStatus === "IN_PROGRESS"
          ? "In Progress"
          : rawStatus === "OVERDUE"
          ? "Overdue"
          : "Open";

      const dateStr = r.requested_on
        ? new Date(r.requested_on).toLocaleDateString("en-GB")
        : new Date().toLocaleDateString("en-GB");

      return {
        id: r.id ? `MR-${String(r.id).slice(0, 8).toUpperCase()}` : `MR-${idx + 101}`,
        requestedBy: r.requester_name || r.student_name || "Hostel Resident",
        blockRoom: roomDisplay,
        issueType: r.issue_type || "General Maintenance",
        priority: priority as any,
        status: status as any,
        requestedOn: dateStr,
        category: r.category || "Repair",
        description: r.description || "Hostel maintenance request",
        requestedDate: dateStr,
        requestedTime: "10:00 AM",
        attachment: r.attachment,
        assignedStaff: r.assigned_to || "Facility Team",
        relatedWorkOrder: r.work_order_id || `WO-2026-${idx + 101}`,
      };
    });
  }, [requests, rooms]);

  const mappedWorkOrders: WorkOrder[] = useMemo(() => {
    return rawWorkOrders.map((wo, idx) => {
      const relatedReq = requests.find((r) => r.id === wo.request_id);
      const schedDate = wo.scheduled_date
        ? new Date(wo.scheduled_date).toLocaleDateString("en-GB")
        : new Date().toLocaleDateString("en-GB");
      const rawStatus = String(wo.status || "OPEN").toUpperCase();
      const status =
        rawStatus === "COMPLETED"
          ? "Completed"
          : rawStatus === "IN_PROGRESS"
          ? "In Progress"
          : rawStatus === "OVERDUE"
          ? "Overdue"
          : "Open";
      return {
        id: wo.id ? `WO-${String(wo.id).slice(0, 8).toUpperCase()}` : `WO-2026-${idx + 101}`,
        relatedRequest: relatedReq?.id
          ? `MR-${String(relatedReq.id).slice(0, 8).toUpperCase()}`
          : wo.request_id
          ? `MR-${String(wo.request_id).slice(0, 8).toUpperCase()}`
          : `MR-${idx + 101}`,
        issueType: relatedReq?.issue_type || "General Maintenance",
        assignedTo:
          "Facility Team",
        status: status as any,
        scheduledDate: schedDate,
        notes: wo.notes || `Scheduled maintenance on ${schedDate}`,
      };
    });
  }, [rawWorkOrders, requests]);

  const totalItems = mappedRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRequests = mappedRequests.slice(startIndex, startIndex + rowsPerPage);
  const showingStart = totalItems === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + rowsPerPage, totalItems);

  const cards = useMemo(
    () => [
      {
        title: "Total Requests",
        value: requests.length,
        footer: "All time records",
        icon: "Wrench",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        tint: "bg-blue-50/60",
      },
      {
        title: "Open Requests",
        value: summary?.open_requests ?? requests.filter((r) => r.status === "OPEN" || r.status === "Open").length,
        footer: "Pending action",
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
        footer: "Active work",
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
        footer: "Resolved issues",
        icon: "CheckCircle2",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        tint: "bg-purple-50/60",
      },
      {
        title: "Work Orders",
        value: summary?.completed_work_orders ?? rawWorkOrders.filter((w) => String(w.status).toUpperCase() === "COMPLETED").length,
        footer: `${rawWorkOrders.length} tracked work orders`,
        icon: "XCircle",
        iconBg: "bg-pink-50",
        iconColor: "text-pink-500",
        tint: "bg-pink-50/60",
      },
    ],
    [requests, summary, rawWorkOrders],
  );

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <MaintenanceManagementPageHeader
            onRaiseRequest={() => setIsRaiseOpen(true)}
            onWorkOrders={() => setIsWorkOrdersOpen(true)}
            onMoreOptions={() => setIsReportOpen(true)}
          />

          {actionError && (
            <div role="alert" className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              <span>{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-xs font-semibold text-red-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {successMessage && (
            <div role="alert" className="mb-6 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
              <span>{successMessage}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-xs font-semibold text-emerald-800 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {loadError && (
            <div role="alert" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
              {loadError}
            </div>
          )}

          {isLoading ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600 animate-pulse">
              Loading maintenance operations data...
            </div>
          ) : (
            <MaintenanceSummaryCards cards={cards} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <RecentWorkOrdersTable
                workOrders={mappedWorkOrders}
                onView={(wo) => setSelectedWorkOrder(wo)}
                onViewAll={() => setIsWorkOrdersOpen(true)}
              />
            </div>
            <div>
              <MaintenanceQuickActions
                actions={QUICK_ACTIONS}
                onAction={handleQuickAction}
              />
            </div>
          </div>

          <MaintenanceRequestsTable
            requests={paginatedRequests}
            onView={(req) => setSelectedRequest(req)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(val) => {
              setRowsPerPage(val);
              setCurrentPage(1);
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            totalItems={totalItems}
            showingStart={showingStart}
            showingEnd={showingEnd}
          />

          {/* Dialogs */}
          <RaiseMaintenanceRequestDialog
            open={isRaiseOpen}
            onClose={() => setIsRaiseOpen(false)}
            onSave={handleRaiseRequest}
            rooms={rooms}
          />

          <WorkOrdersDialog
            open={isWorkOrdersOpen}
            onClose={() => setIsWorkOrdersOpen(false)}
            workOrders={mappedWorkOrders}
            onView={(wo) => {
              setSelectedWorkOrder(wo);
            }}
          />

          <MaintenanceRequestDetailsDialog
            request={selectedRequest}
            open={Boolean(selectedRequest)}
            onClose={() => setSelectedRequest(null)}
          />

          <WorkOrderDetailsDialog
            workOrder={selectedWorkOrder}
            open={Boolean(selectedWorkOrder)}
            onClose={() => setSelectedWorkOrder(null)}
          />

          <RequestHistoryDialog
            open={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            requests={mappedRequests}
            onView={(req) => setSelectedRequest(req)}
          />

          <MaintenanceStaffDialog
            open={isStaffOpen}
            onClose={() => setIsStaffOpen(false)}
            staff={[
              { name: "Campus Operations", role: "Facility Supervisor", contact: "facilities@example.com", block: "Campus Wide" },
              { name: "John Admin", role: "Maintenance Admin", contact: "admin@example.com", block: "All Blocks" },
              { name: "Facilities Desk", role: "Operations Support", contact: "support@example.com", block: "Block A - D" },
            ]}
          />

          <MaintenanceInventoryDialog
            open={isInventoryOpen}
            onClose={() => setIsInventoryOpen(false)}
          />

          <MaintenanceReportDialog
            open={isReportOpen}
            onClose={() => setIsReportOpen(false)}
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
