"use client";

import type { RouteListItem } from "@/lib/fixtures/transport-management-reference-fixture";

interface RouteListCardProps {
  routes: RouteListItem[];
  onViewAll: () => void;
}

export default function RouteListCard({ routes, onViewAll }: RouteListCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Route List</h3>
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
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  No transport routes registered yet. Click &quot;Add Route&quot; to create one.
                </td>
              </tr>
            ) : (
              routes.map((route) => (
                <tr key={route.routeId} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-[#7c3aed]">{route.routeId}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: route.routeColor }}
                      />
                      <span className="text-sm text-slate-700">{route.routeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{route.stops}</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
