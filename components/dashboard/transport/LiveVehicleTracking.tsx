"use client";

import { Bus } from "lucide-react";
import Card from "@/components/shared/Card";
import type { TrackingVehicle } from "@/lib/fixtures/transport-management-reference-fixture";
import TransportMapIllustration from "./TransportMapIllustration";

interface LiveVehicleTrackingProps {
  vehicles: TrackingVehicle[];
  onViewAll: () => void;
  onVehicleSelect: (vehicle: TrackingVehicle) => void;
  highlightedVehicle: string | undefined;
}

export default function LiveVehicleTracking({
  vehicles,
  onViewAll,
  onVehicleSelect,
  highlightedVehicle,
}: LiveVehicleTrackingProps) {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Live Vehicle Tracking</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-[#7c3aed] hover:text-[#6d28d9] transition"
        >
          View All
        </button>
      </div>

      <div className="px-4 pt-4 pb-2">
        <TransportMapIllustration highlightedVehicle={highlightedVehicle} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {vehicles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No live vehicle tracking data available.
          </div>
        ) : (
          <div className="space-y-1">
            {vehicles.map((vehicle) => (
            <button
              key={vehicle.vehicleNo}
              type="button"
              onClick={() => onVehicleSelect(vehicle)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
                highlightedVehicle === vehicle.vehicleNo
                  ? "bg-purple-50 ring-1 ring-purple-200"
                  : "hover:bg-slate-50"
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: vehicle.routeColor + "20" }}
              >
                <Bus className="w-4 h-4" style={{ color: vehicle.routeColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {vehicle.vehicleNo} <span className="text-slate-500 font-normal">({vehicle.routeName})</span>
                </p>
                <p className="text-xs text-slate-500">{vehicle.driverName}</p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                  vehicle.status === "Live"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {vehicle.status}
              </span>
            </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
