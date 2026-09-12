"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { X, CircleDollarSign, Plus, Trash2 } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";

interface AllowanceItem {
  id: string;
  name: string;
  type: "Fixed" | "Percentage";
  value: number;
  taxable: boolean;
}

interface AllowancesDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function AllowancesDialog({
  open,
  onClose,
  onSuccess,
}: AllowancesDialogProps) {
  const [allowances, setAllowances] = useState<AllowanceItem[]>([
    { id: "1", name: "House Rent Allowance (HRA)", type: "Percentage", value: 20, taxable: false },
    { id: "2", name: "Dearness Allowance (DA)", type: "Percentage", value: 10, taxable: true },
    { id: "3", name: "Medical Allowance", type: "Fixed", value: 2500, taxable: false },
    { id: "4", name: "Transport / Conveyance Allowance", type: "Fixed", value: 1600, taxable: false },
    { id: "5", name: "Special Allowance", type: "Percentage", value: 15, taxable: true },
  ]);

  const [newAllowance, setNewAllowance] = useState({
    name: "",
    type: "Fixed" as "Fixed" | "Percentage",
    value: "",
    taxable: true,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllowance.name || !newAllowance.value) return;
    const item: AllowanceItem = {
      id: crypto.randomUUID(),
      name: newAllowance.name,
      type: newAllowance.type,
      value: Number(newAllowance.value),
      taxable: newAllowance.taxable,
    };
    setAllowances((prev) => [...prev, item]);
    setNewAllowance({ name: "", type: "Fixed", value: "", taxable: true });
    onSuccess(`Allowance "${item.name}" added successfully.`);
  };

  const handleDelete = (id: string) => {
    setAllowances((prev) => prev.filter((a) => a.id !== id));
    onSuccess("Allowance removed.");
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <CircleDollarSign className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-slate-900">Manage Salary Allowances</h2>
        </div>
        <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleAdd} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-semibold text-slate-800">Add New Allowance Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Allowance Name</label>
              <input
                type="text"
                placeholder="e.g. Research Grant"
                value={newAllowance.name}
                onChange={(e) => setNewAllowance({ ...newAllowance, name: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Calculation Type</label>
              <Dropdown
                value={newAllowance.type}
                options={["Fixed", "Percentage"]}
                onChange={(v) => setNewAllowance({ ...newAllowance, type: v as "Fixed" | "Percentage" })}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Value (₹ or %)</label>
              <input
                type="number"
                placeholder="0.00"
                value={newAllowance.value}
                onChange={(e) => setNewAllowance({ ...newAllowance, value: e.target.value })}
                className={inputClass}
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newAllowance.taxable}
                onChange={(e) => setNewAllowance({ ...newAllowance, taxable: e.target.checked })}
                className="rounded border-slate-300 text-[#7c3aed]"
              />
              Taxable Allowance
            </label>
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Allowance
            </button>
          </div>
        </form>

        <div>
          <h3 className="text-xs font-semibold text-slate-700 mb-2">Active Salary Allowances</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Allowance Name</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5 text-right">Value</th>
                  <th className="p-2.5 text-center">Tax Status</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allowances.map((a) => (
                  <tr key={a.id}>
                    <td className="p-2.5 font-medium text-slate-900">{a.name}</td>
                    <td className="p-2.5 text-slate-500">{a.type}</td>
                    <td className="p-2.5 text-right font-semibold text-slate-900">
                      {a.type === "Percentage" ? `${a.value}%` : `₹${a.value.toLocaleString("en-IN")}`}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${a.taxable ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {a.taxable ? "Taxable" : "Exempt"}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
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
