"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import { cn } from "@/lib/utils";
import { createAnnouncement } from "@/lib/services/communicationService";
import { getToken, getStoredUser } from "@/lib/auth";

interface CreateAnnouncementDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAnnouncementDialog({
  open,
  onClose,
  onCreated,
}: CreateAnnouncementDialogProps) {
  const [form, setForm] = useState({
    title: "",
    audience: "ALL",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({
        title: "",
        audience: "ALL",
        message: "",
      });
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.message.trim()) newErrors.message = "Message is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const user = getStoredUser();
      if (!token || !user) {
        setErrors({ general: "You must be logged in to create announcements." });
        setSubmitting(false);
        return;
      }

      await createAnnouncement(token, {
        title: form.title,
        message: form.message,
        target_audience: form.audience,
        created_by: user.id,
      });

      onCreated();
      onClose();
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Failed to create announcement." });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = cn(
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal",
    "focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-colors shadow-xs"
  );

  const audienceOptions = [
    { label: "All Students & Parents", value: "ALL" },
    { label: "Students Only", value: "STUDENTS" },
    { label: "Parents Only", value: "PARENTS" },
    { label: "Staff Only", value: "TEACHERS" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Create Announcement" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {errors.general && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600" role="alert">
            {errors.general}
          </p>
        )}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            placeholder="Announcement title"
          />
          {errors.title && <p className="text-xs font-medium text-red-500 mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Audience</label>
          <Dropdown
            value={form.audience}
            items={audienceOptions}
            onChange={(v) => setForm({ ...form, audience: v })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Message / Content *</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={inputClass}
            placeholder="Type your announcement message..."
            rows={5}
          />
          {errors.message && <p className="text-xs font-medium text-red-500 mt-1">{errors.message}</p>}
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9] shadow-md shadow-purple-600/20 transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish Announcement"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
