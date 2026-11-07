import { unwrapArray, unwrapPaginated } from "@/lib/utils/unwrap";
﻿import type { SubjectCreate, SubjectResponse, SubjectUpdate } from "@/types/entities/subject";

const BASE = "/api/subjects";

export async function listSubjects(
  token: string,
  limit = 50,
  offset = 0,
): Promise<SubjectResponse[]> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch subjects.");
  }

  const data = await response.json();
  return unwrapArray(data);
}

export async function listSubjectsPaginated(
  token: string,
  limit = 50,
  offset = 0,
): Promise<{ items: SubjectResponse[]; total: number }> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch subjects.");
  }

  const data = await response.json();
  return unwrapPaginated(data);
}

export async function getSubject(
  token: string,
  id: string,
): Promise<SubjectResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch subject.");
  }

  return (await response.json()) as SubjectResponse;
}

export async function createSubject(
  token: string,
  payload: SubjectCreate,
): Promise<SubjectResponse> {
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
    throw new Error(data.detail ?? "Failed to create subject.");
  }

  return (await response.json()) as SubjectResponse;
}

export async function updateSubject(
  token: string,
  id: string,
  payload: SubjectUpdate,
): Promise<SubjectResponse> {
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
    throw new Error(data.detail ?? "Failed to update subject.");
  }

  return (await response.json()) as SubjectResponse;
}

export async function deleteSubject(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete subject.");
  }
}

