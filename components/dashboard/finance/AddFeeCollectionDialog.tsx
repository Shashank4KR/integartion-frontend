"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";

const CLASS_GRADE_OPTIONS = [
  "All Classes",
  "VIII - A",
  "VI - B",
  "IX - A",
  "VIII - B",
  "IX - B",
  "VI - A",
  "V - B",
  "VIII - C",
];
const FEE_TYPE_OPTIONS = ["All Fee Types", "Tuition Fee", "Transport Fee", "Admission Fee", "Exam Fee", "Other Fees"];
const INSTALLMENT_OPTIONS = ["All Installments", "Installment 1", "Installment 2", "Installment 3", "Full Payment"];
const STATUS_OPTIONS = ["All Status", "Paid", "Partial", "Overdue", "Pending"];

interface AddFeeCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (fee: {
    id: string;
    studentName: string;
    classGrade: string;
    feeType: string;
    installment: string;
    totalAmount: string;
    amountPaid: string;
    paymentMode: string;
    paymentDate: string;
    receiptNumber: string;
    status: string;
    notes: string;
  }) => void;
}

export default function AddFeeCollectionDialog({ open, onClose, onSave }: AddFeeCollectionDialogProps) {
  const [form, setForm] = useState({
    studentName: "",
    classGrade: "All Classes",
    feeType: "Tuition Fee",
    installment: "All Installments",
    totalAmount: "",
    amountPaid: "",
    paymentMode: "Cash",
    paymentDate: new Date().toISOString().split("T")[0],
    receiptNumber: "",
    status: "Paid",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.studentName.trim()) newErrors.studentName = "Student name is required";
    if (!form.classGrade) newErrors.classGrade = "Class / Grade is required";
    if (!form.feeType) newErrors.feeType = "Fee Type is required";
    if (!form.installment) newErrors.installment = "Installment is required";
    if (!form.totalAmount || Number(form.totalAmount) <= 0) newErrors.totalAmount = "Total Amount is required";
    if (!form.amountPaid || Number(form.amountPaid) < 0) newErrors.amountPaid = "Amount Paid is required";
    if (!form.paymentMode) newErrors.paymentMode = "Payment Mode is required";
    if (!form.paymentDate) newErrors.paymentDate = "Payment Date is required";
    if (!form.receiptNumber.trim()) newErrors.receiptNumber = "Receipt Number is required";
    if (!form.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      id: crypto.randomUUID(),
      ...form,
    });
    setForm({
      studentName: "",
      classGrade: "All Classes",
      feeType: "Tuition Fee",
      installment: "All Installments",
      totalAmount: "",
      amountPaid: "",
      paymentMode: "Cash",
      paymentDate: new Date().toISOString().split("T")[0],
      receiptNumber: "",
      status: "Paid",
      notes: "",
    });
    setErrors({});
    setToast({ open: true, message: "Fee collection added successfully" });
    setTimeout(() => {
      setToast({ open: false, message: "" });
      onClose();
    }, 1500);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent";

  return (
    <Modal open={open} onClose={onClose} title="Add Fee Collection" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Student</label>
            <input
              type="text"
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              className={inputClass}
              placeholder="Enter student name"
            />
            {errors.studentName && <p className="text-xs text-red-500 mt-1">{errors.studentName}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Class / Grade</label>
            <Dropdown
              label=""
              value={form.classGrade}
              options={CLASS_GRADE_OPTIONS}
              onChange={(v) => setForm({ ...form, classGrade: v })}
            />
            {errors.classGrade && <p className="text-xs text-red-500 mt-1">{errors.classGrade}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Fee Type</label>
            <Dropdown
              label=""
              value={form.feeType}
              options={FEE_TYPE_OPTIONS}
              onChange={(v) => setForm({ ...form, feeType: v })}
            />
            {errors.feeType && <p className="text-xs text-red-500 mt-1">{errors.feeType}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Installment</label>
            <Dropdown
              label=""
              value={form.installment}
              options={INSTALLMENT_OPTIONS}
              onChange={(v) => setForm({ ...form, installment: v })}
            />
            {errors.installment && <p className="text-xs text-red-500 mt-1">{errors.installment}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Total Amount (₹)</label>
            <input
              type="number"
              value={form.totalAmount}
              onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
              className={inputClass}
              placeholder="0.00"
            />
            {errors.totalAmount && <p className="text-xs text-red-500 mt-1">{errors.totalAmount}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount Paid (₹)</label>
            <input
              type="number"
              value={form.amountPaid}
              onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
              className={inputClass}
              placeholder="0.00"
            />
            {errors.amountPaid && <p className="text-xs text-red-500 mt-1">{errors.amountPaid}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Type of Payment</label>
            <select
              value={form.paymentMode}
              onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
              className={`${inputClass} text-slate-800 bg-white`}
            >
              <option value="Online UPI">Online UPI / QR Code</option>
              <option value="Cash">Cash</option>
              <option value="Debit / Credit Card">Debit / Credit Card</option>
              <option value="Net Banking">Net Banking / NEFT / RTGS</option>
              <option value="Cheque">Cheque / Demand Draft</option>
              <option value="Bank Transfer">Bank Deposit / Transfer</option>
              <option value="Scholarship / Concession">Scholarship / Fee Concession</option>
              <option value="Other">Other Payment Method</option>
            </select>
            {errors.paymentMode && <p className="text-xs text-red-500 mt-1">{errors.paymentMode}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Date</label>
            <input
              type="date"
              value={form.paymentDate}
              onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
              className={inputClass}
            />
            {errors.paymentDate && <p className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Receipt / Reference No.</label>
            <input
              type="text"
              value={form.receiptNumber}
              onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
              className={inputClass}
              placeholder="e.g. RCPT-100245 or UPI-Ref"
            />
            {errors.receiptNumber && <p className="text-xs text-red-500 mt-1">{errors.receiptNumber}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
            <Dropdown
              label=""
              value={form.status}
              options={STATUS_OPTIONS}
              onChange={(v) => setForm({ ...form, status: v })}
            />
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Payment Details & Remarks (Text)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputClass}
              rows={2}
              placeholder="Enter transaction reference, bank details, payer remarks, or payment notes..."
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
      {toast.open && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg">
          {toast.message}
        </div>
      )}
    </Modal>
  );
}

