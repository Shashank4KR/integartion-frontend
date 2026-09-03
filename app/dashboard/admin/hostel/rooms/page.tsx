"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import RoomsPageHeader from "@/components/dashboard/hostel/rooms/RoomsPageHeader";
import RoomSummaryCards from "@/components/dashboard/hostel/rooms/RoomSummaryCards";
import AddRoomDialog, { type CreateRoomPayload } from "@/components/dashboard/hostel/AddRoomDialog";
import { clearAuth, getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import {
  createRoom,
  getHostelDashboardStats,
  listHostelBlocks,
  listRooms,
} from "@/lib/services/hostelService";

export default function RoomsManagementPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

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
      const [roomRows, blockRows, statsData] = await Promise.all([
        listRooms(token),
        listHostelBlocks(token),
        getHostelDashboardStats(token),
      ]);
      setRooms(Array.isArray(roomRows) ? roomRows : []);
      setBlocks(Array.isArray(blockRows) ? blockRows : []);
      setStats(statsData ?? {});
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load hostel rooms.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveRoom = async (payload: CreateRoomPayload) => {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");
    await createRoom(token, payload);
    await loadData();
  };

  const blockMap = useMemo(() => {
    const map = new Map<string, string>();
    blocks.forEach((b) => {
      if (b.id) map.set(b.id, b.block_name);
    });
    return map;
  }, [blocks]);

  const cards = useMemo(
    () => [
      {
        title: "Total Rooms",
        value: String(stats?.total_rooms ?? rooms.length),
        footer: "From database",
        icon: "Bed",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        tint: "bg-blue-50/60",
      },
      {
        title: "Occupied Rooms",
        value: String(rooms.filter((room) => (room.occupancy ?? 0) > 0).length),
        footer: "Rooms with occupancy",
        icon: "Building2",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        tint: "bg-emerald-50/60",
      },
      {
        title: "Vacant Rooms",
        value: String(rooms.filter((room) => (room.occupancy ?? 0) === 0).length),
        footer: "No assigned occupants",
        icon: "Home",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
        tint: "bg-orange-50/60",
      },
      {
        title: "Total Occupancy",
        value: `${stats?.occupied_beds ?? 0} / ${stats?.total_beds ?? 0}`,
        footer: `${stats?.occupancy_percentage ?? 0}%`,
        icon: "Users",
        iconBg: "bg-rose-50",
        iconColor: "text-rose-500",
        tint: "bg-rose-50/60",
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
    [rooms, stats],
  );

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <RoomsPageHeader
            onAddClick={() => setIsAddRoomOpen(true)}
            onMoreOptions={() => {}}
          />

          {loadError ? (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
              Loading hostel rooms...
            </div>
          ) : null}

          {!isLoading && !loadError ? <RoomSummaryCards cards={cards} /> : null}

          {!isLoading && !loadError ? (
            <section className="rounded-lg border border-slate-200 bg-white mb-6">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-900">Rooms</h2>
              </div>
              {rooms.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500">No rooms found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left">Room</th>
                        <th className="px-4 py-3 text-left">Block</th>
                        <th className="px-4 py-3 text-left">Floor</th>
                        <th className="px-4 py-3 text-left">Capacity</th>
                        <th className="px-4 py-3 text-left">Occupancy</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room) => (
                        <tr key={room.id} className="border-b border-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{room.room_no ?? "-"}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {room.block?.block_name ?? blockMap.get(room.block_id) ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{room.floor_no ?? "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{room.capacity ?? 0} beds</td>
                          <td className="px-4 py-3 text-slate-600">{room.occupancy ?? 0} occupied</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                room.status === "AVAILABLE"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : room.status === "FULL"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {room.status ?? "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}

          <AddRoomDialog
            open={isAddRoomOpen}
            onClose={() => setIsAddRoomOpen(false)}
            onSave={handleSaveRoom}
            blocks={blocks}
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
