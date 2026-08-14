"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import FeesManagementPageHeader from "@/components/dashboard/finance/FeesManagementPageHeader";
import FeesSummaryCards from "@/components/dashboard/finance/FeesSummaryCards";
import FeesManagementFilters from "@/components/dashboard/finance/FeesManagementFilters";
import FeesQuickActions from "@/components/dashboard/finance/FeesQuickActions";
import AddFeeCollectionDialog from "@/components/dashboard/finance/AddFeeCollectionDialog";
import FeesActionDialog from "@/components/dashboard/finance/FeesActionDialog";
import { getToken } from "@/lib/auth";
import { getFinanceOverview } from "@/lib/services/financeService";

interface SummaryCard {
  title: string;
  value: string;
  footer: string;
  iconBg: string;
  iconColor: string;
  icon: string;
  sparkColor: string;
  sparkline: number[];
  secondaryIcon?: string;
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

export default function FeesManagementPage() {
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  });
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const [academicYear, setAcademicYear] = useState("2024-25");
  const [classGrade, setClassGrade] = useState("All Classes");
  const [feeType, setFeeType] = useState("All Fee Types");
  const [installment, setInstallment] = useState("All Installments");
  const [status, setStatus] = useState("All Status");
  const [dateRange, setDateRange] = useState("This Month");

  const showToast = (message: string) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: "" }), 3000);
  };

  useEffect(() => {
    const loadSummary = async () => {
      const token = getToken();
      if (!token) {
        setLoadError("Please log in to view fee management.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        const overview = await getFinanceOverview(token);
        const revenue = Number(overview.total_revenue ?? overview.total_fee_collection ?? 0);
        const outstanding = Number(overview.pending_fee_amount ?? overview.total_outstanding ?? 0);
        const invoices = Number(overview.unpaid_invoices ?? overview.invoice_count ?? 0);
        setSummaryCards([
          {
            title: "Collected Fees",
            value: formatCurrency(revenue),
            footer: "Loaded from finance API",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            icon: "wallet",
            sparkColor: "#059669",
            sparkline: [],
          },
          {
            title: "Outstanding",
            value: formatCurrency(outstanding),
            footer: "Loaded from finance API",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            icon: "hourglass",
            sparkColor: "#d97706",
            sparkline: [],
          },
          {
            title: "Open Invoices",
            value: String(invoices),
            footer: "Loaded from finance API",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            icon: "card",
            sparkColor: "#2563eb",
            sparkline: [],
          },
          {
            title: "Concessions",
            value: formatCurrency(Number(overview.total_concessions ?? 0)),
            footer: "Loaded from finance API",
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
            icon: "users",
            sparkColor: "#7c3aed",
            sparkline: [],
          },
        ]);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load fee summary.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadSummary();
  }, []);

  const handleAddCollection = () => {
    setAddDialogOpen(true);
  };

  const handleSaveCollection = (fee: {
    id: string;
    studentName: string;
    classGrade: string;
    feeType: string;
    installment: string;
    totalAmount: string;
    amountPaid: string;
    paymentMode: string;
    paymentDate: string;
    receiptNumber: string;
    status: string;
    notes: string;
  }) => {
    showToast("Fee collection added successfully");
  };

  const handleMoreOptions = () => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: "Additional fees management options will be available here in a future update.",
    });
  };

  const handleQuickAction = (action: string) => {
    setActionDialog({
      open: true,
      title: action,
      message: `The "${action}" workflow will be connected to the backend in the integration phase.`,
    });
  };

  const handleFilter = () => {
    showToast("Filters applied");
  };

  const handleReset = () => {
    setAcademicYear("2024-25");
    setClassGrade("All Classes");
    setFeeType("All Fee Types");
    setInstallment("All Installments");
    setStatus("All Status");
    setDateRange("This Month");
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <FeesManagementPageHeader
            onAddCollection={handleAddCollection}
            onMoreOptions={handleMoreOptions}
          />

          {loadError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Loading fee summary...
            </div>
          )}

          <FeesSummaryCards cards={summaryCards} />

          <FeesManagementFilters
            academicYear={academicYear}
            onAcademicYearChange={setAcademicYear}
            classGrade={classGrade}
            onClassGradeChange={setClassGrade}
            feeType={feeType}
            onFeeTypeChange={setFeeType}
            installment={installment}
            onInstallmentChange={setInstallment}
            status={status}
            onStatusChange={setStatus}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onFilter={handleFilter}
            onReset={handleReset}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <EmptyPanel title="No fee collection chart data available." />
            <EmptyPanel title="No collection trend data available." />
            <EmptyPanel title="No fee due overview data available." />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2">
              <EmptyPanel title="No fee detail records available." />
            </div>
            <div className="space-y-6">
              <EmptyPanel title="No fee collection type data available." />
              <FeesQuickActions onAction={handleQuickAction} />
            </div>
          </div>

          <EmptyPanel title="No additional fee statistics available." />

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2025 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>

      <AddFeeCollectionDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleSaveCollection}
      />

      <FeesActionDialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, title: "", message: "" })}
        title={actionDialog.title}
        message={actionDialog.message}
      />

      {toast.open && (
        <div className="fixed bottom-6 right-6 z-[200] rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-2xl">
          {toast.message}
        </div>
      )}
    </MainLayout>
  );
}
