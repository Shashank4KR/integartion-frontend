import { unwrapArray } from "@/lib/utils/unwrap";
﻿export async function listAnnouncements(token: string): Promise<any[]> {
  const response = await fetch("/api/announcements", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = (await response.json()) as { detail?: string };
    throw new Error(data.detail ?? "Failed to fetch announcements.");
  }

  const data = await response.json();
  return unwrapArray(data);
}

