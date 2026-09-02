"use client";

import type { VehicleTrip } from "@/lib/fixtures/transport-management-reference-fixture";
import VehicleTripActions from "./VehicleTripActions";

interface VehicleTripsTableProps {
  trips: VehicleTrip[];
  onLocation: (trip: VehicleTrip) => void;
  onView: (trip: VehicleTrip) => void;
}

export default function VehicleTripsTable({ trips, onLocation, onView }: VehicleTripsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Route ID</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Route Name / Stops</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Vehicle No.</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Driver Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pickup Time</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Drop Time</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Students</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trips.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
                No active trips scheduled. Register routes and vehicles to dispatch trips.
              </td>
            </tr>
          ) : (
            trips.map((trip) => (
              <tr key={trip.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-[#7c3aed]">{trip.routeId}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{trip.routeName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{trip.stops}</p>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{trip.vehicleNo}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{trip.driverName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{trip.pickupTime}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{trip.dropTime}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{trip.students}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      trip.status === "Running"
                        ? "bg-emerald-50 text-emerald-700"
                        : trip.status === "Completed"
                        ? "bg-blue-50 text-blue-600"
                        : trip.status === "Delayed"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {trip.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <VehicleTripActions onLocation={() => onLocation(trip)} onView={() => onView(trip)} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
