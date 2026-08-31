"use client";

import { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Clock, FileText, Check } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import type { InvoiceRow } from "@/lib/fixtures/invoices-reference-fixture";

interface EditInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: InvoiceRow | null;
  onSave: (updated: InvoiceRow) => void;
}

export default function EditInvoiceDialog({
  open,
  onClose,
  invoice,
  onSave,
}: EditInvoiceDialogProps) {
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [status, setStatus] = useState<"Paid" | "Partial" | "Overdue" | "Pending">("Pending");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoice && open) {
      setDueDate(invoice.dueDate || "");
      setAmount(String(invoice.amount || 0));
      setPaid(String(invoice.paid || 0));
      setStatus((invoice.status as any) || "Pending");
      setNotes("");
      setError(null);
    }
  }, [invoice, open]);

  const numAmount = parseFloat(amount) || 0;
  const numPaid = parseFloat(paid) || 0;
  const balance = Math.max(0, numAmount - numPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    if (!dueDate) {
      setError("Please specify a valid due date for later payment.");
      return;
    }
    if (numAmount <= 0) {
      setError("Invoice amount must be greater than 0.");
      return;
    }
    if (numPaid > numAmount) {
      setError("Paid amount cannot exceed total invoice amount.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Auto-compute status if balance is 0 or partial
      let computedStatus = status;
      if (balance === 0 && numPaid > 0) {
        computedStatus = "Paid";
      } else if (numPaid > 0 && balance > 0) {
        computedStatus = "Partial";
      } else if (new Date(dueDate) < new Date() && balance > 0) {
        computedStatus = "Overdue";
      }

      const updatedInvoice: InvoiceRow = {
        ...invoice,
        dueDate,
        amount: numAmount,
        paid: numPaid,
        balance,
        status: computedStatus,
      };

      onSave(updatedInvoice);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update invoice.");
    } finally {
      setSaving(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Edit Invoice — ${invoice.invoiceNo}`} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Info Banner */}
        <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">Invoice Target</p>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{invoice.studentName}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{invoice.studentId} • Class {invoice.classGrade}</p>
            </div>
            <span className="rounded-md bg-purple-200/60 px-2.5 py-1 text-xs font-semibold text-purple-900">
              {invoice.invoiceType}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Due Date (Payment Deadline)
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Set a later date to allow extended payment window.</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              <option value="Pending">Pending (Unpaid / Awaiting Later Payment)</option>
              <option value="Partial">Partial (Partially Paid)</option>
              <option value="Paid">Paid (Fully Cleared)</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Total Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              required
            />
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Paid So Far (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        {/* Calculated Balance Box */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3.5">
          <span className="text-xs font-semibold text-slate-600">Remaining Balance for Later Payment:</span>
          <span className={`text-base font-bold ${balance > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            ₹ {balance.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Remarks / Reason for Extension */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Remarks / Deferred Payment Agreement
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Parent requested payment extension until next salary cycle on 15th."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6d28d9] transition disabled:opacity-50"
          >
            {saving ? "Saving Changes…" : "Save Invoice Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
