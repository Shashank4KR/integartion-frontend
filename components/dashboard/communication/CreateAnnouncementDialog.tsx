"use client";

import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";
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
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm",
    "focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
  );

  const audienceOptions = [
    { label: "All Students & Parents", value: "ALL" },
    { label: "Students Only", value: "STUDENTS" },
    { label: "Parents Only", value: "PARENTS" },
    { label: "Staff Only", value: "TEACHERS" },
  ];

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-purple-600" />
          Create Announcement
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {errors.general && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600" role="alert">
            {errors.general}
          </p>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            placeholder="Announcement title"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Audience</label>
          <Dropdown
            value={form.audience}
            items={audienceOptions}
            onChange={(val) => setForm({ ...form, audience: val })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message *</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={inputClass}
            placeholder="Type your announcement message..."
            rows={5}
          />
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
