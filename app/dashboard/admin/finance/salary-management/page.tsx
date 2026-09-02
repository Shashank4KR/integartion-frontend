"use client";

import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import SalaryManagementPageHeader from "@/components/dashboard/finance/salary-management/SalaryManagementPageHeader";
import SalarySummaryCards from "@/components/dashboard/finance/salary-management/SalarySummaryCards";
import SalaryFilters from "@/components/dashboard/finance/salary-management/SalaryFilters";
import EmployeeSalaryOverview from "@/components/dashboard/finance/salary-management/EmployeeSalaryOverview";
import SalaryQuickActions from "@/components/dashboard/finance/salary-management/SalaryQuickActions";
import RecentSalaryActivities from "@/components/dashboard/finance/salary-management/RecentSalaryActivities";
import AddSalaryDialog from "@/components/dashboard/finance/salary-management/AddSalaryDialog";
import ImportSalariesDialog from "@/components/dashboard/finance/salary-management/ImportSalariesDialog";
import SalaryDetailsDialog from "@/components/dashboard/finance/salary-management/SalaryDetailsDialog";
import SalaryActionDialog from "@/components/dashboard/finance/salary-management/SalaryActionDialog";
import PayrollSummaryChart from "@/components/dashboard/finance/salary-management/PayrollSummaryChart";
import SalaryComponentsCard from "@/components/dashboard/finance/salary-management/SalaryComponentsCard";
import PayrollTrendChart from "@/components/dashboard/finance/salary-management/PayrollTrendChart";
import TopDepartmentsByPayroll from "@/components/dashboard/finance/salary-management/TopDepartmentsByPayroll";
import MonthlySalarySummaryCards from "@/components/dashboard/finance/salary-management/MonthlySalarySummaryCards";
import { getToken } from "@/lib/auth";
import { listSalaryRecords } from "@/lib/services/financeService";

interface SalaryRow {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  basicSalary: number;
  netSalary: number;
  status: "Paid" | "Partial" | "Pending";
  employeeType: "Teaching Staff" | "Non-Teaching Staff";
}

const formatCurrency = (value: number) =>
  `INR ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function mapSalary(item: Record<string, unknown>): SalaryRow {
  const rawStatus = String(item.status ?? item.payment_status ?? "").toUpperCase();
  return {
    id: String(item.id ?? crypto.randomUUID()),
    employeeId: String(item.employee_id ?? item.staff_id ?? item.id ?? "-"),
    employeeName: String(item.employee_name ?? item.staff_name ?? item.name ?? "-"),
    department: String(item.department ?? item.department_name ?? "-"),
    designation: String(item.designation ?? item.role ?? "-"),
    basicSalary: Number(item.basic_salary ?? item.gross_salary ?? item.amount ?? 0),
    netSalary: Number(item.net_salary ?? item.amount_paid ?? item.amount ?? 0),
    status: rawStatus === "PAID" ? "Paid" : rawStatus === "PARTIAL" ? "Partial" : "Pending",
    employeeType: String(item.employee_type ?? item.staff_type ?? "").toLowerCase().includes("non")
      ? "Non-Teaching Staff"
      : "Teaching Staff",
  };
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600">
      {title}
    </div>
  );
}

export default function SalaryManagementPage() {
  const [salaries, setSalaries] = useState<SalaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [viewSalary, setViewSalary] = useState<SalaryRow | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  });
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const [month, setMonth] = useState("May 2025");
  const [department, setDepartment] = useState("All Departments");
  const [employeeType, setEmployeeType] = useState("All Types");
  const [designation, setDesignation] = useState("All Designations");
  const [paymentStatus, setPaymentStatus] = useState("All Status");
  const [search, setSearch] = useState("");

  const showToast = (message: string) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: "" }), 3000);
  };

  useEffect(() => {
    const loadSalaries = async () => {
      const token = getToken();
      if (!token) {
        setLoadError("Please log in to view salaries.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        const rows = await listSalaryRecords(token);
        setSalaries(rows.map((item) => mapSalary(item as Record<string, unknown>)));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load salaries.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadSalaries();
  }, []);

  const handleAddSalary = (newSalary: SalaryRow) => {
    setSalaries((prev) => [newSalary, ...prev]);
    showToast("Salary added successfully");
  };

  const handleViewSalary = (salary: SalaryRow) => {
    setViewSalary(salary);
  };

  const handleDownload = (salary: SalaryRow) => {
    showToast(`Payslip for ${salary.employeeId} downloaded`);
  };

  const handleMoreOptions = (salary: SalaryRow) => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: `Actions for ${salary.employeeId}: Edit Salary, Generate Payslip, Record Payment, Add Allowance, Add Deduction, View Salary History.`,
    });
  };

  const handlePageAction = (action: string) => {
    setActionDialog({
      open: true,
      title: action,
      message: `The "${action}" workflow will be connected to the backend in the integration phase.`,
    });
  };

  const handleQuickAction = (action: string) => {
    setActionDialog({
      open: true,
      title: action,
      message: `The "${action}" workflow will be connected to the backend in the integration phase.`,
    });
  };

  const handleThreeDotMenu = () => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: "Export Payroll View, Print Salary Register, and Payroll Settings will be available here.",
    });
  };

  const handleImport = (file: File) => {
    showToast(`${file.name} imported successfully`);
  };

  const handleFilter = () => {
    showToast("Filters applied");
  };

  const handleReset = () => {
    setMonth("May 2025");
    setDepartment("All Departments");
    setEmployeeType("All Types");
    setDesignation("All Designations");
    setPaymentStatus("All Status");
    setSearch("");
  };

  const filteredSalaries = useMemo(() => {
    let result = [...salaries];

    if (department !== "All Departments") {
      result = result.filter((s) => s.department === department);
    }
    if (employeeType !== "All Types") {
      result = result.filter((s) => s.employeeType === employeeType);
    }
    if (designation !== "All Designations") {
      result = result.filter((s) => s.designation === designation);
    }
    if (paymentStatus !== "All Status") {
      result = result.filter((s) => s.status === paymentStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.employeeName.toLowerCase().includes(q) ||
        s.employeeId.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
      );
    }

    return result;
  }, [salaries, department, employeeType, designation, paymentStatus, search]);

  const salarySummaryCards = useMemo(() => {
    const totalPayroll = salaries.reduce((sum, salary) => sum + salary.netSalary, 0);
    const paidCount = salaries.filter((salary) => salary.status === "Paid").length;
    const pendingCount = salaries.filter((salary) => salary.status === "Pending").length;
    const partialCount = salaries.filter((salary) => salary.status === "Partial").length;

    return [
      {
        title: "Total Payroll",
        value: formatCurrency(totalPayroll),
        footer: `${salaries.length} records from finance API`,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        sparkline: [],
        sparkColor: "#7c3aed",
        icon: "wallet" as const,
      },
      {
        title: "Paid",
        value: String(paidCount),
        footer: "Loaded from finance API",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        sparkline: [],
        sparkColor: "#059669",
        icon: "card" as const,
      },
      {
        title: "Pending",
        value: String(pendingCount),
        footer: "Loaded from finance API",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        sparkline: [],
        sparkColor: "#d97706",
        icon: "clock" as const,
      },
      {
        title: "Partial",
        value: String(partialCount),
        footer: "Loaded from finance API",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        sparkline: [],
        sparkColor: "#2563eb",
        icon: "chart" as const,
      },
    ];
  }, [salaries]);

  const recentSalaryActivities = useMemo(() =>
    salaries.slice(0, 5).map((salary) => ({
      icon: salary.status === "Paid" ? "check" as const : "document" as const,
      text: `${salary.status} salary: ${salary.employeeName}`,
      secondary: `${salary.department} - ${formatCurrency(salary.netSalary)}`,
      date: month,
      iconBg: salary.status === "Paid" ? "bg-emerald-50" : "bg-amber-50",
      iconColor: salary.status === "Paid" ? "text-emerald-600" : "text-amber-600",
    })),
  [salaries, month]);

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <SalaryManagementPageHeader
            onAddSalary={() => setAddDialogOpen(true)}
            onImportSalaries={() => setImportDialogOpen(true)}
            onMoreOptions={handleThreeDotMenu}
          />

          {loadError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Loading salaries...
            </div>
          )}

          <SalarySummaryCards cards={salarySummaryCards} />

          <SalaryFilters
            month={month}
            onMonthChange={setMonth}
            department={department}
            onDepartmentChange={setDepartment}
            employeeType={employeeType}
            onEmployeeTypeChange={setEmployeeType}
            designation={designation}
            onDesignationChange={setDesignation}
            paymentStatus={paymentStatus}
            onPaymentStatusChange={setPaymentStatus}
            search={search}
            onSearchChange={setSearch}
            onFilter={handleFilter}
            onReset={handleReset}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2">
              {!isLoading && !loadError && filteredSalaries.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600">
                  No salary records found.
                </div>
              ) : (
                <EmployeeSalaryOverview
                  rows={filteredSalaries}
                  onView={handleViewSalary}
                  onDownload={handleDownload}
                  onMore={handleMoreOptions}
                  originalTotal={filteredSalaries.length}
                />
              )}
            </div>
            <div className="space-y-6">
              <PayrollSummaryChart salaries={salaries} />
              <SalaryComponentsCard salaries={salaries} />
              <SalaryQuickActions onAction={handleQuickAction} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PayrollTrendChart salaries={salaries} />
            <TopDepartmentsByPayroll salaries={salaries} />
          </div>

          <div className="space-y-6 mb-6">
            <RecentSalaryActivities items={recentSalaryActivities} />
            <MonthlySalarySummaryCards salaries={salaries} />
          </div>

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2026 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>

      <AddSalaryDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddSalary}
      />

      <ImportSalariesDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />

      <SalaryDetailsDialog
        open={!!viewSalary}
        onClose={() => setViewSalary(null)}
        salary={viewSalary}
      />

      <SalaryActionDialog
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
