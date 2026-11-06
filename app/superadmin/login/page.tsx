"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Server,
  KeyRound,
  CheckCircle2,
  Database,
  Building2,
} from "lucide-react";
import Link from "next/link";
import {
  handleSuperAdminAuth,
  SUPERADMIN_CREDENTIALS,
} from "@/lib/services/superAdminService";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("superadmin@example.com");
  const [password, setPassword] = useState("Superadmin@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleQuickFill = () => {
    setEmail(SUPERADMIN_CREDENTIALS.email);
    setPassword(SUPERADMIN_CREDENTIALS.password);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden select-none">
      {/* Background Ambient Glow & Grid */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      {/* Top Brand Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider uppercase text-white flex items-center gap-2">
              Nomera Platform
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                CLOUD CONSOLE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Multi-Tenant Institution & Database Control Plane
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800"
        >
          <Building2 className="w-3.5 h-3.5" />
          School & Student Login →
        </Link>
      </header>

      {/* Main Login Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/80 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Super Admin Authorization
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in with service-level root credentials to monitor campuses, provision college databases, and configure tenant settings.
            </p>
          </div>

          {/* Quick Fill Credentials Banner */}
          <div className="bg-purple-950/40 border border-purple-800/50 rounded-2xl p-3 text-xs text-purple-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-semibold text-purple-300">Authorized Root Access</p>
              <p className="text-[11px] text-purple-400/80 font-mono">
                superadmin@example.com
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-2.5 py-1 text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition shadow flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3" />
              Quick Fill
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition"
                  placeholder="superadmin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Root Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 outline-none transition font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
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
          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All DB Clusters Operational
            </span>
            <span className="font-mono text-slate-600">TLS 1.3 / AES-256</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <footer className="relative z-10 text-center text-xs text-slate-500 py-4 border-t border-slate-900">
        <p>
          Nomera Platform Owner Service Console • Separate High-Security Infrastructure Tier • Single Institution Admins use standard login.
        </p>
      </footer>
    </main>
  );
}
