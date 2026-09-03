import type { UserResponse } from "@/types/auth";

const TOKEN_STORAGE_KEY = "edtech_access_token";
const USER_STORAGE_KEY = "edtech_user";
const AVATAR_STORAGE_KEY = "edtech_user_avatar";
const ROLE_COOKIE_KEY = "edtech_user_role";
export const AVATAR_CHANGE_EVENT = "edtech_avatar_changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string, days = 7): void {
  if (!isBrowser()) return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export function saveToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  setCookie(TOKEN_STORAGE_KEY, token);
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function saveUser(user: UserResponse): void {
  if (!isBrowser()) return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  const roleName = (user.role?.role_name ?? (user as any).role_name ?? "").trim().toUpperCase();
  if (roleName) {
    setCookie(ROLE_COOKIE_KEY, roleName);
  }
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

export function saveAvatar(avatarUrl: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(AVATAR_STORAGE_KEY, avatarUrl);
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT, { detail: avatarUrl }));
}

export function getStoredAvatar(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(AVATAR_STORAGE_KEY);
}

export function removeAvatar(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AVATAR_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT, { detail: null }));
}

export function subscribeAvatarChange(callback: (avatar: string | null) => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<string | null>;
    callback(customEvent.detail !== undefined ? customEvent.detail : getStoredAvatar());
  };
  const storageHandler = () => callback(getStoredAvatar());
  window.addEventListener(AVATAR_CHANGE_EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(AVATAR_CHANGE_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export function clearAuth(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem("edtech_student");
  localStorage.removeItem(AVATAR_STORAGE_KEY);
  deleteCookie(TOKEN_STORAGE_KEY);
  deleteCookie(ROLE_COOKIE_KEY);
}

export const ROLE_DASHBOARD_PATHS: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/parent",
  ACCOUNTANT: "/dashboard/accountant",
  LIBRARIAN: "/dashboard/librarian",
  WARDEN: "/dashboard/warden",
};

export function getDashboardPathForRole(roleName: string | undefined | null): string | null {
  if (!roleName) return null;
  const normalized = roleName.trim().toUpperCase();
  return ROLE_DASHBOARD_PATHS[normalized] ?? null;
}
