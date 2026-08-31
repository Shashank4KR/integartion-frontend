"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import DatePicker from "@/components/shared/DatePicker";
import { returnBookIssue } from "@/lib/services/libraryService";
import type { BookIssueResponse } from "@/types/entities/library";
import { BookCheck, Loader2 } from "lucide-react";

interface ReturnBookDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  issue: BookIssueResponse | null;
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ReturnBookDialog({
  open,
  onClose,
  onSuccess,
  token,
  issue,
}: ReturnBookDialogProps) {
  const [returnDate, setReturnDate] = useState<string>(() => formatDate(new Date()));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!issue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await returnBookIssue(token, issue.id, returnDate || undefined);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to return book.");
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = issue.due_date && returnDate && returnDate > issue.due_date;

  return (
    <Modal open={open} onClose={onClose} title="Return Book" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 text-xs">Book:</span>
            <span className="font-semibold text-slate-900">{issue.book_title || "Untitled Book"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-xs">Borrower:</span>
            <span className="font-medium text-slate-900">{issue.student_name || "Unknown Student"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-xs">Issue Date:</span>
            <span className="text-slate-700">{issue.issue_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-xs">Due Date:</span>
            <span className="text-slate-700">{issue.due_date}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Return Date <span className="text-red-500">*</span>
          </label>
          <DatePicker value={returnDate} onChange={setReturnDate} />
        </div>

        {isOverdue && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            ⚠️ This book is being returned past the due date ({issue.due_date}). Overdue fines may apply according to library policy.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Return...
              </>
            ) : (
              <>
                <BookCheck className="h-4 w-4" />
                Confirm Return
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
