import type { UserResponse } from "@/types/auth";

const TOKEN_STORAGE_KEY = "edtech_access_token";
const USER_STORAGE_KEY = "edtech_user";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function saveUser(user: UserResponse): void {
  if (!isBrowser()) return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUser(): UserResponse | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
}

export function getStoredRoleId(): string | null {
  const user = getStoredUser();
  return user?.role_id ?? null;
}

export function clearAuth(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem("edtech_student");
}

export const ROLE_DASHBOARD_PATHS: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/parent",
  ACCOUNTANT: "/dashboard/accountant",
  LIBRARIAN: "/dashboard/librarian",
};

export function getDashboardPathForRole(roleName: string | undefined | null): string | null {
  if (!roleName) return null;
  const normalized = roleName.trim().toUpperCase();
  return ROLE_DASHBOARD_PATHS[normalized] ?? null;
}
