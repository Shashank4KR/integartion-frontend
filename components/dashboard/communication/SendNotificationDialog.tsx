"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import { cn } from "@/lib/utils";

import CalendarPicker from "@/components/shared/Calendar";
import { sendNotification } from "@/lib/services/communicationService";
import { getToken } from "@/lib/auth";

interface SendNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
}

type Priority = "Normal" | "High" | "Urgent";
type DeliveryChannel = "In-App" | "Email" | "SMS";

export default function SendNotificationDialog({ open, onClose, onSend }: SendNotificationDialogProps) {
  const [form, setForm] = useState({
    title: "",
    audience: "All",
    message: "",
    priority: "Normal" as Priority,
    scheduleDate: "",
    scheduleTime: "",
    deliveryChannel: "In-App" as DeliveryChannel,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({
        title: "",
        audience: "All",
        message: "",
        priority: "Normal",
        scheduleDate: "",
        scheduleTime: "",
        deliveryChannel: "In-App",
      });
      setErrors({});
      setCalendarOpen(false);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      if (!token) {
        setErrors({ general: "You must be logged in to send notifications." });
        setSubmitting(false);
        return;
      }

      const payload: any = {
        title: form.title,
        message: form.message,
        audience: form.audience,
        is_read: false,
      };

      if (form.scheduleDate) {
        const timeStr = form.scheduleTime || "00:00";
        payload.sent_on = new Date(`${form.scheduleDate}T${timeStr}`).toISOString();
      }

      await sendNotification(token, payload);
      onSend();
      onClose();
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Failed to send notification." });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = cn(
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal",
    "focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-colors shadow-xs"
  );

  return (
    <Modal open={open} onClose={onClose} title="Send Notification" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {errors.general && (
          <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600" role="alert">
            {errors.general}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Notification title"
            />
            {errors.title && <p className="text-xs font-medium text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Audience</label>
            <Dropdown
              value={form.audience}
              options={["All", "Students", "Parents", "Teachers", "Staff"]}
              onChange={(v) => setForm({ ...form, audience: v })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={inputClass}
              placeholder="Type your notification message..."
              rows={4}
            />
            {errors.message && <p className="text-xs font-medium text-red-500 mt-1">{errors.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
            <Dropdown
              value={form.priority}
              options={["Normal", "High", "Urgent"]}
              onChange={(v) => setForm({ ...form, priority: v as Priority })}
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Schedule Date</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={form.scheduleDate}
                onClick={() => setCalendarOpen((o) => !o)}
                className={cn(inputClass, "cursor-pointer")}
                placeholder="Select date"
              />
              <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            {calendarOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                <CalendarPicker
                  selectedDate={form.scheduleDate ? new Date(form.scheduleDate) : undefined}
                  onSelect={(d) => {
                    setForm({ ...form, scheduleDate: d.toISOString().split("T")[0] });
                    setCalendarOpen(false);
                  }}
                />
              </div>
            )}
            {errors.scheduleDate && <p className="text-xs font-medium text-red-500 mt-1">{errors.scheduleDate}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Schedule Time</label>
            <div className="relative">
              <input
                type="time"
                value={form.scheduleTime}
                onChange={(e) => setForm({ ...form, scheduleTime: e.target.value })}
                className={inputClass}
              />
              <Clock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery Channel</label>
            <Dropdown
              value={form.deliveryChannel}
              options={["In-App", "Email", "SMS"]}
              onChange={(v) => setForm({ ...form, deliveryChannel: v as DeliveryChannel })}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-4">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => {
              if (!form.scheduleDate) {
                setErrors({ scheduleDate: "Please select a date to schedule." });
                return;
              }
              void handleSubmit(e);
            }}
            className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition cursor-pointer disabled:opacity-50"
          >
            Schedule
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9] shadow-md shadow-purple-600/20 transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Now"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
