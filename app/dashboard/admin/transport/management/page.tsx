"use client";

import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import TransportManagementPageHeader from "@/components/dashboard/transport/TransportManagementPageHeader";
import TransportSummaryCards from "@/components/dashboard/transport/TransportSummaryCards";
import TransportFilters from "@/components/dashboard/transport/TransportFilters";
import VehicleTripsTable from "@/components/dashboard/transport/VehicleTripsTable";
import VehicleTripsPagination from "@/components/dashboard/transport/VehicleTripsPagination";
import LiveVehicleTracking from "@/components/dashboard/transport/LiveVehicleTracking";
import RouteListCard from "@/components/dashboard/transport/RouteListCard";
import TransportQuickActions from "@/components/dashboard/transport/TransportQuickActions";
import AddVehicleDialog from "@/components/dashboard/transport/AddVehicleDialog";
import AddRouteDialog from "@/components/dashboard/transport/AddRouteDialog";
import AssignDriverDialog from "@/components/dashboard/transport/AssignDriverDialog";
import RouteScheduleDialog from "@/components/dashboard/transport/RouteScheduleDialog";
import TransportFeeDialog from "@/components/dashboard/transport/TransportFeeDialog";
import TransportReportDialog from "@/components/dashboard/transport/TransportReportDialog";
import TripDetailsDialog from "@/components/dashboard/transport/TripDetailsDialog";
import { getToken } from "@/lib/auth";
import { listDrivers, listTransportRoutes, listVehicles } from "@/lib/services/transportService";

interface VehicleTrip {
  id: string;
  routeId: string;
  routeName: string;
  routeColor: string;
  stops: string;
  vehicleNo: string;
  driverName: string;
  pickupTime: string;
  dropTime: string;
  students: number;
  status: "Running" | "Completed" | "Delayed" | "Cancelled";
}

interface TrackingVehicle {
  vehicleNo: string;
  routeId: string;
  routeName: string;
  routeColor: string;
  driverName: string;
  status: "Live" | "Completed";
}

interface QuickAction {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Add Route", icon: "Route", color: "text-[#7c3aed]", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  { label: "Add Vehicle", icon: "Bus", color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  { label: "Assign Driver", icon: "UserPlus", color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  { label: "Route Schedule", icon: "Calendar", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { label: "Transport Fee", icon: "IndianRupee", color: "text-pink-500", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
  { label: "Transport Report", icon: "FileText", color: "text-[#7c3aed]", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
];

const STATUS_OPTIONS = ["All Status", "Running", "Completed", "Delayed", "Cancelled"];

function readString(entry: Record<string, unknown>, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = entry[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function readNumber(entry: Record<string, unknown>, keys: string[]) {
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

function mapRouteList(routes: Array<Record<string, unknown>>, vehicles: Array<Record<string, unknown>>, drivers: Array<Record<string, unknown>>) {
  return routes.map((route, index) => {
    const vehicle = vehicles[index] as Record<string, unknown> | undefined;
    const driver = drivers[index] as Record<string, unknown> | undefined;
    return {
      routeId: readString(route, ["route_id", "routeId", "id"], String(index + 1)),
      routeName: readString(route, ["route_name", "routeName", "name"], `Route ${index + 1}`),
      routeColor: readString(route, ["route_color", "routeColor", "color"], "#7c3aed"),
      stops: readNumber(route, ["stops_count", "stopsCount", "stops"]),
      students: readNumber(route, ["student_count", "studentCount", "students_on_route"]),
      vehicle: vehicle ? readString(vehicle, ["registration_number", "vehicle_no", "vehicleNo", "number", "id"]) : "-",
      driver: driver ? readString(driver, ["name", "driver_name", "driverName", "full_name"]) : "-",
      status: route.status === "inactive" || route.status === "Inactive" ? "Inactive" : "Active",
    };
  });
}

function buildSummaryCards(routes: Array<Record<string, unknown>>, vehicles: Array<Record<string, unknown>>, drivers: Array<Record<string, unknown>>) {
  const activeRoutes = routes.filter((route) => route.status === "active" || route.status === "Active" || route.is_active === true).length;
  const activeVehicles = vehicles.filter((vehicle) => vehicle.status === "active" || vehicle.status === "Active" || vehicle.is_active === true).length;
  const assignedDrivers = drivers.filter((driver) => driver.assigned === true || driver.is_assigned === true || readString(driver, ["vehicle_id", "assigned_vehicle"], "") !== "").length;
  const students = routes.reduce((sum, route) => sum + readNumber(route, ["student_count", "studentCount", "students_on_route"]), 0);

  return [
    { title: "Total Vehicles", value: String(vehicles.length), footer: "Vehicles in database", icon: "Bus", iconBg: "bg-blue-50", iconColor: "text-blue-600", tint: "bg-blue-50/60" },
    { title: "Total Routes", value: String(routes.length), footer: `${activeRoutes} active routes`, icon: "Route", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", tint: "bg-emerald-50/60" },
    { title: "Total Students", value: String(students), footer: "Using transport", icon: "Users", iconBg: "bg-orange-50", iconColor: "text-orange-500", tint: "bg-orange-50/60" },
    { title: "Total Drivers", value: String(drivers.length), footer: `${assignedDrivers} assigned drivers`, icon: "Driver", iconBg: "bg-purple-50", iconColor: "text-purple-600", tint: "bg-purple-50/60" },
    { title: "Today's Trips", value: "0", footer: "No trips endpoint connected", icon: "Calendar", iconBg: "bg-pink-50", iconColor: "text-pink-500", tint: "bg-pink-50/60" },
  ];
}

export default function TransportManagementPage() {
  const [trips] = useState<VehicleTrip[]>([]);
  const [routes, setRoutes] = useState<ReturnType<typeof mapRouteList>>([]);
  const [trackingVehicles] = useState<TrackingVehicle[]>([]);
  const [summaryCards, setSummaryCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [routeFilter, setRouteFilter] = useState("All Routes");
  const [vehicleFilter, setVehicleFilter] = useState("All Vehicles");
  const [driverFilter, setDriverFilter] = useState("All Drivers");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [fromDate, setFromDate] = useState("Select Date");
  const [toDate, setToDate] = useState("Select Date");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [highlightedVehicle, setHighlightedVehicle] = useState<string | undefined>(undefined);

  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [addRouteOpen, setAddRouteOpen] = useState(false);
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<VehicleTrip | null>(null);
  const [tripDetailsOpen, setTripDetailsOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });

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
      .then(([routeRows, vehicleRows, driverRows]) => {
        const apiRoutes = Array.isArray(routeRows) ? (routeRows as Array<Record<string, unknown>>) : [];
        const apiVehicles = Array.isArray(vehicleRows) ? (vehicleRows as Array<Record<string, unknown>>) : [];
        const apiDrivers = Array.isArray(driverRows) ? (driverRows as Array<Record<string, unknown>>) : [];
        setRoutes(mapRouteList(apiRoutes, apiVehicles, apiDrivers));
        setSummaryCards(buildSummaryCards(apiRoutes, apiVehicles, apiDrivers));
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

  const filteredTrips = useMemo(() => {
    let result = [...trips];
    if (routeFilter !== "All Routes") {
      result = result.filter((t) => t.routeName === routeFilter);
    }
    if (vehicleFilter !== "All Vehicles") {
      result = result.filter((t) => t.vehicleNo === vehicleFilter);
    }
    if (driverFilter !== "All Drivers") {
      result = result.filter((t) => t.driverName === driverFilter);
    }
    if (statusFilter !== "All Status") {
      result = result.filter((t) => t.status === statusFilter);
    }
    return result;
  }, [trips, routeFilter, vehicleFilter, driverFilter, statusFilter]);

  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTrips.slice(start, start + rowsPerPage);
  }, [filteredTrips, currentPage, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / rowsPerPage));
  const showingStart = filteredTrips.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const showingEnd = Math.min(currentPage * rowsPerPage, filteredTrips.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleAddClick = () => {
    setActionDialog({
      open: true,
      title: "Add Vehicle / Route",
      message: "Select an option to continue: Add Vehicle, Add Route, Assign Driver, or Create Schedule.",
    });
  };

  const handleMoreOptions = () => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: "Export Transport View, Print Current Schedule, and Transport Settings will be available here.",
    });
  };

  const handleQuickAction = (action: QuickAction) => {
    switch (action.label) {
      case "Add Route":
        setAddRouteOpen(true);
        break;
      case "Add Vehicle":
        setAddVehicleOpen(true);
        break;
      case "Assign Driver":
        setAssignDriverOpen(true);
        break;
      case "Route Schedule":
        setScheduleOpen(true);
        break;
      case "Transport Fee":
        setFeeOpen(true);
        break;
      case "Transport Report":
        setReportOpen(true);
        break;
      default:
        setActionDialog({
          open: true,
          title: action.label,
          message: `The "${action.label}" workflow will be connected to the backend in the integration phase.`,
        });
    }
  };

  const handleVehicleLocation = (trip: VehicleTrip) => {
    setHighlightedVehicle(trip.vehicleNo);
    showToast(`Highlighting ${trip.vehicleNo} on map`);
  };

  const handleVehicleView = (trip: VehicleTrip) => {
    setSelectedTrip(trip);
    setTripDetailsOpen(true);
  };

  const handleVehicleTrackingSelect = (vehicle: typeof trackingVehicles[0]) => {
    setHighlightedVehicle(vehicle.vehicleNo);
  };

  const handleSaveVehicle = (data: {
    vehicleNo: string;
    vehicleType: string;
    capacity: string;
    route: string;
    driver: string;
    status: string;
    insuranceExpiry: string;
    registrationExpiry: string;
    notes: string;
  }) => {
    showToast(`Vehicle ${data.vehicleNo} added successfully`);
  };

  const handleSaveRoute = (data: {
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
  }) => {
    showToast(`Route "${data.routeName}" added successfully`);
  };

  const handleAssignDriver = (data: { vehicle: string; driver: string; route: string }) => {
    showToast(`Driver assigned to ${data.vehicle} successfully`);
  };

  const handleSaveSchedule = (data: {
    route: string;
    driver: string;
    pickupTime: string;
    dropTime: string;
    date: string;
  }) => {
    showToast(`Schedule saved for ${data.route}`);
  };

  const handleSaveFee = (data: {
    student: string;
    route: string;
    vehicle: string;
    amount: string;
    dueDate: string;
    status: string;
  }) => {
    showToast(`Transport fee saved for ${data.student}`);
  };

  const handleFilter = () => {
    setCurrentPage(1);
    showToast("Filters applied");
  };

  const handleReset = () => {
    setRouteFilter("All Routes");
    setVehicleFilter("All Vehicles");
    setDriverFilter("All Drivers");
    setStatusFilter("All Status");
    setFromDate("Select Date");
    setToDate("Select Date");
    setCurrentPage(1);
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <TransportManagementPageHeader
            onAddClick={handleAddClick}
            onMoreOptions={handleMoreOptions}
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

          <TransportSummaryCards cards={summaryCards} />

          <TransportFilters
            route={routeFilter}
            onRouteChange={setRouteFilter}
            vehicle={vehicleFilter}
            onVehicleChange={setVehicleFilter}
            driver={driverFilter}
            onDriverChange={setDriverFilter}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            fromDate={fromDate}
            onFromDateChange={setFromDate}
            toDate={toDate}
            onToDateChange={setToDate}
            onFilter={handleFilter}
            onReset={handleReset}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 bg-white rounded-lg border border-slate-200 flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Today&apos;s Vehicle Trips</h3>
              </div>
              <VehicleTripsTable trips={paginatedTrips} onLocation={handleVehicleLocation} onView={handleVehicleView} />
              <VehicleTripsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                totalItems={filteredTrips.length}
                showingStart={showingStart}
                showingEnd={showingEnd}
              />
            </div>

            <div className="xl:col-span-1">
              <LiveVehicleTracking
                vehicles={trackingVehicles}
                onViewAll={() =>
                  setActionDialog({
                    open: true,
                    title: "Live Vehicle Tracking",
                    message: "A full vehicle tracking view will be available here in a future update.",
                  })
                }
                onVehicleSelect={handleVehicleTrackingSelect}
                highlightedVehicle={highlightedVehicle}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2">
              <RouteListCard routes={routes} onViewAll={() => setActionDialog({ open: true, title: "Route List", message: "A full route list view will be available here in a future update." })} />
            </div>
            <div className="xl:col-span-1">
              <TransportQuickActions actions={QUICK_ACTIONS} onAction={handleQuickAction} />
            </div>
          </div>

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2025 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>

      {/* Dialogs */}
      <AddVehicleDialog open={addVehicleOpen} onClose={() => setAddVehicleOpen(false)} onSave={handleSaveVehicle} />
      <AddRouteDialog open={addRouteOpen} onClose={() => setAddRouteOpen(false)} onSave={handleSaveRoute} />
      <AssignDriverDialog open={assignDriverOpen} onClose={() => setAssignDriverOpen(false)} onSave={handleAssignDriver} />
      <RouteScheduleDialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} onSave={handleSaveSchedule} />
      <TransportFeeDialog open={feeOpen} onClose={() => setFeeOpen(false)} onSave={handleSaveFee} />
      <TransportReportDialog open={reportOpen} onClose={() => setReportOpen(false)} />
      <TripDetailsDialog trip={selectedTrip} open={tripDetailsOpen} onClose={() => setTripDetailsOpen(false)} />

      {/* Generic action dialog */}
      {actionDialog.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActionDialog({ open: false, title: "", message: "" })} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">{actionDialog.title}</h3>
              <button
                onClick={() => setActionDialog({ open: false, title: "", message: "" })}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600">{actionDialog.message}</p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setActionDialog({ open: false, title: "", message: "" })}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
