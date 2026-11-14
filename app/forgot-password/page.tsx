"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not start password reset.");
      setMessage(data.message);
    } catch (e) { setError(e instanceof Error ? e.message : "Network error. Please try again."); }
    finally { setBusy(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(237,233,254,0.95),rgba(245,243,255,0.95))] p-4"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-violet-700"><ShieldCheck /></div><h1 className="mt-5 text-2xl font-bold text-slate-900">Forgot password?</h1><p className="mt-2 text-sm text-slate-500">Enter your account email. If it matches an account, we’ll send reset instructions.</p><form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-semibold text-slate-700">Email address<input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-normal outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label>{message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}{error && <p role="alert" className="text-sm text-rose-600">{error}</p>}<button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 font-semibold text-white hover:bg-violet-800 disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin"/>}Send reset instructions</button></form><Link href="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-violet-700"><ArrowLeft className="h-4 w-4"/>Back to login</Link></section></main>;
}
