import type { ApiErrorResponse } from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "/api";

export async function apiClient<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed. Please try again.";
    try {
      const data = (await response.json()) as ApiErrorResponse;
      if (data?.error?.message) {
        message = data.error.message;
      } else {
        const { detail } = data;
        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          message = detail.map((item) => (typeof item === "string" ? item : item.msg)).join(", ");
        } else if (data?.message) {
          message = data.message;
        }
      }
    } catch (err) {
      console.warn("[apiClient] Response body was not valid JSON, using default error message:", err);
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
