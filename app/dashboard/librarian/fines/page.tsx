"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken, getStoredUser } from "@/lib/auth";
import Card from "@/components/shared/Card";
import {
  Loader2,
  AlertCircle,
  Wallet,
  Plus,
  CheckCircle,
  Ban,
  X,
} from "lucide-react";
import {
  listFinePayments,
  createFinePayment,
  updateFinePayment,
  listBookIssues,
} from "@/lib/services/libraryService";

interface FineRecord {
  id: string;
  studentName: string;
  class: string;
  bookTitle: string;
  daysLate: number;
  fineAmount: number;
  status: "paid" | "pending" | "waived";
  paymentDate?: string;
}

export default function FinesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [bookIssues, setBookIssues] = useState<any[]>([]);

  // Collect / Record Fine dialog state
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [amount, setAmount] = useState("");
  const [fineStatus, setFineStatus] = useState("PAID");

  const fetchFines = useCallback(async () => {
    try {
      const token = getToken();
      const user = getStoredUser();

      if (!token || !user) {
        router.replace("/login");
        return;
      }

      setLoading(true);
      const [records, issues] = await Promise.all([
        listFinePayments(token).catch(() => []),
        listBookIssues(token).catch(() => []),
      ]);

      setBookIssues(Array.isArray(issues) ? issues : []);
      setFines(
        records.map((item: any) => ({
          id: String(item.id),
          studentName: item.student_name ?? "Student",
          class: "-",
          bookTitle: item.book_title ?? "Library Book",
          daysLate: 0,
          fineAmount: Number(item.amount ?? 0),
          status:
            String(item.status ?? "").toUpperCase() === "WAIVED"
              ? "waived"
              : String(item.status ?? "").toUpperCase() === "PAID"
                ? "paid"
                : "pending",
          paymentDate: item.payment_date,
        })),
      );
      setError(null);
    } catch (err) {
      console.error("Error fetching fines:", err);
      setError(err instanceof Error ? err.message : "Failed to load fines");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setFormError("Please enter a valid fine amount.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await createFinePayment(token, {
        issue_id: selectedIssueId || null,
        amount: parsedAmount,
        status: fineStatus,
      });
      setIsRecordOpen(false);
      setAmount("");
      setSelectedIssueId("");
      setFineStatus("PAID");
      await fetchFines();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "PAID" | "WAIVED") => {
    const token = getToken();
    if (!token) return;
    try {
      await updateFinePayment(token, id, { status: newStatus });
      await fetchFines();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update fine status.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "waived": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const totalPending = fines.filter(f => f.status === "pending").reduce((sum, f) => sum + f.fineAmount, 0);
  const totalCollected = fines.filter(f => f.status === "paid").reduce((sum, f) => sum + f.fineAmount, 0);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.librarian}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="h-8 w-8 text-purple-600" />
              Fine Management
            </h1>
            <p className="text-slate-600 mt-1">Track and collect library fines</p>
          </div>

          <button
            onClick={() => setIsRecordOpen(true)}
            className="inline-flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Record / Collect Fine
          </button>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading fines...</p>
            </div>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-amber-200 bg-amber-50 p-6">
                <p className="text-sm font-medium text-slate-600">Pending Fines</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">₹{totalPending.toLocaleString()}</p>
                <p className="text-xs text-amber-600 mt-1">{fines.filter(f => f.status === "pending").length} records</p>
              </Card>
              <Card className="border-green-200 bg-green-50 p-6">
                <p className="text-sm font-medium text-slate-600">Collected</p>
                <p className="text-3xl font-bold text-green-600 mt-2">₹{totalCollected.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">{fines.filter(f => f.status === "paid").length} records</p>
              </Card>
              <Card className="border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-medium text-slate-600">Waived Off</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{fines.filter(f => f.status === "waived").length}</p>
                <p className="text-xs text-slate-600 mt-1">records</p>
              </Card>
            </div>

            {fines.length === 0 ? (
              <Card className="border-green-200 bg-green-50 p-6">
                <div className="flex items-center gap-3 text-green-700">
                  <Wallet className="h-5 w-5" />
                  <p>No fines recorded yet.</p>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="border-b border-slate-200 bg-slate-100 text-slate-900 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Book</th>
                        <th className="px-4 py-3">Fine Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fines.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-4 font-medium text-slate-900">{item.studentName}</td>
                          <td className="px-4 py-4 text-slate-700">{item.bookTitle}</td>
                          <td className="px-4 py-4 font-semibold text-slate-900">₹{item.fineAmount}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {item.status === "pending" && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateStatus(item.id, "PAID")}
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition border border-green-200"
                                  title="Mark fine as collected"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Collect
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(item.id, "WAIVED")}
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 transition border border-slate-200"
                                  title="Waive fine"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  Waive
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Record / Collect Fine Dialog */}
        {isRecordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Record / Collect Fine</h3>
                <button
                  onClick={() => setIsRecordOpen(false)}
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

              <form onSubmit={handleRecordSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Select Issued Book Record (Optional)
                  </label>
                  <select
                    value={selectedIssueId}
                    onChange={(e) => setSelectedIssueId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  >
                    <option value="">Direct / General fine</option>
                    {bookIssues.map((issue) => (
                      <option key={issue.id} value={issue.id}>
                        {issue.book_title || "Book"} — {issue.student_name || "Student"} (Due: {issue.due_date || "N/A"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Fine Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Payment Status *
                  </label>
                  <select
                    value={fineStatus}
                    onChange={(e) => setFineStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  >
                    <option value="PAID">Paid (Collected)</option>
                    <option value="PENDING">Pending (Recorded as Due)</option>
                    <option value="WAIVED">Waived</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRecordOpen(false)}
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
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
