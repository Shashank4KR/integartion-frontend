"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, MapPin, Clock } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";
import type { RouteStopItem } from "./AddRouteDialog";

const ROUTE_COLORS = [
  { label: "Purple", value: "#7c3aed" },
  { label: "Green", value: "#10b981" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Yellow", value: "#eab308" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
];

const STATUS_OPTIONS = ["Active", "Inactive"];

export interface EditableRouteData {
  id: string;
  routeName: string;
  routeColor?: string;
  startingPoint: string;
  destination: string;
  stops?: RouteStopItem[];
  assignedVehicle?: string;
  assignedDriver?: string;
  pickupTime?: string;
  dropTime?: string;
  status?: string;
}

interface EditRouteDialogProps {
  open: boolean;
  onClose: () => void;
  route: EditableRouteData | null;
  onSave: (
    id: string,
    updatedRoute: {
      routeName: string;
      routeColor: string;
      startingPoint: string;
      destination: string;
      stops: RouteStopItem[];
      assignedVehicle: string;
      assignedDriver: string;
      pickupTime: string;
      dropTime: string;
      status: string;
    }
  ) => Promise<void> | void;
  vehicleOptions?: string[];
  driverOptions?: string[];
}

export default function EditRouteDialog({
  open,
  onClose,
  route,
  onSave,
  vehicleOptions = [],
  driverOptions = [],
}: EditRouteDialogProps) {
  const [routeName, setRouteName] = useState("");
  const [routeColor, setRouteColor] = useState("#7c3aed");
  const [startingPoint, setStartingPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [stopsList, setStopsList] = useState<RouteStopItem[]>([]);
  const [newStopName, setNewStopName] = useState("");
  const [newStopTime, setNewStopTime] = useState("");
  const [assignedVehicle, setAssignedVehicle] = useState("");
  const [assignedDriver, setAssignedDriver] = useState("");
  const [pickupTime, setPickupTime] = useState("07:30 AM");
  const [dropTime, setDropTime] = useState("03:30 PM");
  const [status, setStatus] = useState("Active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route) {
      setRouteName(route.routeName || "");
      setRouteColor(route.routeColor || "#7c3aed");
      setStartingPoint(route.startingPoint || "");
      setDestination(route.destination || "");
      setStopsList(route.stops ? [...route.stops] : []);
      setAssignedVehicle(route.assignedVehicle || "");
      setAssignedDriver(route.assignedDriver || "");
      setPickupTime(route.pickupTime || "07:30 AM");
      setDropTime(route.dropTime || "03:30 PM");
      setStatus(route.status || "Active");
      setError(null);
    }
  }, [route]);

  const handleAddStop = () => {
    if (!newStopName.trim()) return;
    const newStop: RouteStopItem = {
      stop_name: newStopName.trim(),
      stop_order: stopsList.length + 1,
      pickup_time: newStopTime.trim() || undefined,
    };
    setStopsList([...stopsList, newStop]);
    setNewStopName("");
    setNewStopTime("");
  };

  const handleRemoveStop = (index: number) => {
    const updated = stopsList
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, stop_order: i + 1 }));
    setStopsList(updated);
  };

  const handleMoveStop = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === stopsList.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...stopsList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setStopsList(updated.map((item, i) => ({ ...item, stop_order: i + 1 })));
  };

  const handleSave = async () => {
    if (!route?.id) return;
    if (!routeName.trim() || !startingPoint.trim() || !destination.trim() || !status) {
      setError("Please fill in Route Name, Starting Point, Destination, and Status.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(route.id, {
        routeName: routeName.trim(),
        routeColor,
        startingPoint: startingPoint.trim(),
        destination: destination.trim(),
        stops: stopsList,
        assignedVehicle,
        assignedDriver,
        pickupTime,
        dropTime,
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update route.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit Route: ${route?.routeName || ""}`} maxWidth="max-w-2xl">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Route Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="e.g. Route 6 (Green)"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Route Color</label>
            <Dropdown
              value={ROUTE_COLORS.find((c) => c.value === routeColor)?.label ?? "Purple"}
              options={ROUTE_COLORS.map((c) => c.label)}
              onChange={(v) => {
                const found = ROUTE_COLORS.find((c) => c.label === v);
                setRouteColor(found?.value ?? "#7c3aed");
              }}
              placeholder="Select color"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Starting Point <span className="text-red-500">*</span>
            </label>
            <Input
              value={startingPoint}
              onChange={(e) => setStartingPoint(e.target.value)}
              placeholder="e.g. Central Campus Main Gate"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Destination <span className="text-red-500">*</span>
            </label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Metro Terminal South"
              required
            />
          </div>
        </div>

        {/* Dynamic Route Stops Management Section */}
        <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#7c3aed]" />
              <span className="text-sm font-bold text-slate-900">Intermediate Route Stops</span>
            </div>
            <span className="text-xs font-semibold text-[#7c3aed] bg-purple-100/70 px-2.5 py-0.5 rounded-full">
              {stopsList.length} {stopsList.length === 1 ? "Stop" : "Stops"}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Add intermediate pickup / drop points along this route with designated schedule times.
          </p>

          {/* Add Stop Input Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                value={newStopName}
                onChange={(e) => setNewStopName(e.target.value)}
                placeholder="Stop name (e.g. Lake Circle)"
                className="bg-white text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStop();
                  }
                }}
              />
            </div>
            <div className="w-full sm:w-36">
              <Input
                value={newStopTime}
                onChange={(e) => setNewStopTime(e.target.value)}
                placeholder="Time (e.g. 07:45 AM)"
                className="bg-white text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStop();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              onClick={handleAddStop}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-3 text-xs font-semibold whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Stop
            </Button>
          </div>

          {/* Ordered Stops List */}
          {stopsList.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500 bg-white/70 rounded-lg border border-dashed border-purple-200">
              No intermediate stops added yet. Route will run directly from {startingPoint || "Start"} to {destination || "Destination"}.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {stopsList.map((stop, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-[#7c3aed] flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      {stop.stop_order}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">{stop.stop_name}</span>
                    {stop.pickup_time && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex-shrink-0">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {stop.pickup_time}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveStop(index, "up")}
                      className="p-1 text-slate-400 hover:text-[#7c3aed] disabled:opacity-30 disabled:hover:text-slate-400 transition"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === stopsList.length - 1}
                      onClick={() => handleMoveStop(index, "down")}
                      className="p-1 text-slate-400 hover:text-[#7c3aed] disabled:opacity-30 disabled:hover:text-slate-400 transition"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition ml-1"
                      title="Remove stop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
