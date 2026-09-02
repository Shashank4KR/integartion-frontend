"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface AddDriverDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    driver_name: string;
    license_number: string;
    phone?: string;
    experience?: number;
    bus_id?: string;
    status: string;
  }) => Promise<void> | void;
  vehicles?: Array<{ id: string; bus_number: string; model: string }>;
}

export default function AddDriverDialog({
  open,
  onClose,
  onSave,
  vehicles = [],
}: AddDriverDialogProps) {
  const [driverName, setDriverName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [busId, setBusId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setDriverName("");
    setLicenseNumber("");
    setPhone("");
    setExperience("");
    setBusId("");
    setStatus("ACTIVE");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) {
      setError("Driver name is required.");
      return;
    }
    if (!licenseNumber.trim()) {
      setError("License number is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        driver_name: driverName.trim(),
        license_number: licenseNumber.trim(),
        phone: phone.trim() || undefined,
        experience: experience ? parseInt(experience, 10) : undefined,
        bus_id: busId || undefined,
        status,
      });
      handleReset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add driver.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add New Driver" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Driver Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            className="w-full text-sm"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Driving License Number <span className="text-red-500">*</span>
          </label>
          <Input
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="e.g. DL-0420110023456"
            className="w-full text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Phone Number
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Experience (Years)
            </label>
            <Input
              type="number"
              min="0"
              max="50"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 5"
              className="w-full text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Assigned Vehicle
            </label>
            <select
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            >
              <option value="">No vehicle assigned</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.bus_number} ({v.model})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="ON_LEAVE">ON LEAVE</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Driver
          </Button>
        </div>
      </form>
    </Modal>
  );
}
