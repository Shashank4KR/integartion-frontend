"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { getSuperAdminSession, superAdminLogin } from "@/lib/services/superAdminService";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSuperAdminSession().then(() => router.replace("/superadmin/dashboard")).catch(() => undefined);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await superAdminLogin(email, password, mfaCode);
      await getSuperAdminSession();
      router.replace("/superadmin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(237,233,254,0.95),rgba(245,243,255,0.95))] p-3 text-slate-900 sm:p-5 lg:p-8">
      <section className="mx-auto flex min-h-[calc(100vh-24px)] max-w-6xl flex-col overflow-hidden rounded-[32px] border border-purple-100 bg-white shadow-[0_30px_80px_-25px_rgba(109,40,217,0.28)] sm:min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-64px)] lg:flex-row">
        <aside className="flex w-full flex-col justify-between bg-[linear-gradient(135deg,#f8f4ff_0%,#f3ebff_50%,#eef6ff_100%)] p-7 sm:p-10 lg:w-[48%]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b2ee6] to-[#7c3aed] text-white shadow-lg shadow-purple-200"><ShieldCheck className="h-6 w-6" /></div>
              <div><p className="text-xl font-semibold tracking-tight text-[#5b2ee6]">Nomera</p><p className="-mt-1 text-[11px] font-medium text-slate-600">Smart Campus ERP</p></div>
            </div>
            <div className="mt-10 max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Platform administration</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-900">One secure place to oversee your <span className="text-[#6d28d9]">Nomera platform.</span></h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">Sign in with your provisioned superadmin account to view live institution records and platform data.</p>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-purple-100 bg-white/80 px-4 py-3 text-xs font-medium text-slate-600 shadow-sm">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#6d28d9]" /> Authentication is verified by the Nomera server.
          </div>
        </aside>

        <div className="flex flex-1 items-center justify-center bg-[#fcfbff] px-5 py-9 sm:px-10">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-25px_rgba(15,23,42,0.18)] sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <div className="rounded-2xl bg-[#f1e8ff] p-3 text-[#6d28d9]"><ShieldCheck className="h-6 w-6" /></div>
              <div><h1 className="text-xl font-semibold tracking-tight text-slate-900">Superadmin sign in</h1><p className="mt-1 text-sm text-slate-500">Use your provisioned platform account.</p></div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-slate-700">Email
                <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 transition focus-within:border-violet-600 focus-within:ring-4 focus-within:ring-violet-100">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent py-3 text-slate-900 outline-none placeholder:text-slate-400" placeholder="name@company.com" />
                </span>
              </label>
              <label className="block text-sm font-medium text-slate-700">Password
                <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 transition focus-within:border-violet-600 focus-within:ring-4 focus-within:ring-violet-100">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />
                  <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent py-3 text-slate-900 outline-none placeholder:text-slate-400" placeholder="Enter your password" />
                </span>
              </label>
              <label className="block text-sm font-medium text-slate-700">Authenticator code <span className="font-normal text-slate-500">(if enabled)</span>
                <input inputMode="numeric" autoComplete="one-time-code" value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:ring-4 focus:ring-violet-100" placeholder="6-digit code" />
              </label>
              {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? "Verifying account…" : "Sign in securely"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
