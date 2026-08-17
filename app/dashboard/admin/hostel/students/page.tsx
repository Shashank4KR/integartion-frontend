"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import HostelStudentsPageHeader from "@/components/dashboard/hostel/students/HostelStudentsPageHeader";
import HostelStudentsSummaryCards from "@/components/dashboard/hostel/students/HostelStudentsSummaryCards";
import { getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import { getHostelDashboardStats, listHostelStudents } from "@/lib/services/hostelService";

export default function HostelStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoadError("Please log in to view hostel students.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    Promise.all([listHostelStudents(token), getHostelDashboardStats(token)])
      .then(([studentRows, statsData]) => {
        setStudents(Array.isArray(studentRows) ? studentRows : []);
        setStats(statsData ?? {});
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Failed to load hostel students.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const cards = useMemo(
    () => [
      { title: "Total Hostel Students", value: String(stats?.active_allocations ?? students.length), footer: "Active allocations", icon: "Users", iconBg: "bg-purple-50", iconColor: "text-purple-600", tint: "bg-purple-50/60" },
      { title: "Allocated Students", value: String(students.length), footer: "From database", icon: "User", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", tint: "bg-emerald-50/60" },
      { title: "Available Beds", value: String(stats?.available_beds ?? 0), footer: "Vacant beds", icon: "Bed", iconBg: "bg-pink-50", iconColor: "text-pink-500", tint: "bg-pink-50/60" },
      { title: "Occupancy", value: `${stats?.occupancy_percentage ?? 0}%`, footer: "Current hostel occupancy", icon: "ClipboardList", iconBg: "bg-blue-50", iconColor: "text-blue-600", tint: "bg-blue-50/60" },
    ],
    [students.length, stats],
  );

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <HostelStudentsPageHeader onAddClick={() => {}} onMoreOptions={() => {}} />
          {loadError ? <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div> : null}
          {isLoading ? <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">Loading hostel students...</div> : null}
          {!isLoading && !loadError ? <HostelStudentsSummaryCards cards={cards} /> : null}

          {!isLoading && !loadError ? (
            <section className="rounded-lg border border-slate-200 bg-white mb-6">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-900">Hostel Students</h2>
              </div>
              {students.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500">No hostel students found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-100"><th className="px-4 py-3 text-left">Student ID</th><th className="px-4 py-3 text-left">Bed ID</th><th className="px-4 py-3 text-left">Check In</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
                    <tbody>{students.map((row) => <tr key={row.id} className="border-b border-slate-50"><td className="px-4 py-3">{row.student_id ?? row.id ?? "-"}</td><td className="px-4 py-3">{row.bed_id ?? "-"}</td><td className="px-4 py-3">{row.check_in_date ?? "-"}</td><td className="px-4 py-3">{row.status ?? "-"}</td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </section>
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
