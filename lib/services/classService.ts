import type { ClassCreate, ClassResponse, ClassUpdate } from "@/types/entities/class";
import type { ClassSubjectSummary } from "@/types/entities/class-subject-summary";
import type { ClassTeacherSummary } from "@/types/entities/class-teacher-summary";

const BASE = "/api/classes";

export async function listClasses(
  token: string,
  limit = 50,
  offset = 0,
): Promise<ClassResponse[]> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch classes.");
  }

  const data = await response.json();
  if (Array.isArray(data)) return data as ClassResponse[];
  if (data && Array.isArray(data.items)) return data.items as ClassResponse[];
  return [];
}

export async function listClassesPaginated(
  token: string,
  limit = 50,
  offset = 0,
): Promise<{ items: ClassResponse[]; total: number }> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch classes.");
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

export async function getClass(
  token: string,
  id: string,
): Promise<ClassResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch class.");
  }

  return (await response.json()) as ClassResponse;
}

export async function createClass(
  token: string,
  payload: ClassCreate,
): Promise<ClassResponse> {
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
    throw new Error(data.detail ?? "Failed to create class.");
  }

  return (await response.json()) as ClassResponse;
}

export async function updateClass(
  token: string,
  id: string,
  payload: ClassUpdate,
): Promise<ClassResponse> {
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
    throw new Error(data.detail ?? "Failed to update class.");
  }

  return (await response.json()) as ClassResponse;
}

export async function deleteClass(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete class.");
  }
}

export async function getClassSubjects(
  token: string,
  classId: string,
): Promise<ClassSubjectSummary[]> {
  const response = await fetch(`${BASE}/${classId}/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch class subjects.");
  }

  return (await response.json()) as ClassSubjectSummary[];
}

export async function getClassTeachers(
  token: string,
  classId: string,
): Promise<ClassTeacherSummary[]> {
  const response = await fetch(`${BASE}/${classId}/teachers`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch class teachers.");
  }

  return (await response.json()) as ClassTeacherSummary[];
}

export async function getClassStudents(
  token: string,
  classId: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/${classId}/students`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch class students.");
  }

  return (await response.json()) as any[];
}


