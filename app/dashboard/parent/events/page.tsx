"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import Card from "@/components/shared/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ParentPageHeader,
} from "@/components/dashboard/parent/ParentModuleHelpers";
import { getToken } from "@/lib/auth";
import { listEvents } from "@/lib/services/calendarService";
import { CalendarDays } from "lucide-react";

type ParentEvent = {
  id: string;
  title: string;
  description: string;
  start?: string;
  end?: string;
  location?: string;
  type?: string;
};

function mapEvent(item: any): ParentEvent {
  return {
    id: String(item.id ?? crypto.randomUUID()),
    title: String(item.title ?? item.event_name ?? item.name ?? "Event"),
    description: String(item.description ?? item.details ?? ""),
    start: item.start_time ?? item.start_date ?? item.event_date ?? item.date,
    end: item.end_time ?? item.end_date,
    location: item.location ?? item.venue,
    type: item.event_type ?? item.type,
  };
}

export default function ParentEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ParentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await listEvents(token);
        if (!mounted) return;
        const formatted = (data ?? []).map(mapEvent);
        formatted.sort((a, b) => new Date(a.start ?? 0).getTime() - new Date(b.start ?? 0).getTime());
        setEvents(formatted);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load events.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadEvents();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.parent}>
      <div className="space-y-6">
        <ParentPageHeader
          icon={CalendarDays}
          title="Events"
          description="View school events available to your parent account."
        />

        {loading && <LoadingState label="Loading events..." />}
        {error && <ErrorState message={error} />}

        {!loading && !error && events.length === 0 && (
          <EmptyState icon={CalendarDays} message="No upcoming events are available right now." />
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <Card key={event.id} className="p-6" hover>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{event.title}</p>
                    {event.type && <p className="text-sm text-purple-700 mt-1">{event.type}</p>}
                  </div>
                  {event.start && (
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(event.start).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
                {event.description && <p className="text-sm text-slate-700 leading-relaxed mt-4">{event.description}</p>}
                <div className="mt-4 space-y-1 text-sm text-slate-600">
                  {event.start && <p>Starts: {new Date(event.start).toLocaleString("en-IN")}</p>}
                  {event.end && <p>Ends: {new Date(event.end).toLocaleString("en-IN")}</p>}
                  {event.location && <p>Location: {event.location}</p>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
