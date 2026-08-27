"use client";

import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";

interface InvoiceActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  destructive?: boolean;
}

export default function InvoiceActionDialog({
  open,
  onClose,
  title,
  message,
  onConfirm,
  confirmLabel = "Confirm",
  destructive = false,
}: InvoiceActionDialogProps) {
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
          {onConfirm && (
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                destructive ? "bg-red-600 hover:bg-red-700" : "bg-[#7c3aed] hover:bg-[#6d28d9]"
              }`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

