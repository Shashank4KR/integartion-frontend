"use client";

import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";

interface ExpenseActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  showConfirm?: boolean;
  destructive?: boolean;
}

export default function ExpenseActionDialog({
  open,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "Confirm",
  showConfirm = true,
  destructive = false,
}: ExpenseActionDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4 pt-2">
        <p className="text-sm text-slate-600">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          {showConfirm && (
            <button
              type="button"
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                destructive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#7c3aed] hover:brightness-110"
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

