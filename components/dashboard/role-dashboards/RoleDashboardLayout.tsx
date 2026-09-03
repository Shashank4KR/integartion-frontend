"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/shared/layout/MainLayout";
import Header from "@/components/shared/layout/Header";
import RoleSidebar from "@/components/dashboard/role-dashboards/RoleSidebar";
import MaintenanceScreen from "@/components/shared/MaintenanceScreen";
import type { RoleConfig } from "@/lib/dashboard/role-dashboards/types";
import { clearAuth, getDashboardPathForRole, getStoredUser, getToken } from "@/lib/auth";

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
      clearAuth();
      router.replace("/login");
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

    if (isAdmin) return;

    fetch("/api/settings/public/system-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.maintenance_mode) {
          setIsMaintenance(true);
        }
      })
      .catch(() => {});
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
