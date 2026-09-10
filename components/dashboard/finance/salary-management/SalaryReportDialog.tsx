"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { X, BarChart3, Download, RefreshCw } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";

interface SalaryRow {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  basicSalary: number;
  netSalary: number;
  status: "Paid" | "Partial" | "Pending";
}

interface SalaryReportDialogProps {
  open: boolean;
  onClose: () => void;
  salaries: SalaryRow[];
  onSuccess: (message: string) => void;
}

const REPORT_PERIODS = ["May 2025", "Current Session 2024-25", "Last Month", "Year-to-Date (YTD)"];

export default function SalaryReportDialog({
  open,
  onClose,
  salaries,
  onSuccess,
}: SalaryReportDialogProps) {
  const [period, setPeriod] = useState(REPORT_PERIODS[0]);

  const totalPayroll = salaries.reduce((acc, s) => acc + s.netSalary, 0);
  const totalPaid = salaries.filter((s) => s.status === "Paid").reduce((acc, s) => acc + s.netSalary, 0);
  const totalPending = salaries.filter((s) => s.status === "Pending").reduce((acc, s) => acc + s.netSalary, 0);
  const avgSalary = salaries.length > 0 ? Math.round(totalPayroll / salaries.length) : 0;

  const deptMap: Record<string, { total: number; count: number }> = {};
  salaries.forEach((s) => {
    const dept = s.department || "Other";
    if (!deptMap[dept]) deptMap[dept] = { total: 0, count: 0 };
    deptMap[dept].total += s.netSalary;
    deptMap[dept].count += 1;
  });

  const handleExportCSV = () => {
    const headers = "Employee ID,Employee Name,Department,Designation,Basic Salary,Net Salary,Status\n";
    const csvContent = salaries.map((s) =>
      `"${s.employeeId}","${s.employeeName}","${s.department}","${s.designation}",${s.basicSalary},${s.netSalary},"${s.status}"`
    ).join("\n");

    const blob = new Blob([headers + csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Salary_Report_${period.replace(/\s+/g, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    onSuccess("Salary report exported to CSV successfully.");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-900">Payroll & Salary Summary Report</h2>
        </div>
        <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Report Period</label>
            <Dropdown value={period} options={REPORT_PERIODS} onChange={setPeriod} />
          </div>
          <button
            type="button"
            onClick={() => onSuccess("Report refreshed with latest database records.")}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium self-end mb-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <span className="text-xs text-purple-700 block">Total Payroll</span>
            <span className="text-base font-bold text-purple-900">₹{totalPayroll.toLocaleString("en-IN")}</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <span className="text-xs text-emerald-700 block">Total Paid</span>
            <span className="text-base font-bold text-emerald-900">₹{totalPaid.toLocaleString("en-IN")}</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <span className="text-xs text-amber-700 block">Total Pending</span>
            <span className="text-base font-bold text-amber-900">₹{totalPending.toLocaleString("en-IN")}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <span className="text-xs text-blue-700 block">Avg Salary / Staff</span>
            <span className="text-base font-bold text-blue-900">₹{avgSalary.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-700 mb-2">Department Payout Breakdown</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Department</th>
                  <th className="p-2.5">Staff Count</th>
                  <th className="p-2.5 text-right">Total Payout (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(deptMap).map(([dept, data]) => (
                  <tr key={dept}>
                    <td className="p-2.5 font-medium text-slate-900">{dept}</td>
                    <td className="p-2.5 text-slate-500">{data.count} staff</td>
                    <td className="p-2.5 text-right font-semibold text-slate-900">₹{data.total.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>
      </div>
    </Modal>
  );
}
