"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import HostelStudentsPageHeader from "@/components/dashboard/hostel/students/HostelStudentsPageHeader";
import HostelStudentsSummaryCards from "@/components/dashboard/hostel/students/HostelStudentsSummaryCards";
import AssignStudentDialog, {
  type CreateAllocationPayload,
} from "@/components/dashboard/hostel/AssignStudentDialog";
import { clearAuth, getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import {
  allocateStudent,
  getHostelAllocations,
  getHostelDashboardStats,
} from "@/lib/services/hostelService";
import { listStudents } from "@/lib/services/studentService";

export default function HostelStudentsPage() {
  const router = useRouter();
  const [allocations, setAllocations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

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
      const [allocRows, studentRows, statsData] = await Promise.all([
        getHostelAllocations(token),
        listStudents(token).catch(() => []),
        getHostelDashboardStats(token),
      ]);
      setAllocations(Array.isArray(allocRows) ? allocRows : []);
      setStudents(Array.isArray(studentRows) ? studentRows : []);
      setStats(statsData ?? {});
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load hostel students.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveAllocation = async (payload: CreateAllocationPayload) => {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");
    await allocateStudent(token, payload);
    await loadData();
  };

  const studentMap = useMemo(() => {
    const map = new Map<string, { name: string; roll: string }>();
    students.forEach((s) => {
      const name = s.user
        ? `${s.user.first_name ?? ""} ${s.user.last_name ?? ""}`.trim()
        : `Student ${s.admission_number ?? ""}`;
      map.set(s.id, { name, roll: s.roll_number ?? "-" });
    });
    return map;
  }, [students]);

  const cards = useMemo(
    () => [
      {
        title: "Total Hostel Students",
        value: String(stats?.active_allocations ?? allocations.length),
        footer: "Active allocations",
        icon: "Users",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        tint: "bg-purple-50/60",
      },
      {
        title: "Allocated Students",
        value: String(allocations.length),
        footer: "From database",
        icon: "User",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        tint: "bg-emerald-50/60",
      },
      {
        title: "Available Beds",
        value: String(stats?.available_beds ?? 0),
        footer: "Vacant beds",
        icon: "Bed",
        iconBg: "bg-pink-50",
        iconColor: "text-pink-500",
        tint: "bg-pink-50/60",
      },
      {
        title: "Occupancy",
        value: `${stats?.occupancy_percentage ?? 0}%`,
        footer: "Current hostel occupancy",
        icon: "ClipboardList",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        tint: "bg-blue-50/60",
      },
    ],
    [allocations.length, stats],
  );

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <HostelStudentsPageHeader
            onAddClick={() => setIsAssignOpen(true)}
            onMoreOptions={() => {}}
          />

          {loadError ? (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
              Loading hostel students...
            </div>
          ) : null}

          {!isLoading && !loadError ? <HostelStudentsSummaryCards cards={cards} /> : null}

          {!isLoading && !loadError ? (
            <section className="rounded-lg border border-slate-200 bg-white mb-6">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-900">Hostel Allocations</h2>
              </div>
              {allocations.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500">No hostel allocations found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-4 py-3 text-left">Student</th>
                        <th className="px-4 py-3 text-left">Roll Number</th>
                        <th className="px-4 py-3 text-left">Bed ID</th>
                        <th className="px-4 py-3 text-left">Check In</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocations.map((row) => {
                        const studentInfo = studentMap.get(row.student_id);
                        return (
                          <tr key={row.id} className="border-b border-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {studentInfo?.name ?? row.student?.user?.first_name ?? `Student (${String(row.student_id).slice(0, 8)})`}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {studentInfo?.roll ?? row.student?.roll_number ?? "-"}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-700">
                              {row.bed?.bed_no ? `Bed ${row.bed.bed_no}` : String(row.bed_id).slice(0, 13)}
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
          ) : null}

          <AssignStudentDialog
            open={isAssignOpen}
            onClose={() => setIsAssignOpen(false)}
            onSave={handleSaveAllocation}
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
