"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/shared/layout/MainLayout";
import Header from "@/components/shared/layout/Header";
import RoleSidebar from "@/components/dashboard/role-dashboards/RoleSidebar";
import MaintenanceScreen from "@/components/shared/MaintenanceScreen";
import type { RoleConfig } from "@/lib/dashboard/role-dashboards/types";
import { clearAuth, logout, getDashboardPathForRole, getStoredUser, getToken } from "@/lib/auth";

interface RoleDashboardLayoutProps {
  config: RoleConfig;
  children: ReactNode;
}

export default function RoleDashboardLayout({
  config,
  children,
}: RoleDashboardLayoutProps) {
  const router = useRouter();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const user = getStoredUser();
  const isAdmin = (user?.role?.role_name || (user as any)?.role_name || "").toUpperCase() === "ADMIN";

  useEffect(() => {
    const token = getToken();
    const currentUser = getStoredUser();

    if (!token || !currentUser) {
      logout("/login");
      return;
    }

    const currentRole = (currentUser.role?.role_name || (currentUser as any)?.role_name || "")
      .trim()
      .toUpperCase();
    const allowedRole = config.key.toUpperCase();

    // Enforce role guard: non-admin users cannot access other role dashboards
    if (currentRole !== "ADMIN" && currentRole !== allowedRole) {
      const userHome = getDashboardPathForRole(currentRole) || "/login";
      router.replace(userHome);
      return;
    }

    // Multi-tab sync: prevent role mismatch if another tab logs into another account or logs out
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "nomera_token" || e.key === "nomera_user") {
        const freshToken = getToken();
        const freshUser = getStoredUser();
        if (!freshToken || !freshUser) {
          window.location.replace("/login");
          return;
        }
        const freshRole = (freshUser.role?.role_name || (freshUser as any)?.role_name || "").trim().toUpperCase();
        if (freshRole !== "ADMIN" && freshRole !== allowedRole) {
          const userHome = getDashboardPathForRole(freshRole) || "/login";
          window.location.replace(userHome);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    if (!isAdmin) {
      fetch("/api/settings/public/system-status")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.maintenance_mode) {
            setIsMaintenance(true);
          }
        })
        .catch((err) => console.warn("[RoleDashboardLayout] Maintenance check error:", err));
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [config.key, isAdmin, router]);

  if (isMaintenance && !isAdmin) {
    return <MaintenanceScreen />;
  }

  return (
    <MainLayout
      sidebar={<RoleSidebar config={config} />}
      header={<Header />}
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </MainLayout>
  );
}
