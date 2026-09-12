"use client";

import { useState } from "react";
import { X, Percent, AlertCircle } from "lucide-react";

interface FeeConcessionDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveConcession: (data: {
    studentName: string;
    classGrade: string;
    category: string;
    discountType: "percentage" | "flat";
    discountValue: number;
    reason: string;
  }) => void;
}

export default function FeeConcessionDialog({
  open,
  onClose,
  onSaveConcession,
}: FeeConcessionDialogProps) {
  const [studentName, setStudentName] = useState("");
  const [classGrade, setClassGrade] = useState("9th - A");
  const [category, setCategory] = useState("Merit Scholarship");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentName.trim()) {
      setError("Please enter the student name.");
      return;
    }
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid concession value.");
      return;
    }
    if (discountType === "percentage" && val > 100) {
      setError("Percentage concession cannot exceed 100%.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSaveConcession({
        studentName: studentName.trim(),
        classGrade,
        category,
        discountType,
        discountValue: val,
        reason: reason.trim() || category,
      });
      setIsSubmitting(false);
      onClose();
      setStudentName("");
      setDiscountValue("");
      setReason("");
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Apply Fee Concession</h3>
              <p className="text-xs text-slate-500">Grant fee scholarship or discount to student</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Student Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Nair"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Class / Grade
              </label>
              <input
                type="text"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Concession Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            >
              <option>Merit Scholarship</option>
              <option>Sibling Discount</option>
              <option>Staff Child Concession</option>
              <option>Economically Weaker Section (EWS)</option>
              <option>Sports / Talent Quota</option>
              <option>Special Discretionary Waiver</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percentage" | "flat")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {discountType === "percentage" ? "Discount Percentage (%) *" : "Discount Amount (₹) *"}
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder={discountType === "percentage" ? "e.g. 25" : "e.g. 5000"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Remarks / Approval Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Approved by Principal for academic excellence"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Applying..." : "Apply Concession"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
