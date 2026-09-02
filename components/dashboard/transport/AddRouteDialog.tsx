"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";

const ROUTE_COLORS = [
  { label: "Green", value: "#10b981" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Yellow", value: "#eab308" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
];

const STATUS_OPTIONS = ["Active", "Inactive"];

interface AddRouteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (route: {
    routeName: string;
    routeColor: string;
    startingPoint: string;
    destination: string;
    stops: string;
    assignedVehicle: string;
    assignedDriver: string;
    pickupTime: string;
    dropTime: string;
    status: string;
  }) => void;
  vehicleOptions?: string[];
  driverOptions?: string[];
}

export default function AddRouteDialog({
  open,
  onClose,
  onSave,
  vehicleOptions = [],
  driverOptions = [],
}: AddRouteDialogProps) {
  const [routeName, setRouteName] = useState("");
  const [routeColor, setRouteColor] = useState("");
  const [startingPoint, setStartingPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState("");
  const [assignedVehicle, setAssignedVehicle] = useState("");
  const [assignedDriver, setAssignedDriver] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropTime, setDropTime] = useState("");
  const [status, setStatus] = useState("");

  const handleSave = () => {
    if (!routeName || !startingPoint || !destination || !status) return;
    onSave({
      routeName,
      routeColor,
      startingPoint,
      destination,
      stops,
      assignedVehicle,
      assignedDriver,
      pickupTime,
      dropTime,
      status,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setRouteName("");
    setRouteColor("");
    setStartingPoint("");
    setDestination("");
    setStops("");
    setAssignedVehicle("");
    setAssignedDriver("");
    setPickupTime("");
    setDropTime("");
    setStatus("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Route" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Route Name</label>
            <Input
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="e.g. Route 6 (Green)"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Route Color</label>
            <Dropdown
              value={routeColor}
              options={ROUTE_COLORS.map((c) => c.label)}
              onChange={(v) => {
                const found = ROUTE_COLORS.find((c) => c.label === v);
                setRouteColor(found?.value ?? "");
              }}
              placeholder="Select color"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Starting Point</label>
            <Input
              value={startingPoint}
              onChange={(e) => setStartingPoint(e.target.value)}
              placeholder="e.g. Central Park"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Destination</label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. School"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Stops</label>
            <Input
              value={stops}
              onChange={(e) => setStops(e.target.value)}
              placeholder="e.g. 5"
              type="number"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Assigned Vehicle</label>
            <Dropdown
              value={assignedVehicle}
              options={vehicleOptions.length > 0 ? vehicleOptions : ["No vehicles registered"]}
              onChange={setAssignedVehicle}
              placeholder="Select vehicle"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Assigned Driver</label>
            <Dropdown
              value={assignedDriver}
              options={driverOptions.length > 0 ? driverOptions : ["No drivers registered"]}
              onChange={setAssignedDriver}
              placeholder="Select driver"
            />
          </div>
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
            <Dropdown
              value={status}
              options={STATUS_OPTIONS}
              onChange={setStatus}
              placeholder="Select status"
            />
          </div>
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
            Save Route
          </Button>
        </div>
      </div>
    </Modal>
  );
}
