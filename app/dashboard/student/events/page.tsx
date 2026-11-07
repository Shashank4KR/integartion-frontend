"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import Card from "@/components/shared/Card";
import Modal from "@/components/shared/Modal";
import Calendar, { CalendarEvent } from "@/components/shared/Calendar";
import {
  CalendarDays,
  Clock,
  MapPin,
  Trophy,
  Sparkles,
  PartyPopper,
  Layers,
  Compass,
  FileBarChart,
  Calendar as CalendarIcon,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface SchoolEvent {
  id: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  description?: string;
  month: string;
  day: number;
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const GENRE_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  ACADEMIC: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", icon: Sparkles },
  SPORTS: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: Trophy },
  CULTURAL: { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", icon: Compass },
  COMPETITION: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Trophy },
  CELEBRATION: { bg: "bg-pink-50 border-pink-200", text: "text-pink-700", icon: PartyPopper },
  WORKSHOP: { bg: "bg-teal-50 border-teal-200", text: "text-teal-700", icon: Layers },
  EXAMINATION: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: FileBarChart },
  OTHER: { bg: "bg-slate-50 border-slate-200", text: "text-slate-700", icon: CalendarDays },
};

export default function StudentEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/events/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Fallback to /api/events
        const fallbackRes = await fetch("/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!fallbackRes.ok) {
          throw new Error("Unable to fetch school events.");
        }
        const data = await fallbackRes.json();
        parseEvents(data);
        return;
      }

      const data = await res.json();
      parseEvents(data);
    } catch (err) {
      console.error("Error loading events:", err);
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  const parseEvents = (raw: any) => {
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.items)
        ? raw.items
        : Array.isArray(raw?.data)
          ? raw.data
          : [];

    const formatted: SchoolEvent[] = list.map((e: any) => {
      const startDateObj = new Date(e.start_date || e.startDate || Date.now());
      const monthStr = MONTHS[startDateObj.getMonth()] || "EVENT";
      const dayNum = startDateObj.getDate();

      return {
        id: String(e.id || Math.random()),
        title: e.event_name || e.title || "School Event",
        genre: String(e.event_type || e.genre || "ACADEMIC").toUpperCase(),
        startDate: e.start_date ? String(e.start_date).split("T")[0] : "",
        endDate: e.end_date ? String(e.end_date).split("T")[0] : undefined,
        venue: e.venue || "Campus Auditorium",
        description: e.description || "No description provided.",
        month: monthStr,
        day: dayNum,
      };
    });

    setEvents(formatted);
  };

  useEffect(() => {
    void fetchEvents();
  }, []);

  const genres = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.genre));
    return ["ALL", ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchGenre = selectedGenre === "ALL" || e.genre === selectedGenre;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.venue && e.venue.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q));
      return matchGenre && matchSearch;
    });
  }, [events, selectedGenre, searchQuery]);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((e) => ({
      day: e.day,
      title: e.title,
    }));
  }, [events]);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-7 w-7 text-purple-600" />
              School Events & Activities
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Discover upcoming competitions, sports meets, cultural festivals, workshops, and exhibitions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition"
            >
              <CalendarIcon className="h-4 w-4" />
              School Calendar
            </button>
            <button
              onClick={fetchEvents}
              disabled={loading}
              title="Refresh events"
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedGenre === g
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {g === "ALL" ? "All Events" : g}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center text-slate-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-3" />
            <p className="text-sm font-medium">Loading upcoming school events...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="p-6 border-red-200 bg-red-50 text-red-700 text-sm">
            <p className="font-semibold mb-1">Could not load events</p>
            <p>{error}</p>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEvents.length === 0 && (
          <Card className="p-12 text-center">
            <CalendarDays className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No events found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no events matching your criteria. Check back soon for new school announcements.
            </p>
          </Card>
        )}

        {/* Events Grid */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const style = GENRE_STYLES[event.genre] || GENRE_STYLES.OTHER;
              const GenreIcon = style.icon;

              return (
                <Card
                  key={event.id}
                  className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer border border-slate-200"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="space-y-4">
                    {/* Header Row: Date Box & Genre Tag */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col items-center justify-center bg-purple-50 text-purple-700 rounded-lg p-2.5 min-w-[56px] border border-purple-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider">{event.month}</span>
                        <span className="text-xl font-extrabold leading-none mt-0.5">{event.day}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text}`}>
                        <GenreIcon className="h-3.5 w-3.5" />
                        {event.genre}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        {event.startDate}
                        {event.endDate && event.endDate !== event.startDate ? ` to ${event.endDate}` : ""}
                      </span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <Modal
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Event Details"}
      >
        {selectedEvent && (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-100 text-purple-800">
                {selectedEvent.genre}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                Status: Upcoming
              </span>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">{selectedEvent.description}</p>

            <div className="bg-slate-50 rounded-lg p-3.5 space-y-2 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="font-medium text-slate-900">Dates:</span>
                <span>
                  {selectedEvent.startDate}
                  {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate
                    ? ` to ${selectedEvent.endDate}`
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="font-medium text-slate-900">Venue:</span>
                <span>{selectedEvent.venue || "Campus Auditorium"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="font-medium text-slate-900">Eligibility:</span>
                <span>Open to all registered students</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Calendar Modal */}
      <Modal
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        title="School Calendar & Upcoming Dates"
      >
        <Calendar initialDate={new Date()} events={calendarEvents} showEventDots />
      </Modal>
    </RoleDashboardLayout>
  );
}
