"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import FinanceOverviewPageHeader from "@/components/dashboard/finance/FinanceOverviewPageHeader";
import FinanceSummaryCards from "@/components/dashboard/finance/FinanceSummaryCards";
import FinanceFilters from "@/components/dashboard/finance/FinanceFilters";
import FeeCollectionSummaryChart from "@/components/dashboard/finance/FeeCollectionSummaryChart";
import IncomeExpenseChart from "@/components/dashboard/finance/IncomeExpenseChart";
import FeeCollectionByTypeChart from "@/components/dashboard/finance/FeeCollectionByTypeChart";
import RecentTransactionsTable from "@/components/dashboard/finance/RecentTransactionsTable";
import OutstandingFeeSummary from "@/components/dashboard/finance/OutstandingFeeSummary";
import FinanceQuickActions from "@/components/dashboard/finance/FinanceQuickActions";
import FinanceBalanceCards from "@/components/dashboard/finance/FinanceBalanceCards";
import AddTransactionDialog from "@/components/dashboard/finance/AddTransactionDialog";
import TransactionDetailsDialog from "@/components/dashboard/finance/TransactionDetailsDialog";
import FinanceActionDialog from "@/components/dashboard/finance/FinanceActionDialog";
import RefundProcessingDialog from "@/components/dashboard/finance/RefundProcessingDialog";
import PaymentLinkDialog from "@/components/dashboard/finance/PaymentLinkDialog";
import SendRemindersDialog from "@/components/dashboard/finance/SendRemindersDialog";
import WalletManagementDialog from "@/components/dashboard/finance/WalletManagementDialog";
import GenerateInvoiceDialog from "@/components/dashboard/finance/invoices/GenerateInvoiceDialog";
import { getToken } from "@/lib/auth";
import { getFinanceOverview, listTransactions, recordTransaction } from "@/lib/services/financeService";
type BalanceCard = any;
type SummaryCard = any;
type TransactionRow = any;

type OutstandingSummary = {
  totalStudents: number;
  studentsWithOutstanding: number;
  outstandingPercentage: string;
  totalOutstandingAmount: string;
};

const EMPTY_OUTSTANDING_SUMMARY: OutstandingSummary = {
  totalStudents: 0,
  studentsWithOutstanding: 0,
  outstandingPercentage: "0%",
  totalOutstandingAmount: "0",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getAmountValue(entry: Record<string, unknown>): number {
  const candidates = [
    entry.amount,
    entry.amount_paid,
    entry.total_amount,
    entry.totalAmount,
    entry.net_amount,
    entry.netAmount,
    entry.value,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number") return candidate;
    if (typeof candidate === "string") {
      const parsed = Number(candidate.replace(/[^0-9.-]/g, ""));
      if (!Number.isNaN(parsed)) return parsed;
    }
  }

  return 0;
}

function getCategoryLabel(entry: Record<string, unknown>): string {
  const direct = [
    entry.category,
    entry.type,
    entry.fee_type,
    entry.feeType,
    entry.label,
    entry.transaction_type,
    entry.transactionType,
  ].find((value) => typeof value === "string" && value.trim().length > 0);

  if (typeof direct === "string") return direct;
  return "Transactions";
}

function buildSummaryCards(overview: Record<string, unknown> | undefined, rows: TransactionRow[]): SummaryCard[] {
  if (Array.isArray(overview?.summaryCards) && overview.summaryCards.length > 0) {
    return overview.summaryCards as SummaryCard[];
  }

  const totalAmount = rows.reduce((sum, row) => sum + getAmountValue(row as unknown as Record<string, unknown>), 0);
  const baseCards: SummaryCard[] = [
    {
      title: "Transactions",
      value: String(rows.length),
      footer: rows.length > 0 ? "Fetched from backend" : "No transactions yet",
      icon: "invoice",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      sparkline: rows.length > 0 ? [rows.length, rows.length + 2, rows.length + 1] : [],
      sparkColor: "#7c3aed",
    },
    {
      title: "Collection",
      value: formatCurrency(totalAmount),
      footer: totalAmount > 0 ? "Amount recorded by backend" : "Awaiting backend values",
      icon: "rupee",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      sparkline: totalAmount > 0 ? [0, 2, 4] : [],
      sparkColor: "#10b981",
    },
  ];

  return baseCards;
}

function buildBalanceCards(overview: Record<string, unknown> | undefined): BalanceCard[] {
  if (Array.isArray(overview?.balanceCards) && overview.balanceCards.length > 0) {
    return overview.balanceCards as BalanceCard[];
  }

  return [];
}

function buildOutstandingSummary(overview: Record<string, unknown> | undefined): OutstandingSummary {
  if (overview && typeof overview === "object") {
    const candidate = overview as Record<string, unknown>;
    if (candidate.outstandingSummary && typeof candidate.outstandingSummary === "object") {
      const value = candidate.outstandingSummary as Record<string, unknown>;
      return {
        totalStudents: Number(value.totalStudents ?? 0),
        studentsWithOutstanding: Number(value.studentsWithOutstanding ?? 0),
        outstandingPercentage: String(value.outstandingPercentage ?? "0%"),
        totalOutstandingAmount: String(value.totalOutstandingAmount ?? "0"),
      };
    }
  }

  return EMPTY_OUTSTANDING_SUMMARY;
}

function buildFeeCollectionSegments(rows: TransactionRow[]): Array<{ label: string; value: number; color: string }> {
  const groups = new Map<string, number>();

  rows.forEach((row) => {
    const record = row as unknown as Record<string, unknown>;
    const key = getCategoryLabel(record);
    const amount = getAmountValue(record);
    groups.set(key, (groups.get(key) ?? 0) + amount);
  });

  const palette = ["#7c3aed", "#3b82f6", "#0ea5e9", "#f59e0b", "#6366f1"];
  return Array.from(groups.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value], index) => ({
      label,
      value: Math.max(1, Math.round(value)),
      color: palette[index % palette.length],
    }));
}

function buildRecentCollections(rows: TransactionRow[]): Array<{ student: string; course: string; status: "Paid" | "Pending" | "Overdue"; amount: string; date: string }> {
  return rows.slice(0, 4).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    const statusVal = r.status === "paid" ? "Paid" : r.status === "overdue" ? "Overdue" : "Pending";
    return {
      student: String(r.studentName ?? r.student ?? "Student"),
      course: String(r.course ?? r.className ?? "N/A"),
      status: statusVal as "Paid" | "Pending" | "Overdue",
      amount: formatCurrency(getAmountValue(r)),
      date: String(r.created_at ?? r.date ?? ""),
    };
  });
}

function buildIncomeExpenseSeries(overview: Record<string, unknown> | undefined) {
  const incomeSeries = Array.isArray(overview?.incomeSeries)
    ? overview.incomeSeries
    : [];
  const expenseSeries = Array.isArray(overview?.expenseSeries)
    ? overview.expenseSeries
    : [];

  return {
    incomeData: Array.isArray(incomeSeries)
      ? incomeSeries.map((item: Record<string, unknown>) => ({
          label: String(item.label ?? ""),
          value: Number(item.value ?? 0),
        }))
      : [],
    expenseData: Array.isArray(expenseSeries)
      ? expenseSeries.map((item: Record<string, unknown>) => ({
          label: String(item.label ?? ""),
          value: Number(item.value ?? 0),
        }))
      : [],
  };
}

function buildFeeTypeSegments(overview: Record<string, unknown> | undefined, rows: TransactionRow[]) {
  if (Array.isArray(overview?.feeTypeSegments) && overview.feeTypeSegments.length > 0) {
    return overview.feeTypeSegments as Array<{ label: string; value: number; color: string }>;
  }

  return buildFeeCollectionSegments(rows);
}

function buildRecentPayments(rows: TransactionRow[]) {
  return rows.slice(0, 4).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    return {
      student: String(r.studentName ?? r.student ?? "Student"),
      status: String(r.status ?? "Pending"),
      amount: formatCurrency(getAmountValue(r)),
    };
  });
}

function mapTransactionRow(item: unknown): TransactionRow {
  const r = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
  const id = String(r.id ?? crypto.randomUUID());
  const receipt = String(
    r.receiptRefNo ??
    r.receipt_ref_no ??
    r.receipt_number ??
    r.receipt_no ??
    r.transaction_no ??
    r.reference_no ??
    (id && !id.startsWith("exp-") ? `REC-${id.slice(0, 8).toUpperCase()}` : `TXN-${id.slice(0, 8).toUpperCase()}`)
  );
  const student = String(
    r.studentName ??
    r.student_name ??
    r.student ??
    (r.type === "Expense" ? "Expense" : "Student")
  );
  const classGrade = String(
    r.classGrade ??
    r.class_grade ??
    r.class_name ??
    r.className ??
    ""
  );
  const category = String(
    r.category ??
    r.type ??
    r.fee_type ??
    r.feeType ??
    r.description ??
    "Fee Payment"
  );
  const rawType = String(r.type ?? "").toLowerCase();
  const rawStatus = String(r.status ?? "Paid").toLowerCase();

  return {
    id,
    receiptRefNo: receipt.trim() || `TXN-${id.slice(0, 8).toUpperCase()}`,
    date: String(r.date ?? r.payment_date ?? r.created_at ?? "-"),
    studentName: student.trim() || "Student",
    classGrade: classGrade.trim(),
    type: rawType.includes("exp") ? "Expense" : "Income",
    category: category.trim() || "Fee Payment",
    paymentMode: String(r.paymentMode ?? r.payment_mode ?? r.payment_method ?? "Online"),
    amount: getAmountValue(r),
    status: rawStatus.includes("fail") ? "Failed" : rawStatus.includes("pend") ? "Pending" : "Paid" as any,
  };
}

export default function FinanceOverviewPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [balanceCards, setBalanceCards] = useState<BalanceCard[]>([]);
  const [outstandingSummary, setOutstandingSummary] = useState<OutstandingSummary>(EMPTY_OUTSTANDING_SUMMARY);
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [classGrade, setClassGrade] = useState("All Classes");
  const [feeType, setFeeType] = useState("All Fee Types");
  const [paymentStatus, setPaymentStatus] = useState("All Status");
  const [dateRange, setDateRange] = useState("This Month");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewTransaction, setViewTransaction] = useState<TransactionRow | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  });
  const [refundOpen, setRefundOpen] = useState(false);
  const [paymentLinkOpen, setPaymentLinkOpen] = useState(false);
  const [sendRemindersOpen, setSendRemindersOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [generateInvoiceOpen, setGenerateInvoiceOpen] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feeCollectionData, setFeeCollectionData] = useState<Array<{ label: string; value: number; color: string }>>([]);
  const [recentCollections, setRecentCollections] = useState<Array<{ student: string; course: string; status: "Paid" | "Pending" | "Overdue"; amount: string; date: string }>>([]);
  const [incomeExpenseSeries, setIncomeExpenseSeries] = useState<{ incomeData: Array<{ label: string; value: number }>; expenseData: Array<{ label: string; value: number }> }>({ incomeData: [], expenseData: [] });
  const [feeTypeSegments, setFeeTypeSegments] = useState<Array<{ label: string; value: number; color: string }>>([]);
  const [recentPayments, setRecentPayments] = useState<Array<{ student: string; status: string; amount: string }>>([]);

  const showToast = (message: string) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: "" }), 3000);
  };

  const loadFinanceData = async () => {
    const token = getToken();
    if (!token) {
      setLoadError("Please log in to view finance data.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const [overview, rows] = await Promise.all([
        getFinanceOverview(token),
        listTransactions(token),
      ]);

      const overviewRecord = overview as Record<string, unknown> | undefined;
      const normalizedRows = Array.isArray(rows) ? rows.map(mapTransactionRow) : [];

      setSummaryCards(buildSummaryCards(overviewRecord, normalizedRows));
      setBalanceCards(buildBalanceCards(overviewRecord));
      setOutstandingSummary(buildOutstandingSummary(overviewRecord));
      setTransactions(normalizedRows);
      setFeeCollectionData(buildFeeCollectionSegments(normalizedRows));
      setRecentCollections(buildRecentCollections(normalizedRows));
      setIncomeExpenseSeries(buildIncomeExpenseSeries(overviewRecord));
      setFeeTypeSegments(buildFeeTypeSegments(overviewRecord, normalizedRows));
      setRecentPayments(buildRecentPayments(normalizedRows));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load finance data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFinanceData();
  }, []);

  const handleAddTransaction = async (newTx: TransactionRow) => {
    const token = getToken();
    if (!token) {
      setLoadError("Please log in to record a transaction.");
      return;
    }

    try {
      await recordTransaction(token, newTx);
      await loadFinanceData();
      setAddDialogOpen(false);
      showToast("Transaction added successfully");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to record transaction.");
    }
  };

  const handleViewDetails = (tx: TransactionRow) => {
    setViewTransaction(tx);
  };

  const exportTransactionsCSV = (rows: TransactionRow[]) => {
    if (!rows || rows.length === 0) {
      showToast("No transaction records available to export.");
      return;
    }
    const headers = ["Receipt/Txn No", "Date", "Student/Entity", "Class/Grade", "Type", "Category", "Payment Mode", "Amount", "Status"];
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => [
        `"${r.receiptRefNo || ""}"`,
        `"${r.date || ""}"`,
        `"${r.studentName || ""}"`,
        `"${r.classGrade || ""}"`,
        `"${r.type || ""}"`,
        `"${r.category || ""}"`,
        `"${r.paymentMode || ""}"`,
        `"${r.amount || 0}"`,
        `"${r.status || ""}"`,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finance-transactions-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Finance report exported successfully!");
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "New Invoice":
        setGenerateInvoiceOpen(true);
        break;
      case "Refund Processing":
        setRefundOpen(true);
        break;
      case "Fee Structure":
        router.push("/dashboard/admin/finance/fees-management");
        break;
      case "Payment Link":
        setPaymentLinkOpen(true);
        break;
      case "Reports":
        router.push("/dashboard/admin/reports");
        break;
      case "Export Data":
        exportTransactionsCSV(transactions);
        break;
      case "Send Reminders":
        setSendRemindersOpen(true);
        break;
      case "Wallet Management":
        setWalletOpen(true);
        break;
      default:
        setActionDialog({
          open: true,
          title: action,
          message: `Performing ${action}...`,
        });
        break;
    }
  };

  const handleProcessRefund = async (refundData: {
    studentName: string;
    receiptNo: string;
    amount: number;
    reason: string;
    refundMode: string;
  }) => {
    const newTx: TransactionRow = {
      id: crypto.randomUUID(),
      receiptRefNo: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split("T")[0],
      studentName: refundData.studentName,
      classGrade: "Refund",
      type: "Expense",
      category: `Fee Refund (${refundData.reason})`,
      paymentMode: refundData.refundMode,
      amount: refundData.amount,
      status: "Paid",
    };
    await handleAddTransaction(newTx);
    showToast(`Refund of ₹${refundData.amount.toLocaleString()} processed for ${refundData.studentName}`);
  };

  const handleSendPaymentLink = (data: { studentName: string; amount: number; purpose: string; link: string }) => {
    showToast(`Payment link for ₹${data.amount.toLocaleString()} generated and sent to ${data.studentName}`);
  };

  const handleSendFeeReminders = (data: { audience: string; channels: string[]; message: string }) => {
    showToast(`Fee reminders broadcasted via ${data.channels.join(", ")} to ${data.audience}`);
  };

  const handleWalletUpdate = (data: { studentName: string; type: "credit" | "debit"; amount: number; purpose: string }) => {
    showToast(`Campus wallet ${data.type === "credit" ? "credited with" : "debited by"} ₹${data.amount.toLocaleString()} for ${data.studentName}`);
  };

  const handleInvoiceSaved = (invoice: any) => {
    setGenerateInvoiceOpen(false);
    showToast(`Invoice ${invoice?.invoiceNumber ?? ""} created successfully!`);
    void loadFinanceData();
  };

  const handleMoreOptions = () => {
    router.push("/dashboard/admin/finance/expenses");
  };

  const handleResetFilters = () => {
    setAcademicYear("2025-26");
    setClassGrade("All Classes");
    setFeeType("All Fee Types");
    setPaymentStatus("All Status");
    setDateRange("This Month");
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <FinanceOverviewPageHeader
            onAddTransaction={() => setAddDialogOpen(true)}
            onMoreOptions={handleMoreOptions}
          />

          {loadError ? (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {loadError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
              Loading finance data...
            </div>
          ) : null}

          <FinanceSummaryCards cards={summaryCards} />

          <FinanceFilters
            academicYear={academicYear}
            onAcademicYearChange={setAcademicYear}
            classGrade={classGrade}
            onClassGradeChange={setClassGrade}
            feeType={feeType}
            onFeeTypeChange={setFeeType}
            paymentStatus={paymentStatus}
            onPaymentStatusChange={setPaymentStatus}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onFilter={loadFinanceData}
            onReset={handleResetFilters}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <FeeCollectionSummaryChart data={feeCollectionData} recentCollections={recentCollections} />
            <IncomeExpenseChart incomeData={incomeExpenseSeries.incomeData} expenseData={incomeExpenseSeries.expenseData} />
            <FeeCollectionByTypeChart segments={feeTypeSegments} recentPayments={recentPayments} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2">
              <RecentTransactionsTable
                rows={transactions}
                onView={handleViewDetails}
                onViewAll={() => router.push("/dashboard/admin/finance/transactions")}
              />
            </div>
            <div className="space-y-6">
              <OutstandingFeeSummary
                data={outstandingSummary}
                onViewAll={() => router.push("/dashboard/admin/finance/fees-management")}
                onSendReminders={() => setSendRemindersOpen(true)}
              />
              <FinanceQuickActions onAction={handleQuickAction} />
            </div>
          </div>

          <FinanceBalanceCards cards={balanceCards} />

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

      <TransactionDetailsDialog
        open={!!viewTransaction}
        onClose={() => setViewTransaction(null)}
        transaction={viewTransaction}
      />

      <GenerateInvoiceDialog
        open={generateInvoiceOpen}
        onClose={() => setGenerateInvoiceOpen(false)}
        onSave={handleInvoiceSaved}
      />

      <RefundProcessingDialog
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        onProcessRefund={handleProcessRefund}
      />

      <PaymentLinkDialog
        open={paymentLinkOpen}
        onClose={() => setPaymentLinkOpen(false)}
        onSendLink={handleSendPaymentLink}
      />

      <SendRemindersDialog
        open={sendRemindersOpen}
        onClose={() => setSendRemindersOpen(false)}
        onSend={handleSendFeeReminders}
      />

      <WalletManagementDialog
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        onWalletUpdate={handleWalletUpdate}
      />

      <FinanceActionDialog
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
