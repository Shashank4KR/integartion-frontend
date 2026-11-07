import { unwrapArray, unwrapData } from "@/lib/utils/unwrap";
﻿import { formatApiError } from "@/lib/services/apiError";
import type {
  ExamCreate,
  ExamResponse,
  ExamTopper,
  ExamUpdate,
} from "@/types/entities/exam";

const BASE = "/api/exams";

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!response.ok) {
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }
    if (!parsed) {
      throw new Error(
        response.statusText || `Request failed with status ${response.status}.`,
      );
    }
    throw new Error(formatApiError(parsed, "Request failed.", response.statusText));
  }

  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function getAllExams(
  token: string,
): Promise<ExamResponse[]> {
  const res = await request<any>("", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return unwrapArray<ExamResponse>(res);
}

export async function getExamById(
  token: string,
  examId: string,
): Promise<ExamResponse> {
  return request<ExamResponse>(`/${encodeURIComponent(examId)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createExam(
  token: string,
  payload: ExamCreate,
): Promise<ExamResponse> {
  return request<ExamResponse>("", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function updateExam(
  token: string,
  examId: string,
  payload: ExamUpdate,
): Promise<ExamResponse> {
  return request<ExamResponse>(`/${encodeURIComponent(examId)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function deleteExam(
  token: string,
  examId: string,
): Promise<void> {
  return request<void>(`/${encodeURIComponent(examId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getExamToppers(
  token: string,
  examId: string,
): Promise<ExamTopper[]> {
  const res = await request<any>(
    `/${encodeURIComponent(examId)}/toppers`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return unwrapArray<ExamTopper>(res);
}

