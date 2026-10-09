"use client";

import Modal from "@/components/shared/Modal";
import type { MaintenanceRequest } from "@/lib/fixtures/maintenance-management-reference-fixture";

interface RequestHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  onView?: (request: MaintenanceRequest) => void;
  requests?: MaintenanceRequest[];
}

export default function RequestHistoryDialog({ open, onClose, onView, requests = [] }: RequestHistoryDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Request History" maxWidth="max-w-3xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Request ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested By</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested On</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No maintenance requests found in history.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-xs font-medium text-[#7c3aed]">{request.id}</td>
                  <td className="px-4 py-3 text-slate-600">{request.requestedBy}</td>
                  <td className="px-4 py-3 text-slate-600">{request.issueType}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      request.status === "Open" ? "bg-blue-50 text-blue-600" :
                      request.status === "In Progress" ? "bg-orange-50 text-orange-600" :
                      request.status === "Completed" ? "bg-green-50 text-green-600" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{request.requestedOn}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onView?.(request)}
                      className="inline-flex items-center justify-center rounded-lg border border-purple-200 bg-purple-50 p-1.5 text-purple-600 hover:bg-purple-100 transition"
                      aria-label={`View ${request.id} details`}
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
