"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardSuperAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/superadmin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-500 text-xs font-mono">
      Redirecting to Super Admin Console...
    </div>
  );
}
