"use client";

import { Eye, Download, MoreHorizontal } from "lucide-react";
import type { SalaryRow } from "@/lib/fixtures/salary-management-reference-fixture";

interface EmployeeSalaryTableProps {
  rows: SalaryRow[];
  onView: (row: SalaryRow) => void;
  onDownload: (row: SalaryRow) => void;
  onMore: (row: SalaryRow) => void;
}

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Partial: "bg-orange-50 text-orange-700 border-orange-200",
    Pending: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

export default function EmployeeSalaryTable({ rows, onView, onDownload, onMore }: EmployeeSalaryTableProps) {
  return (
    <div>
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Employee Salary Overview</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Basic Salary (₹)</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Salary (₹)</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                  No employee salary records found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-mono font-medium text-blue-600">
                      {row.employeeId}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-slate-900">{row.employeeName}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{row.department}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{row.designation}</td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-slate-900">
                    {row.basicSalary.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-slate-900">
                    {row.netSalary.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3">{statusBadge(row.status)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(row)}
                        className="p-1.5 rounded-lg bg-purple-50 text-[#7c3aed] hover:bg-purple-100 transition"
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDownload(row)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        aria-label="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onMore(row)}
                        className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
                        aria-label="More"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
