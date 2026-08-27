"use client";

import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";

interface FeesActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function FeesActionDialog({ open, onClose, title, message }: FeesActionDialogProps) {
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
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

