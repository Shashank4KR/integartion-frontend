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

export async function listBookIssues(token: string): Promise<any[]> {
  const response = await fetch("/api/book-issues", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch book issues.");
  }

  return unwrapItems(await response.json());
}

export async function listOverdueBookIssues(token: string): Promise<any[]> {
  const response = await fetch("/api/book-issues/overdue", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch overdue book issues.");
  }

  return unwrapItems(await response.json());
}

export async function listFinePayments(token: string): Promise<any[]> {
  const response = await fetch("/api/library/fine-payments", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch fine payments.");
  }

  return unwrapItems(await response.json());
}

export async function listStudentBookIssues(
  token: string,
  studentId: string,
): Promise<any[]> {
  const response = await fetch(`/api/students/${studentId}/book-issues`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch issued books.");
  }

  return unwrapItems(await response.json());
}

export async function listBooks(token: string): Promise<any[]> {
  const response = await fetch("/api/books", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch library books.");
  }

  return unwrapItems(await response.json());
}

export async function getLibraryDashboardAnalytics(
  token: string,
): Promise<any> {
  const response = await fetch("/api/library/analytics/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch library analytics.");
  }

  return unwrapData(await response.json(), {});
}

export async function getLibrarySummary(token: string): Promise<any> {
  const response = await fetch("/api/library/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch library summary.");
  }

  return unwrapData(await response.json(), {});
}
