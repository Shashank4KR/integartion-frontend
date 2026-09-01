"use client";

import { useState, useEffect } from "react";
import { Paperclip, User, Users } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import { cn } from "@/lib/utils";
import { sendMessage } from "@/lib/services/communicationService";
import { getToken, getStoredUser } from "@/lib/auth";

interface NewMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onSent?: () => void;
  onSend?: () => void;
}

type MessageType = "Message" | "Email" | "SMS" | "Notification";
type RecipientType = "Student" | "Parent" | "Teacher" | "Staff" | "Class" | "Group" | "All";

export default function NewMessageDialog({
  open,
  onClose,
  onSent,
  onSend,
}: NewMessageDialogProps) {
  const [form, setForm] = useState({
    messageType: "Message" as MessageType,
    recipientType: "Student" as RecipientType,
    recipient: "",
    subject: "",
    message: "",
    attachment: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [suggestedRecipients, setSuggestedRecipients] = useState<Array<{ id: string; name: string; role?: string }>>([]);

  useEffect(() => {
    if (!open) {
      setForm({
        messageType: "Message",
        recipientType: "Student",
        recipient: "",
        subject: "",
        message: "",
        attachment: null,
      });
      setErrors({});
      setSubmitting(false);
    } else {
      const token = getToken();
      if (token) {
        fetch("/api/communication/recipients", { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => (r.ok ? r.json() : []))
          .then((recipients) => {
            if (Array.isArray(recipients) && recipients.length > 0) {
              setSuggestedRecipients(
                recipients.map((r: any) => ({
                  id: r.id,
                  name: r.display_name || `${r.username} (${r.role})`,
                  role: r.role,
                }))
              );
            } else {
              setSuggestedRecipients([
                { id: "student", name: "Student", role: "Student" },
                { id: "teacher", name: "Teacher", role: "Teacher" },
                { id: "parent", name: "Parent", role: "Parent" },
                { id: "accountant", name: "Accountant", role: "Accountant" },
                { id: "librarian", name: "Librarian", role: "Librarian" },
                { id: "warden", name: "Warden", role: "Warden" },
              ]);
            }
          })
          .catch(() => {
            setSuggestedRecipients([
              { id: "student", name: "Student", role: "Student" },
              { id: "teacher", name: "Teacher", role: "Teacher" },
              { id: "parent", name: "Parent", role: "Parent" },
              { id: "accountant", name: "Accountant", role: "Accountant" },
              { id: "librarian", name: "Librarian", role: "Librarian" },
              { id: "warden", name: "Warden", role: "Warden" },
            ]);
          });
      }
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.recipient.trim()) newErrors.recipient = "Recipient is required";
    if (!form.subject.trim()) newErrors.subject = "Subject is required";
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
        setErrors({ general: "You must be logged in to send messages." });
        setSubmitting(false);
        return;
      }

      await sendMessage(token, {
        sender_id: user.id,
        recipient_id: form.recipient,
        recipient: form.recipient,
        subject: form.subject,
        content: form.message,
        message: form.message,
        message_type: form.messageType.toUpperCase(),
      });

      if (onSent) onSent();
      if (onSend) onSend();
      onClose();
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Failed to send message." });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = cn(
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal",
    "focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-colors shadow-xs"
  );

  return (
    <Modal open={open} onClose={onClose} title="New Message" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {errors.general && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600" role="alert">
            {errors.general}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Message Type *</label>
            <Dropdown
              value={form.messageType}
              options={["Message", "Email", "SMS", "Notification"]}
              onChange={(v) => setForm({ ...form, messageType: v as MessageType })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient Type *</label>
            <Dropdown
              value={form.recipientType}
              options={["Student", "Parent", "Teacher", "Staff", "Class", "Group", "All"]}
              onChange={(v) => {
                setForm({ ...form, recipientType: v as RecipientType, recipient: v === "All" ? "All" : form.recipient });
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient *</label>
            <input
              type="text"
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              className={inputClass}
              placeholder="Enter name, email, or select from below"
            />
            {suggestedRecipients.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Quick pick:
                </span>
                {suggestedRecipients.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm({ ...form, recipient: s.name })}
                    className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium transition cursor-pointer border border-purple-200/60"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            {errors.recipient && <p className="text-xs font-medium text-red-500 mt-1">{errors.recipient}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className={inputClass}
              placeholder="Enter subject"
            />
            {errors.subject && <p className="text-xs font-medium text-red-500 mt-1">{errors.subject}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={inputClass}
              placeholder="Type your message..."
              rows={4}
            />
            {errors.message && <p className="text-xs font-medium text-red-500 mt-1">{errors.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Attachment</label>
            <label className="flex items-center gap-2 px-3.5 py-2.5 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
              <Paperclip className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600 truncate">{form.attachment ? form.attachment.name : "Choose file"}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm({ ...form, attachment: file });
                }}
              />
            </label>
          </div>
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
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
