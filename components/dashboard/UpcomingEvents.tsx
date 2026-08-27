"use client";

import { useEffect, useState } from "react";
import { getUpcomingEvents } from "@/lib/services/dashboardService";
import Card from "@/components/shared/Card";
import SectionHeader from "@/components/shared/SectionHeader";
import Modal from "@/components/shared/Modal";
import Calendar, { CalendarEvent } from "@/components/shared/Calendar";

interface EventItem {
  id: string;
  title: string;
  month: string;
  day: number;
  time: string;
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

export default function UpcomingEvents() {
  const [open, setOpen] = useState(false);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      try {
        const rawEvents = await getUpcomingEvents();
        if (!mounted) return;

        const formatted = (rawEvents || []).map((e: any) => {
          const startDateObj = new Date(e.start_date);
          const monthStr = MONTHS[startDateObj.getMonth()] || "EVENT";
          const dayNum = startDateObj.getDate();

          let timeStr = e.start_date;
          if (e.end_date && e.end_date !== e.start_date) {
            timeStr += ` to ${e.end_date}`;
          }
          if (e.venue) {
            timeStr += ` at ${e.venue}`;
          }

          return {
            id: String(e.id),
            title: e.event_name,
            month: monthStr,
            day: dayNum,
            time: timeStr,
          };
        });

        setEventsList(formatted);
      } catch (err) {
        console.error("Failed to load upcoming events:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadEvents();
    return () => {
      mounted = false;
    };
  }, []);

  const calendarEvents: CalendarEvent[] = eventsList.map((e) => ({
    day: e.day,
    title: e.title,
  }));

  const today = new Date();

  return (
    <Card>
      <div className="p-6">
        <SectionHeader
          title="Upcoming Events"
          action={
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-purple-600 transition hover:bg-purple-50 hover:text-purple-700"
            >
              View Calendar
            </button>
          }
        />

        {loading ? (
          <p className="text-sm text-slate-500 py-4">Loading events...</p>
        ) : eventsList.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No upcoming events scheduled.</p>
        ) : (
          <div className="space-y-4">
            {eventsList.slice(0, 4).map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                {/* Date Box */}
                <div className="flex flex-col items-center bg-slate-100 rounded-lg p-2 flex-shrink-0 min-w-[50px]">
                  <span className="text-xs font-semibold text-slate-600 uppercase">
                    {event.month}
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {event.day}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm break-words">
                    {event.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="School Calendar">
        <Calendar
          initialDate={today}
          events={calendarEvents}
          showEventDots
        />
      </Modal>
    </Card>
  );
}
