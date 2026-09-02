"use client";

import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/shared/Dropdown";
import TransportDatePicker from "./TransportDatePicker";

interface TransportFiltersProps {
  route: string;
  onRouteChange: (value: string) => void;
  vehicle: string;
  onVehicleChange: (value: string) => void;
  driver: string;
  onDriverChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  onFilter: () => void;
  onReset: () => void;
  routeOptions?: string[];
  vehicleOptions?: string[];
  driverOptions?: string[];
}

export default function TransportFilters({
  route,
  onRouteChange,
  vehicle,
  onVehicleChange,
  driver,
  onDriverChange,
  status,
  onStatusChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onFilter,
  onReset,
  routeOptions = [],
  vehicleOptions = [],
  driverOptions = [],
}: TransportFiltersProps) {
  const availableRoutes = ["All Routes", ...routeOptions];
  const availableVehicles = ["All Vehicles", ...vehicleOptions];
  const availableDrivers = ["All Drivers", ...driverOptions];
  const availableStatuses = ["All Status", "Running", "Completed", "Delayed", "Cancelled", "Active", "Inactive"];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center flex-shrink-0">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Trip & Schedule Filters</h3>
            <p className="text-xs text-slate-500">Filter vehicle trips by route, vehicle, driver, status, or date range</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset
          </button>
          <Button
            onClick={onFilter}
            className="inline-flex items-center gap-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold"
          >
            <Filter className="w-3.5 h-3.5" />
            Apply Filter
          </Button>
        </div>
      </div>

      {/* Uniform Filter Inputs with Labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Route</label>
          <Dropdown value={route} options={availableRoutes} onChange={onRouteChange} placeholder="Select Route" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Vehicle</label>
          <Dropdown value={vehicle} options={availableVehicles} onChange={onVehicleChange} placeholder="Select Vehicle" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Driver</label>
          <Dropdown value={driver} options={availableDrivers} onChange={onDriverChange} placeholder="Select Driver" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Status</label>
          <Dropdown value={status} options={availableStatuses} onChange={onStatusChange} placeholder="Select Status" />
        </div>
        <div>
          <TransportDatePicker label="From Date" value={fromDate} onChange={onFromDateChange} />
        </div>
        <div>
          <TransportDatePicker label="To Date" value={toDate} onChange={onToDateChange} />
        </div>
      </div>
    </div>
  );
}
