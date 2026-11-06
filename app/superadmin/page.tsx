"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSuperAdminAuthenticated } from "@/lib/services/superAdminService";

export default function SuperAdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (isSuperAdminAuthenticated()) {
      router.replace("/superadmin/dashboard");
    } else {
      router.replace("/superadmin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">
      Routing to Super Administrator Console...
    </div>
  );
}
