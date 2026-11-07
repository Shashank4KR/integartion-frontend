import { unwrapArray } from "@/lib/utils/unwrap";
﻿import type { TeacherSubjectCreate, TeacherSubjectResponse } from "@/types/entities/teacher-subject";

const BASE = "/api/teacher-subjects";

export type ServiceError = Error & { status?: number };

async function parseError(response: Response): Promise<ServiceError> {
  const status = response.status;
  const text = await response.text();
  let message = `Request failed with status ${status}`;

  if (text) {
    try {
      const data = JSON.parse(text) as {
        detail?: unknown;
        message?: unknown;
      };
      const detail = data.detail ?? data.message;
      if (typeof detail === "string" && detail.length > 0) {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail
          .map((d) => (typeof d === "object" && d && "msg" in d ? String((d as { msg: unknown }).msg) : JSON.stringify(d)))
          .join("; ");
      } else {
        message = text;
      }
    } catch {
      message = text;
    }
  }

  const error = new Error(message) as ServiceError;
  error.status = status;
  return error;
}

export async function listTeacherSubjects(token: string): Promise<TeacherSubjectResponse[]> {
  const response = await fetch(`${BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const text = await response.text();
  if (!text) return [];
  try {
    return unwrapArray(JSON.parse(text));
  } catch {
    return [];
  }
}

export async function getTeacherSubject(
  token: string,
  id: string,
): Promise<TeacherSubjectResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const text = await response.text();
  if (!text) {
    throw new Error("Teacher-subject mapping response was empty.");
  }
  return JSON.parse(text) as TeacherSubjectResponse;
}

export async function createTeacherSubject(
  token: string,
  payload: TeacherSubjectCreate,
): Promise<TeacherSubjectResponse> {
  const response = await fetch(`${BASE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const text = await response.text();
  if (!text) {
    throw new Error("Teacher-subject mapping response was empty.");
  }
  return JSON.parse(text) as TeacherSubjectResponse;
}

export async function deleteTeacherSubject(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response);
  }
}

