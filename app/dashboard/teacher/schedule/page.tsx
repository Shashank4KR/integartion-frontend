"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken, getStoredUser } from "@/lib/auth";
import { getCurrentTeacher, getTeacherTimetable } from "@/lib/services/teacherService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, CalendarDays } from "lucide-react";

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  meta: string;
  iconBg: string;
  iconColor: string;
}

export default function TeacherSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = getToken();
        const user = getStoredUser();

        if (!token || !user) {
          router.replace("/login");
          return;
        }

        const teacher = await getCurrentTeacher(token);
        const timetable = await getTeacherTimetable(token, teacher.id);

        setSchedule(
          timetable.map((item) => ({
            id: item.id,
            title: item.class_name ?? "Assigned class",
            description: [item.subject_name, item.room_no].filter(Boolean).join(" · ") || item.day_of_week,
            meta: `${item.day_of_week}, ${item.start_time} - ${item.end_time}`,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",
          })),
        );
        setError(null);
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError(err instanceof Error ? err.message : "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [router]);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-purple-600" />
            Schedule
          </h1>
          <p className="text-slate-600 mt-1">View your daily teaching schedule</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading schedule...</p>
            </div>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {!loading && !error && schedule.length === 0 && (
          <Card className="border-slate-200 bg-white p-8 text-center shadow-sm">
            <CalendarDays className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No current data</p>
            <p className="text-xs text-slate-500 mt-1">No timetable entries assigned yet for your schedule.</p>
          </Card>
        )}

        {!loading && !error && schedule.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays className="h-4 w-4" />
                    <span className="font-semibold">{item.meta}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
