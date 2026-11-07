import { unwrapArray } from "@/lib/utils/unwrap";
const BASE = "/api/visitors";

export async function listVisitors(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch visitors.");
  }

  return unwrapArray(await response.json());
}

export async function getVisitor(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch visitor.");
  }

  return (await response.json()) as any;
}

export async function checkInVisitor(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/checkin`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to check in visitor.");
  }

  return (await response.json()) as any;
}

export async function checkOutVisitor(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${BASE}/${id}/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to check out visitor.");
  }

  return (await response.json()) as any;
}

export async function deleteVisitor(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete visitor.");
  }
}