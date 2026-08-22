"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import { getToken } from "@/lib/auth";
import { getFinanceReport } from "@/lib/services/financeService";

type ReportDef = {
  id: string;
  label: string;
  params: Array<{
    key: string;
    label: string;
    type: "date" | "month" | "year" | "text";
  }>;
};

const REPORTS: ReportDef[] = [
  { id: "daily-collection", label: "Daily Collection", params: [{ key: "date", label: "Date", type: "date" }] },
  {
    id: "monthly-collection",
    label: "Monthly Collection",
    params: [
      { key: "year", label: "Year", type: "year" },
      { key: "month", label: "Month", type: "month" },
    ],
  },
  { id: "yearly-collection", label: "Yearly Collection", params: [{ key: "year", label: "Year", type: "year" }] },
  {
    id: "outstanding-fees",
    label: "Outstanding Fees",
    params: [
      { key: "class_id", label: "Class ID", type: "text" },
      { key: "section", label: "Section", type: "text" },
    ],
  },
  {
    id: "student-ledger",
    label: "Student Ledger",
    params: [
      { key: "student_id", label: "Student ID", type: "text" },
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "end_date", label: "End Date", type: "date" },
    ],
  },
  {
    id: "income-report",
    label: "Income Report",
    params: [
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "end_date", label: "End Date", type: "date" },
    ],
  },
  {
    id: "expense-report",
    label: "Expense Report",
    params: [
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "end_date", label: "End Date", type: "date" },
    ],
  },
  {
    id: "profit-loss",
    label: "Profit & Loss",
    params: [
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "end_date", label: "End Date", type: "date" },
    ],
  },
  {
    id: "payment-mode",
    label: "Payment Mode",
    params: [
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "end_date", label: "End Date", type: "date" },
    ],
  },
  {
    id: "class-wise-collection",
    label: "Class-wise Collection",
    params: [{ key: "academic_year", label: "Academic Year", type: "text" }],
  },
  {
    id: "section-wise-collection",
    label: "Section-wise Collection",
    params: [{ key: "academic_year", label: "Academic Year", type: "text" }],
  },
  {
    id: "transport-fee",
    label: "Transport Fee",
    params: [
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "end_date", label: "End Date", type: "date" },
    ],
  },
  {
    id: "hostel-fee",
    label: "Hostel Fee",
    params: [
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "end_date", label: "End Date", type: "date" },
    ],
  },
  {
    id: "library-fine",
    label: "Library Fine",
    params: [
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "end_date", label: "End Date", type: "date" },
    ],
  },
];

function buildQuery(values: Record<string, string>): string {
  const entries = Object.entries(values).filter(([, v]) => v && v.trim().length > 0);
  if (entries.length === 0) return "";
  const params = new URLSearchParams();
  entries.forEach(([k, v]) => params.set(k, v));
  return `?${params.toString()}`;
}

// Normalizes any report payload shape into rows for the generic table.
function toRows(data: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(data)) {
    return data as Array<Record<string, unknown>>;
  }
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const itemsKey = ["items", "results", "rows", "records"].find(
      (k) => Array.isArray(record[k]),
    );
    if (itemsKey) return record[itemsKey] as Array<Record<string, unknown>>;
    // Single object (e.g. profit-loss summary) -> render as one row.
    return [record];
  }
  return [];
}

function getColumns(rows: Array<Record<string, unknown>>): string[] {
  const cols = new Set<string>();
  rows.forEach((row) => Object.keys(row).forEach((k) => cols.add(k)));
  return Array.from(cols);
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const header = columns.join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const cell = formatCell(row[col]).replace(/"/g, '""');
          return `"${cell}"`;
        })
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>(REPORTS[0].id);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const activeReport = REPORTS.find((r) => r.id === selectedReport) ?? REPORTS[0];
  const columns = getColumns(rows);

  useEffect(() => {
    setParamValues({});
    setRows([]);
    setHasRun(false);
    setLoadError(null);
  }, [selectedReport]);

  const runReport = async () => {
    const token = getToken();
    if (!token) {
      setLoadError("Please log in to view reports.");
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const query = buildQuery(paramValues);
      const data = await getFinanceReport(token, activeReport.id, query);
      setRows(toRows(data));
      setHasRun(true);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load report.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (rows.length === 0) return;
    const csv = toCsv(rows, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeReport.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
              <p className="text-sm text-slate-500">Finance reports across fees, income, and expenses</p>
            </div>
          </div>

          {loadError ? (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Report</label>
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-w-[220px]"
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                >
                  {REPORTS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {activeReport.params.map((param) => (
                <div key={param.key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">{param.label}</label>
                  {param.type === "date" ? (
                    <input
                      type="date"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={paramValues[param.key] ?? ""}
                      onChange={(e) => setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))}
                    />
                  ) : param.type === "month" ? (
                    <input
                      type="number"
                      min={1}
                      max={12}
                      placeholder="MM"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-24"
                      value={paramValues[param.key] ?? ""}
                      onChange={(e) => setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))}
                    />
                  ) : param.type === "year" ? (
                    <input
                      type="number"
                      placeholder="YYYY"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-28"
                      value={paramValues[param.key] ?? ""}
                      onChange={(e) => setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      type="text"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={paramValues[param.key] ?? ""}
                      onChange={(e) => setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}

              <button
                onClick={runReport}
                disabled={isLoading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Run Report"}
              </button>

              <button
                onClick={handleExportCsv}
                disabled={rows.length === 0}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {isLoading ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">Loading report...</div>
            ) : !hasRun ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                Select filters and click &quot;Run Report&quot; to view data.
              </div>
            ) : rows.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">No data found for this report.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {columns.map((col) => (
                        <th key={col} className="px-4 py-3 text-left font-medium text-slate-600 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0">
                        {columns.map((col) => (
                          <td key={col} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                            {formatCell(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2025 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>
    </MainLayout>
  );
}