"use client";

import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import RoleDropdown from "./RoleDropdown";
import { handleLogin } from "@/lib/api";
import { getDashboardPathForRole } from "@/lib/auth";
import { ROLE_LABEL_TO_NAME } from "./RoleDropdown";

type LoginFormProps = {
  language: string;
  setLanguage: (value: string) => void;
};

export default function LoginForm({ language, setLanguage }: LoginFormProps) {
  const router = useRouter();
  const [loginIdOrEmail, setLoginIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const { user } = await handleLogin(loginIdOrEmail, password);

      const backendRole = (user.role?.role_name ?? "").trim().toUpperCase();

      if (!backendRole) {
        setError("Unable to determine your role. Please contact support.");
        return;
      }

      const targetPath = getDashboardPathForRole(backendRole);
      if (!targetPath) {
        setError(`Unknown role "${backendRole}". Please contact support.`);
        return;
      }

      if (!selectedRole) {
        setError("Please select your role.");
        return;
      }

      const selectedRoleName = (ROLE_LABEL_TO_NAME[selectedRole] ?? "")
        .trim()
        .toUpperCase();

      if (selectedRoleName !== backendRole) {
        setError(
          "The selected role does not match your account role. Please select the correct role.",
        );
        return;
      }

      router.push(targetPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-700">
          Login ID / Email
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            value={loginIdOrEmail}
            onChange={(event) => setLoginIdOrEmail(event.target.value)}
            placeholder="Enter your login ID or email"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#6d28d9] focus:ring-4 focus:ring-purple-100"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Password</label>
          <button type="button" className="text-xs font-semibold text-[#6d28d9]">
            Forgot Password?
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-700 outline-none transition focus:border-[#6d28d9] focus:ring-4 focus:ring-purple-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <RoleDropdown value={selectedRole} onChange={setSelectedRole} />

      {error ? (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-3 text-sm ${
            error.toLowerCase().includes("maintenance")
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {error.toLowerCase().includes("maintenance") && (
            <span className="font-bold block mb-0.5">🛠️ System Under Maintenance</span>
          )}
          {error}
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-[#6d28d9] focus:ring-[#6d28d9]"
        />
        Remember me
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#6d28d9] to-[#8b5cf6] text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            Login
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
