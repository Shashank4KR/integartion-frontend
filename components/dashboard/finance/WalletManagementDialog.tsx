"use client";

import { useState } from "react";
import { X, Wallet, PlusCircle, MinusCircle, ArrowRight } from "lucide-react";

interface WalletManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onWalletUpdate: (data: { studentName: string; type: "credit" | "debit"; amount: number; purpose: string }) => void;
}

export default function WalletManagementDialog({
  open,
  onClose,
  onWalletUpdate,
}: WalletManagementDialogProps) {
  const [studentName, setStudentName] = useState("");
  const [actionType, setActionType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("Canteen / Cafeteria Top-up");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      onWalletUpdate({
        studentName: studentName || "Student",
        type: actionType,
        amount: num,
        purpose,
      });
      setIsProcessing(false);
      onClose();
      setStudentName("");
      setAmount("");
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Wallet Management</h3>
              <p className="text-xs text-slate-500">Credit or debit student digital campus wallets</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => setActionType("credit")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
                actionType === "credit"
                  ? "bg-white text-emerald-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Add / Top-up Funds
            </button>
            <button
              type="button"
              onClick={() => setActionType("debit")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
                actionType === "debit"
                  ? "bg-white text-red-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <MinusCircle className="h-4 w-4" />
              Debit / Charge Wallet
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Student Name or Admission No. *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rohan Verma (ADM-2026-081)"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 2000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Purpose / Category
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Canteen / Cafeteria Top-up</option>
              <option>Library Fine / Book Purchase</option>
              <option>Stationery & Bookstore</option>
              <option>Uniform & Supplies</option>
              <option>Laundry / Hostel Service</option>
              <option>General Wallet Adjustment</option>
            </select>
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
              disabled={isProcessing}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${
                actionType === "credit"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isProcessing
                ? "Updating..."
                : actionType === "credit"
                ? "Credit Wallet"
                : "Debit Wallet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
