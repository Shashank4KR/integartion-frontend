"use client";

import { useEffect, useState } from "react";
import { clearAuth, getToken } from "@/lib/auth";

export default function DashboardSessionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let active = true;

    async function validateSession() {
      const token = getToken();
      if (!token) {
        clearAuth();
        window.location.replace("/login");
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (response.status === 401) {
          clearAuth();
          window.location.replace("/login?reason=session-expired");
          return;
        }
      } catch {
        // Keep the dashboard available during temporary network outages so
        // individual panels can show their own retry states.
      }

      if (active) setSessionChecked(true);
    }

    void validateSession();
    return () => {
      active = false;
    };
  }, []);

  if (!sessionChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Checking your session...</p>
      </main>
    );
  }

  return <>{children}</>;
}
