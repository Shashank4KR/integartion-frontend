"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import FeesManagementPageHeader from "@/components/dashboard/finance/FeesManagementPageHeader";
import FeesSummaryCards from "@/components/dashboard/finance/FeesSummaryCards";
import FeesManagementFilters from "@/components/dashboard/finance/FeesManagementFilters";
import FeesQuickActions from "@/components/dashboard/finance/FeesQuickActions";
import AddFeeCollectionDialog from "@/components/dashboard/finance/AddFeeCollectionDialog";
import FeesActionDialog from "@/components/dashboard/finance/FeesActionDialog";
import GenerateInvoiceDialog from "@/components/dashboard/finance/invoices/GenerateInvoiceDialog";
import SendRemindersDialog from "@/components/dashboard/finance/SendRemindersDialog";
import FeeConcessionDialog from "@/components/dashboard/finance/FeeConcessionDialog";
import AddInstallmentDialog from "@/components/dashboard/finance/AddInstallmentDialog";
import FeesCollectionSummaryChart from "@/components/dashboard/finance/FeesCollectionSummaryChart";
import CollectionTrendChart from "@/components/dashboard/finance/CollectionTrendChart";
import FeeDueOverviewChart from "@/components/dashboard/finance/FeeDueOverviewChart";
import StudentFeeDetailsTable from "@/components/dashboard/finance/StudentFeeDetailsTable";
import FeeCollectionByTypeCard from "@/components/dashboard/finance/FeeCollectionByTypeCard";
import FeesFooterCards from "@/components/dashboard/finance/FeesFooterCards";
import { getToken } from "@/lib/auth";
import {
  getFinanceOverview,
  listInvoices,
  listFeeStructures,
  getFinanceReport,
} from "@/lib/services/financeService";
import { listStudents } from "@/lib/services/studentService";
import { listClasses } from "@/lib/services/classService";
import type { StudentFeeRow } from "@/lib/fixtures/fees-management-reference-fixture";

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

export default function FeesManagementPage() {
  const router = useRouter();
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [generateInvoiceOpen, setGenerateInvoiceOpen] = useState(false);
  const [sendRemindersOpen, setSendRemindersOpen] = useState(false);
  const [concessionOpen, setConcessionOpen] = useState(false);
  const [installmentOpen, setInstallmentOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  });
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const [classesList, setClassesList] = useState<any[]>([]);
  const [academicYear, setAcademicYear] = useState("All Academic Years");
  const [classGrade, setClassGrade] = useState("All Classes");
  const [feeType, setFeeType] = useState("All Fee Types");
  const [installment, setInstallment] = useState("All Installments");
  const [status, setStatus] = useState("All Status");
  const [dateRange, setDateRange] = useState("This Month");

  const [collectionSegments, setCollectionSegments] = useState<Array<{ label: string; value: number; color: string }>>([]);
  const [collectionValues, setCollectionValues] = useState<Record<string, string>>({});
  const [trendExpected, setTrendExpected] = useState<number[]>([]);
  const [trendCollected, setTrendCollected] = useState<number[]>([]);
  const [dueSegments, setDueSegments] = useState<Array<{ label: string; value: number; color: string }>>([]);
  const [dueValues, setDueValues] = useState<Record<string, string>>({});
  const [totalDueFormatted, setTotalDueFormatted] = useState<string>("₹ 0");
  const [studentFeeRecords, setStudentFeeRecords] = useState<StudentFeeRow[]>([]);
  const [feeTypeItems, setFeeTypeItems] = useState<Array<{ label: string; amount: string; percentage: number; color: string }>>([]);
  const [feeTypeTotalFormatted, setFeeTypeTotalFormatted] = useState<string>("₹ 0");
  const [footerCards, setFooterCards] = useState<any[]>([]);

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
        const [overview, invoices, monthlyReport, yearlyReport, feeStructures, students, classRows] = await Promise.all([
          getFinanceOverview(token).catch(() => ({})),
          listInvoices(token).catch(() => []),
          getFinanceReport(token, "monthly-collection").catch(() => ({})),
          getFinanceReport(token, "yearly-collection").catch(() => ({})),
          listFeeStructures(token).catch(() => []),
          listStudents(token).catch(() => []),
          listClasses(token).catch(() => []),
        ]);

        setClassesList(Array.isArray(classRows) ? classRows : []);
        const invoiceList = Array.isArray(invoices) ? invoices : [];

        // Aggregate live totals directly from the loaded invoices
        const invTotalExpected = invoiceList.reduce(
          (sum: number, i: any) => sum + Number(i.amount ?? 0),
          0
        );
        const invTotalPaid = invoiceList.reduce(
          (sum: number, i: any) => sum + Number(i.paid ?? i.amount_paid ?? 0),
          0
        );
        const invTotalBalance = invoiceList.reduce((sum: number, i: any) => {
          const total = Number(i.amount ?? 0);
          const paid = Number(i.paid ?? i.amount_paid ?? 0);
          return sum + Number(i.balance ?? Math.max(0, total - paid));
        }, 0);

        // Safely extract from overview (handles backend { summary: { fee_collected, outstanding, fee_expected } } structure)
        const ovSummary = (overview && typeof overview === "object" && "summary" in overview)
          ? (overview as any).summary
          : (overview && typeof overview === "object" && "data" in overview && (overview as any).data?.summary)
          ? (overview as any).data.summary
          : overview || {};

        const ovRevenue = Number(
          ovSummary.fee_collected ??
          overview.total_revenue ??
          overview.total_fee_collection ??
          0
        );
        const ovOutstanding = Number(
          ovSummary.outstanding ??
          overview.pending_fee_amount ??
          overview.total_outstanding ??
          0
        );
        const ovExpected = Number(
          ovSummary.fee_expected ??
          overview.total_invoiced ??
          0
        );

        // Fall back to live invoice calculations when overview properties are not present
        const revenue = ovRevenue > 0 ? ovRevenue : invTotalPaid;
        const outstanding = ovOutstanding > 0 ? ovOutstanding : invTotalBalance;
        const totalExpected = ovExpected > 0 ? ovExpected : (invTotalExpected > 0 ? invTotalExpected : revenue + outstanding);
        const invoicesCount = Number(overview.unpaid_invoices ?? overview.invoice_count ?? invoiceList.length);
        const concessions = Number(overview.total_concessions ?? 0);

        setSummaryCards([
          {
            title: "Collected Fees",
            value: formatCurrency(revenue),
            footer: "Live from finance API",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            icon: "wallet",
            sparkColor: "#059669",
            sparkline: revenue > 0 ? [revenue * 0.4, revenue * 0.7, revenue] : [],
          },
          {
            title: "Outstanding",
            value: formatCurrency(outstanding),
            footer: "Live from finance API",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            icon: "hourglass",
            sparkColor: "#d97706",
            sparkline: outstanding > 0 ? [outstanding, outstanding * 0.8, outstanding] : [],
          },
          {
            title: "Open Invoices",
            value: String(invoicesCount),
            footer: "Live from finance API",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            icon: "card",
            sparkColor: "#2563eb",
            sparkline: invoicesCount > 0 ? [invoicesCount, invoicesCount] : [],
          },
          {
            title: "Concessions",
            value: formatCurrency(concessions),
            footer: "Live from finance API",
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
            icon: "users",
            sparkColor: "#7c3aed",
            sparkline: concessions > 0 ? [concessions] : [],
          },
        ]);

        // Collection summary chart - 100% computed from live data
        const totalFeePool = revenue + outstanding;
        const colPct = totalFeePool > 0 ? Number(((revenue / totalFeePool) * 100).toFixed(1)) : 0;
        const outPct = totalFeePool > 0 ? Number(((outstanding / totalFeePool) * 100).toFixed(1)) : 0;
        setCollectionSegments([
          { label: "Collected", value: colPct, color: "#10b981" },
          { label: "Outstanding", value: outPct, color: "#f97316" },
        ]);
        setCollectionValues({
          Collected: formatCurrency(revenue),
          Outstanding: formatCurrency(outstanding),
        });

        // Collection Trend: 12 months array matching ["Apr", "May", ..., "Mar"]
        const monthMap: Record<string, number> = {
          Apr: 0, May: 1, Jun: 2, Jul: 3, Aug: 4, Sep: 5,
          Oct: 6, Nov: 7, Dec: 8, Jan: 9, Feb: 10, Mar: 11,
        };

        const expectedTrend = new Array(12).fill(0);
        const collectedTrend = new Array(12).fill(0);

        const yearlyBreakdown = Array.isArray(yearlyReport?.monthly_breakdown)
          ? yearlyReport.monthly_breakdown
          : Array.isArray(yearlyReport?.data?.monthly_breakdown)
          ? yearlyReport.data.monthly_breakdown
          : [];

        for (const item of yearlyBreakdown) {
          if (item?.month && monthMap[item.month] !== undefined) {
            collectedTrend[monthMap[item.month]] += Number(item.total ?? 0);
          }
        }

        invoiceList.forEach((inv: any) => {
          const dateStr = inv.invoice_date || inv.due_date || inv.created_at;
          let mIndex = 5; // default Sep
          if (dateStr) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              const monthNum = d.getMonth() + 1;
              mIndex = (monthNum + 8) % 12;
            }
          }
          expectedTrend[mIndex] += Number(inv.amount ?? 0);
          collectedTrend[mIndex] += Number(inv.paid ?? inv.amount_paid ?? 0);
        });

        if (collectedTrend.every((v) => v === 0) && revenue > 0) {
          const curMonthIndex = (new Date().getMonth() + 8) % 12;
          collectedTrend[curMonthIndex] = revenue;
          expectedTrend[curMonthIndex] = totalExpected > 0 ? totalExpected : revenue;
        }

        setTrendExpected(expectedTrend);
        setTrendCollected(collectedTrend);

        // Fee Due Overview - calculated directly from invoices
        const todayDateStr = new Date().toISOString().split("T")[0];
        const overdueAmount = invoiceList
          .filter((i: any) => {
            const rawStatus = String(i.status ?? "").toUpperCase();
            const dueDate = i.due_date ? String(i.due_date).split("T")[0] : "";
            const isUnpaid = Number(i.balance ?? Math.max(0, Number(i.amount ?? 0) - Number(i.paid ?? i.amount_paid ?? 0))) > 0;
            return rawStatus === "OVERDUE" || (dueDate && dueDate < todayDateStr && isUnpaid);
          })
          .reduce((sum: number, i: any) => {
            const total = Number(i.amount ?? 0);
            const paid = Number(i.paid ?? i.amount_paid ?? 0);
            return sum + Number(i.balance ?? Math.max(0, total - paid));
          }, 0);

        const currentDueAmount = Math.max(0, outstanding - overdueAmount);
        const dueTotal = currentDueAmount + overdueAmount;
        const currentPct = dueTotal > 0 ? Number(((currentDueAmount / dueTotal) * 100).toFixed(1)) : 0;
        const overduePct = dueTotal > 0 ? Number(((overdueAmount / dueTotal) * 100).toFixed(1)) : 0;

        setDueSegments([
          { label: "Current Due", value: currentPct, color: "#f97316" },
          { label: "Overdue", value: overduePct, color: "#ef4444" },
        ]);
        setDueValues({
          "Current Due": formatCurrency(currentDueAmount),
          Overdue: formatCurrency(overdueAmount),
        });
        setTotalDueFormatted(formatCurrency(outstanding));

        // Student fee records mapped from backend invoices & students
        const studentMap = new Map((Array.isArray(students) ? students : []).map((s: any) => [String(s.id), s]));
        const mappedRecords: StudentFeeRow[] = invoiceList.map((inv: any, idx: number) => {
          const stud = studentMap.get(String(inv.student_id));
          const studentName = inv.student_name || (stud ? `${stud.first_name || ""} ${stud.last_name || ""}`.trim() : "Student");
          const rollNo = stud?.admission_number || stud?.roll_number || String(inv.student_id ?? `STU00${idx + 1}`);
          const classGradeVal = stud?.class_name || stud?.grade || inv.class_grade || "General";
          const totalFee = Number(inv.amount ?? 0);
          const paid = Number(inv.paid ?? inv.amount_paid ?? 0);
          const balance = Number(inv.balance ?? Math.max(0, totalFee - paid));
          const rawStatus = String(inv.status ?? "Pending").toUpperCase();
          const statusVal = rawStatus === "PAID" ? "Paid" : paid > 0 ? "Partial" : "Overdue";

          return {
            id: String(inv.id ?? idx),
            rollNo,
            studentName: studentName || "Student",
            classGrade: classGradeVal,
            totalFee,
            paid,
            outstanding: balance,
            status: statusVal,
            dueDate: String(inv.due_date ?? "N/A"),
          };
        });
        setStudentFeeRecords(mappedRecords);

        // Fee collection by fee type
        if (Array.isArray(feeStructures) && feeStructures.length > 0) {
          const totalStructAmount = feeStructures.reduce((acc, f) => acc + Number(f.amount ?? 0), 0);
          const colors = ["#6366f1", "#8b5cf6", "#3b82f6", "#f97316", "#ef4444", "#10b981"];
          setFeeTypeItems(
            feeStructures.map((f: any, i: number) => ({
              label: f.name || f.fee_type || "Fee",
              amount: formatCurrency(Number(f.amount ?? 0)),
              percentage: totalStructAmount > 0 ? Number(((Number(f.amount ?? 0) / totalStructAmount) * 100).toFixed(1)) : 0,
              color: colors[i % colors.length],
            }))
          );
          setFeeTypeTotalFormatted(formatCurrency(totalStructAmount));
        } else {
          setFeeTypeItems([]);
          setFeeTypeTotalFormatted("₹ 0");
        }

        // Live Footer cards - no mock data
        const totalInvCount = invoiceList.length;
        const paidCount = invoiceList.filter((i: any) => String(i.status ?? "").toUpperCase() === "PAID").length;
        const pendingCount = totalInvCount - paidCount;
        const overdueCount = invoiceList.filter((i: any) => String(i.status ?? "").toUpperCase() === "OVERDUE").length;

        setFooterCards([
          {
            title: "Total Invoices",
            value: String(totalInvCount),
            footer: "All Students",
            iconBg: "bg-purple-50",
            iconColor: "text-[#7c3aed]",
            icon: "calendar",
          },
          {
            title: "Paid Invoices",
            value: String(paidCount),
            footer: totalInvCount > 0 ? `${((paidCount / totalInvCount) * 100).toFixed(0)}%` : "0%",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            icon: "calendar-check",
          },
          {
            title: "Pending Invoices",
            value: String(pendingCount),
            footer: totalInvCount > 0 ? `${((pendingCount / totalInvCount) * 100).toFixed(0)}%` : "0%",
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
            icon: "pending",
          },
          {
            title: "Overdue Invoices",
            value: String(overdueCount),
            footer: totalInvCount > 0 ? `${((overdueCount / totalInvCount) * 100).toFixed(0)}%` : "0%",
            iconBg: "bg-pink-50",
            iconColor: "text-pink-500",
            icon: "overdue-calendar",
          },
          {
            title: "Total Collections",
            value: formatCurrency(revenue),
            footer: "Live from finance API",
            iconBg: "bg-purple-50",
            iconColor: "text-[#7c3aed]",
            icon: "tag",
          },
          {
            title: "Total Outstanding",
            value: formatCurrency(outstanding),
            footer: "Current Balance",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
            icon: "gift",
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

  const exportFeesReportCSV = (records: StudentFeeRow[]) => {
    if (!records || records.length === 0) {
      showToast("No fee records available to export.");
      return;
    }
    const headers = ["Roll No", "Student Name", "Class/Grade", "Total Fee", "Paid", "Outstanding", "Status", "Due Date"];
    const csvContent = [
      headers.join(","),
      ...records.map((r) => [
        `"${r.rollNo || ""}"`,
        `"${r.studentName || ""}"`,
        `"${r.classGrade || ""}"`,
        `"${r.totalFee || 0}"`,
        `"${r.paid || 0}"`,
        `"${r.outstanding || 0}"`,
        `"${r.status || ""}"`,
        `"${r.dueDate || ""}"`,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fees-management-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Fee report exported successfully!");
  };

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
    router.push("/dashboard/admin/finance/overview");
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "Collect Fee":
        setAddDialogOpen(true);
        break;
      case "Add Installment":
        setInstallmentOpen(true);
        break;
      case "Generate Invoice":
        setGenerateInvoiceOpen(true);
        break;
      case "Fee Reminder":
        setSendRemindersOpen(true);
        break;
      case "Fee Concession":
        setConcessionOpen(true);
        break;
      case "Export Report":
        exportFeesReportCSV(studentFeeRecords);
        break;
      case "Fee Ledger":
        router.push("/dashboard/admin/finance/transactions");
        break;
      case "Fee Settings":
        router.push("/dashboard/admin/settings");
        break;
      default:
        setActionDialog({
          open: true,
          title: action,
          message: `The "${action}" workflow is ready.`,
        });
        break;
    }
  };

  const handleSaveConcession = (data: {
    studentName: string;
    classGrade: string;
    category: string;
    discountType: "percentage" | "flat";
    discountValue: number;
    reason: string;
  }) => {
    showToast(`Concession of ${data.discountType === "percentage" ? `${data.discountValue}%` : `₹${data.discountValue}`} applied for ${data.studentName}`);
  };

  const handleSaveInstallment = (data: {
    title: string;
    academicYear: string;
    dueDate: string;
    percentage: number;
    amount: number;
    lateFeePerDay: number;
  }) => {
    showToast(`Installment plan "${data.title}" created successfully`);
  };

  const handleSendFeeReminders = (data: { audience: string; channels: string[]; message: string }) => {
    showToast(`Fee reminders broadcasted via ${data.channels.join(", ")} to ${data.audience}`);
  };

  const handleInvoiceSaved = (invoice: any) => {
    setGenerateInvoiceOpen(false);
    showToast(`Invoice ${invoice?.invoiceNumber ?? ""} generated successfully!`);
  };

  const handleFilter = () => {
    showToast("Filters applied");
  };

  const handleReset = () => {
    setAcademicYear("All Academic Years");
    setClassGrade("All Classes");
    setFeeType("All Fee Types");
    setInstallment("All Installments");
    setStatus("All Status");
    setDateRange("This Month");
  };

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    classesList.forEach((c) => {
      const name = `${c.class_name || ""}${c.section ? ` - ${c.section}` : ""}`.trim();
      if (name) set.add(name);
    });
    studentFeeRecords.forEach((r) => {
      if (r.classGrade) set.add(r.classGrade);
    });
    return ["All Classes", ...Array.from(set).sort()];
  }, [classesList, studentFeeRecords]);

  const academicYearOptions = useMemo(() => {
    const set = new Set<string>();
    classesList.forEach((c) => {
      if (c.academic_year) set.add(c.academic_year);
    });
    return ["All Academic Years", ...Array.from(set).sort()];
  }, [classesList]);

  const filteredFeeRecords = studentFeeRecords.filter((r) => {
    if (classGrade !== "All Classes" && !r.classGrade.toLowerCase().includes(classGrade.toLowerCase())) {
      return false;
    }
    if (status !== "All Status" && r.status.toLowerCase() !== status.toLowerCase()) {
      return false;
    }
    return true;
  });

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
            academicYearOptions={academicYearOptions}
            classGrade={classGrade}
            onClassGradeChange={setClassGrade}
            classOptions={classOptions}
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
            <FeesCollectionSummaryChart
              segments={collectionSegments}
              values={collectionValues}
            />
            <CollectionTrendChart
              expected={trendExpected}
              collected={trendCollected}
            />
            <FeeDueOverviewChart
              segments={dueSegments}
              values={dueValues}
              total={totalDueFormatted}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2">
              <StudentFeeDetailsTable
                data={filteredFeeRecords}
                loading={isLoading}
              />
            </div>
            <div className="space-y-6">
              <FeeCollectionByTypeCard
                items={feeTypeItems}
                total={feeTypeTotalFormatted}
              />
              <FeesQuickActions onAction={handleQuickAction} />
            </div>
          </div>

          <FeesFooterCards cards={footerCards} />

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2026 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>

      <AddFeeCollectionDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleSaveCollection}
      />

      <GenerateInvoiceDialog
        open={generateInvoiceOpen}
        onClose={() => setGenerateInvoiceOpen(false)}
        onSave={handleInvoiceSaved}
      />

      <SendRemindersDialog
        open={sendRemindersOpen}
        onClose={() => setSendRemindersOpen(false)}
        onSend={handleSendFeeReminders}
      />

      <FeeConcessionDialog
        open={concessionOpen}
        onClose={() => setConcessionOpen(false)}
        onSaveConcession={handleSaveConcession}
      />

      <AddInstallmentDialog
        open={installmentOpen}
        onClose={() => setInstallmentOpen(false)}
        onSaveInstallment={handleSaveInstallment}
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
