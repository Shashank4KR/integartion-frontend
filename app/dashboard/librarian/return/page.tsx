"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken, getStoredUser } from "@/lib/auth";
import Card from "@/components/shared/Card";
import ReturnBookDialog from "@/components/dashboard/library/ReturnBookDialog";
import { listBookIssues } from "@/lib/services/libraryService";
import type { BookIssueResponse } from "@/types/entities/library";
import { Loader2, AlertCircle, BookCheck, Clock } from "lucide-react";

export default function ReturnBookPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<BookIssueResponse[]>([]);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedIssueForReturn, setSelectedIssueForReturn] = useState<BookIssueResponse | null>(null);

  const fetchIssues = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const records = await listBookIssues(authToken);
      setIssues(records);
      setError(null);
    } catch (err) {
      console.error("Error fetching returns:", err);
      setError(err instanceof Error ? err.message : "Failed to load book returns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const activeToken = getToken();
    const user = getStoredUser();

    if (!activeToken || !user) {
      router.replace("/login");
      return;
    }

    setToken(activeToken);
    void fetchIssues(activeToken);
  }, [router, fetchIssues]);

  const activeIssues = issues.filter(
    (item) => String(item.status ?? "").toUpperCase() !== "RETURNED"
  );
  const returnedIssues = issues.filter(
    (item) => String(item.status ?? "").toUpperCase() === "RETURNED"
  );

  const handleOpenReturn = (issue: BookIssueResponse) => {
    setSelectedIssueForReturn(issue);
    setReturnModalOpen(true);
  };

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.librarian}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BookCheck className="h-8 w-8 text-purple-600" />
            Book Returns & History
          </h1>
          <p className="text-slate-600 mt-1">Process pending returns and view circulation history</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading returns...</p>
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
            {/* Active loans awaiting return */}
            {activeIssues.length > 0 && (
              <Card className="overflow-hidden p-0 border border-purple-100 shadow-sm">
                <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <h2 className="font-semibold text-slate-900 text-sm">Active Loans Ready for Return</h2>
                  </div>
                  <span className="text-xs text-purple-700 font-medium">{activeIssues.length} pending</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Book</th>
                        <th className="px-5 py-3 font-semibold">Student</th>
                        <th className="px-5 py-3 font-semibold">Due Date</th>
                        <th className="px-5 py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {activeIssues.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-3.5 font-medium text-slate-900">{item.book_title || "Untitled"}</td>
                          <td className="px-5 py-3.5">{item.student_name || "Unknown"}</td>
                          <td className="px-5 py-3.5 text-slate-600">{item.due_date}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleOpenReturn(item)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition"
                            >
                              <BookCheck className="h-3.5 w-3.5" />
                              Process Return
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Returned History */}
            <Card className="overflow-hidden p-0 border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 text-sm">Completed Returns History</h2>
                <span className="text-xs text-slate-500">{returnedIssues.length} records</span>
              </div>

              {returnedIssues.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No completed returns recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-5 py-3.5 font-semibold">Book</th>
                        <th className="px-5 py-3.5 font-semibold">Student</th>
                        <th className="px-5 py-3.5 font-semibold">Issue Date</th>
                        <th className="px-5 py-3.5 font-semibold">Return Date</th>
                        <th className="px-5 py-3.5 font-semibold">Fine Amount</th>
                        <th className="px-5 py-3.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {returnedIssues.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-3.5 font-medium text-slate-900">{item.book_title || "Untitled"}</td>
                          <td className="px-5 py-3.5">{item.student_name || "Unknown"}</td>
                          <td className="px-5 py-3.5 text-slate-600">{item.issue_date}</td>
                          <td className="px-5 py-3.5 text-slate-600">{item.return_date || "-"}</td>
                          <td className="px-5 py-3.5">₹{Number(item.fine_amount || 0)}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                              Returned
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {token && (
        <ReturnBookDialog
          open={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          onSuccess={() => void fetchIssues(token)}
          token={token}
          issue={selectedIssueForReturn}
        />
      )}
    </RoleDashboardLayout>
  );
}
