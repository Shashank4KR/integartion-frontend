import { unwrapArray, unwrapPaginated } from "@/lib/utils/unwrap";
﻿import type { AdminCreate, AdminResponse } from "@/types/entities/admin";

const BASE = "/api/admins";

export async function listAdmins(
  token: string,
  limit = 50,
  offset = 0,
): Promise<AdminResponse[]> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch admins.");
  }

  const data = await response.json();
  return unwrapArray(data);
}

export async function listAdminsPaginated(
  token: string,
  limit = 50,
  offset = 0,
): Promise<{ items: AdminResponse[]; total: number }> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch admins.");
  }

  const data = await response.json();
  return unwrapPaginated(data);
}

export async function getAdmin(
  token: string,
  id: string,
): Promise<AdminResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch admin.");
  }

  return (await response.json()) as AdminResponse;
}

export async function createAdmin(
  token: string,
  payload: AdminCreate,
): Promise<AdminResponse> {
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
    throw new Error(data.detail ?? "Failed to create admin.");
  }

  return (await response.json()) as AdminResponse;
}

export async function updateAdmin(
  token: string,
  id: string,
  payload: Partial<AdminCreate>,
): Promise<AdminResponse> {
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
    throw new Error(data.detail ?? "Failed to update admin.");
  }

  return (await response.json()) as AdminResponse;
}

export async function deleteAdmin(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete admin.");
  }
}

