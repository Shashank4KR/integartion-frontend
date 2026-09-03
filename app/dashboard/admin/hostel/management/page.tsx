"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import HostelManagementPageHeader from "@/components/dashboard/hostel/HostelManagementPageHeader";
import HostelSummaryCards from "@/components/dashboard/hostel/HostelSummaryCards";
import AddBlockDialog, { type CreateBlockPayload } from "@/components/dashboard/hostel/AddBlockDialog";
import { clearAuth, getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import {
  createHostelBlock,
  getHostelAllocations,
  getHostelDashboardStats,
  listHostelBlocks,
  listHostelBeds,
  listRooms,
} from "@/lib/services/hostelService";
import { listStudents } from "@/lib/services/studentService";

export default function HostelManagementPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      clearAuth();
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const [statsData, blockRows, roomRows, allocationRows, studentRows, bedRows] = await Promise.all([
        getHostelDashboardStats(token),
        listHostelBlocks(token),
        listRooms(token),
        getHostelAllocations(token),
        listStudents(token).catch(() => []),
        listHostelBeds(token).catch(() => []),
      ]);
      setStats(statsData ?? {});
      setBlocks(Array.isArray(blockRows) ? blockRows : []);
      setRooms(Array.isArray(roomRows) ? roomRows : []);
      setAllocations(Array.isArray(allocationRows) ? allocationRows : []);
      setStudents(Array.isArray(studentRows) ? studentRows : []);
      setBeds(Array.isArray(bedRows) ? bedRows : []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load hostel data.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveBlock = async (payload: CreateBlockPayload) => {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");
    await createHostelBlock(token, payload);
    await loadData();
  };

  const studentMap = useMemo(() => {
    const map = new Map<string, { name: string; roll: string }>();
    students.forEach((s) => {
      const directName = [s.first_name, s.last_name].filter(Boolean).join(" ").trim();
      const userName = s.user?.full_name || [s.user?.first_name, s.user?.last_name].filter(Boolean).join(" ").trim();
      const name = directName || userName || s.user?.email || `Student ${s.admission_no ?? s.id?.slice(0, 8)}`;
      const roll = s.roll_no || s.roll_number || s.admission_no || "-";
      map.set(s.id, { name, roll });
    });
    return map;
  }, [students]);

  const bedMap = useMemo(() => {
    const map = new Map<string, string>();
    beds.forEach((b) => {
      if (b.id) {
        map.set(b.id, b.bed_no ? `Bed ${b.bed_no}` : `Bed ${String(b.id).slice(0, 8)}`);
      }
    });
    return map;
  }, [beds]);

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
        title: "Total Students",
        value: String(stats?.active_allocations ?? 0),
        footer: "Active allocations",
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

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <HostelManagementPageHeader
            onAddClick={() => setIsAddBlockOpen(true)}
            onMoreOptions={() => {}}
          />

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

          {!isLoading && !loadError ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <section className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-bold text-slate-900">Hostel Blocks</h2>
                </div>
                {blocks.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-slate-500">No hostel blocks found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left">Block</th>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Rooms</th>
                          <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blocks.map((block) => (
                          <tr key={block.id} className="border-b border-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{block.block_name ?? "-"}</td>
                            <td className="px-4 py-3 text-slate-600">{block.block_type ?? "-"}</td>
                            <td className="px-4 py-3 text-slate-600">{block.total_rooms ?? 0}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                  block.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {block.status ?? "-"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-bold text-slate-900">Recent Allocations</h2>
                </div>
                {allocations.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-slate-500">No hostel allocations found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left">Student</th>
                          <th className="px-4 py-3 text-left">Bed</th>
                          <th className="px-4 py-3 text-left">Check In</th>
                          <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allocations.slice(0, 10).map((row) => {
                          const studentInfo = studentMap.get(row.student_id);
                          const bedLabel = row.bed?.bed_no ? `Bed ${row.bed.bed_no}` : (bedMap.get(row.bed_id) ?? (row.bed_id ? `Bed ${String(row.bed_id).slice(0, 8)}` : "-"));
                          return (
                            <tr key={row.id} className="border-b border-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {studentInfo?.name ?? row.student?.user?.first_name ?? (row.student_id ? `Student (${String(row.student_id).slice(0, 8)})` : "-")}
                              </td>
                              <td className="px-4 py-3 text-slate-700 font-medium">
                                {bedLabel}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{row.check_in_date ?? "-"}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                    row.status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {row.status ?? "-"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          ) : null}

          {!isLoading && !loadError && rooms.length === 0 && blocks.length === 0 && allocations.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              No hostel records found.
            </div>
          ) : null}

          <AddBlockDialog
            open={isAddBlockOpen}
            onClose={() => setIsAddBlockOpen(false)}
            onSave={handleSaveBlock}
          />

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>{COMPANY_INFO.copyright}</span>
            <span>Version {COMPANY_INFO.version}</span>
          </footer>
        </div>
      </div>
    </MainLayout>
  );
}
