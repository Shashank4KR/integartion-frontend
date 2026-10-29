"use client";

import { Globe2, ShieldCheck, ChevronDown } from "lucide-react";
import { useState } from "react";
import LoginForm from "./LoginForm";

export default function LoginCard() {
  const [language, setLanguage] = useState("English");

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