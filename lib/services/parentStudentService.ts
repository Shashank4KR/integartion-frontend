import type {
  ParentStudentCreate,
  ParentStudentResponse,
} from "@/types/entities/parent-student";

const BASE = "/api/parent-students";

export async function listParentStudents(
  token: string,
  limit = 50,
  offset = 0,
): Promise<ParentStudentResponse[]> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch parent-students.");
  }

  const data = await response.json();
  if (Array.isArray(data)) return data as ParentStudentResponse[];
  if (data && Array.isArray(data.items)) return data.items as ParentStudentResponse[];
  return [];
}

export async function listParentStudentsPaginated(
  token: string,
  limit = 50,
  offset = 0,
): Promise<{ items: ParentStudentResponse[]; total: number }> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch parent-students.");
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

export async function getParentStudent(
  token: string,
  id: string,
): Promise<ParentStudentResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch parent-student relationship.");
  }

  return (await response.json()) as ParentStudentResponse;
}

export async function createParentStudent(
  token: string,
  payload: ParentStudentCreate,
): Promise<ParentStudentResponse> {
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
    throw new Error(data.detail ?? "Failed to create parent-student relationship.");
  }

  return (await response.json()) as ParentStudentResponse;
}

export async function updateParentStudent(
  token: string,
  id: string,
  payload: Partial<ParentStudentCreate>,
): Promise<ParentStudentResponse> {
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
    throw new Error(data.detail ?? "Failed to update parent-student relationship.");
  }

  return (await response.json()) as ParentStudentResponse;
}

export async function deleteParentStudent(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete parent-student relationship.");
  }
}

