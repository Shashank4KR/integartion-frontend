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
import { listDrivers, listTransportRoutes, listVehicles, listStudentTransports } from "@/lib/services/transportService";
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

function buildSummaryCards(
  routes: Array<Record<string, unknown>>,
  vehicles: Array<Record<string, unknown>>,
  drivers: Array<Record<string, unknown>>,
  studentTransports: Array<Record<string, unknown>> = []
) {
  const activeRoutes = routes.filter(
    (route) => route.status !== "inactive" && route.status !== "Inactive" && route.is_active !== false
  ).length;
  const totalStudents = studentTransports.length;
  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status !== "inactive" && vehicle.status !== "maintenance" && vehicle.is_active !== false
  ).length;
  const assignedDrivers = drivers.filter(
    (driver) => Boolean(driver.bus_id || driver.assigned === true || driver.is_assigned === true)
  ).length;

  return [
    {
      title: "Students on Route",
      value: String(totalStudents),
      footer: `${activeRoutes} active ${activeRoutes === 1 ? "route" : "routes"}`,
      icon: "users-route",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      sparkline: [3, 5, 4, 6, 7],
      sparkColor: "#7c3aed",
    },
    {
      title: "Routes On Time",
      value: String(activeRoutes || routes.length),
      footer: `${activeVehicles} ${activeVehicles === 1 ? "vehicle" : "vehicles"} tracked`,
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

function buildSegments(
  routes: Array<Record<string, unknown>>,
  studentTransports: Array<Record<string, unknown>> = []
) {
  if (routes.length === 0) {
    return [];
  }

  const palette = ["#3b82f6", "#10b981", "#eab308", "#ef4444", "#f97316", "#7c3aed"];
  return routes.slice(0, 6).map((route, index) => {
    const routeId = String(route.id || route.route_id || index + 1);
    const routeName = String(route.name ?? route.route_name ?? `Route ${index + 1}`);
    const studentCount = studentTransports.filter(
      (st) => String(st.route_id) === routeId || String(st.route_name) === routeName
    ).length;

    return {
      label: routeName,
      value: studentCount,
      color: palette[index % palette.length],
    };
  });
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
  const [totalCapacity, setTotalCapacity] = useState<number>(60);
  const [routeDetails, setRouteDetails] = useState<any[]>([]);
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

    Promise.all([
      listTransportRoutes(token),
      listVehicles(token),
      listDrivers(token),
      listStudentTransports(token).catch(() => []),
    ])
      .then(([routes, vehicles, drivers, studentTransports]) => {
        const routeRows = Array.isArray(routes) ? routes : [];
        const vehicleRows = Array.isArray(vehicles) ? vehicles : [];
        const driverRows = Array.isArray(drivers) ? drivers : [];
        const studentTransportRows = Array.isArray(studentTransports) ? studentTransports : [];

        const cards = buildSummaryCards(
          routeRows as Array<Record<string, unknown>>,
          vehicleRows as Array<Record<string, unknown>>,
          driverRows as Array<Record<string, unknown>>,
          studentTransportRows as Array<Record<string, unknown>>
        );
        const routeSegments = buildSegments(
          routeRows as Array<Record<string, unknown>>,
          studentTransportRows as Array<Record<string, unknown>>
        );
        const total = studentTransportRows.length;
        const cap = (vehicleRows as any[]).reduce((sum, v) => sum + (Number(v.capacity) || 0), 0) || 60;

        const details = (routeRows as any[]).map((r: any, i: number) => {
          const v = (vehicleRows as any[])[i];
          const count = studentTransportRows.filter(
            (st: any) => String(st.route_id) === String(r.id) || String(st.route_name) === String(r.route_name)
          ).length;
          return {
            id: r.id,
            name: r.route_name || `Route ${i + 1}`,
            startPoint: r.start_point || "Campus",
            endPoint: r.end_point || "City",
            vehicleNo: v ? v.bus_number : "Unassigned",
            students: count,
            color: ["#3b82f6", "#10b981", "#eab308", "#ef4444", "#7c3aed"][i % 5],
          };
        });

        setSummaryCards(cards);
        setSegments(routeSegments);
        setActivityRows(buildActivityRows(routeRows as Array<Record<string, unknown>>, vehicleRows as Array<Record<string, unknown>>));
        setTotalStudents(total);
        setTotalCapacity(cap);
        setRouteDetails(details);
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
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const handleAction = (action?: string) => {
    switch (action) {
      case "tracking":
        setTrackingOpen(true);
        break;
      case "schedule":
        setScheduleOpen(true);
        break;
      case "report":
        setReportOpen(true);
        break;
      default:
        setMoreOpen(true);
        break;
    }
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <TransportOverviewPageHeader
            onMoreOptions={() => setMoreOpen(true)}
          />

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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2">
              <TransportSummaryChart
                segments={segments}
                totalStudents={totalStudents}
                totalCapacity={totalCapacity}
                routes={routeDetails}
              />
            </div>
            <div className="xl:col-span-1">
              <TransportGuidelinesCard guidelines={TRANSPORT_GUIDELINES} />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2">
              <TransportActivityCard activities={activityRows} />
            </div>
            <div className="xl:col-span-1">
              <TransportQuickNavigation
                items={QUICK_NAVIGATION_ITEMS}
                onTracking={() => setTrackingOpen(true)}
                onSchedule={() => setScheduleOpen(true)}
                onReport={() => setReportOpen(true)}
              />
            </div>
          </div>

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2026 EdTech Smart Campus ERP. All rights reserved.</span>
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
    </MainLayout>
  );
}
