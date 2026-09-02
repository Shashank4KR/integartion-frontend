"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";

interface RouteScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    route: string;
    driver: string;
    pickupTime: string;
    dropTime: string;
    date: string;
  }) => void;
  routeOptions?: string[];
  driverOptions?: string[];
}

export default function RouteScheduleDialog({
  open,
  onClose,
  onSave,
  routeOptions = [],
  driverOptions = [],
}: RouteScheduleDialogProps) {
  const [route, setRoute] = useState("");
  const [driver, setDriver] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropTime, setDropTime] = useState("");
  const [date, setDate] = useState("");

  const availableRoutes = routeOptions.length > 0 ? routeOptions : ["No routes registered"];
  const availableDrivers = driverOptions.length > 0 ? driverOptions : ["No drivers registered"];

  const handleSave = () => {
    if (!route || !driver || !pickupTime || !dropTime || !date) return;
    onSave({ route, driver, pickupTime, dropTime, date });
    setRoute("");
    setDriver("");
    setPickupTime("");
    setDropTime("");
    setDate("");
    onClose();
  };

  const handleClose = () => {
    setRoute("");
    setDriver("");
    setPickupTime("");
    setDropTime("");
    setDate("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Route Schedule" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Route</label>
          <Dropdown
            value={route}
            options={availableRoutes}
            onChange={setRoute}
            placeholder="Select route"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Driver</label>
          <Dropdown
            value={driver}
            options={availableDrivers}
            onChange={setDriver}
            placeholder="Select driver"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Pickup Time</label>
            <Input
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              placeholder="e.g. 07:30 AM"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Drop Time</label>
            <Input
              value={dropTime}
              onChange={(e) => setDropTime(e.target.value)}
              placeholder="e.g. 03:30 PM"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
          <Input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="DD/MM/YYYY"
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
            Save Schedule
          </Button>
        </div>
      </div>
    </Modal>
  );
}
