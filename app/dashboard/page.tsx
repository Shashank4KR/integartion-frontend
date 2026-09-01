"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, getStoredRoleId, getDashboardPathForRole, clearAuth } from "@/lib/auth";

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    const roleId = getStoredRoleId();

    if (!user && !roleId) {
      clearAuth();
      router.replace("/login");
      return;
    }

    const roleName = user?.role?.role_name || (user as any)?.role_name;
    if (roleName) {
      const byName = getDashboardPathForRole(roleName);
      if (byName) {
        router.replace(byName);
        return;
      }
    }

    const ROLE_ID_PATHS: Record<string, string> = {
      "00000000-0000-0000-0000-000000000001": "/dashboard/admin",
      "00000000-0000-0000-0000-000000000002": "/dashboard/teacher",
      "00000000-0000-0000-0000-000000000003": "/dashboard/parent",
      "00000000-0000-0000-0000-000000000004": "/dashboard/student",
      "00000000-0000-0000-0000-000000000005": "/dashboard/accountant",
      "00000000-0000-0000-0000-000000000006": "/dashboard/librarian",
      "00000000-0000-0000-0000-000000000007": "/dashboard/warden",
    };

    const target = (roleId && ROLE_ID_PATHS[roleId]) || "/dashboard/admin";
    router.replace(target);
  }, [router]);

  return null;
}

