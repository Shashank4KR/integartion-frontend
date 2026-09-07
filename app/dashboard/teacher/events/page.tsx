"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken, getStoredUser } from "@/lib/auth";
import { getCurrentTeacher, getTeacherEvents } from "@/lib/services/teacherService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, Megaphone } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  meta: string;
  iconBg: string;
  iconColor: string;
}

export default function TeacherEventsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = getToken();
        const user = getStoredUser();

        if (!token || !user) {
          router.replace("/login");
          return;
        }

        const teacher = await getCurrentTeacher(token);
        const teacherEvents = await getTeacherEvents(token, teacher.id);

        setEvents(
          teacherEvents.map((event) => ({
            id: event.id,
            title: event.event_name,
            description: event.description ?? "No description provided",
            meta: event.end_date ? `${event.start_date} - ${event.end_date}` : event.start_date,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",
          })),
        );
        setError(null);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [router]);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-purple-600" />
            Events
          </h1>
          <p className="text-slate-600 mt-1">View upcoming school events and announcements</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading events...</p>
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

        {!loading && !error && events.length === 0 && (
          <Card className="border-slate-200 bg-white p-8 text-center shadow-sm">
            <Megaphone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No current data</p>
            <p className="text-xs text-slate-500 mt-1">No upcoming events or announcements found.</p>
          </Card>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                  </div>
                  <p className="text-xs text-slate-500">{event.meta}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
