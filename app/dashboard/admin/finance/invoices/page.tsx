"use client";

import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import InvoicesPageHeader from "@/components/dashboard/finance/invoices/InvoicesPageHeader";
import InvoiceSummaryCards from "@/components/dashboard/finance/invoices/InvoiceSummaryCards";
import InvoiceFilters from "@/components/dashboard/finance/invoices/InvoiceFilters";
import InvoicesTable from "@/components/dashboard/finance/invoices/InvoicesTable";
import InvoicePagination from "@/components/dashboard/finance/invoices/InvoicePagination";
import InvoiceDetailsCard from "@/components/dashboard/finance/invoices/InvoiceDetailsCard";
import GenerateInvoiceDialog from "@/components/dashboard/finance/invoices/GenerateInvoiceDialog";
import ImportInvoicesDialog from "@/components/dashboard/finance/invoices/ImportInvoicesDialog";
import InvoiceActionDialog from "@/components/dashboard/finance/invoices/InvoiceActionDialog";
import { getToken } from "@/lib/auth";
import { listInvoices } from "@/lib/services/financeService";

const ITEMS_PER_PAGE = 10;
interface InvoiceRow {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  studentName: string;
  studentId: string;
  classGrade: string;
  invoiceType: "Fee Invoice" | "Salary Invoice" | "Expense Invoice" | "Other Invoice";
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: "Paid" | "Partial" | "Overdue" | "Pending";
}

const formatCurrency = (value: number) =>
  `INR ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function mapInvoice(item: Record<string, unknown>): InvoiceRow {
  const amount = Number(item.amount ?? item.total_amount ?? item.net_amount ?? 0);
  const paid = Number(item.paid ?? item.paid_amount ?? item.amount_paid ?? 0);
  const rawStatus = String(item.status ?? item.payment_status ?? "").toUpperCase();
  const status =
    rawStatus === "PAID" ? "Paid" :
      rawStatus === "PARTIAL" ? "Partial" :
        rawStatus === "OVERDUE" ? "Overdue" :
          "Pending";

  const studentName = (() => {
    if (item.student_name) return String(item.student_name);
    if (item.student && typeof item.student === "object") {
      const stud = item.student as Record<string, any>;
      const first = stud.first_name || stud.firstName || "";
      const last = stud.last_name || stud.lastName || "";
      const name = `${first} ${last}`.trim();
      return name || stud.name || stud.username || "-";
    }
    return String(item.student ?? "-");
  })();

  return {
    id: String(item.id ?? crypto.randomUUID()),
    invoiceNo: String(item.invoice_number ?? item.invoice_no ?? item.id ?? "-"),
    invoiceDate: String(item.invoice_date ?? item.created_at ?? "-"),
    studentName,
    studentId: String(item.student_id ?? "-"),
    classGrade: String(item.class_grade ?? item.className ?? "-"),
    invoiceType: "Fee Invoice",
    dueDate: String(item.due_date ?? "-"),
    amount,
    paid,
    balance: Number(item.balance ?? item.balance_amount ?? Math.max(0, amount - paid)),
    status,
  };
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600">
      {title}
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    destructive?: boolean;
  }>({ open: false, title: "", message: "", destructive: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [invoiceType, setInvoiceType] = useState("All Types");
  const [classGrade, setClassGrade] = useState("All Classes");
  const [status, setStatus] = useState("All Status");
  const [dateRange, setDateRange] = useState("This Month");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const showToast = (message: string) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: "" }), 3000);
  };

  useEffect(() => {
    const loadInvoices = async () => {
      const token = getToken();
      if (!token) {
        setLoadError("Please log in to view invoices.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        const rows = await listInvoices(token);
        const mapped = rows.map((item) => mapInvoice(item as Record<string, unknown>));
        setInvoices(mapped);
        setSelectedInvoice(mapped[0] ?? null);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load invoices.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (invoiceType !== "All Types") {
      result = result.filter((inv) => inv.invoiceType === invoiceType);
    }
    if (classGrade !== "All Classes") {
      result = result.filter((inv) => inv.classGrade === classGrade);
    }
    if (status !== "All Status") {
      result = result.filter((inv) => inv.status === status);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((inv) =>
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.studentName.toLowerCase().includes(q) ||
        inv.studentId.toLowerCase().includes(q) ||
        inv.invoiceType.toLowerCase().includes(q) ||
        inv.classGrade.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q) ||
        inv.dueDate.toLowerCase().includes(q)
      );
    }

    const totalPages = Math.max(1, Math.ceil(result.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    const paginated = result.slice(start, start + ITEMS_PER_PAGE);

    return { paginated, totalPages, total: result.length, originalTotal: result.length };
  }, [invoices, invoiceType, classGrade, status, search, currentPage]);

  const invoiceTotals = useMemo(() => {
    const amount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paid = invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
    const balance = invoices.reduce((sum, invoice) => sum + invoice.balance, 0);
    return { amount, paid, balance };
  }, [invoices]);

  const invoiceSummaryCards = useMemo(() => [
    {
      title: "Total Invoices",
      value: String(invoices.length),
      footer: "Loaded from finance API",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      sparkline: [],
      sparkColor: "#2563eb",
      icon: "invoice" as const,
    },
    {
      title: "Invoice Amount",
      value: formatCurrency(invoiceTotals.amount),
      footer: "Loaded from finance API",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      sparkline: [],
      sparkColor: "#7c3aed",
      icon: "amount" as const,
    },
    {
      title: "Paid",
      value: formatCurrency(invoiceTotals.paid),
      footer: "Loaded from finance API",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      sparkline: [],
      sparkColor: "#059669",
      icon: "paid" as const,
    },
    {
      title: "Outstanding",
      value: formatCurrency(invoiceTotals.balance),
      footer: "Loaded from finance API",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      sparkline: [],
      sparkColor: "#d97706",
      icon: "outstanding" as const,
    },
  ], [invoices.length, invoiceTotals]);

  const handleGenerateInvoice = () => setGenerateDialogOpen(true);
  const handleImportInvoices = () => setImportDialogOpen(true);
  const handleMoreOptions = () => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: "Export Current View, Print Invoice Register, and Invoice Settings will be available here.",
    });
  };

  const handleSaveInvoice = (newInvoice: InvoiceRow) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    setSelectedInvoice(newInvoice);
    showToast("Invoice created successfully");
    setCurrentPage(1);
  };

  const handleViewInvoice = (invoice: InvoiceRow) => {
    setSelectedInvoice(invoice);
  };

  const handleDownloadInvoice = (invoice: InvoiceRow) => {
    showToast(`Invoice ${invoice.invoiceNo} downloaded`);
  };

  const handleMoreActions = (invoice: InvoiceRow) => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: `Actions for ${invoice.invoiceNo}: Edit Invoice, Print Invoice, Record Payment, Duplicate Invoice, Cancel Invoice, or Delete Invoice.`,
      destructive: false,
    });
  };

  const handleDeleteInvoice = (invoice: InvoiceRow) => {
    setActionDialog({
      open: true,
      title: "Delete Invoice",
      message: `Are you sure you want to delete invoice ${invoice.invoiceNo}? This action cannot be undone.`,
      destructive: true,
    });
  };

  const handleActionConfirm = () => {
    showToast("Action completed successfully");
    setActionDialog({ open: false, title: "", message: "", destructive: false });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, filteredInvoices.totalPages)));
  };

  const handleFilter = () => {
    showToast("Filters applied");
  };

  const handleReset = () => {
    setAcademicYear("2024-25");
    setInvoiceType("All Types");
    setClassGrade("All Classes");
    setStatus("All Status");
    setDateRange("This Month");
    setSearch("");
    setCurrentPage(1);
  };

  const handleImport = (file: File) => {
    showToast(`${file.name} imported successfully`);
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <InvoicesPageHeader
            onGenerateInvoice={handleGenerateInvoice}
            onImportInvoices={handleImportInvoices}
            onMoreOptions={handleMoreOptions}
          />

          {loadError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Loading invoices...
            </div>
          )}

          <InvoiceSummaryCards cards={invoiceSummaryCards} />

          <InvoiceFilters
            academicYear={academicYear}
            onAcademicYearChange={setAcademicYear}
            invoiceType={invoiceType}
            onInvoiceTypeChange={setInvoiceType}
            classGrade={classGrade}
            onClassGradeChange={setClassGrade}
            status={status}
            onStatusChange={setStatus}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            search={search}
            onSearchChange={setSearch}
            onFilter={handleFilter}
            onReset={handleReset}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                {!isLoading && !loadError && filteredInvoices.total === 0 ? (
                  <div className="px-1 py-8 text-sm text-slate-600">
                    No invoices found.
                  </div>
                ) : (
                  <>
                    <InvoicesTable
                      rows={filteredInvoices.paginated}
                      onView={handleViewInvoice}
                      onDownload={handleDownloadInvoice}
                      onMore={handleMoreActions}
                    />
                    <InvoicePagination
                      currentPage={currentPage}
                      totalPages={filteredInvoices.totalPages}
                      onPageChange={handlePageChange}
                      totalItems={filteredInvoices.originalTotal}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <InvoiceDetailsCard invoice={selectedInvoice} />
              <EmptyPanel title="No balance fee breakdown available." />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <EmptyPanel title="No invoice trend data available." />
            </div>
            <div>
              <EmptyPanel title="No invoice status chart data available." />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-3">
              <EmptyPanel title="No invoice type data available." />
            </div>
          </div>

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2026 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>

      <GenerateInvoiceDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        onSave={handleSaveInvoice}
      />

      <ImportInvoicesDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />

      <InvoiceActionDialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, title: "", message: "", destructive: false })}
        title={actionDialog.title}
        message={actionDialog.message}
        onConfirm={handleActionConfirm}
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
