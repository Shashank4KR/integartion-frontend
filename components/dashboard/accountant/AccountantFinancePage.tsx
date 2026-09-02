"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, FileText, RefreshCcw, Search, Wallet } from "lucide-react";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import DashboardCard from "@/components/dashboard/role-dashboards/DashboardCard";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import {
  getFinanceOverview,
  getFinanceReport,
  listInvoices,
  listPayments,
  listTransactions,
  listSalaryRecords,
  listExpenses,
} from "@/lib/services/financeService";
import GenerateInvoiceDialog from "@/components/dashboard/accountant/GenerateInvoiceDialog";
import { generateInvoicePdf } from "@/lib/utils/generateInvoicePdf";
import { Download } from "lucide-react";
type PageKind = "invoices" | "payments" | "dues" | "defaulters" | "reports";

type FinanceRow = {
  id: string;
  primary: string;
  secondary: string;
  student: string;
  className: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
  date: string;
  dueDate: string;
  method: string;
};

type SummaryCard = {
  label: string;
  value: string;
  hint: string;
};

const PAGE_COPY: Record<PageKind, { title: string; subtitle: string; empty: string }> = {
  invoices: {
    title: "Invoices",
    subtitle: "Fee invoices loaded from the finance database.",
    empty: "No invoices found.",
  },
  payments: {
    title: "Payments",
    subtitle: "Payment transactions recorded in the finance database.",
    empty: "No payment transactions found.",
  },
  dues: {
    title: "Dues",
    subtitle: "Outstanding student fee balances.",
    empty: "No outstanding dues found.",
  },
  defaulters: {
    title: "Defaulters",
    subtitle: "Students with overdue or unpaid fee balances.",
    empty: "No defaulters found.",
  },
  reports: {
    title: "Reports",
    subtitle: "Finance reports generated from live backend data.",
    empty: "No report data found.",
  },
};

const money = (value: number) =>
  `INR ${Number.isFinite(value) ? value.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0"}`;

const text = (value: unknown, fallback = "-") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const num = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const displayDate = (value: string) => {
  if (!value || value === "-") return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

const normalizeStatus = (value: unknown) =>
  text(value, "Pending")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function isOverdue(row: FinanceRow) {
  const status = row.status.toUpperCase();
  const due = row.dueDate && row.dueDate !== "-" ? new Date(row.dueDate) : null;
  return row.balance > 0 && (status.includes("OVERDUE") || status.includes("UNPAID") || (!!due && due < new Date()));
}

function mapInvoice(item: Record<string, unknown>, paymentTotals: Record<string, number>): FinanceRow {
  const amount = num(item.amount ?? item.net_amount ?? item.total_amount);
  const paid = num(item.paid ?? item.paid_amount ?? item.amount_paid ?? paymentTotals[text(item.id, "")]);
  const balance = num(item.balance ?? item.balance_due ?? item.balance_amount ?? Math.max(amount - paid, 0));
  return {
    id: text(item.id, crypto.randomUUID()),
    primary: text(item.invoice_number ?? item.invoice_no ?? item.id),
    secondary: text(item.fee_type ?? item.fee_type_id, "Fee Invoice"),
    student: (() => {
      if (item.student_name) return String(item.student_name);
      const s = item.student as Record<string, unknown> | undefined;
      if (s && typeof s === "object") {
        const name = [s.first_name, s.last_name].filter(Boolean).join(" ").trim();
        if (name) return name;
      }
      return text(item.student_name ?? item.student_id, "Student");
    })(),
    className: (() => {
      if (item.class_grade && item.class_grade !== "None" && item.class_grade !== "null") return String(item.class_grade);
      const s = item.student as Record<string, unknown> | undefined;
      const cls = s?.class_ as Record<string, unknown> | undefined;
      if (cls?.class_name) return text(cls.class_name);
      return text(item.class_name ?? item.class_grade ?? item.class, "General");
    })(),
    amount,
    paid,
    balance,
    status: normalizeStatus(item.status),
    date: text(item.invoice_date ?? item.created_at),
    dueDate: text(item.due_date),
    method: "-",
  };
}

function mapSalaryToFinanceRow(item: Record<string, unknown>): FinanceRow {
  const amount = num(item.amount ?? item.net_salary);
  const isPaid = String(item.status ?? "").toUpperCase() === "PAID";
  const paid = isPaid ? amount : 0;
  const balance = Math.max(0, amount - paid);
  const id = text(item.id, crypto.randomUUID());
  return {
    id,
    primary: text(item.voucher_no, `SAL-${id.slice(0, 8).toUpperCase()}`),
    secondary: "Salary Invoice",
    student: text(item.employee_name ?? item.name, "Staff Member"),
    className: text(item.department, "Staff / Payroll"),
    amount,
    paid,
    balance,
    status: isPaid ? "Paid" : "Pending",
    date: text(item.payment_date ?? item.created_at),
    dueDate: text(item.payment_date ?? item.created_at),
    method: text(item.payment_method, "Bank Transfer"),
  };
}

function mapExpenseToFinanceRow(item: Record<string, unknown>): FinanceRow {
  const amount = num(item.amount);
  const isPaid = ["PAID", "APPROVED"].includes(String(item.status ?? item.approval_status ?? "").toUpperCase());
  const paid = isPaid ? amount : 0;
  const balance = Math.max(0, amount - paid);
  const id = text(item.id, crypto.randomUUID());
  return {
    id,
    primary: text(item.reference_no ?? item.voucher_number, `EXP-${id.slice(0, 8).toUpperCase()}`),
    secondary: text(item.category, "Expense Invoice"),
    student: text(item.vendor ?? item.title ?? item.description, "Vendor"),
    className: text(item.department ?? item.category, "Operational"),
    amount,
    paid,
    balance,
    status: isPaid ? "Paid" : "Pending",
    date: text(item.expense_date ?? item.created_at),
    dueDate: text(item.expense_date ?? item.created_at),
    method: text(item.payment_method, "Cash"),
  };
}

function mapPayment(item: Record<string, unknown>, invoice?: Record<string, unknown>): FinanceRow {
  const paymentAmount = num(item.amount ?? item.amount_paid);
  const totalAmount = invoice ? num(invoice.amount ?? invoice.net_amount ?? paymentAmount) : paymentAmount;
  const totalPaid = invoice ? num(invoice.paid ?? paymentAmount) : paymentAmount;
  const balance = invoice ? num(invoice.balance ?? Math.max(0, totalAmount - totalPaid)) : 0;

  const studentName = (() => {
    if (item.student_name) return String(item.student_name);
    if (invoice?.student_name) return String(invoice.student_name);
    const s = (item.student ?? invoice?.student) as Record<string, unknown> | undefined;
    if (s && typeof s === "object") {
      const name = [s.first_name, s.last_name].filter(Boolean).join(" ").trim();
      if (name) return name;
    }
    return text(item.student ?? invoice?.student_id ?? item.invoice_id, "Student");
  })();

  const className = (() => {
    if (item.class_grade && item.class_grade !== "None" && item.class_grade !== "null") return String(item.class_grade);
    if (invoice?.class_grade && invoice.class_grade !== "None" && invoice.class_grade !== "null") return String(invoice.class_grade);
    const s = (item.student ?? invoice?.student) as Record<string, unknown> | undefined;
    const cls = s?.class_ as Record<string, unknown> | undefined;
    if (cls?.class_name) return text(cls.class_name);
    if (invoice?.class_name) return String(invoice.class_name);
    return text(item.class_name ?? item.class, "-");
  })();

  const receiptRef = text(
    item.receipt_number ?? item.receipt_no ?? item.receipt_ref_no ?? item.transaction_no,
    item.id ? `REC-${String(item.id).slice(0, 8).toUpperCase()}` : "-"
  );

  const feeCategory = text(
    item.fee_type ?? item.category ?? invoice?.fee_type,
    "Fee Payment"
  );

  return {
    id: text(item.id, crypto.randomUUID()),
    primary: receiptRef,
    secondary: feeCategory,
    student: studentName,
    className,
    amount: totalAmount,
    paid: totalPaid,
    balance,
    status: normalizeStatus(balance === 0 ? (item.status ?? "Paid") : "Partial"),
    date: text(item.date ?? item.payment_date ?? item.created_at),
    dueDate: text(invoice?.due_date ?? item.due_date),
    method: text(item.payment_mode ?? item.payment_method, "Online"),
  };
}

function mapOutstandingStudent(item: Record<string, unknown>): FinanceRow {
  const invoices = Array.isArray(item.invoices) ? item.invoices : [];
  const firstInvoice = invoices[0] as Record<string, unknown> | undefined;
  const balance = num(item.total_outstanding ?? item.outstanding ?? item.balance);
  const amount = invoices.reduce((sum, invoice) => sum + num((invoice as Record<string, unknown>).amount), 0);
  const paid = invoices.reduce((sum, invoice) => sum + num((invoice as Record<string, unknown>).paid), 0);
  return {
    id: text(item.student_id ?? item.id, crypto.randomUUID()),
    primary: text(item.name ?? item.student_name ?? item.student_id),
    secondary: `${invoices.length} open invoice${invoices.length === 1 ? "" : "s"}`,
    student: text(item.name ?? item.student_name),
    className: text(item.class ?? item.class_name),
    amount: amount || balance + paid,
    paid,
    balance,
    status: normalizeStatus(firstInvoice?.status ?? "Outstanding"),
    date: "-",
    dueDate: text(firstInvoice?.due_date),
    method: "-",
  };
}

function StatePanel({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "error" }) {
  const classes =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes}`}>{children}</div>;
}

function SummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}

function DataTable({ rows, kind, onSelect }: { rows: FinanceRow[]; kind: PageKind; onSelect: (row: FinanceRow) => void }) {

  return (

    <div className="overflow-x-auto">

      <table className="w-full min-w-[920px] text-left">

        <thead>

          <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">

            <th className="pb-3 pr-4">{kind === "payments" ? "Receipt" : kind === "dues" || kind === "defaulters" ? "Student" : "Invoice"}</th>

            <th className="pb-3 pr-4">Student</th>

            <th className="pb-3 pr-4">Class</th>

            <th className="pb-3 pr-4">Date</th>

            <th className="pb-3 pr-4">Due Date</th>

            <th className="pb-3 pr-4 text-right">Amount</th>

            <th className="pb-3 pr-4 text-right">Paid</th>

            <th className="pb-3 pr-4 text-right">Balance</th>

            <th className="pb-3 pr-4">Status</th>

            {kind === "invoices" && <th className="pb-3"></th>}

          </tr>

        </thead>

        <tbody>

          {rows.map((row) => (

            <tr key={row.id} className="border-b border-slate-100 text-sm hover:bg-slate-50">

              <td className="py-3 pr-4">

                <button className="text-left font-semibold text-slate-900 hover:text-[#6d28d9]" onClick={() => onSelect(row)}>

                  {row.primary}

                </button>

                <p className="text-xs text-slate-500">{row.secondary}</p>

              </td>

              <td className="py-3 pr-4 text-slate-700">{row.student}</td>

              <td className="py-3 pr-4 text-slate-700">{row.className}</td>

              <td className="py-3 pr-4 text-slate-700">{displayDate(row.date)}</td>

              <td className="py-3 pr-4 text-slate-700">{displayDate(row.dueDate)}</td>

              <td className="py-3 pr-4 text-right font-medium text-slate-900">{money(row.amount)}</td>

              <td className="py-3 pr-4 text-right text-slate-700">{money(row.paid)}</td>

              <td className="py-3 pr-4 text-right font-medium text-slate-900">{money(row.balance)}</td>

              <td className="py-3 pr-4">

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">

                  {row.status}

                </span>

              </td>

              {kind === "invoices" && (

                <td className="py-3 pl-2">

                  <button

                    onClick={() =>

                      generateInvoicePdf({

                        invoiceNumber: row.primary,

                        studentName: row.student,

                        className: row.className,

                        admissionNo: "-",

                        feeType: row.secondary,

                        amount: row.amount,

                        paid: row.paid,

                        balance: row.balance,

                        status: row.status,

                        invoiceDate: row.date,

                        dueDate: row.dueDate,

                      })

                    }

                    className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50"

                    title="Download PDF"

                  >

                    <Download className="h-4 w-4" />

                  </button>

                </td>

              )}

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

function DetailsPanel({ row }: { row: FinanceRow | null }) {
  if (!row) {
    return <StatePanel>Select a row to view details.</StatePanel>;
  }

  return (
    <DashboardCard title="Details">
      <div className="space-y-4 text-sm">
        {[
          ["Reference", row.primary],
          ["Student", row.student],
          ["Class", row.className],
          ["Amount", money(row.amount)],
          ["Paid", money(row.paid)],
          ["Balance", money(row.balance)],
          ["Status", row.status],
          ["Date", displayDate(row.date)],
          ["Due Date", displayDate(row.dueDate)],
          ["Method", row.method],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
            <span className="text-slate-500">{label}</span>
            <span className="text-right font-medium text-slate-900">{value}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function ReportGrid({ reports }: { reports: Record<string, unknown> }) {
  const rows = [
    ["Daily Collection", money(num((reports["daily-collection"] as Record<string, unknown>)?.total_collection ?? (reports["daily-collection"] as Record<string, unknown>)?.total_collected))],
    ["Monthly Collection", money(num((reports["monthly-collection"] as Record<string, unknown>)?.total_collection ?? (reports["monthly-collection"] as Record<string, unknown>)?.total_collected))],
    ["Yearly Collection", money(num((reports["yearly-collection"] as Record<string, unknown>)?.total_collection ?? (reports["yearly-collection"] as Record<string, unknown>)?.total_collected))],
    ["Outstanding Fees", money(num((reports["outstanding-fees"] as Record<string, unknown>)?.total_outstanding))],
    ["Profit / Loss", money(num((reports["profit-loss"] as Record<string, unknown>)?.net_profit))],
  ];
  const paymentModes = ((reports["payment-mode"] as Record<string, unknown>)?.payment_modes ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <DashboardCard title="Report Summary" className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </DashboardCard>
      <DashboardCard title="Payment Modes">
        <div className="space-y-3">
          {paymentModes.length === 0 ? (
            <p className="text-sm text-slate-600">No payment mode data found.</p>
          ) : (
            paymentModes.map((mode) => (
              <div key={text(mode.method)} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm">
                <span className="text-slate-600">{text(mode.method)}</span>
                <span className="font-semibold text-slate-900">{money(num(mode.total))}</span>
              </div>
            ))
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

export default function AccountantFinancePage({ kind }: { kind: PageKind }) {
  const copy = PAGE_COPY[kind];
  const [rows, setRows] = useState<FinanceRow[]>([]);
  const [reports, setReports] = useState<Record<string, unknown>>({});
  const [selectedRow, setSelectedRow] = useState<FinanceRow | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);

  const loadData = async () => {
    const token = getToken();
    if (!token) {
      setError("Please log in to view finance data.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (kind === "reports") {
        const [overview, daily, monthly, yearly, outstanding, profitLoss, paymentMode] = await Promise.all([
          getFinanceOverview(token),
          getFinanceReport(token, "daily-collection"),
          getFinanceReport(token, "monthly-collection"),
          getFinanceReport(token, "yearly-collection"),
          getFinanceReport(token, "outstanding-fees"),
          getFinanceReport(token, "profit-loss"),
          getFinanceReport(token, "payment-mode"),
        ]);
        setReports({
          overview,
          "daily-collection": daily,
          "monthly-collection": monthly,
          "yearly-collection": yearly,
          "outstanding-fees": outstanding,
          "profit-loss": profitLoss,
          "payment-mode": paymentMode,
        });
        setRows([]);
        setSelectedRow(null);
        return;
      }

      if (kind === "payments") {
        const [payments, transactions, invoices] = await Promise.all([
          listPayments(token),
          listTransactions(token),
          listInvoices(token).catch(() => []),
        ]);
        const transactionById = new Map(transactions.map((item) => [text((item as Record<string, unknown>).id), item as Record<string, unknown>]));
        const invoiceById = new Map(invoices.map((item) => [text((item as Record<string, unknown>).id), item as Record<string, unknown>]));
        const mapped = payments.map((item) => {
          const payment = item as Record<string, unknown>;
          const invoiceId = text(payment.invoice_id, "");
          const linkedInvoice = invoiceId ? invoiceById.get(invoiceId) : undefined;
          return mapPayment(
            { ...payment, ...(transactionById.get(text(payment.id)) ?? {}) },
            linkedInvoice
          );
        });
        setRows(mapped);
        setSelectedRow(mapped[0] ?? null);
        return;
      }

      if (kind === "dues" || kind === "defaulters") {
        const outstanding = await getFinanceReport(token, "outstanding-fees");
        const students: unknown[] = Array.isArray(outstanding.students) ? outstanding.students : [];
        const mapped = students.map((item) => mapOutstandingStudent(item as Record<string, unknown>));
        const visibleRows = kind === "defaulters" ? mapped.filter(isOverdue) : mapped;
        setRows(visibleRows);
        setSelectedRow(visibleRows[0] ?? null);
        return;
      }

      const [invoices, payments, salaries, expenses] = await Promise.all([
        listInvoices(token).catch(() => []),
        listPayments(token).catch(() => []),
        listSalaryRecords(token).catch(() => []),
        listExpenses(token).catch(() => []),
      ]);
      const paymentTotals = payments.reduce<Record<string, number>>((acc, item) => {
        const payment = item as Record<string, unknown>;
        const invoiceId = text(payment.invoice_id, "");
        acc[invoiceId] = (acc[invoiceId] ?? 0) + num(payment.amount_paid);
        return acc;
      }, {});
      const feeInvoices = invoices.map((item) => mapInvoice(item as Record<string, unknown>, paymentTotals));
      const salaryInvoices = salaries.map((item) => mapSalaryToFinanceRow(item as Record<string, unknown>));
      const expenseInvoices = expenses.map((item) => mapExpenseToFinanceRow(item as Record<string, unknown>));
      const mapped = [...feeInvoices, ...salaryInvoices, ...expenseInvoices];
      setRows(mapped);
      setSelectedRow(mapped[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load finance data.");
      setRows([]);
      setSelectedRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [kind]);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.primary, row.secondary, row.student, row.className, row.status, row.method]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, rows]);

  const summaryCards = useMemo<SummaryCard[]>(() => {
    if (kind === "reports") {
      const overview = reports.overview as Record<string, unknown> | undefined;
      const summary = overview?.summary as Record<string, unknown> | undefined;
      const balance = overview?.balance as Record<string, unknown> | undefined;
      return [
        { label: "Fee Collected", value: money(num(summary?.fee_collected)), hint: "From finance overview" },
        { label: "Outstanding", value: money(num(summary?.outstanding)), hint: "From finance overview" },
        { label: "Expenses", value: money(num(summary?.total_expenses)), hint: "From finance overview" },
        { label: "Net Balance", value: money(num(balance?.net_balance)), hint: "From finance overview" },
      ];
    }

    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
    const totalPaid = rows.reduce((sum, row) => sum + row.paid, 0);
    const totalBalance = rows.reduce((sum, row) => sum + row.balance, 0);
    return [
      { label: "Records", value: String(rows.length), hint: "Loaded from backend" },
      { label: "Amount", value: money(totalAmount), hint: "Total listed amount" },
      { label: "Paid", value: money(totalPaid), hint: "Received amount" },
      { label: "Balance", value: money(totalBalance), hint: "Outstanding amount" },
    ];
  }, [kind, reports, rows]);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.accountant}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{copy.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {kind === "invoices" && (
            <button
              type="button"
              onClick={() => setShowGenerateInvoice(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <FileText className="h-4 w-4" />
              Generate Invoice
            </button>
          )}
          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6">
        <SummaryCards cards={summaryCards} />
      </div>

      {error && (
        <div className="mb-6">
          <StatePanel tone="error">{error}</StatePanel>
        </div>
      )}

      {loading && (
        <div className="mb-6">
          <StatePanel>{`Loading ${copy.title.toLowerCase()}...`}</StatePanel>
        </div>
      )}

      {kind === "reports" ? (
        <ReportGrid reports={reports} />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <DashboardCard
              title={copy.title}
              action={
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search records"
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#6d28d9]"
                  />
                </div>
              }
            >
              {!loading && !error && filteredRows.length === 0 ? (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  <AlertCircle className="h-5 w-5 text-slate-400" />
                  {copy.empty}
                </div>
              ) : (
                <DataTable rows={filteredRows} kind={kind} onSelect={setSelectedRow} />
              )}
            </DashboardCard>
          </div>

          <div className="space-y-6">
            <DetailsPanel row={selectedRow} />
            <DashboardCard title={kind === "payments" ? "Payment Snapshot" : "Finance Snapshot"}>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <FileText className="h-4 w-4" /> Records
                  </span>
                  <span className="font-semibold text-slate-900">{filteredRows.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Wallet className="h-4 w-4" /> Outstanding
                  </span>
                  <span className="font-semibold text-slate-900">
                    {money(filteredRows.reduce((sum, row) => sum + row.balance, 0))}
                  </span>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      )}

      <footer className="mt-8 flex items-center justify-between border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
        <span>© 2026 EdTech Smart Campus ERP. All rights reserved.</span>
        <span>Version 1.0.0</span>
      </footer>

      <GenerateInvoiceDialog
        open={showGenerateInvoice}
        onClose={() => setShowGenerateInvoice(false)}
        onGenerated={() => void loadData()}
      />
    </RoleDashboardLayout>
  );
}