"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { X, Settings, Save } from "lucide-react";

interface TaxSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function TaxSettingsDialog({
  open,
  onClose,
  onSuccess,
}: TaxSettingsDialogProps) {
  const [taxSettings, setTaxSettings] = useState({
    tdsRate: 5,
    pfEmployeeRate: 12,
    pfEmployerRate: 12,
    esiRate: 0.75,
    professionalTax: 200,
    taxExemptionLimit: 300000,
  });

  const handleSave = () => {
    onSuccess("Tax & Statutory deduction settings updated successfully.");
    onClose();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-900">Tax & Deduction Settings</h2>
        </div>
        <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-800 border-b border-slate-100 pb-1">Income Tax & TDS Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Standard TDS Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxSettings.tdsRate}
                onChange={(e) => setTaxSettings({ ...taxSettings, tdsRate: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Tax Exemption Limit (₹ / year)</label>
              <input
                type="number"
                value={taxSettings.taxExemptionLimit}
                onChange={(e) => setTaxSettings({ ...taxSettings, taxExemptionLimit: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          <h3 className="text-xs font-semibold text-slate-800 border-b border-slate-100 pb-1 pt-2">Provident Fund (PF) & ESI Rates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Employee PF Contribution (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxSettings.pfEmployeeRate}
                onChange={(e) => setTaxSettings({ ...taxSettings, pfEmployeeRate: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Employer PF Contribution (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxSettings.pfEmployerRate}
                onChange={(e) => setTaxSettings({ ...taxSettings, pfEmployerRate: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">ESI Contribution (%)</label>
              <input
                type="number"
                step="0.05"
                value={taxSettings.esiRate}
                onChange={(e) => setTaxSettings({ ...taxSettings, esiRate: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Monthly Professional Tax (₹)</label>
              <input
                type="number"
                value={taxSettings.professionalTax}
                onChange={(e) => setTaxSettings({ ...taxSettings, professionalTax: Number(e.target.value) })}
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
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <Save className="w-4 h-4" /> Save Tax Settings
          </button>
        </div>
      </div>
    </Modal>
  );
}
