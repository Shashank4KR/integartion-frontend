"use client";

import { ReactNode } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Header from "@/components/shared/layout/Header";
import RoleSidebar from "@/components/dashboard/role-dashboards/RoleSidebar";
import type { RoleConfig } from "@/lib/dashboard/role-dashboards/types";

interface RoleDashboardLayoutProps {
  config: RoleConfig;
  children: ReactNode;
}

export default function RoleDashboardLayout({
  config,
  children,
}: RoleDashboardLayoutProps) {
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
