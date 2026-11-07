import type {
  TimetableCreate,
  TimetableResponse,
  TimetableUpdate,
} from "@/types/entities/timetable";

const BASE = "/api/timetables";

export async function listTimetables(
  token: string,
  limit = 50,
  offset = 0,
): Promise<TimetableResponse[]> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch timetables.");
  }

  const data = await response.json();
  if (Array.isArray(data)) return data as TimetableResponse[];
  if (data && Array.isArray(data.items)) return data.items as TimetableResponse[];
  return [];
}

export async function listTimetablesPaginated(
  token: string,
  limit = 50,
  offset = 0,
): Promise<{ items: TimetableResponse[]; total: number }> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch timetables.");
  }

  const data = await response.json();
  if (data && Array.isArray(data.items)) {
    return { items: data.items, total: data.total ?? data.items.length };
  }
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  return { items: [], total: 0 };
}

export async function getTimetable(
  token: string,
  id: string,
): Promise<TimetableResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch timetable.");
  }

  return (await response.json()) as TimetableResponse;
}

export async function createTimetable(
  token: string,
  payload: TimetableCreate,
): Promise<TimetableResponse> {
  const response = await fetch(`${BASE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to create timetable.");
  }

  return (await response.json()) as TimetableResponse;
}

export async function updateTimetable(
  token: string,
  id: string,
  payload: TimetableUpdate,
): Promise<TimetableResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to update timetable.");
  }

  return (await response.json()) as TimetableResponse;
}

export async function getClassTimetable(
  token: string,
  classId: string,
): Promise<TimetableResponse[]> {
  const response = await fetch(`/api/classes/${classId}/timetable`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch class timetable.");
  }

  const text = await response.text();
  if (!text) return [];
  return JSON.parse(text) as TimetableResponse[];
}

export type StudentTimetableResponse = TimetableResponse & {
  subject_name?: string | null;
  teacher_name?: string | null;
};

export async function getCurrentStudentTimetable(
  token: string,
): Promise<StudentTimetableResponse[]> {
  const response = await fetch("/api/students/me/timetable", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch your timetable.");
  }

  const text = await response.text();
  if (!text) return [];
  return JSON.parse(text) as StudentTimetableResponse[];
}

export async function deleteTimetable(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete timetable.");
  }
}


