"use client";

import Modal from "@/components/shared/Modal";
import type { WorkOrder } from "@/lib/fixtures/maintenance-management-reference-fixture";

interface WorkOrdersDialogProps {
  open: boolean;
  onClose: () => void;
  onView: (workOrder: WorkOrder) => void;
  workOrders?: WorkOrder[];
}

export default function WorkOrdersDialog({ open, onClose, onView, workOrders = [] }: WorkOrdersDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Work Orders" maxWidth="max-w-3xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Work Order ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Related Request</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned To</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Scheduled Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  No work orders found.
                </td>
              </tr>
            ) : (
              workOrders.map((workOrder) => (
                <tr key={workOrder.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-xs font-medium text-[#7c3aed]">{workOrder.id}</td>
                  <td className="px-4 py-3 text-slate-600">{workOrder.relatedRequest}</td>
                  <td className="px-4 py-3 text-slate-600">{workOrder.issueType}</td>
                  <td className="px-4 py-3 text-slate-600">{workOrder.assignedTo}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      workOrder.status === "Open" ? "bg-blue-50 text-blue-600" :
                      workOrder.status === "In Progress" ? "bg-orange-50 text-orange-600" :
                      workOrder.status === "Completed" ? "bg-green-50 text-green-600" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {workOrder.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{workOrder.scheduledDate}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onView(workOrder)}
                      className="inline-flex items-center justify-center rounded-lg border border-purple-200 bg-purple-50 p-1.5 text-purple-600 hover:bg-purple-100 transition"
                      aria-label={`View ${workOrder.id} details`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
