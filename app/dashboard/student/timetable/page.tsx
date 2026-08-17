"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentStudentProfile } from "@/lib/services/dashboardService";
import {
  getCurrentStudentTimetable,
  type StudentTimetableResponse,
} from "@/lib/services/timetableService";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function StudentTimetablePage() {
  const router = useRouter();
  const [studentClass, setStudentClass] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<StudentTimetableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const [profile, entries] = await Promise.all([
          getCurrentStudentProfile(),
          getCurrentStudentTimetable(token),
        ]);
        setStudentClass(profile.class_name ?? null);
        setTimetable(entries ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load timetable.");
      } finally {
        setLoading(false);
      }
    };

    void fetchTimetable();
  }, [router]);

  const sortedTimetable = useMemo(() => {
    return [...timetable].sort((a, b) => {
      const dayA = WEEK_DAYS.indexOf(a.day_of_week || "");
      const dayB = WEEK_DAYS.indexOf(b.day_of_week || "");
      if (dayA !== dayB) return dayA - dayB;
      if (a.period_no != null && b.period_no != null) return a.period_no - b.period_no;
      return a.start_time.localeCompare(b.start_time);
    });
  }, [timetable]);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Timetable</h1>
          <p className="mt-2 text-sm text-slate-500">
            View your class timetable below. This loads the timetable created for your assigned class.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load timetable</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : sortedTimetable.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              <p className="font-medium">No timetable data is available for your class yet.</p>
              <p className="mt-2 text-sm">
                The admin must publish the timetable for your class before it appears here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p>
                  Class: <span className="font-semibold">{studentClass ?? "Not assigned"}</span>
                </p>
                <p className="mt-1">Total periods: {sortedTimetable.length}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-100 text-slate-900">
                    <tr>
                      <th className="px-4 py-3">Day</th>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Teacher</th>
                      <th className="px-4 py-3">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTimetable.map((entry) => (
                      <tr key={entry.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-900">{entry.day_of_week}</td>
                        <td className="px-4 py-4">{entry.period_no ?? "—"}</td>
                        <td className="px-4 py-4">
                          {entry.start_time} - {entry.end_time}
                        </td>
                        <td className="px-4 py-4">{entry.subject_name ?? entry.subject_id}</td>
                        <td className="px-4 py-4">{entry.teacher_name ?? entry.teacher_id}</td>
                        <td className="px-4 py-4">{entry.room_no ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </RoleDashboardLayout>
  );
}
