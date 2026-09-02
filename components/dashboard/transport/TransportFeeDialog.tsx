"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";

interface TransportFeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    student: string;
    route: string;
    vehicle: string;
    amount: string;
    dueDate: string;
    status: string;
    stopPoint?: string;
  }) => Promise<void> | void;
  routeOptions?: string[];
  vehicleOptions?: string[];
  studentOptions?: Array<{ id: string; name: string; admission_no?: string }>;
}

export default function TransportFeeDialog({
  open,
  onClose,
  onSave,
  routeOptions = [],
  vehicleOptions = [],
  studentOptions = [],
}: TransportFeeDialogProps) {
  const [student, setStudent] = useState("");
  const [route, setRoute] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [stopPoint, setStopPoint] = useState("");
  const [saving, setSaving] = useState(false);

  const availableRoutes = routeOptions.length > 0 ? routeOptions : ["No routes registered"];
  const availableVehicles = vehicleOptions.length > 0 ? vehicleOptions : ["No vehicles registered"];
  const studentChoices = studentOptions.map(
    (s) => s.admission_no ? `${s.name} (${s.admission_no})` : s.name
  );

  const handleSave = async () => {
    if (!student || !route) return;
    setSaving(true);
    try {
      await onSave({
        student,
        route,
        vehicle,
        amount: amount || "0",
        dueDate: dueDate || new Date().toISOString().split("T")[0],
        status,
        stopPoint: stopPoint || "Main Stop",
      });
      setStudent("");
      setRoute("");
      setVehicle("");
      setAmount("");
      setDueDate("");
      setStatus("Pending");
      setStopPoint("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStudent("");
    setRoute("");
    setVehicle("");
    setAmount("");
    setDueDate("");
    setStatus("Pending");
    setStopPoint("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Assign Student & Transport Fee" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Student</label>
          {studentChoices.length > 0 ? (
            <Dropdown
              value={student}
              options={studentChoices}
              onChange={setStudent}
              placeholder="Select student"
            />
          ) : (
            <Input
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              placeholder="Student Name, ID, or Admission No."
            />
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Vehicle</label>
            <Dropdown
              value={vehicle}
              options={availableVehicles}
              onChange={setVehicle}
              placeholder="Select vehicle"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              type="number"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Due Date</label>
            <Input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
          <Dropdown
            value={status}
            options={["Pending", "Paid", "Overdue"]}
            onChange={setStatus}
            placeholder="Select status"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Stop Point / Pickup Location</label>
          <Input
            value={stopPoint}
            onChange={(e) => setStopPoint(e.target.value)}
            placeholder="e.g. KGF Circle, Main Gate"
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
            disabled={saving || !student || !route}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save & Allocate"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
