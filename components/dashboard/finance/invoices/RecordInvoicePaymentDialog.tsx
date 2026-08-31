"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, CreditCard, Banknote, Building2, Receipt, FileText } from "lucide-react";
import Modal from "@/components/shared/Modal";
import type { InvoiceRow } from "@/lib/fixtures/invoices-reference-fixture";

const PAYMENT_TYPE_OPTIONS = [
  "Online UPI / QR",
  "Cash",
  "Debit / Credit Card",
  "Net Banking / NEFT / RTGS",
  "Cheque / Demand Draft",
  "Bank Deposit / Direct Transfer",
  "Scholarship / Concession",
  "Other Payment Method",
];

interface RecordInvoicePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: InvoiceRow | null;
  onPaymentRecorded: (
    updated: InvoiceRow,
    paymentData?: {
      amountPaid: number;
      paymentType: string;
      paymentDetails: string;
      paymentDate: string;
    }
  ) => void;
}

export default function RecordInvoicePaymentDialog({
  open,
  onClose,
  invoice,
  onPaymentRecorded,
}: RecordInvoicePaymentDialogProps) {
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentType, setPaymentType] = useState("Online UPI / QR");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentDetails, setPaymentDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoice && open) {
      setAmountPaid(String(invoice.balance > 0 ? invoice.balance : invoice.amount));
      setPaymentType("Online UPI / QR");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentDetails(`TXN-${Math.floor(100000 + Math.random() * 900000)} | Paid by Parent`);
      setError(null);
    }
  }, [invoice, open]);

  const numPayment = parseFloat(amountPaid) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    if (numPayment <= 0) {
      setError("Payment amount must be greater than ₹0.");
      return;
    }
    if (numPayment > invoice.balance && invoice.balance > 0) {
      setError(`Payment amount cannot exceed outstanding balance of ₹${invoice.balance.toLocaleString("en-IN")}.`);
      return;
    }

    try {
      setSubmitting(true);
      const newPaid = invoice.paid + numPayment;
      const newBalance = Math.max(0, invoice.amount - newPaid);
      const newStatus = newBalance === 0 ? "Paid" : "Partial";

      const updatedInvoice: InvoiceRow = {
        ...invoice,
        paid: newPaid,
        balance: newBalance,
        status: newStatus,
      };

      onPaymentRecorded(updatedInvoice, {
        amountPaid: numPayment,
        paymentType,
        paymentDetails,
        paymentDate,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Record Fee Payment — ${invoice.invoiceNo}`} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Invoice Summary */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Invoice Total</p>
            <p className="text-sm font-bold text-slate-800">₹ {invoice.amount.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Already Paid</p>
            <p className="text-sm font-bold text-emerald-600">₹ {invoice.paid.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Balance Due</p>
            <p className="text-sm font-bold text-amber-600">₹ {invoice.balance.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Amount to Pay */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Amount to Collect (₹)
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              required
            />
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              required
            />
          </div>

          {/* Type of Payment (Select Option) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Type of Payment
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              {PAYMENT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Details (Text Field) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Payment Details & Reference (Text)
          </label>
          <textarea
            rows={2}
            value={paymentDetails}
            onChange={(e) => setPaymentDetails(e.target.value)}
            placeholder="e.g., UPI Ref: 9876543210 / Bank Name: HDFC Bank / Cheque No: 440210 / Paid by Father"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Enter transaction reference number, bank name, cheque number, or payer details.
          </p>
        </div>

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
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {submitting ? "Recording…" : `Collect ₹${numPayment.toLocaleString("en-IN")}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
