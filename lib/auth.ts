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
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0;`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0;`;
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

export function isValidAvatar(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("data:image/")) {
    const commaIndex = trimmed.indexOf(",");
    if (commaIndex === -1) return false;
    const base64Data = trimmed.slice(commaIndex + 1);
    if (base64Data.length < 50 || base64Data.startsWith("avatar_")) {
      return false;
    }
  }
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("/")
  );
}

export function saveUser(user: UserResponse): void {
  if (!isBrowser()) return;
  try {
    if (user.avatar_url && !isValidAvatar(user.avatar_url)) {
      user.avatar_url = null;
    }
    if (!user.avatar_url) {
      const existingAvatar = localStorage.getItem(AVATAR_STORAGE_KEY) || getStoredAvatar();
      if (existingAvatar && isValidAvatar(existingAvatar)) {
        user.avatar_url = existingAvatar;
      }
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    const roleName = (user.role?.role_name ?? (user as any).role_name ?? "").trim().toUpperCase();
    if (roleName) {
      setCookie(ROLE_COOKIE_KEY, roleName);
    }
    if (user.avatar_url && isValidAvatar(user.avatar_url)) {
      localStorage.setItem(AVATAR_STORAGE_KEY, user.avatar_url);
    }
  } catch (err) {
    console.warn("Storage quota warning:", err);
  }
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT, { detail: user.avatar_url ?? null }));
}

export function getStoredUser(): UserResponse | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as UserResponse;
    if (user.avatar_url && !isValidAvatar(user.avatar_url)) {
      user.avatar_url = null;
    }
    return user;
  } catch {
    return null;
  }
}

export function getStoredRoleId(): string | null {
  const user = getStoredUser();
  return user?.role_id ?? null;
}

export function saveAvatar(avatarUrl: string | null): void {
  if (!isBrowser()) return;
  try {
    if (avatarUrl && isValidAvatar(avatarUrl)) {
      localStorage.setItem(AVATAR_STORAGE_KEY, avatarUrl);
    } else {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
      avatarUrl = null;
    }
    const user = getStoredUser();
    if (user) {
      user.avatar_url = avatarUrl;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.warn("Storage warning in saveAvatar:", err);
  }
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT, { detail: avatarUrl }));
}

export function getStoredAvatar(): string | null {
  if (!isBrowser()) return null;
  const direct = localStorage.getItem(AVATAR_STORAGE_KEY);
  if (direct) {
    if (isValidAvatar(direct)) return direct;
    localStorage.removeItem(AVATAR_STORAGE_KEY);
  }
  const user = getStoredUser();
  if (user?.avatar_url && isValidAvatar(user.avatar_url)) {
    return user.avatar_url;
  }
  return null;
}

export function removeAvatar(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(AVATAR_STORAGE_KEY);
    const user = getStoredUser();
    if (user) {
      user.avatar_url = null;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.warn("Storage warning in removeAvatar:", err);
  }
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
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem("edtech_student");
    localStorage.removeItem(AVATAR_STORAGE_KEY);
    localStorage.removeItem("edtech_notifications_viewed_at");
    localStorage.removeItem("edtech_messages_viewed_at");
    sessionStorage.clear();
  } catch (e) {
    console.error("Failed to clear local storage during logout:", e);
  }
  deleteCookie(TOKEN_STORAGE_KEY);
  deleteCookie(ROLE_COOKIE_KEY);
}

export function logout(redirectPath = "/login"): void {
  if (!isBrowser()) return;
  const token = getToken();

  // Fire-and-forget notification to backend if available
  if (token) {
    try {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    } catch {
      // Ignore network errors during logout
    }
  }

  clearAuth();
  // Bypass Next.js App Router client cache and force a complete browser reload
  window.location.replace(redirectPath);
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
