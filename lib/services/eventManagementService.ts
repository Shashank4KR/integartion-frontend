import type { EventGenre, EventItem, EventStatus, TargetAudienceRole } from "@/types/events";

const EVENTS_STORAGE_KEY = "nomera_school_events";
const BASE = "/api/events";

export const INITIAL_EVENTS: EventItem[] = [];

function isMockEvent(e: EventItem): boolean {
  if (!e || !e.id) return true;
  if (["evt-01", "evt-02", "evt-03", "evt-04", "evt-05"].includes(e.id)) return true;
  return false;
}

export function getStoredEvents(): EventItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    const cleaned = Array.isArray(parsed) ? parsed.filter((e) => !isMockEvent(e)) : [];
    return cleaned;
  } catch {
    return [];
  }
}

export function saveEventItem(event: EventItem): EventItem[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getStoredEvents();
    const index = existing.findIndex((e) => e.id === event.id);
    let updated: EventItem[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = event;
    } else {
      updated = [event, ...existing];
    }
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteEventItem(id: string): EventItem[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getStoredEvents();
    const updated = existing.filter((e) => e.id !== id);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// Map backend DB record to frontend EventItem
function mapBackendEvent(b: any): EventItem {
  return {
    id: String(b.id),
    title: b.event_name || b.title || "School Event",
    genre: (b.event_type || "ACADEMIC") as EventGenre,
    targetAudience: (b.target_audience || "ALL") as TargetAudienceRole,
    targetClasses: b.target_classes || ["All Classes"],
    startDate: b.start_date ? String(b.start_date).split("T")[0] : new Date().toISOString().split("T")[0],
    startTime: b.start_time || "09:00 AM",
    endDate: b.end_date ? String(b.end_date).split("T")[0] : new Date().toISOString().split("T")[0],
    endTime: b.end_time || "04:00 PM",
    venue: b.venue || "Campus Auditorium",
    description: b.description || "",
    eligibility: b.eligibility || "Open to all students & staff",
    registrationRequired: Boolean(b.registration_required),
    status: (b.status || "UPCOMING") as EventStatus,
    registeredCount: b.registered_count || 0,
    createdAt: b.created_at || new Date().toISOString(),
  };
}

// Fetch live events from backend PostgreSQL database
export async function fetchLiveEvents(token?: string | null): Promise<EventItem[]> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(BASE, { headers });
    if (!res.ok) return getStoredEvents();

    const json = await res.json();
    const data = json && json.data !== undefined ? json.data : json;
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
          ? data.data
          : [];

    if (!list.length) return getStoredEvents();

    const mapped = list.map(mapBackendEvent);

    if (typeof window !== "undefined") {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(mapped));
    }

    return mapped;
  } catch {
    return getStoredEvents();
  }
}

// Save event to live backend and local cache
export async function saveLiveEvent(event: EventItem, token?: string | null): Promise<EventItem[]> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const payload = {
      event_name: event.title,
      event_type: event.genre,
      description: event.description,
      start_date: event.startDate,
      end_date: event.endDate || event.startDate,
      venue: event.venue,
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.id);
    let res: Response;

    if (isUUID) {
      res = await fetch(`${BASE}/${event.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(BASE, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
    }

    if (res.ok) {
      const saved = await res.json();
      const mapped = mapBackendEvent(saved);
      return saveEventItem(mapped);
    }
  } catch (err) {
    console.warn("Could not save event to backend, persisting locally:", err);
  }

  return saveEventItem(event);
}

// Delete event from live backend and local cache
export async function deleteLiveEvent(id: string, token?: string | null): Promise<EventItem[]> {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUUID) {
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${BASE}/${id}`, { method: "DELETE", headers });
    } catch (err) {
      console.warn("Could not delete event from backend:", err);
    }
  }
  return deleteEventItem(id);
}
