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
import EditInvoiceDialog from "@/components/dashboard/finance/invoices/EditInvoiceDialog";
import RecordInvoicePaymentDialog from "@/components/dashboard/finance/invoices/RecordInvoicePaymentDialog";
import BalanceFeesOverview from "@/components/dashboard/finance/invoices/BalanceFeesOverview";
import InvoiceTrendChart from "@/components/dashboard/finance/invoices/InvoiceTrendChart";
import InvoicesByStatusChart from "@/components/dashboard/finance/invoices/InvoicesByStatusChart";
import TopInvoiceTypes from "@/components/dashboard/finance/invoices/TopInvoiceTypes";
import { getToken } from "@/lib/auth";
import { listInvoices, updateInvoice, deleteInvoice, createFeePayment, listSalaryRecords, listExpenses } from "@/lib/services/financeService";
import { listStudents } from "@/lib/services/studentService";
import { listClasses } from "@/lib/services/classService";
import { generateInvoicePdf } from "@/lib/utils/generateInvoicePdf";

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

  const rawClass = String(item.class_grade ?? item.className ?? item.class_name ?? "-");

  return {
    id: String(item.id ?? crypto.randomUUID()),
    invoiceNo: String(item.invoice_number ?? item.invoice_no ?? item.id ?? "-"),
    invoiceDate: String(item.invoice_date ?? item.created_at ?? "-"),
    studentName,
    studentId: String(item.student_id ?? item.admission_no ?? "-"),
    classGrade: rawClass !== "None" && rawClass !== "null" ? rawClass : "General",
    invoiceType: "Fee Invoice",
    dueDate: String(item.due_date ?? "-"),
    amount,
    paid,
    balance: Number(item.balance ?? item.balance_amount ?? Math.max(0, amount - paid)),
    status,
  };
}

function mapSalaryToInvoice(item: Record<string, unknown>): InvoiceRow {
  const amount = Number(item.amount ?? item.net_salary ?? 0);
  const rawStatus = String(item.status ?? "Pending").toUpperCase();
  const isPaid = rawStatus === "PAID";
  const paid = isPaid ? amount : 0;
  const balance = Math.max(0, amount - paid);
  const id = String(item.id ?? crypto.randomUUID());

  return {
    id,
    invoiceNo: String(item.voucher_no ?? (id ? `SAL-${id.slice(0, 8).toUpperCase()}` : `SAL-${Date.now().toString().slice(-6)}`)),
    invoiceDate: String(item.payment_date ?? item.created_at ?? "-"),
    studentName: String(item.employee_name ?? item.name ?? "Staff Member"),
    studentId: String(item.employee_id ?? "STAFF"),
    classGrade: String(item.department ?? "Payroll / Staff"),
    invoiceType: "Salary Invoice",
    dueDate: String(item.payment_date ?? item.created_at ?? "-"),
    amount,
    paid,
    balance,
    status: isPaid ? "Paid" : "Pending",
  };
}

function mapExpenseToInvoice(item: Record<string, unknown>): InvoiceRow {
  const amount = Number(item.amount ?? 0);
  const rawStatus = String(item.status ?? item.approval_status ?? "Pending").toUpperCase();
  const isPaid = rawStatus === "PAID" || rawStatus === "APPROVED";
  const paid = isPaid ? amount : 0;
  const balance = Math.max(0, amount - paid);
  const id = String(item.id ?? crypto.randomUUID());

  return {
    id,
    invoiceNo: String(item.reference_no ?? item.voucher_number ?? (id ? `EXP-${id.slice(0, 8).toUpperCase()}` : "-")),
    invoiceDate: String(item.expense_date ?? item.created_at ?? "-"),
    studentName: String(item.vendor ?? item.title ?? item.description ?? "Vendor"),
    studentId: String(item.category ?? "EXPENSE"),
    classGrade: String(item.department ?? item.category ?? "Operational"),
    invoiceType: "Expense Invoice",
    dueDate: String(item.expense_date ?? item.created_at ?? "-"),
    amount,
    paid,
    balance,
    status: isPaid ? "Paid" : "Pending",
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
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRow | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<InvoiceRow | null>(null);
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
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
        const [rows, salaryRows, expenseRows, studentsRes, classesRes] = await Promise.all([
          listInvoices(token).catch(() => []),
          listSalaryRecords(token).catch(() => []),
          listExpenses(token).catch(() => []),
          listStudents(token).catch(() => []),
          listClasses(token).catch(() => []),
        ]);

        const classMap = new Map<string, string>();
        const classesList: string[] = ["All Classes"];
        (Array.isArray(classesRes) ? classesRes : []).forEach((c: any) => {
          const lbl = `${c.class_name || "Class"} ${c.section ? `- ${c.section}` : ""}`.trim();
          classMap.set(String(c.id), lbl);
          if (!classesList.includes(lbl)) classesList.push(lbl);
        });
        setAvailableClasses(classesList);

        const studentMap = new Map<string, { name: string; admissionNo: string; classGrade: string }>();
        (Array.isArray(studentsRes) ? studentsRes : []).forEach((s: any) => {
          const cLabel = s.class_id ? classMap.get(String(s.class_id)) : null;
          const sName = [s.first_name, s.last_name].filter(Boolean).join(" ") || s.admission_no || "Student";
          const sAdm = s.admission_no || String(s.id).slice(0, 8);
          const sClass = cLabel || s.class_name || s.grade || "General";
          studentMap.set(String(s.id), { name: sName, admissionNo: sAdm, classGrade: sClass });
          if (s.admission_no) {
            studentMap.set(String(s.admission_no), { name: sName, admissionNo: sAdm, classGrade: sClass });
          }
        });

        const mappedFees = (Array.isArray(rows) ? rows : []).map((item: any) => {
          const base = mapInvoice(item as Record<string, unknown>);
          const matchStudent = (item.student_id ? studentMap.get(String(item.student_id)) : null) ||
                               (base.studentId ? studentMap.get(String(base.studentId)) : null);
          if (matchStudent) {
            if (!base.studentName || base.studentName === "-" || base.studentName === "Student") {
              base.studentName = matchStudent.name;
            }
            if (!base.studentId || base.studentId === "-") {
              base.studentId = matchStudent.admissionNo;
            }
            if (!base.classGrade || base.classGrade === "-" || base.classGrade === "General") {
              base.classGrade = matchStudent.classGrade;
            }
          }
          return base;
        });

        const mappedSalaries = (Array.isArray(salaryRows) ? salaryRows : []).map((item: any) =>
          mapSalaryToInvoice(item as Record<string, unknown>)
        );

        const mappedExpenses = (Array.isArray(expenseRows) ? expenseRows : []).map((item: any) =>
          mapExpenseToInvoice(item as Record<string, unknown>)
        );

        const combinedInvoices = [...mappedFees, ...mappedSalaries, ...mappedExpenses];

        setInvoices(combinedInvoices);
        setSelectedInvoice(combinedInvoices[0] ?? null);
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
    try {
      generateInvoicePdf({
        invoiceNumber: invoice.invoiceNo,
        studentName: invoice.studentName,
        className: invoice.classGrade,
        admissionNo: invoice.studentId,
        feeType: invoice.invoiceType,
        amount: invoice.amount,
        paid: invoice.paid,
        balance: invoice.balance,
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
      });
      showToast(`Invoice ${invoice.invoiceNo} PDF downloaded successfully`);
    } catch (err: any) {
      showToast(`Failed to generate PDF: ${err?.message || "Unknown error"}`);
    }
  };

  const handleEditInvoice = (invoice: InvoiceRow) => {
    setEditingInvoice(invoice);
    setEditDialogOpen(true);
  };

  const handleRecordPayment = (invoice: InvoiceRow) => {
    setPayingInvoice(invoice);
    setRecordPaymentDialogOpen(true);
  };

  const handleSaveEditedInvoice = async (updated: InvoiceRow) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
    if (selectedInvoice?.id === updated.id) {
      setSelectedInvoice(updated);
    }
    showToast(`Invoice ${updated.invoiceNo} updated successfully! Later payment deadline set to ${updated.dueDate}.`);

    const token = getToken();
    if (token && updated.id) {
      try {
        await updateInvoice(token, updated.id, {
          due_date: updated.dueDate,
          amount: updated.amount,
          status: updated.status.toUpperCase(),
        });
      } catch {
        // Optimistic update retained
      }
    }
  };

  const handlePaymentRecorded = async (
    updated: InvoiceRow,
    paymentData?: {
      amountPaid: number;
      paymentType: string;
      paymentDetails: string;
      paymentDate: string;
    }
  ) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
    if (selectedInvoice?.id === updated.id) {
      setSelectedInvoice(updated);
    }
    showToast(`Payment recorded for ${updated.invoiceNo}. Remaining balance: ₹${updated.balance.toLocaleString("en-IN")}`);

    const token = getToken();
    if (token && updated.id) {
      try {
        await createFeePayment(token, {
          invoice_id: updated.id,
          amount_paid: paymentData?.amountPaid ?? (updated.paid || 0),
          payment_method: paymentData?.paymentType ?? "ONLINE",
          payment_date: paymentData?.paymentDate ?? new Date().toISOString().split("T")[0],
          remarks: paymentData?.paymentDetails || "Fee Payment",
        });
      } catch (err) {
        console.error("Failed to record fee payment on backend:", err);
      }
    }
  };

  const handleMoreActions = (invoice: InvoiceRow) => {
    handleEditInvoice(invoice);
  };

  const handleDeleteInvoice = async (invoice: InvoiceRow) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoice.id));
    if (selectedInvoice?.id === invoice.id) {
      setSelectedInvoice(null);
    }
    showToast(`Invoice ${invoice.invoiceNo} has been deleted`);

    const token = getToken();
    if (token && invoice.id) {
      try {
        await deleteInvoice(token, invoice.id);
      } catch {
        // Optimistic delete retained
      }
    }
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
            classOptions={availableClasses}
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
                      onEdit={handleEditInvoice}
                      onRecordPayment={handleRecordPayment}
                      onDelete={handleDeleteInvoice}
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
              <InvoiceDetailsCard
                invoice={selectedInvoice}
                onEdit={handleEditInvoice}
                onRecordPayment={handleRecordPayment}
              />
              <BalanceFeesOverview invoices={invoices} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <InvoiceTrendChart invoices={invoices} />
            </div>
            <div>
              <InvoicesByStatusChart invoices={invoices} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-3">
              <TopInvoiceTypes invoices={invoices} />
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

      <EditInvoiceDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingInvoice(null);
        }}
        invoice={editingInvoice}
        onSave={handleSaveEditedInvoice}
      />

      <RecordInvoicePaymentDialog
        open={recordPaymentDialogOpen}
        onClose={() => {
          setRecordPaymentDialogOpen(false);
          setPayingInvoice(null);
        }}
        invoice={payingInvoice}
        onPaymentRecorded={handlePaymentRecorded}
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
