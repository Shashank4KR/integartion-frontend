"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { X, MinusCircle, Plus, Trash2 } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";

interface DeductionItem {
  id: string;
  name: string;
  category: "Statutory" | "Voluntary" | "Penalty";
  type: "Fixed" | "Percentage";
  value: number;
}

interface DeductionsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function DeductionsDialog({
  open,
  onClose,
  onSuccess,
}: DeductionsDialogProps) {
  const [deductions, setDeductions] = useState<DeductionItem[]>([
    { id: "1", name: "Provident Fund (PF)", category: "Statutory", type: "Percentage", value: 12 },
    { id: "2", name: "Tax Deducted at Source (TDS)", category: "Statutory", type: "Percentage", value: 5 },
    { id: "3", name: "Professional Tax (PT)", category: "Statutory", type: "Fixed", value: 200 },
    { id: "4", name: "Employee State Insurance (ESI)", category: "Statutory", type: "Percentage", value: 0.75 },
    { id: "5", name: "Salary Advance / Loan Recovery", category: "Voluntary", type: "Fixed", value: 5000 },
    { id: "6", name: "Unapproved Leave / Late Penalty", category: "Penalty", type: "Fixed", value: 500 },
  ]);

  const [newDeduction, setNewDeduction] = useState({
    name: "",
    category: "Statutory" as "Statutory" | "Voluntary" | "Penalty",
    type: "Fixed" as "Fixed" | "Percentage",
    value: "",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeduction.name || !newDeduction.value) return;
    const item: DeductionItem = {
      id: crypto.randomUUID(),
      name: newDeduction.name,
      category: newDeduction.category,
      type: newDeduction.type,
      value: Number(newDeduction.value),
    };
    setDeductions((prev) => [...prev, item]);
    setNewDeduction({ name: "", category: "Statutory", type: "Fixed", value: "" });
    onSuccess(`Deduction "${item.name}" added successfully.`);
  };

  const handleDelete = (id: string) => {
    setDeductions((prev) => prev.filter((d) => d.id !== id));
    onSuccess("Deduction removed.");
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <MinusCircle className="w-5 h-5 text-pink-600" />
          <h2 className="text-base font-semibold text-slate-900">Manage Salary Deductions</h2>
        </div>
        <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleAdd} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-semibold text-slate-800">Add New Deduction Rule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-600 mb-0.5">Deduction Name</label>
              <input
                type="text"
                placeholder="e.g. Welfare Fund"
                value={newDeduction.name}
                onChange={(e) => setNewDeduction({ ...newDeduction, name: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Category</label>
              <Dropdown
                value={newDeduction.category}
                options={["Statutory", "Voluntary", "Penalty"]}
                onChange={(v) => setNewDeduction({ ...newDeduction, category: v as "Statutory" | "Voluntary" | "Penalty" })}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Type & Amount (₹ / %)</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="0.00"
                  value={newDeduction.value}
                  onChange={(e) => setNewDeduction({ ...newDeduction, value: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="w-48">
              <Dropdown
                value={newDeduction.type}
                options={["Fixed", "Percentage"]}
                onChange={(v) => setNewDeduction({ ...newDeduction, type: v as "Fixed" | "Percentage" })}
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Deduction Rule
            </button>
          </div>
        </form>

        <div>
          <h3 className="text-xs font-semibold text-slate-700 mb-2">Active Deduction Rules</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Deduction Name</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Rule / Value</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deductions.map((d) => (
                  <tr key={d.id}>
                    <td className="p-2.5 font-medium text-slate-900">{d.name}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        d.category === "Statutory" ? "bg-purple-50 text-purple-700" :
                        d.category === "Penalty" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                      }`}>
                        {d.category}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-semibold text-slate-900">
                      {d.type === "Percentage" ? `${d.value}%` : `₹${d.value.toLocaleString("en-IN")}`}
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id)}
                        className="text-slate-400 hover:text-red-600 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
