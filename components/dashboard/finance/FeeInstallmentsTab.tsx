"use client";

import { MoreVertical } from "lucide-react";
import type { FeeInstallmentRow } from "@/lib/fixtures/fees-management-reference-fixture";

interface FeeInstallmentsTabProps {
  installments?: FeeInstallmentRow[];
}

export default function FeeInstallmentsTab({ installments = [] }: FeeInstallmentsTabProps) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Paid: "bg-emerald-50 text-emerald-700",
      Partial: "bg-amber-50 text-amber-700",
      Overdue: "bg-red-50 text-red-700",
      Pending: "bg-slate-100 text-slate-700",
    };
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.Pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class / Grade</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Installment</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount (₹)</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Paid Amount (₹)</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Balance (₹)</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {installments.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-sm text-slate-500">
                No fee installment records found.
              </td>
            </tr>
          ) : (
            installments.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                <td className="py-3 pr-4 text-sm font-medium text-slate-900">{row.studentName}</td>
                <td className="py-3 pr-4 text-sm text-slate-600">{row.classGrade}</td>
                <td className="py-3 pr-4 text-sm text-slate-600">{row.installment}</td>
                <td className="py-3 pr-4 text-sm text-slate-600">{row.dueDate}</td>
                <td className="py-3 pr-4 text-sm text-slate-900 text-right font-medium">{row.amount.toLocaleString()}</td>
                <td className="py-3 pr-4 text-sm text-slate-900 text-right">{row.paidAmount.toLocaleString()}</td>
                <td className="py-3 pr-4 text-sm text-slate-900 text-right">{row.balance.toLocaleString()}</td>
                <td className="py-3 pr-4">{getStatusBadge(row.status)}</td>
                <td className="py-3 text-center">
                  <button className="p-1.5 rounded-md hover:bg-slate-100 transition" aria-label="More actions">
                    <MoreVertical className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
