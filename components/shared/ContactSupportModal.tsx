"use client";

import { useState } from "react";
import { Mail, Phone, MessageSquare, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import Modal from "@/components/shared/Modal";

interface ContactSupportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactSupportModal({ open, onClose }: ContactSupportModalProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Support");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const generatedId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(generatedId);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubject("");
    setCategory("General Support");
    setMessage("");
    setSubmitted(false);
    setTicketId("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleReset} title="Campus Support Desk" maxWidth="max-w-xl">
      {submitted ? (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Support Ticket Created</h4>
            <p className="text-xs text-slate-500 mt-1">
              Ticket ID: <span className="font-mono font-bold text-purple-600">{ticketId}</span>
            </p>
          </div>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Our campus technical and administrative support team has received your inquiry and will respond within 2-4 business hours.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg bg-[#7c3aed] px-5 py-2 text-sm font-medium text-white shadow hover:bg-[#6d28d9] transition"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Quick contact channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="p-2 rounded-lg bg-purple-100 text-[#7c3aed]">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="text-slate-500 font-medium">Email Desk</p>
                <p className="text-slate-900 font-semibold">support@campus.edu</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="text-slate-500 font-medium">Toll Free Helpline</p>
                <p className="text-slate-900 font-semibold">+91 1800-425-CAMPUS</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                >
                  <option value="General Support">General Support</option>
                  <option value="Hostel & Mess">Hostel & Mess</option>
                  <option value="Academics & Attendance">Academics & Attendance</option>
                  <option value="Fee & Finance">Fee & Finance</option>
                  <option value="System & Access Issue">System & Access Issue</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of your issue"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message / Details</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe how we can assist you..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Response time: ~2 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#7c3aed] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#6d28d9] transition"
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
