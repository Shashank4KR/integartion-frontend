import type {
  BookCategoryCreate,
  BookCategoryResponse,
  BookCreate,
  BookIssueCreate,
  BookIssueResponse,
  BookResponse,
  BookUpdate,
} from "@/types/entities/library";

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

function unwrapItems<T = any>(payload: unknown): T[] {
  const data = unwrapData<unknown>(payload, []);
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as { items?: unknown; results?: unknown };
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.results)) return record.results as T[];
  }
  return [];
}

export async function listBookIssues(token: string): Promise<BookIssueResponse[]> {
  const response = await fetch("/api/book-issues", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch book issues.");
  }

  return unwrapItems<BookIssueResponse>(await response.json());
}

export async function listOverdueBookIssues(token: string): Promise<BookIssueResponse[]> {
  const response = await fetch("/api/book-issues/overdue", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch overdue book issues.");
  }

  return unwrapItems<BookIssueResponse>(await response.json());
}

export async function createBookIssue(
  token: string,
  payload: BookIssueCreate,
): Promise<BookIssueResponse> {
  const response = await fetch("/api/book-issues", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to issue book.");
  }

  return (await response.json()) as BookIssueResponse;
}

export async function returnBookIssue(
  token: string,
  issueId: string,
  returnDate?: string,
): Promise<BookIssueResponse> {
  const response = await fetch(`/api/book-issues/${encodeURIComponent(issueId)}/return`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ return_date: returnDate ?? null }),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to process book return.");
  }

  return (await response.json()) as BookIssueResponse;
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
): Promise<BookIssueResponse[]> {
  const response = await fetch(`/api/students/${encodeURIComponent(studentId)}/book-issues`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch issued books.");
  }

  return unwrapItems<BookIssueResponse>(await response.json());
}

export async function getCurrentStudentLibrary(token: string): Promise<any> {
  const response = await fetch("/api/students/me/library", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch your library data.");
  }

  return unwrapData(await response.json(), {});
}

export async function listBooks(
  token: string,
  params?: { search?: string; categoryId?: string; status?: boolean },
): Promise<BookResponse[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.categoryId) query.set("category_id", params.categoryId);
  if (params?.status !== undefined) query.set("status", String(params.status));

  const url = `/api/books${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch library books.");
  }

  return unwrapItems<BookResponse>(await response.json());
}

export async function createBook(
  token: string,
  payload: BookCreate,
): Promise<BookResponse> {
  const response = await fetch("/api/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to create book.");
  }

  return (await response.json()) as BookResponse;
}

export async function updateBook(
  token: string,
  bookId: string,
  payload: BookUpdate,
): Promise<BookResponse> {
  const response = await fetch(`/api/books/${encodeURIComponent(bookId)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to update book.");
  }

  return (await response.json()) as BookResponse;
}

export async function deleteBook(token: string, bookId: string): Promise<void> {
  const response = await fetch(`/api/books/${encodeURIComponent(bookId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to delete book.");
  }
}

export async function listCategories(token: string): Promise<BookCategoryResponse[]> {
  const response = await fetch("/api/book-categories", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch book categories.");
  }

  return unwrapItems<BookCategoryResponse>(await response.json());
}

export async function createCategory(
  token: string,
  payload: BookCategoryCreate,
): Promise<BookCategoryResponse> {
  const response = await fetch("/api/book-categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to create book category.");
  }

  return (await response.json()) as BookCategoryResponse;
}

export async function getLibraryDashboardAnalytics(token: string): Promise<any> {
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

export async function getFineSummary(token: string): Promise<any> {
  const response = await fetch("/api/library/fine-payments/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response, "Failed to fetch fine summary.");
  }

  return unwrapData(await response.json(), {});
}
