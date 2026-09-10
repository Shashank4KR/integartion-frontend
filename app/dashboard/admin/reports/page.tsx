"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import { getToken } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import {
  fetchOverviewReport,
  fetchCategoryReportData,
  type OverviewReportData,
} from "@/lib/services/reportService";
import {
  FileText,
  Download,
  RefreshCw,
  Users,
  CheckCircle2,
  DollarSign,
  BookOpen,
  Building2,
  Truck,
  Search,
  Filter,
  BarChart3,
} from "lucide-react";

type ReportCategory =
  | "overview"
  | "students"
  | "attendance"
  | "exams"
  | "finance"
  | "library"
  | "hostel"
  | "transport";

const CATEGORY_TABS: { id: ReportCategory; label: string; icon: any }[] = [
  { id: "overview", label: "Executive Summary", icon: BarChart3 },
  { id: "students", label: "Students", icon: Users },
  { id: "attendance", label: "Attendance", icon: CheckCircle2 },
  { id: "exams", label: "Exams & Results", icon: FileText },
  { id: "finance", label: "Fees & Finance", icon: DollarSign },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "hostel", label: "Hostel", icon: Building2 },
  { id: "transport", label: "Transport", icon: Truck },
];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportCategory>("overview");
  const [overview, setOverview] = useState<OverviewReportData | null>(null);
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const loadReportData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoadError("Please log in to access system reports.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const [overviewData, rows] = await Promise.all([
        fetchOverviewReport(token),
        fetchCategoryReportData(token, activeTab),
      ]);
      setOverview(overviewData);
      setReportRows(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load report data.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void loadReportData();
  }, [loadReportData]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return reportRows;
    const q = searchTerm.toLowerCase();
    return reportRows.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(q)
      )
    );
  }, [reportRows, searchTerm]);

  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      showToast("No data to export.");
      return;
    }

    const sample = filteredRows[0];
    const keys = Object.keys(sample);
    const headers = keys.join(",") + "\n";
    const body = filteredRows
      .map((row) => keys.map((k) => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([headers + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Report_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast(`Exported ${activeTab} report to CSV successfully.`);
  };

  const cards = useMemo(() => {
    if (!overview) return [];
    return [
      { title: "Total Students", value: String(overview.totalStudents), footer: "Loaded from database", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
      { title: "Attendance Rate", value: `${overview.attendanceRate}%`, footer: "Calculated from attendance records", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
      { title: "Total Collection", value: `₹${overview.totalCollection.toLocaleString("en-IN")}`, footer: "From finance module", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Books Circulated", value: String(overview.booksIssued), footer: "From library module", icon: BookOpen, color: "text-orange-600", bg: "bg-orange-50" },
      { title: "Hostel Occupants", value: String(overview.hostelOccupancy), footer: "From hostel module", icon: Building2, color: "text-pink-600", bg: "bg-pink-50" },
      { title: "Active Transport", value: String(overview.activeVehicles), footer: "From transport fleet", icon: Truck, color: "text-teal-600", bg: "bg-teal-50" },
    ];
  }, [overview]);

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">System Reports & Analytics</h1>
              <p className="text-xs text-slate-500 mt-1">Real-time data reporting across academic & administrative modules</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void loadReportData()}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7c3aed] hover:bg-purple-700 rounded-lg shadow-sm transition"
              >
                <Download className="w-4 h-4" /> Export CSV Report
              </button>
            </div>
          </div>

          {loadError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              {loadError}
            </div>
          )}

          {/* KPI Cards */}
          {overview && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              {cards.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">{c.title}</span>
                      <div className={`p-2 rounded-lg ${c.bg}`}>
                        <Icon className={`w-4 h-4 ${c.color}`} />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{c.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{c.footer}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6 border-b border-slate-200">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    active
                      ? "bg-[#7c3aed] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={`Search ${activeTab} records...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Showing {filteredRows.length} records</span>
            </div>
          </div>

          {/* Report Data Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading {activeTab} report data...</div>
            ) : filteredRows.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No {activeTab} report records found.</div>
            ) : (
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      {Object.keys(filteredRows[0]).slice(0, 7).map((header) => (
                        <th key={header} className="p-3 uppercase tracking-wide">
                          {header.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        {Object.keys(filteredRows[0]).slice(0, 7).map((key) => (
                          <td key={key} className="p-3 font-medium text-slate-900 truncate max-w-[200px]">
                            {typeof row[key] === "object" && row[key] !== null
                              ? JSON.stringify(row[key])
                              : String(row[key] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>{COMPANY_INFO.copyright}</span>
            <span>Version {COMPANY_INFO.version}</span>
          </footer>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-2xl">
          {toastMessage}
        </div>
      )}
    </MainLayout>
  );
}