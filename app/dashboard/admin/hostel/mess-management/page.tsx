"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import MessManagementPageHeader from "@/components/dashboard/mess/MessManagementPageHeader";
import MessManagementSummaryCards from "@/components/dashboard/mess/MessManagementSummaryCards";
import MessQuickActionsCard from "@/components/dashboard/mess/MessQuickActionsCard";
import TodaysMenuCard from "@/components/dashboard/mess/TodaysMenuCard";
import RecentMessCollectionsCard from "@/components/dashboard/mess/RecentMessCollectionsCard";
import RecentMessExpensesCard from "@/components/dashboard/mess/RecentMessExpensesCard";
import MealsServedTodayChart from "@/components/dashboard/mess/MealsServedTodayChart";
import TopExpenseHeadsCard from "@/components/dashboard/mess/TopExpenseHeadsCard";
import AddMenuDialog from "@/components/dashboard/mess/AddMenuDialog";
import FullMenuPlanDialog from "@/components/dashboard/mess/FullMenuPlanDialog";
import CollectionEntryDialog from "@/components/dashboard/mess/CollectionEntryDialog";
import MessExpenseDialog from "@/components/dashboard/mess/MessExpenseDialog";
import MealAttendanceDialog from "@/components/dashboard/mess/MealAttendanceDialog";
import MessReportDialog from "@/components/dashboard/mess/MessReportDialog";
import ViewAllCollectionsDialog from "@/components/dashboard/mess/ViewAllCollectionsDialog";
import ViewAllExpensesDialog from "@/components/dashboard/mess/ViewAllExpensesDialog";
import { clearAuth, getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import { getMessDashboard } from "@/lib/services/hostelService";
import {
  createMenu,
  addExpense,
  recordCollection,
  recordMealAttendance,
  listCollections,
  listExpenses,
  listMenus,
  listMealAttendance,
} from "@/lib/services/messService";
import {
  MESS_QUICK_ACTIONS,
  type QuickActionItem,
  type MealRow,
  type CollectionRow,
  type ExpenseRow,
  type MealServedSegment,
} from "@/lib/fixtures/mess-management-reference-fixture";

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
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog open states
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isMenuPlanOpen, setIsMenuPlanOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAllCollectionsOpen, setIsAllCollectionsOpen] = useState(false);
  const [isAllExpensesOpen, setIsAllExpensesOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("Today");

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
      const [summaryData, menuRows, expenseRows, collectionRows, attendanceRows] = await Promise.all([
        getMessDashboard(token).catch(() => ({})),
        listMenus(token).catch(() => []),
        listExpenses(token).catch(() => []),
        listCollections(token).catch(() => []),
        listMealAttendance(token).catch(() => []),
      ]);
      setSummary(summaryData ?? {});
      setMenus(Array.isArray(menuRows) ? menuRows : []);
      setExpenses(Array.isArray(expenseRows) ? expenseRows : []);
      setCollections(Array.isArray(collectionRows) ? collectionRows : []);
      setAttendance(Array.isArray(attendanceRows) ? attendanceRows : []);
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

    setActionError(null);
    setSuccessMessage(null);
    try {
      const mealTypeLower = payload.mealType.toLowerCase();
      await createMenu(token, {
        menu_date: payload.date || new Date().toISOString().split("T")[0],
        meal_type: payload.mealType || "Breakfast",
        items: payload.menuItems,
        breakfast: mealTypeLower === "breakfast" ? payload.menuItems : undefined,
        lunch: mealTypeLower === "lunch" ? payload.menuItems : undefined,
        dinner: mealTypeLower === "dinner" ? payload.menuItems : undefined,
        start_time: payload.startTime || undefined,
        end_time: payload.endTime || undefined,
        notes: payload.notes || undefined,
      });
      setSuccessMessage("Menu created successfully.");
      await loadData();
      setIsAddMenuOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create menu.");
    }
  };

  const handleAddExpense = async (data: {
    date: string;
    particular: string;
    category: string;
    amount: string;
    addedBy: string;
    notes: string;
  }) => {
    const token = getToken();
    if (!token) return;

    setActionError(null);
    setSuccessMessage(null);
    try {
      await addExpense(token, {
        expense_date: data.date || new Date().toISOString().split("T")[0],
        category: data.category || "Groceries",
        description: data.particular || data.notes || "Mess Expense",
        amount: Number(data.amount) || 0,
      });
      setSuccessMessage("Mess expense added successfully.");
      await loadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to record expense.");
    }
  };

  const handleRecordCollection = async (data: {
    date: string;
    receivedFrom: string;
    blockRoom: string;
    amount: string;
    receivedBy: string;
    paymentMode: string;
    notes: string;
  }) => {
    const token = getToken();
    if (!token) return;

    setActionError(null);
    setSuccessMessage(null);
    try {
      await recordCollection(token, {
        collection_date: data.date || new Date().toISOString().split("T")[0],
        amount: Number(data.amount) || 0,
        payment_method: data.paymentMode || "Cash",
      });
      setSuccessMessage("Mess collection recorded successfully.");
      await loadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to record collection.");
    }
  };

  const handleRecordAttendance = async (data: {
    date: string;
    meal: string;
    block: string;
    present: string;
    absent: string;
  }) => {
    const token = getToken();
    if (!token) return;

    setActionError(null);
    setSuccessMessage(null);
    try {
      await recordMealAttendance(token, {
        attendance_date: data.date || new Date().toISOString().split("T")[0],
        meal_type: data.meal || "Breakfast",
        status: "PRESENT",
      });
      setSuccessMessage("Meal attendance recorded successfully.");
      await loadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to record meal attendance.");
    }
  };

  const handleQuickAction = (action: QuickActionItem) => {
    switch (action.label) {
      case "Add Menu":
        setIsAddMenuOpen(true);
        break;
      case "Record Attendance":
        setIsAttendanceOpen(true);
        break;
      case "Add Expense":
        setIsAddExpenseOpen(true);
        break;
      case "Collection Entry":
        setIsCollectionOpen(true);
        break;
      case "Generate Report":
        setIsReportOpen(true);
        break;
      default:
        break;
    }
  };

  // Map today's menu
  const todaysMenuRows: MealRow[] = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todays = menus.filter((m) => {
      const d = typeof m.menu_date === "string" ? m.menu_date.split("T")[0] : "";
      return d === todayStr;
    });
    return todays.map((m, idx) => {
      const mealType = m.meal_type || "Meal";
      const isBreakfast = mealType.toLowerCase().includes("breakfast");
      const isLunch = mealType.toLowerCase().includes("lunch");
      return {
        id: String(m.id || idx),
        meal: mealType,
        menu: m.items || m.menu_items || m.breakfast || m.lunch || m.dinner || "Scheduled meal items",
        time: m.start_time && m.end_time ? `${m.start_time} - ${m.end_time}` : isBreakfast ? "07:30 AM - 09:00 AM" : isLunch ? "12:30 PM - 02:00 PM" : "07:30 PM - 09:00 PM",
        status: "Served" as const,
        iconColor: isBreakfast ? "text-orange-500" : isLunch ? "text-emerald-600" : "text-blue-600",
        iconBg: isBreakfast ? "bg-orange-50" : isLunch ? "bg-emerald-50" : "bg-blue-50",
        mealIcon: isBreakfast ? "Sun" : isLunch ? "Flame" : "Moon",
      };
    });
  }, [menus]);

  // Map collections
  const mappedCollections: CollectionRow[] = useMemo(() => {
    return collections.map((c, idx) => ({
      id: String(c.id || idx),
      date: c.collection_date ? new Date(c.collection_date).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB"),
      receivedFrom: c.student_name || "Hostel Resident",
      blockRoom: c.payment_method ? `Via ${c.payment_method}` : "General",
      amount: Number(c.amount) || 0,
      receivedBy: "Mess Admin",
    }));
  }, [collections]);

  // Map expenses
  const mappedExpenses: ExpenseRow[] = useMemo(() => {
    return expenses.map((e, idx) => ({
      id: String(e.id || idx),
      date: e.expense_date ? new Date(e.expense_date).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB"),
      particulars: e.description || e.particulars || e.category || "Mess Procurement",
      category: e.category || "Groceries",
      amount: Number(e.amount) || 0,
      addedBy: "Mess Manager",
    }));
  }, [expenses]);

  // Dynamic top expense heads
  const dynamicExpenseHeads = useMemo(() => {
    if (expenses.length === 0) return [];
    const catMap: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      catMap[cat] = (catMap[cat] || 0) + (Number(e.amount) || 0);
    });
    const maxVal = Math.max(...Object.values(catMap), 1);
    const colors = ["#7c3aed", "#10b981", "#f97316", "#3b82f6", "#ec4899"];
    return Object.entries(catMap)
      .slice(0, 5)
      .map(([cat, amt], idx) => ({
        category: cat,
        amount: formatCurrency(amt),
        amountNum: amt,
        barWidth: Math.round((amt / maxVal) * 100),
        barColor: colors[idx % colors.length],
      }));
  }, [expenses]);

  const cards = useMemo(
    () => [
      {
        title: "Menus",
        value: String(menus.length),
        footer: "Active menu records",
        icon: "UtensilsCrossed",
        iconBg: "bg-purple-50",
        iconColor: "text-[#7c3aed]",
        tint: "bg-purple-50/60",
      },
      {
        title: "Meals Served Today",
        value: String(summary?.today_attendance ?? 0),
        footer: "Verified attendance count",
        icon: "Users",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        tint: "bg-emerald-50/60",
      },
      {
        title: "Total Expenses",
        value: formatCurrency(summary?.total_expenses ?? expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)),
        footer: `${expenses.length} expense entries`,
        icon: "IndianRupee",
        iconBg: "bg-pink-50",
        iconColor: "text-pink-500",
        tint: "bg-pink-50/60",
      },
      {
        title: "Total Collection",
        value: formatCurrency(summary?.total_collections ?? collections.reduce((s, c) => s + (Number(c.amount) || 0), 0)),
        footer: `${collections.length} collection entries`,
        icon: "Wallet",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        tint: "bg-blue-50/60",
      },
      {
        title: "Balance",
        value: formatCurrency(summary?.profit_loss ?? 0),
        footer: "Collections minus expenses",
        icon: "TrendingUp",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
        tint: "bg-orange-50/60",
      },
    ],
    [collections, expenses, menus.length, summary],
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

    return { title: "Current Schedule", days: Object.values(daysMap) };
  }, [menus]);

  const mealServedSegments: MealServedSegment[] = useMemo(() => {
    let breakfastCount = 0;
    let lunchCount = 0;
    let dinnerCount = 0;

    attendance.forEach((att) => {
      const m = (att.meal_type || "").toLowerCase();
      if (m.includes("breakfast")) breakfastCount++;
      else if (m.includes("lunch")) lunchCount++;
      else if (m.includes("dinner") || m.includes("supper")) dinnerCount++;
    });

    const total = breakfastCount + lunchCount + dinnerCount;
    if (total === 0) {
      return [
        { label: "Breakfast", count: 0, percentage: "0%", color: "#f97316" },
        { label: "Lunch", count: 0, percentage: "0%", color: "#10b981" },
        { label: "Dinner", count: 0, percentage: "0%", color: "#3b82f6" },
      ];
    }

    return [
      { label: "Breakfast", count: breakfastCount, percentage: `${Math.round((breakfastCount / total) * 100)}%`, color: "#f97316" },
      { label: "Lunch", count: lunchCount, percentage: `${Math.round((lunchCount / total) * 100)}%`, color: "#10b981" },
      { label: "Dinner", count: dinnerCount, percentage: `${Math.round((dinnerCount / total) * 100)}%`, color: "#3b82f6" },
    ];
  }, [attendance]);

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <MessManagementPageHeader
            onAddClick={() => setIsAddMenuOpen(true)}
            onViewMenuPlan={() => setIsMenuPlanOpen(true)}
            onMoreOptions={() => setIsReportOpen(true)}
          />

          {actionError && (
            <div role="alert" className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              <span>{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-xs font-semibold text-red-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {successMessage && (
            <div role="alert" className="mb-6 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
              <span>{successMessage}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-xs font-semibold text-emerald-800 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {loadError && (
            <div role="alert" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
              {loadError}
            </div>
          )}

          {isLoading ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600 animate-pulse">
              Loading mess operations data...
            </div>
          ) : (
            <MessManagementSummaryCards cards={cards} />
          )}

          {/* Quick Actions & Today's Menu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <MessQuickActionsCard
                actions={MESS_QUICK_ACTIONS}
                onAction={handleQuickAction}
              />
            </div>
            <div className="lg:col-span-2">
              <TodaysMenuCard
                rows={todaysMenuRows}
                onRowClick={() => setIsMenuPlanOpen(true)}
              />
            </div>
          </div>

          {/* Attendance Chart & Top Expense Heads */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <MealsServedTodayChart
                segments={mealServedSegments}
                total={Number(summary?.today_attendance ?? attendance.length)}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            </div>
            <div className="lg:col-span-1">
              <TopExpenseHeadsCard
                rows={dynamicExpenseHeads}
                month={new Date().toLocaleString("en-US", { month: "short", year: "numeric" })}
              />
            </div>
          </div>

          {/* Collections and Expenses Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <RecentMessCollectionsCard
              rows={mappedCollections.slice(0, 5)}
              onViewAll={() => setIsAllCollectionsOpen(true)}
            />
            <RecentMessExpensesCard
              rows={mappedExpenses.slice(0, 5)}
              onViewAll={() => setIsAllExpensesOpen(true)}
            />
          </div>

          {/* Dialogs */}
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

          <CollectionEntryDialog
            open={isCollectionOpen}
            onClose={() => setIsCollectionOpen(false)}
            onSave={handleRecordCollection}
          />

          <MessExpenseDialog
            open={isAddExpenseOpen}
            onClose={() => setIsAddExpenseOpen(false)}
            onSave={handleAddExpense}
          />

          <MealAttendanceDialog
            open={isAttendanceOpen}
            onClose={() => setIsAttendanceOpen(false)}
            onSave={handleRecordAttendance}
          />

          <MessReportDialog
            open={isReportOpen}
            onClose={() => setIsReportOpen(false)}
          />

          <ViewAllCollectionsDialog
            open={isAllCollectionsOpen}
            onClose={() => setIsAllCollectionsOpen(false)}
            rows={mappedCollections}
          />

          <ViewAllExpensesDialog
            open={isAllExpensesOpen}
            onClose={() => setIsAllExpensesOpen(false)}
            rows={mappedExpenses}
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
