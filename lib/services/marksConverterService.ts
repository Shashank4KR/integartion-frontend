export type BoardDirection = "CBSE_TO_STATE" | "STATE_TO_CBSE";

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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/marks-converter/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }
  if (!response.ok) {
    const detail = (data as { detail?: unknown } | null)?.detail;
    throw new Error(typeof detail === "string" ? detail : "The request could not be completed.");
  }
  return data as T;
}

export const getMarksConverterOptions = () => request<MarksConverterOptions>("options");
export const convertMarks = (payload: MarksConversionPayload) => request<MarksConversionResult>("convert", { method: "POST", body: JSON.stringify(payload) });
export const getConversionHistory = () => request<MarksConversionHistoryEntry[]>("history?limit=20");
export const getConversionRules = () => request<MarksConversionRule[]>("rules?include_inactive=true");
export const createConversionRule = (payload: MarksRulePayload) => request<MarksConversionRule>("rules", { method: "POST", body: JSON.stringify(payload) });
export const updateConversionRule = (id: string, payload: Partial<MarksRulePayload>) => request<MarksConversionRule>(`rules/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
