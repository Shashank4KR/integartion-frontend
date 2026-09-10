"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { X, Wallet, CheckCircle2 } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";
import { getToken } from "@/lib/auth";
import { bulkProcessSalaries } from "@/lib/services/financeService";

const MONTH_OPTIONS = ["May 2025", "April 2025", "March 2025", "February 2025", "January 2025"];
const DEPARTMENT_OPTIONS = [
  "All Departments",
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Information Tech.",
  "Administration",
  "Accounts",
  "Library",
];
const PAYMENT_METHOD_OPTIONS = ["BANK_TRANSFER", "CHEQUE", "CASH"];

interface ProcessPayrollDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingCount?: number;
}

function parseMonthYear(monthStr: string): { month: number; year: number } {
  const parts = monthStr.trim().split(" ");
  const months: Record<string, number> = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
  };
  const m = months[parts[0]] ?? 5;
  const y = parseInt(parts[1], 10) || new Date().getFullYear();
  return { month: m, year: y };
}

export default function ProcessPayrollDialog({
  open,
  onClose,
  onSuccess,
  existingCount = 0,
}: ProcessPayrollDialogProps) {
  const [selectedMonth, setSelectedMonth] = useState(MONTH_OPTIONS[0]);
  const [selectedDepartment, setSelectedDepartment] = useState(DEPARTMENT_OPTIONS[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { month, year } = parseMonthYear(selectedMonth);

  const sampleStaff = [
    { name: "Dr. Rajesh Sharma", empId: "EMP001", dept: "Computer Science", amount: 85000 },
    { name: "Priya Patel", empId: "EMP002", dept: "Electronics", amount: 62000 },
    { name: "Amit Verma", empId: "EMP003", dept: "Mechanical", amount: 74000 },
    { name: "Sunita Rao", empId: "EMP004", dept: "Information Tech.", amount: 68000 },
    { name: "Ramesh Gupta", empId: "EMP005", dept: "Administration", amount: 48000 },
  ];

  const filteredStaff = selectedDepartment === "All Departments"
    ? sampleStaff
    : sampleStaff.filter((s) => s.dept === selectedDepartment);

  const estimatedTotal = filteredStaff.reduce((sum, s) => sum + s.amount, 0);

  const handleProcess = async () => {
    const token = getToken();
    if (!token) {
      setError("Please log in to process payroll.");
      return;
    }

    const payload = filteredStaff.map((staff) => ({
      employee_name: staff.name,
      employee_id: staff.empId,
      amount: staff.amount,
      month,
      year,
      payment_method: paymentMethod,
      status: "PAID",
      payment_date: new Date().toISOString().split("T")[0],
    }));

    try {
      setIsSubmitting(true);
      setError(null);
      await bulkProcessSalaries(token, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payroll.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#7c3aed]" />
          <h2 className="text-base font-semibold text-slate-900">Process Payroll</h2>
        </div>
        <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Payroll Month</label>
            <Dropdown value={selectedMonth} options={MONTH_OPTIONS} onChange={setSelectedMonth} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
            <Dropdown value={selectedDepartment} options={DEPARTMENT_OPTIONS} onChange={setSelectedDepartment} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
            <Dropdown value={paymentMethod} options={PAYMENT_METHOD_OPTIONS} onChange={setPaymentMethod} />
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-purple-700 block">Employees</span>
            <span className="text-lg font-bold text-purple-900">{filteredStaff.length}</span>
          </div>
          <div>
            <span className="text-xs text-purple-700 block">Estimated Payout</span>
            <span className="text-lg font-bold text-purple-900">
              ₹{estimatedTotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div>
            <span className="text-xs text-purple-700 block">Status</span>
            <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-4 h-4" /> Ready to Process
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-700 mb-2">Staff Payroll Preview</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Staff Member</th>
                  <th className="p-2.5">Department</th>
                  <th className="p-2.5 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((staff) => (
                  <tr key={staff.empId}>
                    <td className="p-2.5 font-medium text-slate-900">{staff.name} ({staff.empId})</td>
                    <td className="p-2.5 text-slate-500">{staff.dept}</td>
                    <td className="p-2.5 text-right font-semibold text-slate-900">₹{staff.amount.toLocaleString("en-IN")}</td>
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
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={isSubmitting || filteredStaff.length === 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#7c3aed] hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : `Process Payroll (${filteredStaff.length})`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
