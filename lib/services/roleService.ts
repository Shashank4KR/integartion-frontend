import { unwrapArray } from "@/lib/utils/unwrap";
export type RoleResponse = {
  id: string;
  role_name: string;
  description: string;
};

export type PermissionResponse = {
  id: string;
  name: string;
  description: string;
};

export async function listRoles(token: string): Promise<RoleResponse[]> {
  const response = await fetch("/api/roles", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch roles.");
  }

  const data = await response.json();
  return unwrapArray(data);
}

export async function listPermissions(token: string): Promise<PermissionResponse[]> {
  const response = await fetch("/api/permissions", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch permissions.");
  }

  const data = await response.json();
  return unwrapArray(data);
}
