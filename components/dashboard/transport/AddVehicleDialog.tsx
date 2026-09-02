"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/shared/Dropdown";
import { Input } from "@/components/ui/input";

const VEHICLE_TYPE_OPTIONS = ["Bus", "Van", "Mini Bus", "Car"];
const VEHICLE_STATUS_OPTIONS = ["Active", "Maintenance", "Inactive"];

interface AddVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (vehicle: {
    vehicleNo: string;
    vehicleType: string;
    capacity: string;
    route: string;
    driver: string;
    status: string;
    insuranceExpiry: string;
    registrationExpiry: string;
    notes: string;
  }) => void;
  driverOptions?: string[];
  routeOptions?: string[];
}

export default function AddVehicleDialog({
  open,
  onClose,
  onSave,
  driverOptions = [],
  routeOptions = [],
}: AddVehicleDialogProps) {
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [route, setRoute] = useState("");
  const [driver, setDriver] = useState("");
  const [status, setStatus] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [registrationExpiry, setRegistrationExpiry] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!vehicleNo || !vehicleType || !capacity || !status) return;
    onSave({
      vehicleNo,
      vehicleType,
      capacity,
      route,
      driver,
      status,
      insuranceExpiry,
      registrationExpiry,
      notes,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setVehicleNo("");
    setVehicleType("");
    setCapacity("");
    setRoute("");
    setDriver("");
    setStatus("");
    setInsuranceExpiry("");
    setRegistrationExpiry("");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Vehicle" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Vehicle Number</label>
            <Input
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              placeholder="e.g. KA-05-AB-1234"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Vehicle Type</label>
            <Dropdown
              value={vehicleType}
              options={VEHICLE_TYPE_OPTIONS}
              onChange={setVehicleType}
              placeholder="Select type"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Capacity</label>
            <Input
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 40"
              type="number"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Route</label>
            <Dropdown
              value={route}
              options={routeOptions.length > 0 ? routeOptions : ["No routes registered"]}
              onChange={setRoute}
              placeholder="Select route"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Driver</label>
            <Dropdown
              value={driver}
              options={driverOptions.length > 0 ? driverOptions : ["No drivers registered"]}
              onChange={setDriver}
              placeholder="Select driver"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
            <Dropdown
              value={status}
              options={VEHICLE_STATUS_OPTIONS}
              onChange={setStatus}
              placeholder="Select status"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Insurance Expiry</label>
            <Input
              value={insuranceExpiry}
              onChange={(e) => setInsuranceExpiry(e.target.value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Registration Expiry</label>
            <Input
              value={registrationExpiry}
              onChange={(e) => setRegistrationExpiry(e.target.value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed]"
            rows={3}
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <Button
            onClick={handleSave}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Save Vehicle
          </Button>
        </div>
      </div>
    </Modal>
  );
}
