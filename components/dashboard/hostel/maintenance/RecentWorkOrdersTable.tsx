"use client";

import { Eye } from "lucide-react";
import Card from "@/components/shared/Card";
import type { WorkOrder } from "@/lib/fixtures/maintenance-management-reference-fixture";

interface RecentWorkOrdersTableProps {
  workOrders: WorkOrder[];
  onView: (workOrder: WorkOrder) => void;
  onViewAll: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Open: "bg-blue-50 text-blue-600",
    "In Progress": "bg-orange-50 text-orange-600",
    Completed: "bg-green-50 text-green-600",
    Overdue: "bg-red-50 text-red-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export default function RecentWorkOrdersTable({ workOrders, onView, onViewAll }: RecentWorkOrdersTableProps) {
  return (
    <Card className="flex flex-col mb-6">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Recent Work Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Work Order ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Related Request</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned To</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Scheduled Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-500">
                  No work orders found.
                </td>
              </tr>
            ) : (
              workOrders.map((workOrder) => (
                <tr key={workOrder.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-xs font-medium text-[#7c3aed]">{workOrder.id}</td>
                  <td className="px-5 py-3 text-slate-600">{workOrder.relatedRequest}</td>
                  <td className="px-5 py-3 text-slate-600">{workOrder.issueType}</td>
                  <td className="px-5 py-3 text-slate-600">{workOrder.assignedTo}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={workOrder.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-600">{workOrder.scheduledDate}</td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => onView(workOrder)}
                      aria-label={`View ${workOrder.id} details`}
                      className="inline-flex items-center justify-center rounded-lg border border-purple-200 bg-purple-50 p-1.5 text-purple-600 hover:bg-purple-100 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3">
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-[#7c3aed] hover:text-[#6d28d9] transition inline-flex items-center gap-1"
        >
          View All Work Orders
          <span className="text-[#7c3aed]">→</span>
        </button>
      </div>
    </Card>
  );
}
