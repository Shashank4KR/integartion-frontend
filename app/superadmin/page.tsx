"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSuperAdminSession } from "@/lib/services/superAdminService";

export default function SuperAdminIndexPage() {
  const router = useRouter();
  useEffect(() => {
    getSuperAdminSession()
      .then(() => router.replace("/superadmin/dashboard"))
      .catch(() => router.replace("/superadmin/login"));
  }, [router]);
  return <main className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">Verifying superadmin session…</main>;
}
