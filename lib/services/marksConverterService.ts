export type BoardDirection =
  | "CBSE_TO_STATE"
  | "STATE_TO_CBSE"
  | "ICSE_TO_CBSE"
  | "CBSE_TO_ICSE"
  | "ICSE_TO_STATE"
  | "STATE_TO_ICSE";

export interface MarksConverterOptions {
  states: string[];
  classes: string[];
  exam_types: string[];
  subjects: string[];
  methods: { id: string; label: string }[];
}

export interface MarksConversionRule {
  id: string;
  board_direction: BoardDirection;
  state: string;
  class_grade: string;
  subject: string | null;
  exam_type: string;
  academic_year: string;
  source_max_marks: number;
  target_max_marks: number;
  method: string;
  source_title: string | null;
  reference_url: string | null;
  is_official: boolean;
  is_active: boolean;
  verified_at: string | null;
}

export interface MarksConversionResult {
  history_id: string;
  board_direction: BoardDirection;
  source_board: string;
  target_board: string;
  state: string;
  class_grade: string;
  subject: string | null;
  marks_obtained: number;
  source_max_marks: number;
  target_marks: number;
  target_max_marks: number;
  percentage: number;
  method: string;
  formula: string;
  is_official: boolean;
  status_note: string;
  source_title: string | null;
  reference_url: string | null;
  created_at: string;
}

export interface MarksConversionHistoryEntry {
  id: string;
  board_direction: BoardDirection;
  state: string;
  class_grade: string;
  subject: string | null;
  marks_obtained: number;
  source_max_marks: number;
  target_marks: number;
  target_max_marks: number;
  percentage: number;
  method: string;
  is_official: boolean;
  formula: string;
  source_title: string | null;
  reference_url: string | null;
  created_at: string;
}

export interface MarksConversionPayload {
  board_direction: BoardDirection;
  state: string;
  class_grade: string;
  subject: string | null;
  exam_type: string;
  academic_year: string;
  marks_obtained: number;
  source_max_marks: number;
  target_max_marks: number;
}

export type MarksRulePayload = Omit<MarksConversionRule, "id" | "verified_at">;

function unwrapItems<T = any>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as {
    data?: unknown;
    items?: unknown;
    results?: unknown;
  };

  if (Array.isArray(record.data)) return record.data as T[];
  if (Array.isArray(record.items)) return record.items as T[];
  if (Array.isArray(record.results)) return record.results as T[];

  if (record.data && typeof record.data === "object") {
    const data = record.data as { items?: unknown; results?: unknown; data?: unknown };
    if (Array.isArray(data.items)) return data.items as T[];
    if (Array.isArray(data.results)) return data.results as T[];
    if (Array.isArray(data.data)) return data.data as T[];
  }

  return [];
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("nomera_token") || localStorage.getItem("nomera_access_token");
    if (!token) {
      try {
        const stored = localStorage.getItem("nomera_user");
        const parsed = stored ? JSON.parse(stored) : null;
        token = parsed?.access_token || parsed?.token || null;
      } catch {}
    }
  }

  const response = await fetch(`/api/marks-converter/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let data: any = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }
  if (!response.ok) {
    const detail = data?.detail || data?.error?.message || data?.message;
    throw new Error(typeof detail === "string" ? detail : "The request could not be completed.");
  }
  if (data && typeof data === "object" && "data" in data && data.data !== null && data.data !== undefined) {
    return data.data as T;
  }
  return data as T;
}

export const getMarksConverterOptions = () => request<MarksConverterOptions>("options");
export const convertMarks = (payload: MarksConversionPayload) => request<MarksConversionResult>("convert", { method: "POST", body: JSON.stringify(payload) });
export const getConversionHistory = async () => {
  const res = await request<any>("history?limit=20").catch(() => []);
  return unwrapItems<MarksConversionHistoryEntry>(res);
};
export const getConversionRules = async () => {
  const res = await request<any>("rules?include_inactive=true").catch(() => []);
  return unwrapItems<MarksConversionRule>(res);
};
export const createConversionRule = (payload: MarksRulePayload) => request<MarksConversionRule>("rules", { method: "POST", body: JSON.stringify(payload) });
export const updateConversionRule = (id: string, payload: Partial<MarksRulePayload>) => request<MarksConversionRule>(`rules/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
