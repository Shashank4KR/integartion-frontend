import { unwrapArray } from "@/lib/utils/unwrap";
﻿import type { UserCreate, UserResponse } from "@/types/entities/user";

const BASE = "/api/users";

export async function listUsers(token: string): Promise<UserResponse[]> {
  const response = await fetch(`${BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch users.");
  }

  const data = await response.json();
  return unwrapArray(data);
}

export async function getUser(token: string, id: string): Promise<UserResponse> {
  const response = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch user.");
  }

  return (await response.json()) as UserResponse;
}

export async function createUser(
  token: string,
  payload: UserCreate,
): Promise<UserResponse> {
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
    throw new Error(data.detail ?? "Failed to create user.");
  }

  return (await response.json()) as UserResponse;
}

export async function updateUser(
  token: string,
  id: string,
  payload: Partial<UserCreate>,
): Promise<UserResponse> {
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
    throw new Error(data.detail ?? "Failed to update user.");
  }

  return (await response.json()) as UserResponse;
}

export async function deleteUser(token: string, id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to delete user.");
  }
}

