import type { ClassSubjectResponse } from "@/types/entities/class-subject";

const BASE = "/api/class-subjects";

export async function listClassSubjects(token: string): Promise<ClassSubjectResponse[]> {
  const response = await fetch(`${BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch class-subject mappings.");
  }

  return (await response.json()) as ClassSubjectResponse[];
}

export async function createClassSubject(
  token: string,
  payload: { class_id: string; subject_id: string },
): Promise<ClassSubjectResponse> {
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
    throw new Error(data.detail ?? "Failed to create class-subject mapping.");
  }

  return (await response.json()) as ClassSubjectResponse;
}

export async function getClassSubject(
  token: string,
  id: string,
): Promise<ClassSubjectResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch class-subject mapping.");
  }

  return (await response.json()) as ClassSubjectResponse;
}

export async function deleteClassSubject(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    let message = "Failed to delete class-subject mapping.";
    try {
      const data = (await response.json()) as { detail?: string };
      message = data.detail ?? message;
    } catch (err) {
      console.warn("[classSubjectService] Error parsing non-JSON response body:", err);
    }
    throw new Error(message);
  }
}

