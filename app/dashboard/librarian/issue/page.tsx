"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken, getStoredUser } from "@/lib/auth";
import Card from "@/components/shared/Card";
import IssueBookDialog from "@/components/dashboard/library/IssueBookDialog";
import ReturnBookDialog from "@/components/dashboard/library/ReturnBookDialog";
import { listBookIssues } from "@/lib/services/libraryService";
import type { BookIssueResponse } from "@/types/entities/library";
import {
  Loader2,
  AlertCircle,
  BookOpen,
  Plus,
  BookCheck,
  Search,
} from "lucide-react";

export default function IssueBookPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<BookIssueResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedIssueForReturn, setSelectedIssueForReturn] = useState<BookIssueResponse | null>(null);

  const fetchIssues = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const records = await listBookIssues(authToken);
      setIssues(records);
      setError(null);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError(err instanceof Error ? err.message : "Failed to load book issues");
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

  const filteredIssues = activeIssues.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const book = (item.book_title ?? "").toLowerCase();
    const student = (item.student_name ?? "").toLowerCase();
    const sClass = (item.student_class ?? "").toLowerCase();
    return book.includes(q) || student.includes(q) || sClass.includes(q);
  });

  const handleOpenReturn = (issue: BookIssueResponse) => {
    setSelectedIssueForReturn(issue);
    setReturnModalOpen(true);
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = String(status).toUpperCase() === "OVERDUE" || new Date(dueDate) < new Date();
    if (isOverdue) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Overdue</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Active Loan</span>;
  };

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.librarian}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              Book Loans & Circulation
            </h1>
            <p className="text-slate-600 mt-1">Issue books to students and monitor active loans</p>
          </div>

          <button
            onClick={() => setIssueModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Issue / Lend Book
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search active loans by book title or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading active book issues...</p>
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

        {!loading && !error && filteredIssues.length === 0 && (
          <Card className="border-amber-200 bg-amber-50 p-8 text-center">
            <div className="flex flex-col items-center gap-3 text-amber-800">
              <BookOpen className="h-10 w-10 text-amber-600" />
              <p className="text-base font-semibold">No active book loans found.</p>
              <p className="text-sm text-amber-700">
                {searchQuery
                  ? "No loans match your search filter."
                  : "All borrowed books have been returned or none are issued."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIssueModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" /> Issue a Book
                </button>
              )}
            </div>
          </Card>
        )}

        {!loading && !error && filteredIssues.length > 0 && (
          <Card className="overflow-hidden p-0 border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Book Title</th>
                    <th className="px-5 py-3.5 font-semibold">Borrower</th>
                    <th className="px-5 py-3.5 font-semibold">Issue Date</th>
                    <th className="px-5 py-3.5 font-semibold">Due Date</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredIssues.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {item.book_title || "Untitled book"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">{item.student_name || "Unknown Student"}</div>
                        {item.student_class && (
                          <div className="text-xs text-slate-500">Class {item.student_class}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{item.issue_date}</td>
                      <td className="px-5 py-4 text-slate-600">{item.due_date}</td>
                      <td className="px-5 py-4">
                        {getStatusBadge(item.status, item.due_date)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenReturn(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition"
                        >
                          <BookCheck className="h-3.5 w-3.5" />
                          Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {token && (
        <>
          <IssueBookDialog
            open={issueModalOpen}
            onClose={() => setIssueModalOpen(false)}
            onSuccess={() => void fetchIssues(token)}
            token={token}
          />
          <ReturnBookDialog
            open={returnModalOpen}
            onClose={() => setReturnModalOpen(false)}
            onSuccess={() => void fetchIssues(token)}
            token={token}
            issue={selectedIssueForReturn}
          />
        </>
      )}
    </RoleDashboardLayout>
  );
}
