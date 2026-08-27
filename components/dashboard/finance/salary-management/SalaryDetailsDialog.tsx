"use client";

import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import type { SalaryRow } from "@/lib/fixtures/salary-management-reference-fixture";

interface SalaryDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  salary: SalaryRow | null;
}

export default function SalaryDetailsDialog({ open, onClose, salary }: SalaryDetailsDialogProps) {
  if (!salary) return null;

  return (
    <Modal open={open} onClose={onClose} title="Salary Details" maxWidth="max-w-lg">
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Employee ID</p>
            <p className="text-sm font-semibold text-slate-800">{salary.employeeId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Employee Name</p>
            <p className="text-sm font-semibold text-slate-800">{salary.employeeName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Department</p>
            <p className="text-sm text-slate-700">{salary.department}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Designation</p>
            <p className="text-sm text-slate-700">{salary.designation}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Basic Salary</p>
            <p className="text-sm text-slate-700">₹ {salary.basicSalary.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Net Salary</p>
            <p className="text-sm font-semibold text-slate-900">₹ {salary.netSalary.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
            <div>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                salary.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                salary.status === "Partial" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-red-50 text-red-700 border-red-200"
              }`}>
                {salary.status}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Employee Type</p>
            <p className="text-sm text-slate-700">{salary.employeeType}</p>
          </div>
        </div>
        <div className="flex items-center justify-end pt-3 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

