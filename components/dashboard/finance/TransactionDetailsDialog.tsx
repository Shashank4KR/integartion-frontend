"use client";

import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import type { TransactionRow } from "@/lib/fixtures/transactions-reference-fixture";

interface TransactionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionRow | null;
}

export default function TransactionDetailsDialog({ open, onClose, transaction }: TransactionDetailsDialogProps) {
  if (!transaction) return null;

  const isExpense = transaction.type === "Expense";

  return (
    <Modal open={open} onClose={onClose} title="Transaction Details" maxWidth="max-w-lg">
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Receipt / Ref No.</p>
            <p className="text-sm font-semibold text-slate-800">{transaction.receiptRefNo}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Date</p>
            <p className="text-sm text-slate-700">{transaction.date}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Student / Party Name</p>
            <p className="text-sm text-slate-700">{transaction.studentName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Class / Grade</p>
            <p className="text-sm text-slate-700">{transaction.classGrade || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Type</p>
            <div>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isExpense ? "text-pink-600" : "text-emerald-600"}`}>
                {transaction.type === "Income" ? (
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                )}
                {transaction.type}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Category</p>
            <p className="text-sm text-slate-700">{transaction.category}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Payment Mode</p>
            <p className="text-sm text-slate-700">{transaction.paymentMode}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Amount</p>
            <p className="text-sm font-semibold text-slate-900">₹{transaction.amount.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
            <div>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                transaction.status === "Success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                transaction.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-red-50 text-red-700 border-red-200"
              }`}>
                {transaction.status}
              </span>
            </div>
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

