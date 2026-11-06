import type { EventGenre, EventItem, EventStatus, TargetAudienceRole } from "@/types/events";

const EVENTS_STORAGE_KEY = "nomera_school_events";
const BASE = "/api/events";

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-01",
    title: "Inter-School Science & Robotics Championship 2026",
    genre: "COMPETITION",
    targetAudience: "STUDENTS",
    targetClasses: ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"],
    startDate: "2026-11-20",
    startTime: "09:00 AM",
    endDate: "2026-11-21",
    endTime: "04:30 PM",
    venue: "Main Campus Auditorium & STEM Lab",
    description: "Annual multi-school innovation challenge featuring line-follower robots, IoT sensor models, and sustainable energy projects.",
    eligibility: "Teams of 2 to 4 students from registered schools.",
    registrationRequired: true,
    maxParticipants: 40,
    registrationDeadline: "2026-11-15",
    coordinatorName: "Prof. Arvind Rao",
    coordinatorContact: "arvind.stem@school.edu",
    prizes: "1st: ₹25,000 + Gold Trophy | 2nd: ₹15,000 | 3rd: ₹10,000",
    status: "UPCOMING",
    registeredCount: 28,
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt-02",
    title: "Annual Day & Cultural Celebration (Tarang 2026)",
    genre: "CELEBRATION",
    targetAudience: "ALL",
    targetClasses: ["All Classes"],
    startDate: "2026-12-05",
    startTime: "05:00 PM",
    endDate: "2026-12-05",
    endTime: "09:30 PM",
    venue: "Open Air Amphitheatre & Sports Ground",
    description: "Grand annual day celebration showcasing classical dance, theatrical dramas, musical orchestras, and felicitation of annual academic toppers.",
    eligibility: "All students, parents, alumni, and faculty members.",
    registrationRequired: false,
    coordinatorName: "Mrs. Shobha Kulkarni",
    coordinatorContact: "cultural.coord@school.edu",
    status: "UPCOMING",
    registeredCount: 450,
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt-03",
    title: "Class 10 & 12 Pre-Board Exam Orientation for Parents",
    genre: "MEETING",
    targetAudience: "PARENTS_AND_STUDENTS",
    targetClasses: ["Class 10", "Class 12"],
    startDate: "2026-11-14",
    startTime: "10:30 AM",
    endDate: "2026-11-14",
    endTime: "01:00 PM",
    venue: "Conference Hall B",
    description: "Comprehensive briefing on board examination patterns, marks moderation guidelines, counseling for exam stress management, and revision schedules.",
    eligibility: "Mandatory for parents and students of Class 10 & 12.",
    registrationRequired: false,
    coordinatorName: "Dr. B. K. Goswami (Principal)",
    coordinatorContact: "principal@school.edu",
    status: "UPCOMING",
    registeredCount: 160,
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt-04",
    title: "Annual Athletics & Sports Meet (Sprint 2026)",
    genre: "SPORTS",
    targetAudience: "STUDENTS",
    targetClasses: ["Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
    startDate: "2026-11-28",
    startTime: "08:00 AM",
    endDate: "2026-11-29",
    endTime: "05:00 PM",
    venue: "Athletics Stadium & Running Track",
    description: "Track and field events including 100m sprint, 4x100m relay, long jump, shot put, and inter-house football championship.",
    eligibility: "Qualified house participants selected from heats.",
    registrationRequired: true,
    maxParticipants: 120,
    registrationDeadline: "2026-11-22",
    coordinatorName: "Coach Rajesh Singh",
    coordinatorContact: "sports@school.edu",
    status: "UPCOMING",
    registeredCount: 95,
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt-05",
    title: "National Constitution Day Celebration",
    genre: "CELEBRATION",
    targetAudience: "ALL",
    targetClasses: ["All Classes"],
    startDate: "2026-11-26",
    startTime: "09:30 AM",
    endDate: "2026-11-26",
    endTime: "11:00 AM",
    venue: "Morning Assembly Quadrangle",
    description: "Reading of the Preamble, quiz on Indian Constitution, and special address by Senior Advocate on fundamental duties and rights.",
    registrationRequired: false,
    coordinatorName: "Department of Social Sciences",
    status: "UPCOMING",
    registeredCount: 300,
    createdAt: new Date().toISOString(),
  },
];

export function getStoredEvents(): EventItem[] {
  if (typeof window === "undefined") return INITIAL_EVENTS;
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EVENTS;
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

export async function fetchBackendEvents(token: string): Promise<EventItem[]> {
  try {
    const response = await fetch(`${BASE}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Map backend event structure to EventItem if needed
        return data.map((d: any) => ({
          id: d.id,
          title: d.event_name || d.title,
          genre: (d.event_type || "OTHER") as EventGenre,
          targetAudience: "ALL" as TargetAudienceRole,
          targetClasses: ["All Classes"],
          startDate: d.start_date,
          endDate: d.end_date,
          venue: d.venue || "Campus",
          description: d.description || "",
          registrationRequired: false,
          status: "UPCOMING" as EventStatus,
        }));
      }
    }
  } catch {
    // Fallback to local storage
  }
  return getStoredEvents();
}
