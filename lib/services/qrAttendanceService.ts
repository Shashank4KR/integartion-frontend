import { unwrapArray } from "@/lib/utils/unwrap";
const BASE = "/api/qr-attendance";

export async function listQRSessions(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch QR sessions.");
  }

  return unwrapArray(await response.json());
}

export async function createQRSession(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to create QR session.");
  }

  return (await response.json()) as any;
}

export async function getQRSession(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${BASE}/sessions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch QR session.");
  }

  return (await response.json()) as any;
}

export async function markQRAttendance(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/mark`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to mark QR attendance.");
  }

  return (await response.json()) as any;
}

export async function getQRAttendanceReport(
  token: string,
  sessionId: string,
): Promise<any> {
  const response = await fetch(`${BASE}/sessions/${sessionId}/report`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch QR attendance report.");
  }

  return (await response.json()) as any;
}