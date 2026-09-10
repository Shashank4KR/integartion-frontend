"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { X, Building2, Save } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";

const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Office Manager",
  "Accountant",
  "Librarian",
  "Technician",
];

interface SalaryStructureDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function SalaryStructureDialog({
  open,
  onClose,
  onSuccess,
}: SalaryStructureDialogProps) {
  const [selectedDesignation, setSelectedDesignation] = useState(DESIGNATIONS[0]);
  const [components, setComponents] = useState({
    basicPayPct: 50,
    hraPct: 20,
    daPct: 10,
    specialAllowancePct: 15,
    pfDeductionPct: 12,
    tdsPct: 5,
  });

  const handleSave = () => {
    onSuccess(`Salary structure for ${selectedDesignation} saved successfully.`);
    onClose();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-slate-900">Salary Structure Configuration</h2>
        </div>
        <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Select Designation / Role</label>
          <Dropdown
            value={selectedDesignation}
            options={DESIGNATIONS}
            onChange={setSelectedDesignation}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-800 border-b border-slate-100 pb-1">Earnings Components (% of Gross Salary)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Basic Pay (%)</label>
              <input
                type="number"
                value={components.basicPayPct}
                onChange={(e) => setComponents({ ...components, basicPayPct: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">House Rent Allowance - HRA (%)</label>
              <input
                type="number"
                value={components.hraPct}
                onChange={(e) => setComponents({ ...components, hraPct: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Dearness Allowance - DA (%)</label>
              <input
                type="number"
                value={components.daPct}
                onChange={(e) => setComponents({ ...components, daPct: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Special Allowance (%)</label>
              <input
                type="number"
                value={components.specialAllowancePct}
                onChange={(e) => setComponents({ ...components, specialAllowancePct: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          <h3 className="text-xs font-semibold text-slate-800 border-b border-slate-100 pb-1 pt-2">Statutory Deductions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Provident Fund - PF (%)</label>
              <input
                type="number"
                value={components.pfDeductionPct}
                onChange={(e) => setComponents({ ...components, pfDeductionPct: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Tax Deducted at Source - TDS (%)</label>
              <input
                type="number"
                value={components.tdsPct}
                onChange={(e) => setComponents({ ...components, tdsPct: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition"
          >
            <Save className="w-4 h-4" /> Save Structure
          </button>
        </div>
      </div>
    </Modal>
  );
}
