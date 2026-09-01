"use client";

import { Wrench, ShieldAlert, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { clearAuth } from "@/lib/auth";

export default function MaintenanceScreen() {
  const [checking, setChecking] = useState(false);

  const handleCheck = () => {
    setChecking(true);
    window.location.reload();
  };

  const handleAdminLogin = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 select-none">
      <div className="max-w-lg w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Wrench className="w-10 h-10 animate-bounce" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow">
            !
          </div>
        </div>

        {/* Title & Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3 border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          System Maintenance
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          We&apos;ll be back soon!
        </h1>

        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Our platform is currently undergoing scheduled system upgrades and maintenance to enhance stability and performance. Normal portal access for students, teachers, parents, and staff will resume shortly.
        </p>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking status..." : "Check Status & Refresh"}
          </button>

          <button
            onClick={handleAdminLogin}
            className="w-full h-11 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-600/40 cursor-pointer"
          >
            <span>Are you a System Administrator? Sign in</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-700/40 text-[11px] text-slate-500">
          EdTech Smart Campus System • Maintenance Window Active
        </div>
      </div>
    </div>
  );
}
