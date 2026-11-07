"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Server,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { handleSuperAdminAuth, isSuperAdminAuthenticated } from "@/lib/services/superAdminService";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSuperAdminAuthenticated()) {
      router.replace("/superadmin/dashboard");
    }
  }, [router]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const success = handleSuperAdminAuth(email, password);
      if (success) {
        router.push("/superadmin/dashboard");
      } else {
        setError(
          "Invalid Super Administrator credentials. Please verify your email and password.",
        );
        setIsLoading(false);
      }
    }, 450);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden select-none">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Brand Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider uppercase text-slate-900 flex items-center gap-2">
              Nomera Platform
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                CLOUD CONSOLE
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Multi-Tenant Institution & Database Control Plane
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs text-slate-600 hover:text-purple-700 transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-purple-300"
        >
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          School & Student Login →
        </Link>
      </header>

      {/* Main Login Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xl shadow-purple-500/5 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-50 to-indigo-50 border border-purple-200 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-7 h-7 text-[#7c3aed]" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Super Admin Authorization
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with service-level root credentials to monitor campuses, provision databases, and configure tenant settings.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition font-medium shadow-sm"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Root Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition font-mono shadow-sm"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#7c3aed] to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>Authenticating Root Session...</>
              ) : (
                <>
                  Access Platform Control Center
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Infrastructure Security Footer */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All DB Clusters Operational
            </span>
            <span className="font-mono text-slate-400">TLS 1.3 / AES-256</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <footer className="relative z-10 text-center text-xs text-slate-500 py-4 border-t border-slate-200">
        <p>
          Nomera Platform Owner Service Console • High-Security Tier • School & Teacher Admins use the standard portal.
        </p>
      </footer>
    </main>
  );
}
