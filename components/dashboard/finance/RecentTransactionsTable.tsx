"use client";

import { Eye, Download, Printer, ChevronDown } from "lucide-react";
import type { TransactionRow } from "@/lib/fixtures/transactions-reference-fixture";

interface RecentTransactionsTableProps {
  rows: TransactionRow[];
  onView: (row: TransactionRow) => void;
  onViewAll: () => void;
}

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Failed: "bg-red-50 text-red-700 border-red-200",
    Refunded: "bg-slate-100 text-slate-700 border-slate-200",
    Overdue: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

export default function RecentTransactionsTable({ rows, onView, onViewAll }: RecentTransactionsTableProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search transactions..."
            className="h-9 w-48 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
          />
          <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
            Filter
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
            Export
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const r = row as any;
              const receipt = row.receiptRefNo || r.receipt_ref_no || (row.id ? `TXN-${String(row.id).slice(0, 8).toUpperCase()}` : "-");
              const student = row.studentName || r.student_name || r.student || "Student";
              const cls = row.classGrade || r.class_grade || "";
              const cat = row.category || r.type || r.fee_type || "Fee Payment";

              return (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{receipt}</td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{student}</p>
                      {cls && <p className="text-xs text-slate-500">{cls}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">{cat}</td>
                <td className="px-5 py-3 text-sm font-semibold text-slate-900">₹{row.amount.toLocaleString()}</td>
                <td className="px-5 py-3">{statusBadge(row.status)}</td>
                <td className="px-5 py-3 text-xs text-slate-500">{row.date}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(row)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                      aria-label="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                      aria-label="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                      aria-label="Print"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-500">Showing {rows.length} of {rows.length} transactions</p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Previous</button>
          <button className="px-3 py-1.5 rounded-lg bg-[#7c3aed] text-xs text-white">1</button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">2</button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Next</button>
        </div>
      </div>
    </div>
  );
}
