"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { clearAuth, getStoredUser, getToken } from "@/lib/auth";

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

    fetch("/api/settings/public/system-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.maintenance_mode) {
          setMaintenanceActive(true);
        }
      })
      .catch(() => {});
  }, [router]);

  return (
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
  );
}
