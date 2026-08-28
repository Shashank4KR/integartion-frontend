"use client";

import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import ExpensesPageHeader from "@/components/dashboard/finance/expenses/ExpensesPageHeader";
import ExpenseSummaryCards from "@/components/dashboard/finance/expenses/ExpenseSummaryCards";
import ExpenseFilters from "@/components/dashboard/finance/expenses/ExpenseFilters";
import ExpensesList from "@/components/dashboard/finance/expenses/ExpensesList";
import TopExpenseCategories from "@/components/dashboard/finance/expenses/TopExpenseCategories";
import BudgetVsActual from "@/components/dashboard/finance/expenses/BudgetVsActual";
import ExpensePaymentModeChart from "@/components/dashboard/finance/expenses/ExpensePaymentModeChart";
import RecentExpenseActivities from "@/components/dashboard/finance/expenses/RecentExpenseActivities";
import ExpenseQuickActions from "@/components/dashboard/finance/expenses/ExpenseQuickActions";
import AddExpenseDialog from "@/components/dashboard/finance/expenses/AddExpenseDialog";
import ImportExpensesDialog from "@/components/dashboard/finance/expenses/ImportExpensesDialog";
import ExpenseDetailsDialog from "@/components/dashboard/finance/expenses/ExpenseDetailsDialog";
import ExpenseActionDialog from "@/components/dashboard/finance/expenses/ExpenseActionDialog";
import { getToken } from "@/lib/auth";
import { listExpenses } from "@/lib/services/financeService";

interface Expense {
  id: string;
  expenseId: string;
  expenseDate: string;
  expenseName: string;
  category: string;
  department: string;
  amount: number;
  paymentMode: string;
  status: "Approved" | "Pending" | "Rejected";
  refNo?: string;
  vendor?: string;
  description?: string;
}

const EXPENSE_QUICK_ACTIONS = [
  { label: "Add Expense", icon: "plus", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { label: "Import Expenses", icon: "upload", color: "text-blue-600", bgColor: "bg-blue-50" },
  { label: "Export Report", icon: "download", color: "text-purple-600", bgColor: "bg-purple-50" },
];

const formatCurrency = (value: number) =>
  `INR ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function mapExpense(item: Record<string, unknown>): Expense {
  const rawStatus = String(item.status ?? item.approval_status ?? "").toLowerCase();
  return {
    id: String(item.id ?? crypto.randomUUID()),
    expenseId: String(item.expense_id ?? item.voucher_number ?? item.reference_no ?? item.id ?? "-"),
    expenseDate: String(item.expense_date ?? item.date ?? item.created_at ?? "-"),
    expenseName: String(item.expense_name ?? item.title ?? item.description ?? "Expense"),
    category: String(item.category ?? item.expense_category ?? "Expense"),
    department: String(item.department ?? item.department_name ?? "-"),
    amount: Number(item.amount ?? 0),
    paymentMode: String(item.payment_mode ?? item.payment_method ?? "-"),
    status: rawStatus === "rejected" ? "Rejected" : rawStatus === "pending" ? "Pending" : "Approved",
    refNo: item.reference_no ? String(item.reference_no) : undefined,
    vendor: item.vendor ? String(item.vendor) : undefined,
    description: item.description ? String(item.description) : undefined,
  };
}

export default function ExpensesManagementPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [viewExpense, setViewExpense] = useState<Expense | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    destructive?: boolean;
    showConfirm?: boolean;
  }>({
    open: false,
    title: "",
    message: "",
  });
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const [financialYear, setFinancialYear] = useState("2024-25");
  const [department, setDepartment] = useState("All Departments");
  const [category, setCategory] = useState("All Categories");
  const [paymentMode, setPaymentMode] = useState("All Modes");
  const [dateRange, setDateRange] = useState("This Month");
  const [search, setSearch] = useState("");

  const showToast = (message: string) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: "" }), 3000);
  };

  useEffect(() => {
    const loadExpenses = async () => {
      const token = getToken();
      if (!token) {
        setLoadError("Please log in to view expenses.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        const rows = await listExpenses(token);
        setExpenses(rows.map((item) => mapExpense(item as Record<string, unknown>)));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load expenses.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadExpenses();
  }, []);

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    showToast("Expense added successfully");
  };

  const handleViewExpense = (expense: Expense) => {
    setViewExpense(expense);
  };

  const handleDownload = (expense: Expense) => {
    showToast(`Expense voucher for ${expense.expenseId} generated`);
  };

  const handleMoreOptions = (expense: Expense) => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: `Actions for ${expense.expenseId}: Edit Expense, Submit for Approval, Approve, Reject, Duplicate, Delete.`,
      showConfirm: false,
    });
  };

  const handlePageAction = (action: string) => {
    setActionDialog({
      open: true,
      title: action,
      message: `The "${action}" workflow will be connected to the backend in the integration phase.`,
      showConfirm: false,
    });
  };

  const handleQuickAction = (action: string) => {
    setActionDialog({
      open: true,
      title: action,
      message: `The "${action}" workflow will be connected to the backend in the integration phase.`,
      showConfirm: false,
    });
  };

  const handleThreeDotMenu = () => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: "Export Current View, Print Expenses Register, and Expense Settings will be available here.",
      showConfirm: false,
    });
  };

  const handleRowAction = (expense: Expense, action: string) => {
    if (action === "Delete" || action === "Reject") {
      setActionDialog({
        open: true,
        title: action === "Delete" ? "Delete Expense" : "Reject Expense",
        message: `Are you sure you want to ${action.toLowerCase()} expense ${expense.expenseId}?`,
        confirmText: action,
        destructive: action === "Delete",
        showConfirm: true,
        onConfirm: () => {
          if (action === "Delete") {
            setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
            showToast(`Expense ${expense.expenseId} deleted`);
          } else {
            setExpenses((prev) =>
              prev.map((e) => (e.id === expense.id ? { ...e, status: "Rejected" as const } : e))
            );
            showToast(`Expense ${expense.expenseId} rejected`);
          }
        },
      });
    } else if (action === "Edit") {
      setActionDialog({
        open: true,
        title: "Edit Expense",
        message: `Editing expense ${expense.expenseId}. This will connect to the backend in the integration phase.`,
        showConfirm: false,
      });
    } else if (action === "Approve") {
      setExpenses((prev) =>
        prev.map((e) => (e.id === expense.id ? { ...e, status: "Approved" as const } : e))
      );
      showToast(`Expense ${expense.expenseId} approved`);
    } else if (action === "Submit for Approval") {
      setExpenses((prev) =>
        prev.map((e) => (e.id === expense.id ? { ...e, status: "Pending" as const } : e))
      );
      showToast(`Expense ${expense.expenseId} submitted for approval`);
    } else if (action === "Duplicate") {
      const duplicated: Expense = {
        ...expense,
        id: crypto.randomUUID(),
        expenseId: `EXP${Date.now().toString().slice(-6)}`,
        status: "Pending",
      };
      setExpenses((prev) => [duplicated, ...prev]);
      showToast(`Expense ${expense.expenseId} duplicated`);
    } else {
      setActionDialog({
        open: true,
        title: action,
        message: `The "${action}" action for ${expense.expenseId} will be connected to the backend in the integration phase.`,
        showConfirm: false,
      });
    }
  };

  const handleImport = (file: File) => {
    showToast(`${file.name} imported successfully`);
  };

  const handleFilter = () => {
    showToast("Filters applied");
  };

  const handleReset = () => {
    setFinancialYear("2024-25");
    setDepartment("All Departments");
    setCategory("All Categories");
    setPaymentMode("All Modes");
    setDateRange("This Month");
    setSearch("");
  };

  const handleViewAllActivities = () => {
    setActionDialog({
      open: true,
      title: "All Activities",
      message: "A full activity history view will be available here in a future update.",
      showConfirm: false,
    });
  };

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (department !== "All Departments") {
      result = result.filter((e) => e.department === department);
    }
    if (category !== "All Categories") {
      result = result.filter((e) => e.category === category);
    }
    if (paymentMode !== "All Modes") {
      result = result.filter((e) => e.paymentMode === paymentMode);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.expenseId.toLowerCase().includes(q) ||
          e.expenseName.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.paymentMode.toLowerCase().includes(q) ||
          e.status.toLowerCase().includes(q)
      );
    }

    return result;
  }, [expenses, department, category, paymentMode, search]);

  const totalExpenseAmount = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const summaryCards = useMemo(() => [
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenseAmount),
      footer: `${expenses.length} records from finance API`,
      iconBg: "bg-pink-50",
      iconColor: "text-pink-600",
      sparkline: [],
      sparkColor: "#db2777",
      icon: "money" as const,
    },
    {
      title: "Approved",
      value: String(expenses.filter((expense) => expense.status === "Approved").length),
      footer: "Loaded from finance API",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      sparkline: [],
      sparkColor: "#059669",
      icon: "wallet" as const,
    },
    {
      title: "Pending",
      value: String(expenses.filter((expense) => expense.status === "Pending").length),
      footer: "Loaded from finance API",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      sparkline: [],
      sparkColor: "#d97706",
      icon: "clock" as const,
    },
    {
      title: "Rejected",
      value: String(expenses.filter((expense) => expense.status === "Rejected").length),
      footer: "Loaded from finance API",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      sparkline: [],
      sparkColor: "#dc2626",
      icon: "warning" as const,
    },
  ], [expenses, totalExpenseAmount]);

  const topExpenseCategories = useMemo(() => {
    const totals = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
      return acc;
    }, {});
    return Object.entries(totals).map(([categoryName, amount]) => ({
      category: categoryName,
      amount: formatCurrency(amount),
      percentage: totalExpenseAmount > 0 ? `${Math.round((amount / totalExpenseAmount) * 100)}%` : "0%",
      barWidth: totalExpenseAmount > 0 ? Math.round((amount / totalExpenseAmount) * 100) : 0,
      amountNum: amount,
    }));
  }, [expenses, totalExpenseAmount]);

  const paymentModeSegments = useMemo(() => {
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#7c3aed", "#ef4444"];
    const totals = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.paymentMode] = (acc[expense.paymentMode] ?? 0) + expense.amount;
      return acc;
    }, {});
    return Object.entries(totals).map(([label, amount], index) => ({
      label,
      value: formatCurrency(amount),
      amountNum: amount,
      percentage: totalExpenseAmount > 0 ? `${Math.round((amount / totalExpenseAmount) * 100)}%` : "0%",
      color: colors[index % colors.length],
    }));
  }, [expenses, totalExpenseAmount]);

  const recentActivities = useMemo(() =>
    expenses.slice(0, 5).map((expense) => ({
      id: expense.id,
      text: expense.expenseName,
      subText: `${expense.category} - ${formatCurrency(expense.amount)}`,
      date: expense.expenseDate,
      type: expense.status === "Approved" ? "approved" as const : expense.status === "Rejected" ? "rejected" as const : "pending" as const,
      iconColor: expense.status === "Approved" ? "text-emerald-600" : expense.status === "Rejected" ? "text-red-600" : "text-amber-600",
      bgColor: expense.status === "Approved" ? "bg-emerald-50" : expense.status === "Rejected" ? "bg-red-50" : "bg-amber-50",
    })),
  [expenses]);

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <ExpensesPageHeader
            onAddExpense={() => setAddDialogOpen(true)}
            onImportExpenses={() => setImportDialogOpen(true)}
            onMoreOptions={handleThreeDotMenu}
          />

          {loadError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Loading expenses...
            </div>
          )}

          <ExpenseSummaryCards cards={summaryCards} />

          <ExpenseFilters
            financialYear={financialYear}
            onFinancialYearChange={setFinancialYear}
            department={department}
            onDepartmentChange={setDepartment}
            category={category}
            onCategoryChange={setCategory}
            paymentMode={paymentMode}
            onPaymentModeChange={setPaymentMode}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            search={search}
            onSearchChange={setSearch}
            onFilter={handleFilter}
            onReset={handleReset}
          />

          {!isLoading && !loadError && filteredExpenses.length === 0 ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600">
              No expenses found.
            </div>
          ) : (
            <ExpensesList
              expenses={filteredExpenses}
              onView={handleViewExpense}
              onDownload={handleDownload}
              onAction={handleRowAction}
            />
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <TopExpenseCategories data={topExpenseCategories} />
            <BudgetVsActual data={[]} utilization="0%" />
            <ExpensePaymentModeChart segments={paymentModeSegments} total={formatCurrency(totalExpenseAmount)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RecentExpenseActivities items={recentActivities} onViewAll={handleViewAllActivities} />
            <ExpenseQuickActions items={EXPENSE_QUICK_ACTIONS} onAction={handleQuickAction} />
          </div>

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2026 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>

      <AddExpenseDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddExpense}
      />

      <ImportExpensesDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />

      <ExpenseDetailsDialog
        open={!!viewExpense}
        onClose={() => setViewExpense(null)}
        expense={viewExpense}
      />

      <ExpenseActionDialog
        open={actionDialog.open}
        onClose={() =>
          setActionDialog({ open: false, title: "", message: "", showConfirm: false })
        }
        title={actionDialog.title}
        message={actionDialog.message}
        onConfirm={actionDialog.onConfirm}
        confirmText={actionDialog.confirmText}
        showConfirm={actionDialog.showConfirm}
        destructive={actionDialog.destructive}
      />

      {toast.open && (
        <div className="fixed bottom-6 right-6 z-[200] rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-2xl">
          {toast.message}
        </div>
      )}
    </MainLayout>
  );
}
