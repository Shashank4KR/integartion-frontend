"use client";

import { X, Calendar } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Badge from "@/components/shared/Badge";
import type { Expense } from "@/lib/fixtures/expenses-management-reference-fixture";

interface ExpenseDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export default function ExpenseDetailsDialog({ open, onClose, expense }: ExpenseDetailsDialogProps) {
  if (!expense) return null;

  const getStatusBadge = (status: string) => {
    if (status === "Approved") return <Badge variant="success">Approved</Badge>;
    if (status === "Pending") return <Badge variant="warning">Pending</Badge>;
    if (status === "Rejected") return <Badge variant="error">Rejected</Badge>;
    return <Badge>{status}</Badge>;
  };

  return (
    <Modal open={open} onClose={onClose} title="Expense Details" maxWidth="max-w-lg">
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <DetailField label="Expense ID" value={expense.expenseId} />
          <DetailField label="Expense Name" value={expense.expenseName} />
          <DetailField label="Category" value={expense.category} />
          <DetailField label="Department" value={expense.department} />
          <DetailField label="Amount" value={`₹ ${expense.amount.toLocaleString("en-IN")}`} />
          <DetailField label="Payment Mode" value={expense.paymentMode} />
          <DetailField label="Expense Date" value={expense.expenseDate} />
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
            <div>{getStatusBadge(expense.status)}</div>
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

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}

