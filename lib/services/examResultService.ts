import { unwrapArray, unwrapData } from "@/lib/utils/unwrap";
﻿import { formatApiError } from "@/lib/services/apiError";
import type {
  ExamResultCreate,
  ExamResultResponse,
  ExamResultUpdate,
} from "@/types/entities/exam-result";

const BASE = "/api/exam-results";

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

export async function getAllExamResults(
  token: string,
): Promise<ExamResultResponse[]> {
  const res = await request<any>("", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return unwrapArray<ExamResultResponse>(res);
}

export async function getExamResultById(
  token: string,
  examResultId: string,
): Promise<ExamResultResponse> {
  return request<ExamResultResponse>(`/${encodeURIComponent(examResultId)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createExamResult(
  token: string,
  payload: ExamResultCreate,
): Promise<ExamResultResponse> {
  return request<ExamResultResponse>("", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function updateExamResult(
  token: string,
  examResultId: string,
  payload: ExamResultUpdate,
): Promise<ExamResultResponse> {
  return request<ExamResultResponse>(`/${encodeURIComponent(examResultId)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function deleteExamResult(
  token: string,
  examResultId: string,
): Promise<void> {
  return request<void>(`/${encodeURIComponent(examResultId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

