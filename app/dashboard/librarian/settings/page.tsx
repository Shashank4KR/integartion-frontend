"use client";

import { Suspense } from "react";
import SettingsPage from "@/components/settings/SettingsPage";

export default function LibrarianSettingsRoute() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-500">Loading settings…</div>}>
      <SettingsPage currentRole="Librarian" />
    </Suspense>
  );
}

