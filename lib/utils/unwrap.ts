/**
 * Universal safe unwrappers for backend API responses.
 * Handles bare arrays, enveloped responses ({ success: true, data: [...] }),
 * paginated responses ({ items: [...], total: N }), and error/null objects.
 */

export function unwrapArray<T = any>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.items)) {
    return obj.items as T[];
  }
  if (Array.isArray(obj.data)) {
    return obj.data as T[];
  }
  if (Array.isArray(obj.results)) {
    return obj.results as T[];
  }
  if (obj.data && typeof obj.data === "object") {
    const sub = obj.data as Record<string, unknown>;
    if (Array.isArray(sub.items)) {
      return sub.items as T[];
    }
    if (Array.isArray(sub.data)) {
      return sub.data as T[];
    }
    if (Array.isArray(sub.results)) {
      return sub.results as T[];
    }
  }
  return [];
}

export function unwrapPaginated<T = any>(payload: unknown): { items: T[]; total: number } {
  const items = unwrapArray<T>(payload);
  let total = items.length;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (typeof obj.total === "number") {
      total = obj.total;
    } else if (obj.data && typeof obj.data === "object" && typeof (obj.data as Record<string, unknown>).total === "number") {
      total = (obj.data as Record<string, unknown>).total as number;
    }
  }
  return { items, total };
}

export function unwrapData<T = any>(payload: unknown, fallback: T): T {
  if (payload === null || payload === undefined) {
    return fallback;
  }
  if (typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    const inner = (payload as Record<string, unknown>).data;
    if (inner !== undefined && inner !== null) {
      return inner as T;
    }
  }
  return payload as T;
}

export function toSafeArray<T = any>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : unwrapArray<T>(val);
}
