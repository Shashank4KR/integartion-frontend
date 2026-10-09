"use client";

import { Edit2, Trash2, MapPin } from "lucide-react";
import type { RouteListItem } from "@/lib/fixtures/transport-management-reference-fixture";

export interface ExtendedRouteListItem extends RouteListItem {
  id?: string;
  startPoint?: string;
  endPoint?: string;
  stopsList?: Array<{ id?: string; stop_name: string; stop_order: number; pickup_time?: string }>;
}

interface RouteListCardProps {
  routes: ExtendedRouteListItem[];
  onViewAll: () => void;
  onEditRoute?: (route: ExtendedRouteListItem) => void;
  onDeleteRoute?: (routeId: string) => void;
}

export default function RouteListCard({
  routes,
  onViewAll,
  onEditRoute,
  onDeleteRoute,
}: RouteListCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Route List</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {routes.length} registered campus transit routes with ordered intermediate stops
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-[#7c3aed] hover:text-[#6d28d9] transition"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Route ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Route Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Stops</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Students</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Vehicle</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Driver</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                  No transport routes registered yet. Click &quot;Add Route&quot; to create one.
                </td>
              </tr>
            ) : (
              routes.map((route) => (
                <tr key={route.id || route.routeId} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-[#7c3aed]">{route.routeId}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: route.routeColor }}
                      />
                      <span className="text-sm font-semibold text-slate-800">{route.routeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-[#7c3aed] text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{route.stops} {route.stops === 1 ? "Stop" : "Stops"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{route.students}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{route.vehicle}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{route.driver}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        route.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {route.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1">
                      {onEditRoute && (
                        <button
                          type="button"
                          onClick={() => onEditRoute(route)}
                          className="p-1.5 text-slate-500 hover:text-[#7c3aed] hover:bg-purple-50 rounded-md transition"
                          title="Edit Route & Stops"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteRoute && (
                        <button
                          type="button"
                          onClick={() => onDeleteRoute(route.id || route.routeId)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Delete Route"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
