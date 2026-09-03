"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import MessManagementPageHeader from "@/components/dashboard/mess/MessManagementPageHeader";
import MessManagementSummaryCards from "@/components/dashboard/mess/MessManagementSummaryCards";
import AddMenuDialog from "@/components/dashboard/mess/AddMenuDialog";
import FullMenuPlanDialog from "@/components/dashboard/mess/FullMenuPlanDialog";
import { clearAuth, getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import { getMessDashboard } from "@/lib/services/hostelService";
import { createMenu, listCollections, listExpenses, listMenus } from "@/lib/services/messService";

function formatCurrency(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number.isNaN(amount) ? 0 : amount,
  );
}

export default function MessManagementPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any | null>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isMenuPlanOpen, setIsMenuPlanOpen] = useState(false);

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      clearAuth();
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const [summaryData, menuRows, expenseRows, collectionRows] = await Promise.all([
        getMessDashboard(token),
        listMenus(token),
        listExpenses(token),
        listCollections(token),
      ]);
      setSummary(summaryData ?? {});
      setMenus(Array.isArray(menuRows) ? menuRows : []);
      setExpenses(Array.isArray(expenseRows) ? expenseRows : []);
      setCollections(Array.isArray(collectionRows) ? collectionRows : []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load mess data.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateMenu = async (payload: {
    date: string;
    mealType: string;
    menuType: string;
    menuItems: string;
    startTime: string;
    endTime: string;
    block: string;
    status: string;
    notes: string;
  }) => {
    const token = getToken();
    if (!token) {
      clearAuth();
      router.replace("/login");
      return;
    }

    try {
      await createMenu(token, {
        menu_date: payload.date,
        meal_type: payload.mealType,
        items: payload.menuItems,
        start_time: payload.startTime || undefined,
        end_time: payload.endTime || undefined,
        notes: payload.notes || undefined,
      });
      await loadData();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to create menu.");
    }
  };

  const cards = useMemo(
    () => [
      {
        title: "Menus",
        value: String(menus.length),
        footer: "Menu records",
        icon: "UtensilsCrossed",
        iconBg: "bg-purple-50",
        iconColor: "text-[#7c3aed]",
        tint: "bg-purple-50/60",
      },
      {
        title: "Meals Served Today",
        value: String(summary?.today_attendance ?? 0),
        footer: "Present attendance",
        icon: "Users",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        tint: "bg-emerald-50/60",
      },
      {
        title: "Total Expenses",
        value: formatCurrency(summary?.total_expenses),
        footer: `${expenses.length} expense records`,
        icon: "IndianRupee",
        iconBg: "bg-pink-50",
        iconColor: "text-pink-500",
        tint: "bg-pink-50/60",
      },
      {
        title: "Total Collection",
        value: formatCurrency(summary?.total_collections),
        footer: `${collections.length} collection records`,
        icon: "Wallet",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        tint: "bg-blue-50/60",
      },
      {
        title: "Balance",
        value: formatCurrency(summary?.profit_loss),
        footer: "Collection minus expenses",
        icon: "TrendingUp",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
        tint: "bg-orange-50/60",
      },
    ],
    [collections.length, expenses.length, menus.length, summary],
  );

  const weeklyMenuPlan = useMemo(() => {
    const daysMap: Record<string, any> = {};
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    menus.forEach((m, idx) => {
      const dateStr = m.menu_date || new Date().toISOString().split("T")[0];
      const d = new Date(dateStr);
      const dayName = Number.isNaN(d.getTime()) ? `Day ${idx + 1}` : dayNames[d.getDay()];

      if (!daysMap[dateStr]) {
        daysMap[dateStr] = {
          dayNum: idx + 1,
          day: dayName,
          date: dateStr,
          breakfast: "—",
          lunch: "—",
          dinner: "—",
        };
      }

      const meal = (m.meal_type || "").toLowerCase();
      const items = m.items || m.menu_items || "";
      if (meal.includes("break")) daysMap[dateStr].breakfast = items;
      else if (meal.includes("lunch")) daysMap[dateStr].lunch = items;
      else if (meal.includes("din") || meal.includes("supper")) daysMap[dateStr].dinner = items;
      else daysMap[dateStr].breakfast = items;
    });

    return { days: Object.values(daysMap) };
  }, [menus]);

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <MessManagementPageHeader
            onAddClick={() => setIsAddMenuOpen(true)}
            onViewMenuPlan={() => setIsMenuPlanOpen(true)}
            onMoreOptions={() => {}}
          />
          {loadError ? (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}
          {isLoading ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
              Loading mess data...
            </div>
          ) : null}
          {!isLoading && !loadError ? <MessManagementSummaryCards cards={cards} /> : null}

          {!isLoading && !loadError ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <section className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Mess Menus</h2>
                  <button
                    type="button"
                    onClick={() => setIsAddMenuOpen(true)}
                    className="text-xs font-semibold text-[#7c3aed] hover:underline"
                  >
                    + Add Menu
                  </button>
                </div>
                {menus.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-slate-500">No mess menus found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Meal</th>
                          <th className="px-4 py-3 text-left">Menu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menus.map((row) => (
                          <tr key={row.id} className="border-b border-slate-50">
                            <td className="px-4 py-3">{row.menu_date ?? "-"}</td>
                            <td className="px-4 py-3">{row.meal_type ?? "-"}</td>
                            <td className="px-4 py-3">{row.items ?? row.menu_items ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              <section className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-bold text-slate-900">Mess Expenses</h2>
                </div>
                {expenses.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-slate-500">No mess expenses found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Category</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((row) => (
                          <tr key={row.id} className="border-b border-slate-50">
                            <td className="px-4 py-3">{row.expense_date ?? "-"}</td>
                            <td className="px-4 py-3">{row.category ?? "-"}</td>
                            <td className="px-4 py-3">{formatCurrency(row.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          ) : null}

          <AddMenuDialog
            open={isAddMenuOpen}
            onClose={() => setIsAddMenuOpen(false)}
            onSave={handleCreateMenu}
          />

          <FullMenuPlanDialog
            open={isMenuPlanOpen}
            onClose={() => setIsMenuPlanOpen(false)}
            plan={weeklyMenuPlan}
          />

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>{COMPANY_INFO.copyright}</span>
            <span>Version {COMPANY_INFO.version}</span>
          </footer>
        </div>
      </div>
    </MainLayout>
  );
}
