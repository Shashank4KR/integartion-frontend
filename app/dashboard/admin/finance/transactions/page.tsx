"use client";

import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import TransactionsPageHeader from "@/components/dashboard/finance/TransactionsPageHeader";
import TransactionSummaryCards from "@/components/dashboard/finance/TransactionSummaryCards";
import TransactionFilters from "@/components/dashboard/finance/TransactionFilters";
import TransactionsTable from "@/components/dashboard/finance/TransactionsTable";
import TransactionPagination from "@/components/dashboard/finance/TransactionPagination";
import TransactionSummaryChart from "@/components/dashboard/finance/TransactionSummaryChart";
import PaymentModeSummary from "@/components/dashboard/finance/PaymentModeSummary";
import TransactionsQuickActions from "@/components/dashboard/finance/TransactionsQuickActions";
import RecentActivity from "@/components/dashboard/finance/RecentActivity";
import AddTransactionDialog from "@/components/dashboard/finance/AddTransactionDialog";
import ImportTransactionsDialog from "@/components/dashboard/finance/ImportTransactionsDialog";
import TransactionDetailsDialog from "@/components/dashboard/finance/TransactionDetailsDialog";
import TransactionActionDialog from "@/components/dashboard/finance/TransactionActionDialog";
import { getToken } from "@/lib/auth";
import { listTransactions } from "@/lib/services/financeService";

const ITEMS_PER_PAGE = 10;
interface TransactionRow {
  id: string;
  receiptRefNo: string;
  date: string;
  studentName: string;
  classGrade: string;
  type: "Income" | "Expense";
  category: string;
  paymentMode: string;
  amount: number;
  status: "Success" | "Pending" | "Failed";
}

interface SummaryCard {
  title: string;
  value: string;
  footer: string;
  iconBg: string;
  iconColor: string;
  sparkline: number[];
  sparkColor: string;
  icon: "transactions" | "income" | "expense" | "balance";
}

interface PaymentModeRow {
  label: string;
  amount: string;
  percentage: number;
}

interface RecentActivityItem {
  type: "Income" | "Expense";
  text: string;
  secondary: string;
  amount: string;
  date: string;
}

const QUICK_ACTIONS = [
  { label: "Add Income", icon: "plus", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { label: "Add Expense", icon: "minus", color: "text-red-600", bgColor: "bg-red-50" },
  { label: "Export", icon: "download", color: "text-blue-600", bgColor: "bg-blue-50" },
];

function mapTransaction(item: Record<string, unknown>): TransactionRow {
  const amount = Number(item.amount ?? item.amount_paid ?? item.total_amount ?? 0);
  const rawType = String(item.type ?? item.transaction_type ?? "").toLowerCase();
  const rawStatus = String(item.status ?? item.payment_status ?? "").toLowerCase();

  return {
    id: String(item.id ?? crypto.randomUUID()),
    receiptRefNo: String(item.receipt_number ?? item.receipt_no ?? item.reference_no ?? item.id ?? "-"),
    date: String(item.payment_date ?? item.date ?? item.created_at ?? "-"),
    studentName: String(item.student_name ?? item.student ?? "-"),
    classGrade: String(item.class_grade ?? item.className ?? "-"),
    type: rawType === "expense" ? "Expense" : "Income",
    category: String(item.category ?? item.fee_type ?? item.description ?? "Transaction"),
    paymentMode: String(item.payment_method ?? item.paymentMode ?? "-"),
    amount,
    status: rawStatus === "failed" ? "Failed" : rawStatus === "pending" ? "Pending" : "Success",
  };
}

const formatCurrency = (value: number) =>
  `INR ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function EmptyPanel({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600">
      {title}
    </div>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [viewTransaction, setViewTransaction] = useState<TransactionRow | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionType, setTransactionType] = useState("All Types");
  const [paymentMode, setPaymentMode] = useState("All Modes");
  const [dateRange, setDateRange] = useState("This Month");
  const [status, setStatus] = useState("All Status");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const showToast = (message: string) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: "" }), 3000);
  };

  useEffect(() => {
    const loadTransactions = async () => {
      const token = getToken();
      if (!token) {
        setLoadError("Please log in to view transactions.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        const rows = await listTransactions(token);
        setTransactions(rows.map((item) => mapTransaction(item as Record<string, unknown>)));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load transactions.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (transactionType !== "All Types") {
      result = result.filter((t) => t.type === transactionType);
    }
    if (paymentMode !== "All Modes") {
      result = result.filter((t) => t.paymentMode === paymentMode);
    }
    if (status !== "All Status") {
      result = result.filter((t) => t.status === status);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.receiptRefNo.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.paymentMode.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      );
    }

    const totalPages = Math.max(1, Math.ceil(result.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    const paginated = result.slice(start, start + ITEMS_PER_PAGE);

    return { paginated, totalPages, total: result.length, originalTotal: result.length };
  }, [transactions, transactionType, paymentMode, status, search, currentPage]);

  const transactionTotals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "Income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expense = transactions
      .filter((transaction) => transaction.type === "Expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const total = income + expense;
    const balance = income - expense;

    return {
      income,
      expense,
      total,
      balance,
      incomePercentage: total > 0 ? `${Math.round((income / total) * 100)}%` : "0%",
      expensePercentage: total > 0 ? `${Math.round((expense / total) * 100)}%` : "0%",
    };
  }, [transactions]);

  const summaryCards = useMemo<SummaryCard[]>(() => [
    {
      title: "Total Transactions",
      value: String(transactions.length),
      footer: "Loaded from finance API",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      sparkline: [],
      sparkColor: "#2563eb",
      icon: "transactions",
    },
    {
      title: "Total Income",
      value: formatCurrency(transactionTotals.income),
      footer: "Loaded from finance API",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      sparkline: [],
      sparkColor: "#059669",
      icon: "income",
    },
    {
      title: "Total Expense",
      value: formatCurrency(transactionTotals.expense),
      footer: "Loaded from finance API",
      iconBg: "bg-pink-50",
      iconColor: "text-pink-600",
      sparkline: [],
      sparkColor: "#db2777",
      icon: "expense",
    },
    {
      title: "Balance",
      value: formatCurrency(transactionTotals.balance),
      footer: "Loaded from finance API",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      sparkline: [],
      sparkColor: "#7c3aed",
      icon: "balance",
    },
  ], [transactions.length, transactionTotals]);

  const paymentModeSummary = useMemo<PaymentModeRow[]>(() => {
    const totals = transactions.reduce<Record<string, number>>((acc, transaction) => {
      const label = transaction.paymentMode || "Unknown";
      acc[label] = (acc[label] ?? 0) + transaction.amount;
      return acc;
    }, {});

    return Object.entries(totals).map(([label, amount]) => ({
      label,
      amount: formatCurrency(amount),
      percentage: transactionTotals.total > 0 ? Math.round((amount / transactionTotals.total) * 100) : 0,
    }));
  }, [transactions, transactionTotals.total]);

  const recentActivity = useMemo<RecentActivityItem[]>(() =>
    transactions.slice(0, 5).map((transaction) => ({
      type: transaction.type,
      text: `${transaction.type}: ${transaction.category}`,
      secondary: transaction.studentName,
      amount: formatCurrency(transaction.amount),
      date: transaction.date,
    })),
  [transactions]);

  const handleAddTransaction = (newTx: TransactionRow) => {
    setTransactions((prev) => [newTx, ...prev]);
    setAddDialogOpen(false);
    showToast("Transaction added successfully");
    setCurrentPage(1);
  };

  const handleViewDetails = (tx: TransactionRow) => {
    setViewTransaction(tx);
  };

  const handleDownload = (tx: TransactionRow) => {
    showToast(`Receipt ${tx.receiptRefNo} downloaded`);
  };

  const handleMoreOptions = (tx: TransactionRow) => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: `Actions for ${tx.receiptRefNo}: Edit Transaction, Print Receipt, Duplicate, Mark Pending, or Delete.`,
    });
  };

  const handlePageAction = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, filteredTransactions.totalPages)));
  };

  const handleQuickAction = (label: string) => {
    setActionDialog({
      open: true,
      title: label,
      message: `The "${label}" workflow will be connected to the backend in the integration phase.`,
    });
  };

  const handleThreeDotMenu = () => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: "Export Current View, Print Transactions, and Transaction Settings will be available here.",
    });
  };

  const handleImport = (file: File) => {
    showToast(`${file.name} imported successfully`);
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <TransactionsPageHeader
            onAddTransaction={() => setAddDialogOpen(true)}
            onImportTransactions={() => setImportDialogOpen(true)}
            onMoreOptions={handleThreeDotMenu}
          />

          {loadError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Loading transactions...
            </div>
          )}

          <TransactionSummaryCards cards={summaryCards} />

          <TransactionFilters
            transactionType={transactionType}
            onTransactionTypeChange={setTransactionType}
            paymentMode={paymentMode}
            onPaymentModeChange={setPaymentMode}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            status={status}
            onStatusChange={setStatus}
            search={search}
            onSearchChange={setSearch}
            onFilter={() => showToast("Filters applied")}
            onReset={() => {
              setTransactionType("All Types");
              setPaymentMode("All Modes");
              setStatus("All Status");
              setSearch("");
              setDateRange("This Month");
              setCurrentPage(1);
            }}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 space-y-6">
              {!isLoading && !loadError && filteredTransactions.total === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600">
                  No transactions found.
                </div>
              ) : (
                <>
                  <TransactionsTable
                    rows={filteredTransactions.paginated}
                    onView={handleViewDetails}
                    onDownload={handleDownload}
                    onMore={handleMoreOptions}
                  />
                  <TransactionPagination
                    currentPage={currentPage}
                    totalPages={filteredTransactions.totalPages}
                    onPageChange={handlePageAction}
                    totalItems={filteredTransactions.originalTotal}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                </>
              )}
            </div>
            <div className="space-y-6">
              <TransactionSummaryChart
                incomeAmount={formatCurrency(transactionTotals.income)}
                incomePercentage={transactionTotals.incomePercentage}
                expenseAmount={formatCurrency(transactionTotals.expense)}
                expensePercentage={transactionTotals.expensePercentage}
                totalAmount={formatCurrency(transactionTotals.total)}
              />
              <PaymentModeSummary rows={paymentModeSummary} />
              <TransactionsQuickActions actions={QUICK_ACTIONS} onAction={handleQuickAction} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <EmptyPanel title="No income and expense trend data available." />
            </div>
            <div>
              <EmptyPanel title="No income category data available." />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-3">
              <RecentActivity
                items={recentActivity}
                onViewAll={() =>
                  setActionDialog({
                    open: true,
                    title: "All Activities",
                    message: "A full activity history view will be available here in a future update.",
                  })
                }
              />
            </div>
          </div>

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2026 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>

      <AddTransactionDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddTransaction}
      />

      <ImportTransactionsDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />

      <TransactionDetailsDialog
        open={!!viewTransaction}
        onClose={() => setViewTransaction(null)}
        transaction={viewTransaction}
      />

      <TransactionActionDialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, title: "", message: "" })}
        title={actionDialog.title}
        message={actionDialog.message}
        onConfirm={() => {
          showToast("Action completed successfully");
          setActionDialog({ open: false, title: "", message: "" });
        }}
      />

      {toast.open && (
        <div className="fixed bottom-6 right-6 z-[200] rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-2xl">
          {toast.message}
        </div>
      )}
    </MainLayout>
  );
}
