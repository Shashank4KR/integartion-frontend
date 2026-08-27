"use client";

import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";

interface TransactionActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function TransactionActionDialog({ open, onClose, title, message, onConfirm }: TransactionActionDialogProps) {
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
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold transition"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}

