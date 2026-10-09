"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import { clearAuth, getToken, getStoredUser } from "@/lib/auth";
import { COMPANY_INFO } from "@/lib/constants";
import {
  listVisitors,
  checkInVisitor,
  checkOutVisitor,
  deleteVisitor,
} from "@/lib/services/visitorService";
import { listStudents } from "@/lib/services/studentService";
import {
  Plus,
  Search,
  LogOut,
  Trash2,
  UserCheck,
  Clock,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";

interface VisitorRecord {
  id: string;
  student_id: string;
  visitor_name: string;
  relation?: string | null;
  phone: string;
  check_in_time: string;
  check_out_time?: string | null;
  approved_by: string;
  created_at?: string;
}

export default function HostelVisitorsPage() {
  const router = useRouter();
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "CHECKED_OUT">("ALL");

  // Dialog state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    student_id: "",
    visitor_name: "",
    relation: "Parent",
    phone: "",
  });

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      clearAuth();
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const [visitorData, studentData] = await Promise.all([
        listVisitors(token),
        listStudents(token).catch(() => []),
      ]);
      setVisitors(Array.isArray(visitorData) ? visitorData : []);
      setStudents(Array.isArray(studentData) ? studentData : []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load hostel visitors.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const studentMap = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => {
      const name = `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.name || "Student";
      map.set(String(s.id), name);
    });
    return map;
  }, [students]);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    const currentUser = getStoredUser();
    if (!token || !currentUser) return;

    if (!formData.student_id) {
      setFormError("Please select a student being visited.");
      return;
    }
    if (!formData.visitor_name.trim()) {
      setFormError("Visitor name is required.");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Contact phone number is required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await checkInVisitor(token, {
        student_id: formData.student_id,
        visitor_name: formData.visitor_name.trim(),
        relation: formData.relation.trim() || "Visitor",
        phone: formData.phone.trim(),
        check_in_time: new Date().toISOString(),
        approved_by: currentUser.id,
      });
      setIsCheckInOpen(false);
      setFormData({ student_id: "", visitor_name: "", relation: "Parent", phone: "" });
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to record check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await checkOutVisitor(token, id);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to check out visitor.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visitor record?")) return;
    const token = getToken();
    if (!token) return;
    try {
      await deleteVisitor(token, id);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete visitor record.");
    }
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const studentName = studentMap.get(String(v.student_id)) || "";
      const matchesSearch =
        !searchQuery ||
        v.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.phone.includes(searchQuery) ||
        studentName.toLowerCase().includes(searchQuery.toLowerCase());

      const isCheckedOut = Boolean(v.check_out_time);
      if (statusFilter === "ACTIVE" && isCheckedOut) return false;
      if (statusFilter === "CHECKED_OUT" && !isCheckedOut) return false;

      return matchesSearch;
    });
  }, [visitors, searchQuery, statusFilter, studentMap]);

  const activeCount = useMemo(() => visitors.filter((v) => !v.check_out_time).length, [visitors]);
  const checkedOutCount = useMemo(() => visitors.filter((v) => Boolean(v.check_out_time)).length, [visitors]);

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hostel Visitors Log</h1>
              <nav className="flex items-center gap-1.5 mt-1 text-sm" aria-label="Breadcrumb">
                <span className="text-[#7c3aed] font-medium">Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#7c3aed] font-medium">Hostel</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Visitors</span>
              </nav>
            </div>

            <button
              onClick={() => setIsCheckInOpen(true)}
              className="inline-flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg h-9 px-4 text-sm font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Check In Visitor
            </button>
          </div>

          {/* Error Banner */}
          {loadError && (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Visits</p>
                  <p className="text-xl font-bold text-slate-900">{visitors.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Currently Inside</p>
                  <p className="text-xl font-bold text-emerald-700">{activeCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-50 text-[#7c3aed]">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Checked Out</p>
                  <p className="text-xl font-bold text-slate-700">{checkedOutCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter / Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search visitor, student, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === "ALL"
                    ? "bg-[#7c3aed] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === "ACTIVE"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Inside Hostel ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter("CHECKED_OUT")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === "CHECKED_OUT"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Checked Out
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Visitor Entries</h2>
              <span className="text-xs text-slate-500">{filteredVisitors.length} record(s)</span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#7c3aed]" />
                Loading visitors log...
              </div>
            ) : filteredVisitors.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                No visitor records match the current criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Visitor</th>
                      <th className="px-5 py-3">Relation</th>
                      <th className="px-5 py-3">Student Visited</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Check-In Time</th>
                      <th className="px-5 py-3">Check-Out Time</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVisitors.map((v) => {
                      const isInside = !v.check_out_time;
                      return (
                        <tr key={v.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3 font-medium text-slate-900">{v.visitor_name}</td>
                          <td className="px-5 py-3 text-slate-600">{v.relation || "Visitor"}</td>
                          <td className="px-5 py-3 text-slate-700">
                            {studentMap.get(String(v.student_id)) || "Student"}
                          </td>
                          <td className="px-5 py-3 text-slate-600 font-mono text-xs">{v.phone}</td>
                          <td className="px-5 py-3 text-slate-600 text-xs">
                            {v.check_in_time ? new Date(v.check_in_time).toLocaleString() : "-"}
                          </td>
                          <td className="px-5 py-3 text-slate-600 text-xs">
                            {v.check_out_time ? new Date(v.check_out_time).toLocaleString() : "—"}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isInside
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {isInside ? "Inside Hostel" : "Checked Out"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isInside && (
                                <button
                                  onClick={() => handleCheckOut(v.id)}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200"
                                  title="Check out visitor"
                                >
                                  <LogOut className="w-3.5 h-3.5" />
                                  Check Out
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(v.id)}
                                className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Delete record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Check In Dialog */}
          {isCheckInOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-base font-bold text-slate-900">Check In Visitor</h3>
                  <button
                    onClick={() => setIsCheckInOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleCheckInSubmit} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Student Being Visited *
                    </label>
                    <select
                      value={formData.student_id}
                      onChange={(e) => setFormData((p) => ({ ...p, student_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                      required
                    >
                      <option value="">Select a student...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} ({s.admission_no || s.admission_number || "Student"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Visitor Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Robert Smith"
                      value={formData.visitor_name}
                      onChange={(e) => setFormData((p) => ({ ...p, visitor_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Relation to Student
                    </label>
                    <select
                      value={formData.relation}
                      onChange={(e) => setFormData((p) => ({ ...p, relation: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Relative">Relative</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsCheckInOpen(false)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold transition text-sm disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Check In
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>{COMPANY_INFO.copyright}</span>
            <span>Version {COMPANY_INFO.version}</span>
          </footer>
        </div>
      </div>
    </MainLayout>
  );
}
