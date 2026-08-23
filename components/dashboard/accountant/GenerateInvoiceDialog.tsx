"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getToken } from "@/lib/auth";
import { generateInvoice, listFeeStructures } from "@/lib/services/financeService";
import { listStudents } from "@/lib/services/studentService";

type FeeStructureOption = {
  id: string;
  label: string;
  amount: number;
};

type StudentOption = {
  id: string;
  label: string;
};

function text(value: unknown, fallback = ""): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function num(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function GenerateInvoiceDialog({
  open,
  onClose,
  onGenerated,
}: {
  open: boolean;
  onClose: () => void;
  onGenerated: () => void;
}) {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructureOption[]>([]);
  const [studentId, setStudentId] = useState("");
  const [feeStructureId, setFeeStructureId] = useState("");
  const [amount, setAmount] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      const token = getToken();
      if (!token) {
        setError("Please log in to generate an invoice.");
        return;
      }

      setLoadingOptions(true);
      setError(null);

      try {
        const [studentRows, feeStructureRows] = await Promise.all([
          listStudents(token),
          listFeeStructures(token),
        ]);

        const studentOptions = (Array.isArray(studentRows) ? studentRows : []).map((item) => {
          const record = item as Record<string, unknown>;
          const name = [record.first_name, record.last_name].filter(Boolean).join(" ").trim();
          return {
            id: text(record.id),
            label: name || text(record.admission_no, text(record.id)),
          };
        });

        const feeOptions = (Array.isArray(feeStructureRows) ? feeStructureRows : []).map((item) => {
          const record = item as Record<string, unknown>;
          return {
            id: text(record.id),
            label: `${text(record.fee_type, "Fee")} - ${text(record.academic_year, "")}`.trim(),
            amount: num(record.amount),
          };
        });

        setStudents(studentOptions);
        setFeeStructures(feeOptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load students or fee structures.");
      } finally {
        setLoadingOptions(false);
      }
    };

    void loadOptions();
  }, [open]);

  useEffect(() => {
    if (!feeStructureId) return;
    const match = feeStructures.find((fee) => fee.id === feeStructureId);
    if (match) setAmount(String(match.amount));
  }, [feeStructureId, feeStructures]);

  const resetForm = () => {
    setStudentId("");
    setFeeStructureId("");
    setAmount("");
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const token = getToken();
    if (!token) {
      setError("Please log in to generate an invoice.");
      return;
    }
    if (!studentId || !feeStructureId || !amount || !dueDate) {
      setError("Please fill in student, fee structure, amount, and due date.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await generateInvoice(token, {
        student_id: studentId,
        fee_type_id: feeStructureId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        amount: Number(amount),
      });
      resetForm();
      onGenerated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Generate Invoice</h2>
          <button onClick={handleClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        {loadingOptions ? (
          <div className="py-6 text-center text-sm text-slate-500">Loading students and fee structures...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Student</label>
              <select
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Fee Structure</label>
              <select
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={feeStructureId}
                onChange={(e) => setFeeStructureId(e.target.value)}
              >
                <option value="">Select a fee structure</option>
                {feeStructures.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label} (INR {f.amount.toLocaleString("en-IN")})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Amount</label>
                <input
                  type="number"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Invoice Date</label>
                <input
                  type="date"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Due Date</label>
              <input
                type="date"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting ? "Generating..." : "Generate Invoice"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}