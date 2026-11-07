import type { EventGenre, EventItem, EventStatus, TargetAudienceRole } from "@/types/events";

const EVENTS_STORAGE_KEY = "nomera_school_events";
const BASE = "/api/events";

// ZERO mock events. Real data only.
export const INITIAL_EVENTS: EventItem[] = [];

// Helper to filter out any legacy mock data cached in user's browser
function isMockEvent(e: EventItem): boolean {
  if (!e || !e.id) return true;
  if (["evt-01", "evt-02", "evt-03", "evt-04", "evt-05"].includes(e.id)) return true;
  const t = (e.title || "").toLowerCase();
  if (
    t.includes("robotics championship") ||
    t.includes("tarang 2026") ||
    t.includes("sprint 2026") ||
    t.includes("constitution day") ||
    t.includes("pre-board exam orientation")
  ) {
    return true;
  }
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
    // Immediately persist cleaned list so browser never shows mock events again
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(cleaned));
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

// Fetch live events from backend PostgreSQL database
export async function fetchLiveEvents(token?: string): Promise<EventItem[]> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(BASE, { headers });
    if (!res.ok) return getStoredEvents();

    const data = await res.json();
    if (!Array.isArray(data)) return getStoredEvents();

    // Map backend events to EventItem
    const mapped: EventItem[] = data.map((b: any) => ({
      id: b.id,
      title: b.title || "School Event",
      genre: (b.event_type || "ACADEMIC") as EventGenre,
      targetAudience: "ALL" as TargetAudienceRole,
      targetClasses: ["All Classes"],
      startDate: b.start_date ? b.start_date.split("T")[0] : new Date().toISOString().split("T")[0],
      startTime: "09:00 AM",
      endDate: b.end_date ? b.end_date.split("T")[0] : new Date().toISOString().split("T")[0],
      endTime: "04:00 PM",
      venue: b.venue || "Campus Auditorium",
      description: b.description || "",
      eligibility: "",
      registrationRequired: false,
      status: "UPCOMING" as EventStatus,
      registeredCount: 0,
      createdAt: b.created_at || new Date().toISOString(),
    }));

    // Merge with any local user-created events
    const local = getStoredEvents();
    const merged = [...local];
    mapped.forEach((m) => {
      if (!merged.find((e) => e.id === m.id)) {
        merged.push(m);
      }
    });

    return merged;
  } catch {
    return getStoredEvents();
  }
}
