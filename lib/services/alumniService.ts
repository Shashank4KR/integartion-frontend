import { unwrapArray } from "@/lib/utils/unwrap";
const BASE = "/api/alumni";

export async function listAlumni(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch alumni.");
  }

  return unwrapArray(await response.json());
}

export async function getAlumni(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch alumni.");
  }

  return (await response.json()) as any;
}

export async function createAlumni(
  token: string,
  payload: any,
): Promise<any> {
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
    throw new Error(data.detail ?? "Failed to create alumni record.");
  }

  return (await response.json()) as any;
}

export async function updateAlumni(
  token: string,
  id: string,
  payload: any,
): Promise<any> {
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
    throw new Error(data.detail ?? "Failed to update alumni record.");
  }

  return (await response.json()) as any;
}

export async function deleteAlumni(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete alumni record.");
  }
}