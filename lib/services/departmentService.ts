import { unwrapArray, unwrapPaginated } from "@/lib/utils/unwrap";
﻿import type { DepartmentCreate, DepartmentResponse } from "@/types/entities/department";

const BASE = "/api/departments";

export async function listDepartments(
  token: string,
  limit = 50,
  offset = 0,
): Promise<DepartmentResponse[]> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch departments.");
  }

  const data = await response.json();
  return unwrapArray(data);
}

export async function listDepartmentsPaginated(
  token: string,
  limit = 50,
  offset = 0,
): Promise<{ items: DepartmentResponse[]; total: number }> {
  const queryParam = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  const response = await fetch(`${BASE}${queryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch departments.");
  }

  const data = await response.json();
  return unwrapPaginated(data);
}

export async function getDepartment(
  token: string,
  id: string,
): Promise<DepartmentResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch department.");
  }

  return (await response.json()) as DepartmentResponse;
}

export async function createDepartment(
  token: string,
  payload: DepartmentCreate,
): Promise<DepartmentResponse> {
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
    throw new Error(data.detail ?? "Failed to create department.");
  }

  return (await response.json()) as DepartmentResponse;
}

export async function updateDepartment(
  token: string,
  id: string,
  payload: Partial<DepartmentCreate>,
): Promise<DepartmentResponse> {
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
    throw new Error(data.detail ?? "Failed to update department.");
  }

  return (await response.json()) as DepartmentResponse;
}

export async function deleteDepartment(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete department.");
  }
}

