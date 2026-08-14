"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import HostelSummaryCards from "@/components/dashboard/hostel/HostelSummaryCards";
import { getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import { getHostelDashboardStats } from "@/lib/services/hostelService";

interface HostelStats {
  total_blocks?: number;
  total_rooms?: number;
  total_beds?: number;
  occupied_beds?: number;
  available_beds?: number;
  active_allocations?: number;
  occupancy_percentage?: number;
}

export default function HostelOverviewPage() {
  const [stats, setStats] = useState<HostelStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoadError("Please log in to view hostel data.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    getHostelDashboardStats(token)
      .then((data) => setStats(data ?? {}))
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Failed to load hostel data.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const cards = useMemo(
    () => [
      {
        title: "Total Rooms",
        value: String(stats?.total_rooms ?? 0),
        footer: `${stats?.total_blocks ?? 0} blocks`,
        icon: "Bed",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        tint: "bg-blue-50/60",
      },
      {
        title: "Active Students",
        value: String(stats?.active_allocations ?? 0),
        footer: "Current allocations",
        icon: "Users",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        tint: "bg-emerald-50/60",
      },
      {
        title: "Occupied Beds",
        value: String(stats?.occupied_beds ?? 0),
        footer: `${stats?.occupancy_percentage ?? 0}% occupancy`,
        icon: "User",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
        tint: "bg-orange-50/60",
      },
      {
        title: "Vacant Beds",
        value: String(stats?.available_beds ?? 0),
        footer: "Available beds",
        icon: "ClipboardList",
        iconBg: "bg-pink-50",
        iconColor: "text-pink-500",
        tint: "bg-pink-50/60",
      },
      {
        title: "Total Beds",
        value: String(stats?.total_beds ?? 0),
        footer: "Across all rooms",
        icon: "ClipboardList",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        tint: "bg-blue-50/60",
      },
    ],
    [stats],
  );

  const hasRecords = Boolean(
    stats &&
      ((stats.total_blocks ?? 0) > 0 ||
        (stats.total_rooms ?? 0) > 0 ||
        (stats.total_beds ?? 0) > 0 ||
        (stats.active_allocations ?? 0) > 0),
  );

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Hostel Overview
            </h1>
            <nav className="flex items-center justify-center gap-1.5 text-sm" aria-label="Breadcrumb">
              <span className="text-[#7c3aed] font-medium">Dashboard</span>
              <span className="text-slate-400">/</span>
              <span className="text-[#7c3aed] font-medium">Hostel</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500 font-medium">Overview</span>
            </nav>
          </div>

          {loadError ? (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
              Loading hostel data...
            </div>
          ) : null}

          {!isLoading && !loadError ? <HostelSummaryCards cards={cards} /> : null}

          {!isLoading && !loadError && !hasRecords ? (
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center">
              <h2 className="text-base font-semibold text-slate-900">No hostel records found</h2>
              <p className="mt-1 text-sm text-slate-500">Create hostel blocks, rooms, beds, and allocations to populate this dashboard.</p>
            </div>
          ) : null}

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>{COMPANY_INFO.copyright}</span>
            <span>Version {COMPANY_INFO.version}</span>
          </footer>
        </div>
      </div>
    </MainLayout>
  );
}
