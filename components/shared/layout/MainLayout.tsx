"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { clearAuth, logout, getStoredUser, getToken, getDashboardPathForRole } from "@/lib/auth";
import { MobileNavigationContext } from "@/components/shared/layout/MobileNavigationContext";

interface MainLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}

export default function MainLayout({
  sidebar,
  header,
  children,
}: MainLayoutProps) {
  const router = useRouter();
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = getStoredUser();
  const isAdmin = (user?.role?.role_name || (user as any)?.role_name || "").toUpperCase() === "ADMIN";

  const mobileNavigation = {
    open: mobileMenuOpen,
    toggle: () => setMobileMenuOpen((open) => !open),
    close: () => setMobileMenuOpen(false),
  };

  useEffect(() => {
    const token = getToken();
    const currentUser = getStoredUser();
    if (!token || !currentUser) {
      logout("/login");
      return;
    }

    // Multi-tab sync: detect if session changed or logged out in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "nomera_token" || e.key === "nomera_user") {
        const freshToken = getToken();
        const freshUser = getStoredUser();
        if (!freshToken || !freshUser) {
          window.location.replace("/login");
          return;
        }
        const freshRole = (freshUser.role?.role_name || (freshUser as any)?.role_name || "").trim().toUpperCase();
        if (freshRole !== "ADMIN" && freshRole !== "SUPER_ADMIN" && freshRole !== "SUPERADMIN") {
          const userHome = getDashboardPathForRole(freshRole) || "/login";
          window.location.replace(userHome);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    fetch("/api/settings/public/system-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.maintenance_mode) {
          setMaintenanceActive(true);
        }
      })
      .catch((err) => console.warn("[MainLayout] System status fetch error:", err));

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  return (
    <MobileNavigationContext.Provider value={mobileNavigation}>
    <div className="flex min-h-screen bg-slate-50">
      {sidebar}

      <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0">
        {isAdmin && maintenanceActive && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm border-b border-amber-600">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-950" />
              <span>
                <strong>MAINTENANCE MODE ACTIVE:</strong> Non-admin users are currently blocked from the platform.
              </span>
            </div>
            <Link
              href="/dashboard/admin/settings"
              className="underline font-bold hover:text-white transition"
            >
              Manage in Settings →
            </Link>
          </div>
        )}

        {header}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </MobileNavigationContext.Provider>
  );
}
