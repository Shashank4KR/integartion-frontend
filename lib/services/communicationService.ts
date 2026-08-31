const BASE = "/api/communication";

async function parseError(response: Response, fallback: string): Promise<Error> {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return new Error(data.detail ?? data.message ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

function unwrapData<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    return (data ?? fallback) as T;
  }
  return (payload ?? fallback) as T;
}

function unwrapItems(payload: unknown): any[] {
  const data = unwrapData<unknown>(payload, []);
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const record = data as { items?: unknown; results?: unknown };
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.results)) return record.results;
  }
  return [];
}

export async function listAnnouncements(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/announcements`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch announcements.");
  }

  return unwrapItems(await response.json());
}

export async function listNotifications(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch notifications.");
  }

  return unwrapItems(await response.json());
}

export async function markAllNotificationsRead(
  token: string,
): Promise<any> {
  const response = await fetch(`${BASE}/notifications/read-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return { ok: false };
  }

  return unwrapData(await response.json(), { message: "Marked as read" });
}

export async function markNotificationRead(
  token: string,
  id: string,
): Promise<any> {
  const response = await fetch(`${BASE}/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return { ok: false };
  }

  return unwrapData(await response.json(), {});
}

export async function createAnnouncement(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/announcements`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to create announcement.");
  }

  return unwrapData(await response.json(), {});
}

export async function updateAnnouncement(
  token: string,
  id: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/announcements/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to update announcement.");
  }

  return unwrapData(await response.json(), {});
}

export async function deleteAnnouncement(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${BASE}/announcements/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to delete announcement.");
  }
}

export async function listMessages(
  token: string,
): Promise<any[]> {
  const response = await fetch(`${BASE}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch messages.");
  }

  return unwrapItems(await response.json());
}

export async function sendMessage(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to send message.");
  }

  return unwrapData(await response.json(), {});
}

export async function getCommunicationStats(
  token: string,
): Promise<any> {
  const response = await fetch(`${BASE}/statistics`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch communication statistics.");
  }

  return unwrapData(await response.json(), {});
}

export async function sendNotification(
  token: string,
  payload: any,
): Promise<any> {
  const response = await fetch(`${BASE}/notifications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to send notification.");
  }

  return unwrapData(await response.json(), {});
}
