"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Settings2,
  X,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import { MODULES, QUICK_ACCESS, type ModuleCard } from "@/lib/modules";

const STORAGE_KEY = "admin-module-preferences";

type Preferences = {
  order: string[];
  hidden: Record<string, boolean>;
};

const DEFAULT_PREFS: Preferences = {
  order: MODULES.map((m) => m.title),
  hidden: {},
};

function loadPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Preferences;
    const order = MODULES.map((m) => m.title).filter(
      (t) => !parsed.order || parsed.order.includes(t)
    );
    if (parsed.order) {
      for (const t of parsed.order) {
        if (MODULES.some((m) => m.title === t) && !order.includes(t)) {
          order.push(t);
        }
      }
    }
    return {
      order,
      hidden: parsed.hidden ?? {},
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function UserModulesPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [savedPrefs, setSavedPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const current = loadPreferences();
    setPrefs(current);
    setSavedPrefs(current);
  }, []);

  const openModal = () => {
    const current = loadPreferences();
    setPrefs(current);
    setSavedPrefs(current);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const savePrefs = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSavedPrefs(prefs);
    setModalOpen(false);
  };

  const cancelPrefs = () => {
    setPrefs(savedPrefs);
    setModalOpen(false);
  };

  const resetPrefs = () => {
    setPrefs(DEFAULT_PREFS);
  };

  const toggleHidden = (title: string) => {
    setPrefs((p) => ({
      ...p,
      hidden: { ...p.hidden, [title]: !p.hidden[title] },
    }));
  };

  const move = (index: number, dir: -1 | 1) => {
    setPrefs((p) => {
      const order = [...p.order];
      const next = index + dir;
      if (next < 0 || next >= order.length) return p;
      [order[index], order[next]] = [order[next], order[index]];
      return { ...p, order };
    });
  };

  const visibleModules: ModuleCard[] = prefs.order
    .map((title) => MODULES.find((m) => m.title === title))
    .filter((m): m is ModuleCard => Boolean(m) && !prefs.hidden[m!.title]);

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">User Modules</h1>
              <p className="mt-1 text-sm text-slate-600">
                Access all modules and manage your school operations efficiently.
              </p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#6d28d9] hover:text-[#6d28d9] hover:shadow-md"
            >
              <Settings2 className="h-4 w-4" />
              Customize Modules
            </button>
          </div>

          {/* Module Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ backgroundColor: module.bg, color: module.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d28d9] text-white transition group-hover:scale-105">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    {module.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {module.description}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Quick Access */}
          <div className="mt-10">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Quick Access</h2>
              <p className="mt-1 text-sm text-slate-600">
                Frequently used actions at your fingertips.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {QUICK_ACCESS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#6d28d9] hover:text-[#6d28d9] hover:shadow-md"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Customize Modules Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Customize Modules
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto px-6 py-4">
              <p className="mb-4 text-xs text-slate-500">
                Show or hide module cards and reorder them. Changes apply only to
                your view.
              </p>
              <ul className="space-y-2">
                {prefs.order.map((title, index) => {
                  const module = MODULES.find((m) => m.title === title);
                  if (!module) return null;
                  const Icon = module.icon;
                  const hidden = Boolean(prefs.hidden[title]);
                  return (
                    <li
                      key={title}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: module.bg, color: module.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-slate-700">
                        {title}
                      </span>
                      <button
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => move(index, 1)}
                        disabled={index === prefs.order.length - 1}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleHidden(title)}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-100 ${
                          hidden ? "text-slate-400" : "text-[#6d28d9]"
                        }`}
                        aria-label={hidden ? "Show" : "Hide"}
                      >
                        {hidden ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={resetPrefs}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelPrefs}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={savePrefs}
                  className="rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
