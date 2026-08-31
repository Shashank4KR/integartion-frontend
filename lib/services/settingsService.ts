import { saveUser } from "@/lib/auth";
import type { UserResponse } from "@/types/auth";

const SETTINGS_BASE = "/api/settings";
const AUTH_BASE = "/api/auth";
const AUDIT_BASE = "/api/audit-logs";

export async function getSettings(
  token: string,
): Promise<Record<string, any>> {
  const response = await fetch(`${SETTINGS_BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch settings.");
  }

  return (await response.json()) as Record<string, any>;
}

export async function updateSettings(
  token: string,
  payload: Record<string, any>,
): Promise<Record<string, any>> {
  const response = await fetch(`${SETTINGS_BASE}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(data.detail ?? "Failed to update settings.");
  }

  return (await response.json()) as Record<string, any>;
}

export async function updateCategorySettings(
  token: string,
  category: string,
  config: Record<string, any>,
): Promise<any> {
  const response = await fetch(`${SETTINGS_BASE}/${category}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ config }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(data.detail ?? `Failed to update ${category} settings.`);
  }

  return await response.json();
}

export async function updateProfile(
  token: string,
  payload: { username?: string; email?: string; phone?: string },
): Promise<UserResponse> {
  const response = await fetch(`${AUTH_BASE}/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(data.detail ?? "Failed to update profile information.");
  }

  const updatedUser = (await response.json()) as UserResponse;
  saveUser(updatedUser);
  return updatedUser;
}

export async function changePassword(
  token: string,
  payload: { current_password: string; new_password: string },
): Promise<{ message: string }> {
  const response = await fetch(`${AUTH_BASE}/change-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(data.detail ?? "Failed to change password.");
  }

  return (await response.json()) as { message: string };
}

export async function getUserSessions(token: string): Promise<Array<{
  id: string;
  login_time: string | null;
  logout_time: string | null;
  device: string;
  ip_address: string;
  is_active: boolean;
}>> {
  const response = await fetch(`${AUTH_BASE}/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json().catch(() => [])) as Array<{
    id: string;
    login_time: string | null;
    logout_time: string | null;
    device: string;
    ip_address: string;
    is_active: boolean;
  }>;
}

export async function getAuditLogs(token: string): Promise<Array<{
  id: string;
  activity: string;
  details?: string | null;
  timestamp?: string | null;
  created_at?: string | null;
  user_id?: string | null;
  user?: { username?: string; email?: string } | null;
}>> {
  const response = await fetch(`${AUDIT_BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json().catch(() => [])) as Array<{
    id: string;
    activity: string;
    details?: string | null;
    timestamp?: string | null;
    created_at?: string | null;
    user_id?: string | null;
    user?: { username?: string; email?: string } | null;
  }>;
}

export async function exportAuditLogsCSV(token: string): Promise<void> {
  const logs = await getAuditLogs(token);
  if (!logs || logs.length === 0) {
    throw new Error("No audit log records available to export.");
  }

  const headers = ["ID", "Activity", "Details", "User", "Timestamp"];
  const rows = logs.map((log) => [
    `"${log.id || ""}"`,
    `"${(log.activity || "").replace(/"/g, '""')}"`,
    `"${(log.details || "").replace(/"/g, '""')}"`,
    `"${(log.user?.username || log.user_id || "System").replace(/"/g, '""')}"`,
    `"${log.timestamp || log.created_at || new Date().toISOString()}"`,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `audit_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}