"use client";

import { Globe2, ShieldCheck, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import { getToken, getStoredUser, getDashboardPathForRole, clearAuth } from "@/lib/auth";

export default function LoginCard() {
  const [language, setLanguage] = useState("English");
  const [existingSession, setExistingSession] = useState<{
    username: string;
    role: string;
    path: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const redirectParam = searchParams.get("redirect");
    const reasonParam = searchParams.get("reason");

    // If redirected to login, the server rejected the session -> clear stale local data immediately
    if (redirectParam || reasonParam) {
      clearAuth();
      setExistingSession(null);
      return;
    }

    const token = getToken();
    const user = getStoredUser();

    if (token && user) {
      // Validate that the session is genuinely active with the backend before auto-redirecting
      fetch("/api/auth/me")
        .then((res) => {
          if (!res.ok) {
            clearAuth();
            setExistingSession(null);
          } else {
            const role = (
              user.role?.role_name ||
              (user as any)?.role_name ||
              user.role_id ||
              ""
            )
              .trim()
              .toUpperCase();
            const targetPath = getDashboardPathForRole(role) || "/dashboard";
            setExistingSession({
              username: user.username || "Active User",
              role: user.role?.role_name || role,
              path: targetPath,
            });
            window.location.href = targetPath;
          }
        })
        .catch(() => {
          clearAuth();
          setExistingSession(null);
        });
    }
  }, []);

  if (existingSession) {
    return (
      <div className="relative w-full max-w-[29.375rem] rounded-[28px] border border-purple-200 bg-white p-8 shadow-xl text-center space-y-4">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-purple-50 text-[#7c3aed]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Active Session Detected</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          An account for <strong className="text-purple-700">{existingSession.username}</strong> ({existingSession.role}) is already active in this browser.
        </p>
        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-center gap-2 text-xs text-purple-700 font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-[#7c3aed]" />
          Redirecting to your active workspace...
        </div>
        <button
          type="button"
          onClick={() => {
            clearAuth();
            setExistingSession(null);
          }}
          className="mt-3 block w-full text-center text-xs font-semibold text-purple-700 hover:text-purple-900 underline cursor-pointer"
        >
          Sign in with a different account
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[29.375rem] rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-25px_rgba(15,23,42,0.25)] sm:p-8">
      <label className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:right-6 sm:top-6">
        <Globe2 className="h-3.5 w-3.5 text-[#6d28d9]" />
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="appearance-none bg-transparent pr-4 outline-none"
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Arabic</option>
          <option>French</option>
          <option>Spanish</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-400" />
      </label>

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1e8ff] shadow-inner">
        <ShieldCheck className="h-8 w-8 text-[#6d28d9]" />
      </div>

      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
        Welcome Back!
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Login to access your Nomera account.
      </p>

      <LoginForm language={language} setLanguage={setLanguage} />

      <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-[#6d28d9]" />
        Your data is 100% secure with enterprise-grade encryption.
      </div>
    </div>
  );
}
