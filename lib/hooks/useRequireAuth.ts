"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getDashboardPathForRole, getStoredUser, getToken } from "@/lib/auth";

export interface AuthState {
  token: string | null;
  user: ReturnType<typeof getStoredUser>;
  roleName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useRequireAuth(allowedRoles?: string[]): AuthState {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    roleName: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();

    if (!token || !user) {
      clearAuth();
      setAuthState({
        token: null,
        user: null,
        roleName: null,
        isAuthenticated: false,
        isLoading: false,
      });
      router.replace("/login");
      return;
    }

    const roleName = (user.role?.role_name || (user as any)?.role_name || "").trim().toUpperCase();

    if (allowedRoles && allowedRoles.length > 0) {
      const normalizedAllowed = allowedRoles.map((r) => r.trim().toUpperCase());
      if (roleName !== "ADMIN" && !normalizedAllowed.includes(roleName)) {
        const homePath = getDashboardPathForRole(roleName) || "/login";
        router.replace(homePath);
        return;
      }
    }

    setAuthState({
      token,
      user,
      roleName,
      isAuthenticated: true,
      isLoading: false,
    });
  }, [allowedRoles, router]);

  return authState;
}
