"use client";

import { useState } from "react";
import { X, ArrowLeftRight, Copy, Check, Share2, Send } from "lucide-react";

interface PaymentLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onSendLink: (data: { studentName: string; amount: number; purpose: string; link: string }) => void;
}

export default function PaymentLinkDialog({
  open,
  onClose,
  onSendLink,
}: PaymentLinkDialogProps) {
  const [studentName, setStudentName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("Tuition Fee");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    const link = `https://pay.edtech.edu/inv/${token}?amt=${amount || 1000}&name=${encodeURIComponent(studentName || "Student")}`;
    setGeneratedLink(link);
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    onSendLink({
      studentName: studentName || "Student",
      amount: parseFloat(amount) || 0,
      purpose,
      link: generatedLink,
    });
    onClose();
    setGeneratedLink("");
    setStudentName("");
    setAmount("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Generate Payment Link</h3>
              <p className="text-xs text-slate-500">Create instant shareable link for fee collection</p>
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

        <form onSubmit={handleGenerate} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Student / Parent Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Diya Patel"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Fee Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>Tuition Fee</option>
                <option>Examination Fee</option>
                <option>Transport Fee</option>
                <option>Hostel Fee</option>
                <option>Activity / Sports Fee</option>
                <option>Miscellaneous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Recipient Phone / Email (Optional)
            </label>
            <input
              type="text"
              placeholder="+91 98765 43210 or parent@example.com"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Generate Link
          </button>
        </form>

        {generatedLink && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4 animate-in fade-in">
            <label className="mb-1 block text-xs font-semibold text-blue-900">
              Shareable Payment URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs text-slate-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-blue-100 text-xs">
              <span className="text-slate-600">UPI, NetBanking & Cards enabled</span>
              <button
                type="button"
                onClick={handleSend}
                className="flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800"
              >
                <Send className="h-3.5 w-3.5" />
                Send via SMS/Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
