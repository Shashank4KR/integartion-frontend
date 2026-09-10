"use client";

import { useState } from "react";
import { X, Send, Mail, MessageSquare, Bell, CheckCircle2 } from "lucide-react";

interface SendRemindersDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (data: {
    audience: string;
    channels: string[];
    message: string;
  }) => void;
}

export default function SendRemindersDialog({
  open,
  onClose,
  onSend,
}: SendRemindersDialogProps) {
  const [audience, setAudience] = useState("All Students with Outstanding Fees");
  const [emailChannel, setEmailChannel] = useState(true);
  const [smsChannel, setSmsChannel] = useState(true);
  const [whatsappChannel, setWhatsappChannel] = useState(false);
  const [customMessage, setCustomMessage] = useState(
    "Dear Parent/Guardian, this is a gentle reminder regarding the pending fee payment for the current academic session. Kindly clear the dues by the 15th of this month to avoid late fees. Thank you."
  );
  const [isSending, setIsSending] = useState(false);

  if (!open) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const channels: string[] = [];
    if (emailChannel) channels.push("Email");
    if (smsChannel) channels.push("SMS");
    if (whatsappChannel) channels.push("WhatsApp");

    setIsSending(true);
    setTimeout(() => {
      onSend({
        audience,
        channels: channels.length > 0 ? channels : ["Email"],
        message: customMessage,
      });
      setIsSending(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Send Fee Reminders</h3>
              <p className="text-xs text-slate-500">Notify parents & students regarding pending dues</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Target Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option>All Students with Outstanding Fees</option>
              <option>Overdue &gt; 30 Days Only</option>
              <option>Current Term Installment Only</option>
              <option>Bus / Transport Fee Pending Only</option>
              <option>Hostel Fee Pending Only</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Dispatch Channels
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailChannel}
                  onChange={(e) => setEmailChannel(e.target.checked)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                Email
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsChannel}
                  onChange={(e) => setSmsChannel(e.target.checked)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                SMS
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappChannel}
                  onChange={(e) => setWhatsappChannel(e.target.checked)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <Bell className="h-3.5 w-3.5 text-slate-500" />
                WhatsApp
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Reminder Message
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="rounded-xl bg-orange-50 p-3 text-xs text-orange-800">
            <span className="font-semibold">Notice:</span> Individual payment link will be appended automatically to each recipient&apos;s message.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSending ? "Broadcasting..." : "Broadcast Reminders"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
