"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { X, FileText, Download, Printer } from "lucide-react";
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

interface GeneratePayslipDialogProps {
  open: boolean;
  onClose: () => void;
  salaries: SalaryRow[];
  onSuccess: (message: string) => void;
}

export default function GeneratePayslipDialog({
  open,
  onClose,
  salaries,
  onSuccess,
}: GeneratePayslipDialogProps) {
  const [selectedId, setSelectedId] = useState(salaries[0]?.id ?? "");

  const activeSalary = salaries.find((s) => s.id === selectedId) ?? salaries[0] ?? {
    id: "sample",
    employeeId: "EMP001",
    employeeName: "Dr. Rajesh Sharma",
    department: "Computer Science",
    designation: "Professor",
    basicSalary: 70000,
    netSalary: 85000,
    status: "Paid" as const,
  };

  const basic = activeSalary.basicSalary || activeSalary.netSalary * 0.7;
  const hra = activeSalary.netSalary * 0.2;
  const allowances = activeSalary.netSalary * 0.1;
  const gross = basic + hra + allowances;
  const pf = activeSalary.netSalary * 0.08;
  const tax = activeSalary.netSalary * 0.04;
  const totalDeductions = pf + tax;
  const netPay = gross - totalDeductions;

  const handleDownload = () => {
    onSuccess(`Payslip generated and downloaded for ${activeSalary.employeeName} (${activeSalary.employeeId})`);
    onClose();
  };

  const options = salaries.length > 0
    ? salaries.map((s) => ({ value: s.id, label: `${s.employeeName} (${s.employeeId}) - ${s.department}` }))
    : [{ value: "sample", label: "Dr. Rajesh Sharma (EMP001) - Computer Science" }];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-pink-600" />
          <h2 className="text-base font-semibold text-slate-900">Generate Salary Payslip</h2>
        </div>
        <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Select Employee Record</label>
          <Dropdown
            value={selectedId}
            options={options.map((o) => o.value)}
            onChange={setSelectedId}
          />
        </div>

        {/* Printable Payslip Card Preview */}
        <div id="payslip-print-area" className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-sm">
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">EdTech Smart Campus ERP</h3>
              <p className="text-xs text-slate-500">Official Monthly Salary Slip</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeSalary.status.toUpperCase()}
              </span>
              <p className="text-xs text-slate-400 mt-1">May 2025</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-400 block">Employee Name</span>
              <span className="font-semibold text-slate-800">{activeSalary.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Employee ID</span>
              <span className="font-semibold text-slate-800">{activeSalary.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Department</span>
              <span className="font-semibold text-slate-800">{activeSalary.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Designation</span>
              <span className="font-semibold text-slate-800">{activeSalary.designation}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="font-semibold text-slate-700 border-b border-slate-200 pb-1 mb-2">Earnings</h4>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between"><span>Basic Pay:</span> <span>₹{Math.round(basic).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>HRA:</span> <span>₹{Math.round(hra).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Special Allowances:</span> <span>₹{Math.round(allowances).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-100 pt-1">
                  <span>Gross Earnings:</span> <span>₹{Math.round(gross).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 border-b border-slate-200 pb-1 mb-2">Deductions</h4>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between"><span>Provident Fund (PF):</span> <span>₹{Math.round(pf).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Income Tax (TDS):</span> <span>₹{Math.round(tax).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-100 pt-1">
                  <span>Total Deductions:</span> <span>₹{Math.round(totalDeductions).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-900">Net Transferable Salary:</span>
            <span className="text-base font-bold text-purple-900">₹{Math.round(netPay).toLocaleString("en-IN")}</span>
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
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition"
          >
            <Download className="w-4 h-4" /> Download Payslip
          </button>
        </div>
      </div>
    </Modal>
  );
}
