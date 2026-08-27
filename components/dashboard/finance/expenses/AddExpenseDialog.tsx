"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, Calendar } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import CalendarPicker from "@/components/shared/Calendar";
import type { Expense } from "@/lib/fixtures/expenses-management-reference-fixture";

const EXPENSE_CATEGORIES_FOR_FORM = ["Academic Expenses", "Office Expenses", "Utilities", "Maintenance", "Other Expenses"];
const PAYMENT_MODES_FOR_FORM = ["UPI", "Bank Transfer", "Net Banking", "Cash"];
const APPROVAL_STATUSES_FOR_FORM = ["Approved", "Pending", "Rejected"];

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}

export default function AddExpenseDialog({ open, onClose, onSave }: AddExpenseDialogProps) {
  const [form, setForm] = useState({
    expenseName: "",
    expenseDate: new Date().toLocaleDateString("en-GB"),
    category: EXPENSE_CATEGORIES_FOR_FORM[0],
    department: "Administration",
    amount: "",
    paymentMode: PAYMENT_MODES_FOR_FORM[0],
    referenceNumber: "",
    approvalStatus: "Approved",
    vendor: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({
        expenseName: "",
        expenseDate: new Date().toLocaleDateString("en-GB"),
        category: EXPENSE_CATEGORIES_FOR_FORM[0],
        department: "Administration",
        amount: "",
        paymentMode: PAYMENT_MODES_FOR_FORM[0],
        referenceNumber: "",
        approvalStatus: "Approved",
        vendor: "",
        description: "",
      });
      setErrors({});
      setCalendarOpen(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.expenseName.trim()) newErrors.expenseName = "Expense name is required";
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!form.category) newErrors.category = "Category is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      expenseId: `EXP${Date.now().toString().slice(-6)}`,
      expenseDate: form.expenseDate,
      expenseName: form.expenseName,
      category: form.category,
      department: form.department,
      amount: parseFloat(form.amount),
      paymentMode: form.paymentMode,
      status: form.approvalStatus as Expense["status"],
      refNo: form.referenceNumber,
      vendor: form.vendor,
      description: form.description,
    };
    onSave(newExpense);
    onClose();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent";

  return (
    <Modal open={open} onClose={onClose} title="Add Expense" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Expense Name</label>
            <input
              type="text"
              value={form.expenseName}
              onChange={(e) => setForm({ ...form, expenseName: e.target.value })}
              className={inputClass}
              placeholder="e.g. Office Supplies"
              required
            />
            {errors.expenseName && <p className="text-xs text-red-500 mt-1">{errors.expenseName}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Expense Date</label>
            <input
              type="text"
              value={form.expenseDate}
              readOnly
              onClick={() => setCalendarOpen((o) => !o)}
              className={`${inputClass} cursor-pointer`}
            />
            {calendarOpen && (
              <div className="absolute z-10">
                <CalendarPicker
                  selectedDate={new Date()}
                  onSelect={(d) => {
                    const dateStr = d.toLocaleDateString("en-GB");
                    setForm({ ...form, expenseDate: dateStr });
                    setCalendarOpen(false);
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
            <Dropdown
              value={form.category}
              options={EXPENSE_CATEGORIES_FOR_FORM}
              onChange={(v) => setForm({ ...form, category: v })}
            />
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
            <Dropdown
              value={form.department}
              options={["Administration", "Computer Science", "Electronics", "Mechanical", "Management", "NSS"]}
              onChange={(v) => setForm({ ...form, department: v })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount (₹)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={inputClass}
              placeholder="0.00"
              required
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Mode</label>
            <Dropdown
              value={form.paymentMode}
              options={PAYMENT_MODES_FOR_FORM}
              onChange={(v) => setForm({ ...form, paymentMode: v })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Approval Status</label>
            <Dropdown
              value={form.approvalStatus}
              options={APPROVAL_STATUSES_FOR_FORM}
              onChange={(v) => setForm({ ...form, approvalStatus: v })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Reference Number</label>
            <input
              type="text"
              value={form.referenceNumber}
              onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
              className={inputClass}
              placeholder="e.g. REF12345"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Vendor / Party</label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              className={inputClass}
              placeholder="Vendor name"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              placeholder="Optional description..."
              rows={2}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold transition"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
