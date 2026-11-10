"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, LogOut, RefreshCw, Users } from "lucide-react";
import {
  getSuperAdminOverview,
  getSuperAdminSession,
  superAdminLogout,
  type SuperAdminOverview,
  type SuperAdminUser,
} from "@/lib/services/superAdminService";

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SuperAdminUser | null>(null);
  const [overview, setOverview] = useState<SuperAdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const session = await getSuperAdminSession();
        if (!active) return;
        setUser(session);
      } catch {
        if (active) router.replace("/superadmin/login");
        return;
      }
      try {
        const data = await getSuperAdminOverview();
        if (active) setOverview(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load platform data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void initialize();
    return () => { active = false; };
  }, [router]);

  async function refreshOverview() {
    setLoading(true);
    setError(null);
    try {
      setOverview(await getSuperAdminOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load platform data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await superAdminLogout();
    router.replace("/superadmin/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div><p className="text-xs uppercase tracking-[0.2em] text-violet-300">Platform access</p><h1 className="mt-1 text-2xl font-bold">Superadmin overview</h1></div>
          <div className="flex items-center gap-4">
            <span className="hidden text-right sm:block"><span className="block text-sm font-medium">{user?.username}</span><span className="text-xs text-slate-400">{user?.email}</span></span>
            <button onClick={() => void handleLogout()} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-5 py-8">
        <p className="max-w-3xl text-sm leading-6 text-slate-400">Live records read from the configured application database. Tenant provisioning and infrastructure controls are unavailable because this backend does not provide those operations.</p>
        {error && <div role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div>}

        <section className="grid gap-4 sm:grid-cols-3">
          <Metric title="Institutions" value={overview?.institutions.length} icon={<Building2 />} />
          <Metric title="Students" value={overview?.totals.students} icon={<GraduationCap />} />
          <Metric title="Faculty" value={overview?.totals.faculty} icon={<Users />} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div><h2 className="font-semibold">Database institutions</h2><p className="mt-1 text-xs text-slate-400">School records returned by the backend</p></div>
            <button onClick={() => void refreshOverview()} disabled={loading} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/5 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
          </div>
          {loading ? <p className="p-6 text-sm text-slate-400">Loading live data…</p> : overview?.institutions.length ? (
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-white/[0.03] text-xs uppercase text-slate-400"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Code</th><th className="px-5 py-3">Board</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-white/5">{overview.institutions.map((institution) => <tr key={institution.id}><td className="px-5 py-4 font-medium">{institution.name}</td><td className="px-5 py-4 font-mono text-xs">{institution.code}</td><td className="px-5 py-4 text-slate-300">{institution.board || "—"}</td><td className="px-5 py-4">{institution.status}</td><td className="px-5 py-4 text-slate-400">{institution.created_at ? new Date(institution.created_at).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div>
          ) : <p className="p-6 text-sm text-slate-400">No institution records exist in the database.</p>}
          <p className="border-t border-white/10 px-5 py-3 text-xs text-slate-500">Classes in database: {overview?.totals.classes ?? "—"}</p>
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value, icon }: { title: string; value?: number; icon: React.ReactNode }) {
  return <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"><div className="flex items-center justify-between text-slate-400"><span className="text-sm">{title}</span><span className="text-violet-300">{icon}</span></div><p className="mt-4 text-3xl font-bold">{value ?? "—"}</p></article>;
}
