"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

const RESET_TOKEN_KEY = "nomera_password_reset_token";
const inputClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 pr-12 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [tokenReady, setTokenReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const hashToken = new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
    const savedToken = window.sessionStorage.getItem(RESET_TOKEN_KEY) || "";
    const resetToken = hashToken || savedToken;

    // Next.js may remount this page while synchronizing replaceState. Keep the
    // short-lived reset credential in this tab so that update cannot lose it.
    if (hashToken) window.sessionStorage.setItem(RESET_TOKEN_KEY, hashToken);
    setToken(resetToken);
    setTokenReady(true);

    if (hashToken) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Use at least 12 characters, including a letter and a number.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password, confirm_password: confirm }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400) window.sessionStorage.removeItem(RESET_TOKEN_KEY);
        throw new Error(data.detail || "Reset failed.");
      }
      window.sessionStorage.removeItem(RESET_TOKEN_KEY);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(237,233,254,0.95),rgba(245,243,255,0.95))] p-4"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-violet-700"><ShieldCheck/></div><h1 className="mt-5 text-2xl font-bold text-slate-900">Set a new password</h1>{done ? <><p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Password reset successfully. Sign in with your new password.</p><Link href="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700">Continue to login</Link></> : !tokenReady ? <p role="status" className="mt-4 text-sm text-slate-500">Checking your reset link…</p> : !token ? <><p role="alert" className="mt-4 text-sm text-rose-600">This reset link is missing or invalid. Request a new link.</p><Link href="/forgot-password" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700">Request another link</Link></> : <form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-semibold">New password<span className="relative block"><input className={inputClass} type={show?"text":"password"} autoComplete="new-password" required value={password} onChange={e=>setPassword(e.target.value)} aria-describedby="password-policy"/><button type="button" aria-label={show?"Hide password":"Show password"} onClick={()=>setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{show?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></span></label><p id="password-policy" className="text-xs text-slate-500">At least 12 characters, including a letter and a number.</p><label className="block text-sm font-semibold">Confirm new password<input className={inputClass} type={show?"text":"password"} autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>{error&&<p role="alert" className="text-sm text-rose-600">{error}</p>}<button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 font-semibold text-white disabled:opacity-60">{busy&&<Loader2 className="h-4 w-4 animate-spin"/>}Reset password</button></form>}<Link href="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-violet-700"><ArrowLeft className="h-4 w-4"/>Back to login</Link></section></main>;
}
