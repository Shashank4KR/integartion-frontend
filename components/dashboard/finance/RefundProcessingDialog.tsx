"use client";

import { useState } from "react";
import { X, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface RefundProcessingDialogProps {
  open: boolean;
  onClose: () => void;
  onProcessRefund: (refundData: {
    studentName: string;
    receiptNo: string;
    amount: number;
    reason: string;
    refundMode: string;
  }) => void;
}

export default function RefundProcessingDialog({
  open,
  onClose,
  onProcessRefund,
}: RefundProcessingDialogProps) {
  const [studentName, setStudentName] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [refundMode, setRefundMode] = useState("Original Payment Method");
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
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid refund amount.");
      return;
    }
    if (!reason.trim()) {
      setError("Please provide a reason for the refund.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onProcessRefund({
        studentName: studentName.trim(),
        receiptNo: receiptNo.trim() || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: numAmount,
        reason: reason.trim(),
        refundMode,
      });
      setIsSubmitting(false);
      onClose();
      setStudentName("");
      setReceiptNo("");
      setAmount("");
      setReason("");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-[#7c3aed]">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Refund Processing</h3>
              <p className="text-xs text-slate-500">Issue full or partial fee refund to student</p>
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
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Student Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Original Receipt / Txn No.
              </label>
              <input
                type="text"
                placeholder="e.g. REC-8921"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Refund Amount (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Refund Method
            </label>
            <select
              value={refundMode}
              onChange={(e) => setRefundMode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100"
            >
              <option>Original Payment Method</option>
              <option>Bank Transfer (NEFT/IMPS)</option>
              <option>UPI Transfer</option>
              <option>Campus Wallet Credit</option>
              <option>Cheque / Cash</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Reason for Refund *
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Overpayment adjustment / Course cancellation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100"
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
              className="flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Process Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
