import type { ParentCreate, ParentResponse } from "@/types/entities/parent";

const BASE = "/api/parents";

export async function listParents(token: string): Promise<ParentResponse[]> {
  const response = await fetch(`${BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch parents.");
  }

  return (await response.json()) as ParentResponse[];
}

export async function getParent(
  token: string,
  id: string,
): Promise<ParentResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch parent.");
  }

  return (await response.json()) as ParentResponse;
}

export async function createParent(
  token: string,
  payload: ParentCreate,
): Promise<ParentResponse> {
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
    throw new Error(data.detail ?? "Failed to create parent.");
  }

  return (await response.json()) as ParentResponse;
}

export async function updateParent(
  token: string,
  id: string,
  payload: Partial<ParentCreate>,
): Promise<ParentResponse> {
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
    throw new Error(data.detail ?? "Failed to update parent.");
  }

  return (await response.json()) as ParentResponse;
}

export async function deleteParent(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete parent.");
  }
}

export async function getMyChildrenFees(token: string): Promise<any> {
  const response = await fetch(`${BASE}/me/fees`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch children fees.");
  }

  return await response.json();
}

