"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SettingsPage, { type SchoolRole } from "@/components/settings/SettingsPage";

const roles: SchoolRole[] = ["Admin", "Teacher", "Student", "Parent", "Librarian", "Accountant"];

function SettingsContent() {
  const requestedRole = useSearchParams().get("role");
  const currentRole = roles.find((role) => role.toLowerCase() === requestedRole?.toLowerCase()) ?? "Admin";

  return <SettingsPage currentRole={currentRole} />;
}

export default function SettingsRoute() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading settings…</div>}><SettingsContent /></Suspense>;
}
