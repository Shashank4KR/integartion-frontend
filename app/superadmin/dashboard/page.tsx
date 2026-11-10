"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, LogOut, RefreshCw, ShieldCheck, Users } from "lucide-react";
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
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-purple-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b2ee6] to-[#7c3aed] text-white shadow-md shadow-purple-200"><ShieldCheck className="h-5 w-5" /></div>
            <div><p className="text-lg font-semibold tracking-tight text-[#5b2ee6]">Nomera</p><p className="-mt-1 text-[11px] font-medium text-slate-500">Platform administration</p></div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-right sm:block"><span className="block text-sm font-semibold text-slate-800">{user?.username}</span><span className="text-xs text-slate-500">{user?.email}</span></span>
            <button onClick={() => void handleLogout()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-7 px-5 py-8">
        <section className="rounded-3xl bg-gradient-to-r from-[#5b2ee6] via-[#6d28d9] to-[#7c3aed] p-6 text-white shadow-xl shadow-purple-200 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-100">Secure platform overview</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Live institution data</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-purple-100">Records and counts below come from the configured Nomera database. Tenant provisioning controls are not shown because the backend does not support them.</p>
        </section>

        {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        <section className="grid gap-4 sm:grid-cols-3">
          <Metric title="Institutions" value={overview?.institutions.length} icon={<Building2 />} />
          <Metric title="Students" value={overview?.totals.students} icon={<GraduationCap />} />
          <Metric title="Faculty" value={overview?.totals.faculty} icon={<Users />} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h2 className="font-semibold text-slate-900">Institutions</h2><p className="mt-1 text-xs text-slate-500">School records returned by the database</p></div>
            <button onClick={() => void refreshOverview()} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
          </div>
          {loading ? <p className="p-6 text-sm text-slate-500">Loading live data…</p> : overview?.institutions.length ? (
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-600"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Code</th><th className="px-5 py-3">Board</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{overview.institutions.map((institution) => <tr key={institution.id} className="hover:bg-purple-50/40"><td className="px-5 py-4 font-medium text-slate-900">{institution.name}</td><td className="px-5 py-4 font-mono text-xs text-slate-700">{institution.code}</td><td className="px-5 py-4 text-slate-700">{institution.board || "—"}</td><td className="px-5 py-4 text-slate-700">{institution.status}</td><td className="px-5 py-4 text-slate-600">{institution.created_at ? new Date(institution.created_at).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div>
          ) : <p className="p-6 text-sm text-slate-500">No institution records exist in the database.</p>}
          <p className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600">Classes in database: {overview?.totals.classes ?? "—"}</p>
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value, icon }: { title: string; value?: number; icon: React.ReactNode }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-slate-600"><span className="text-sm font-medium">{title}</span><span className="rounded-xl bg-purple-50 p-2 text-[#6d28d9]">{icon}</span></div><p className="mt-4 text-3xl font-bold text-slate-900">{value ?? "—"}</p></article>;
}
