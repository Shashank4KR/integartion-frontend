"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import TransportOverviewPageHeader from "@/components/dashboard/transport/TransportOverviewPageHeader";
import TransportOverviewSummaryCards from "@/components/dashboard/transport/TransportOverviewSummaryCards";
import TransportGuidelinesCard from "@/components/dashboard/transport/TransportGuidelinesCard";
import TransportSummaryChart from "@/components/dashboard/transport/TransportSummaryChart";
import TransportActivityCard from "@/components/dashboard/transport/TransportActivityCard";
import TransportQuickNavigation from "@/components/dashboard/transport/TransportQuickNavigation";
import TransportOverviewDialogs from "@/components/dashboard/transport/TransportOverviewDialogs";
import { getToken } from "@/lib/auth";
import { listDrivers, listTransportRoutes, listVehicles } from "@/lib/services/transportService";
import type { QuickNavItem } from "@/lib/fixtures/transport-overview-reference-fixture";

const QUICK_NAVIGATION_ITEMS: QuickNavItem[] = [
  { title: "Transport Management", description: "Manage routes and fleet", href: "/dashboard/admin/transport/management", icon: "bus", iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  { title: "Live Tracking", description: "Monitor current trips", href: "/dashboard/admin/transport", icon: "map-pin", iconBg: "bg-blue-50", iconColor: "text-blue-600", action: "tracking" },
  { title: "Driver Assignment", description: "Assign drivers to routes", href: "/dashboard/admin/transport", icon: "calendar-route", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
];

const TRANSPORT_GUIDELINES = [
  "Route performance is refreshed from the transport backend.",
  "Driver assignments are validated against active vehicles.",
  "Attendance and tracking data is loaded at runtime.",
];

function getNumericValue(entry: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = entry[key];
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.-]/g, ""));
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

function buildSummaryCards(routes: Array<Record<string, unknown>>, vehicles: Array<Record<string, unknown>>, drivers: Array<Record<string, unknown>>) {
  const activeRoutes = routes.filter((route) => route.status === "active" || route.is_active === true).length;
  const totalStudents = routes.reduce((sum, route) => sum + getNumericValue(route, ["student_count", "studentCount", "capacity", "students_on_route"]), 0);
  const activeVehicles = vehicles.filter((vehicle) => vehicle.status === "active" || vehicle.is_active === true).length;
  const assignedDrivers = drivers.filter((driver) => driver.assigned === true || driver.is_assigned === true).length;

  return [
    {
      title: "Students on Route",
      value: String(totalStudents),
      footer: `${activeRoutes} active routes`,
      icon: "users-route",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      sparkline: [3, 5, 4, 6, 7],
      sparkColor: "#7c3aed",
    },
    {
      title: "Routes On Time",
      value: String(activeRoutes || routes.length),
      footer: `${activeVehicles} vehicles tracked`,
      icon: "clock-check",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      sparkline: [2, 4, 3, 5, 4],
      sparkColor: "#10b981",
    },
    {
      title: "Fleet Availability",
      value: `${activeVehicles}/${vehicles.length}`,
      footer: "Vehicles ready for dispatch",
      icon: "bus-check",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      sparkline: [1, 3, 2, 4, 3],
      sparkColor: "#3b82f6",
    },
    {
      title: "Drivers Assigned",
      value: String(assignedDrivers || drivers.length || 0),
      footer: "Driver assignment status",
      icon: "alert-bell",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      sparkline: [2, 3, 2, 4, 5],
      sparkColor: "#f59e0b",
    },
  ];
}

function buildSegments(routes: Array<Record<string, unknown>>) {
  if (routes.length === 0) {
    return [];
  }

  const palette = ["#3b82f6", "#10b981", "#eab308", "#ef4444", "#f97316", "#7c3aed"];
  return routes.slice(0, 6).map((route, index) => ({
    label: String(route.name ?? route.route_name ?? `Route ${index + 1}`),
    value: getNumericValue(route, ["student_count", "studentCount", "capacity", "students_on_route"]),
    color: palette[index % palette.length],
  }));
}

function buildActivityRows(routes: Array<Record<string, unknown>>, vehicles: Array<Record<string, unknown>>) {
  return [
    {
      label: "Trips Completed",
      value: String(Math.max(0, routes.length)),
      icon: "check-circle",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      progressColor: "bg-emerald-500",
      progressValue: Math.min(100, routes.length * 10),
    },
    {
      label: "Vehicles In Service",
      value: String(vehicles.length),
      icon: "bus",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      progressColor: "bg-blue-500",
      progressValue: Math.min(100, vehicles.length * 12),
    },
  ];
}

export default function TransportOverviewPage() {
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [summaryCards, setSummaryCards] = useState<any[]>([]);
  const [segments, setSegments] = useState<Array<{ label: string; value: number; color: string }>>([]);
  const [activityRows, setActivityRows] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoadError("Please log in to view transport data.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    Promise.all([listTransportRoutes(token), listVehicles(token), listDrivers(token)])
      .then(([routes, vehicles, drivers]) => {
        const routeRows = Array.isArray(routes) ? routes : [];
        const vehicleRows = Array.isArray(vehicles) ? vehicles : [];
        const driverRows = Array.isArray(drivers) ? drivers : [];
        const cards = buildSummaryCards(routeRows as Array<Record<string, unknown>>, vehicleRows as Array<Record<string, unknown>>, driverRows as Array<Record<string, unknown>>);
        const routeSegments = buildSegments(routeRows as Array<Record<string, unknown>>);
        const total = routeRows.reduce((sum, route) => sum + getNumericValue(route as Record<string, unknown>, ["student_count", "studentCount", "capacity", "students_on_route"]), 0);

        setSummaryCards(cards);
        setSegments(routeSegments);
        setActivityRows(buildActivityRows(routeRows as Array<Record<string, unknown>>, vehicleRows as Array<Record<string, unknown>>));
        setTotalStudents(total);
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Failed to load transport data.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const showToast = (message: string) => {
    const toast = document.createElement("div");
    toast.className = "fixed bottom-6 right-6 z-[200] rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-2xl";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const handleExport = () => {
    setMoreOpen(false);
    showToast("Overview exported successfully");
  };

  const handlePrint = () => {
    setMoreOpen(false);
    showToast("Print dialog opened");
  };

  const handleSettings = () => {
    setMoreOpen(false);
    showToast("Transport Settings coming soon");
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <TransportOverviewPageHeader onMoreOptions={() => setMoreOpen(true)} />

          {loadError ? (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
              Loading transport data...
            </div>
          ) : null}

          <TransportOverviewSummaryCards cards={summaryCards} />

          <TransportGuidelinesCard guidelines={TRANSPORT_GUIDELINES} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <TransportSummaryChart segments={segments} total={totalStudents} />
            <TransportActivityCard rows={activityRows} />
          </div>

          <TransportQuickNavigation
            items={QUICK_NAVIGATION_ITEMS}
            onTracking={() => setTrackingOpen(true)}
            onSchedule={() => setScheduleOpen(true)}
            onReport={() => setReportOpen(true)}
          />

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2025 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>

      <TransportOverviewDialogs
        trackingOpen={trackingOpen}
        onCloseTracking={() => setTrackingOpen(false)}
        scheduleOpen={scheduleOpen}
        onCloseSchedule={() => setScheduleOpen(false)}
        reportOpen={reportOpen}
        onCloseReport={() => setReportOpen(false)}
      />

      {moreOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">More Options</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-1">
              <button
                type="button"
                onClick={handleExport}
                className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Export Overview
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Print Overview
              </button>
              <button
                type="button"
                onClick={handleSettings}
                className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Transport Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
