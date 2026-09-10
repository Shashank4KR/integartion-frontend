"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/shared/Modal";
import { X, Calendar } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";
import CalendarPicker from "@/components/shared/Calendar";
import { getToken } from "@/lib/auth";
import { processSalary } from "@/lib/services/financeService";

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
  "Maintenance",
];
const DESIGNATION_OPTIONS = [
  "All Designations",
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Office Manager",
  "Accountant",
  "Librarian",
  "Technician",
];

interface AddSalaryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function AddSalaryDialog({ open, onClose, onSuccess }: AddSalaryDialogProps) {
  const [form, setForm] = useState({
    employeeName: "",
    employeeId: "",
    department: DEPARTMENT_OPTIONS[1],
    designation: DESIGNATION_OPTIONS[1],
    month: MONTH_OPTIONS[0],
    basicSalary: "",
    allowances: "",
    deductions: "",
    paymentStatus: "Paid" as "Paid" | "Partial" | "Pending",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm({
        employeeName: "",
        employeeId: "",
        department: DEPARTMENT_OPTIONS[1],
        designation: DESIGNATION_OPTIONS[1],
        month: MONTH_OPTIONS[0],
        basicSalary: "",
        allowances: "",
        deductions: "",
        paymentStatus: "Paid",
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setErrors({});
      setCalendarOpen(false);
      setIsSubmitting(false);
      setApiError(null);
    }
  }, [open]);

  const basic = parseFloat(form.basicSalary) || 0;
  const allowances = parseFloat(form.allowances) || 0;
  const deductions = parseFloat(form.deductions) || 0;
  const netSalary = Math.max(0, basic + allowances - deductions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.employeeName) newErrors.employeeName = "Employee name is required";
    if (!form.employeeId) newErrors.employeeId = "Employee ID is required";
    if (!form.basicSalary || parseFloat(form.basicSalary) <= 0) newErrors.basicSalary = "Basic salary must be greater than 0";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const token = getToken();
    if (!token) {
      setApiError("Authentication required.");
      return;
    }

    const { month, year } = parseMonthYear(form.month);

    const payload = {
      employee_name: form.employeeName,
      employee_id: form.employeeId,
      amount: netSalary,
      month,
      year,
      payment_method: "BANK_TRANSFER",
      status: form.paymentStatus.toUpperCase(),
      payment_date: form.paymentDate,
    };

    try {
      setIsSubmitting(true);
      setApiError(null);
      await processSalary(token, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to save salary.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Add Salary</h2>
        <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        {apiError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {apiError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Employee Name *</label>
            <input
              type="text"
              value={form.employeeName}
              onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
              className={inputClass}
              placeholder="Enter employee name"
              required
            />
            {errors.employeeName && <p className="text-xs text-red-500 mt-1">{errors.employeeName}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Employee ID *</label>
            <input
              type="text"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              className={inputClass}
              placeholder="e.g. EMP009"
              required
            />
            {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
            <Dropdown
              value={form.department}
              options={DEPARTMENT_OPTIONS.filter((o) => o !== "All Departments")}
              onChange={(v) => setForm({ ...form, department: v })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
            <Dropdown
              value={form.designation}
              options={DESIGNATION_OPTIONS.filter((o) => o !== "All Designations")}
              onChange={(v) => setForm({ ...form, designation: v })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Month</label>
            <Dropdown
              value={form.month}
              options={MONTH_OPTIONS}
              onChange={(v) => setForm({ ...form, month: v })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Basic Salary (₹) *</label>
            <input
              type="number"
              value={form.basicSalary}
              onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
              className={inputClass}
              placeholder="0.00"
              required
            />
            {errors.basicSalary && <p className="text-xs text-red-500 mt-1">{errors.basicSalary}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Allowances (₹)</label>
            <input
              type="number"
              value={form.allowances}
              onChange={(e) => setForm({ ...form, allowances: e.target.value })}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Deductions (₹)</label>
            <input
              type="number"
              value={form.deductions}
              onChange={(e) => setForm({ ...form, deductions: e.target.value })}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Net Salary (₹)</label>
            <input
              type="text"
              value={netSalary.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              readOnly
              className={`${inputClass} bg-slate-50 text-slate-600`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Payment Status</label>
            <Dropdown
              value={form.paymentStatus}
              options={["Paid", "Partial", "Pending"]}
              onChange={(v) => setForm({ ...form, paymentStatus: v as "Paid" | "Partial" | "Pending" })}
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-slate-700 mb-1">Payment Date</label>
            <div className="relative">
              <input
                type="text"
                value={form.paymentDate}
                readOnly
                onClick={() => setCalendarOpen((o) => !o)}
                className={`${inputClass} cursor-pointer pr-8`}
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              {calendarOpen && (
                <div className="absolute right-0 top-full mt-1 z-50">
                  <CalendarPicker
                    selectedDate={new Date(form.paymentDate)}
                    onSelect={(d) => {
                      const dateStr = d.toISOString().split("T")[0];
                      setForm({ ...form, paymentDate: dateStr });
                      setCalendarOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputClass}
              placeholder="Optional notes..."
              rows={2}
            />
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
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#7c3aed] hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Salary"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
