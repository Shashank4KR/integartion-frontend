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
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300"><ShieldCheck /></div>
          <div><h1 className="text-xl font-bold">Superadmin sign in</h1><p className="text-sm text-slate-400">Use your provisioned platform account.</p></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm text-slate-300">Email
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3">
              <Mail className="h-4 w-4 text-slate-500" />
              <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent py-3 text-white outline-none" />
            </span>
          </label>
          <label className="block text-sm text-slate-300">Password
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3">
              <LockKeyhole className="h-4 w-4 text-slate-500" />
              <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent py-3 text-white outline-none" />
            </span>
          </label>
          <label className="block text-sm text-slate-300">Authenticator code <span className="text-slate-500">(if enabled)</span>
            <input inputMode="numeric" autoComplete="one-time-code" value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none" />
          </label>
          {error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-violet-600 py-3 font-semibold transition hover:bg-violet-500 disabled:opacity-50">
            {busy ? "Verifying account…" : "Sign in securely"}
          </button>
        </form>
      </section>
    </main>
  );
}
