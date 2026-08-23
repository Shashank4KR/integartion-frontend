"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentStudentLibrary } from "@/lib/services/studentService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";

interface BookIssue {
  id: string;
  bookTitle: string;
  author?: string;
  issueDate: string;
  dueDate: string;
  status: "active" | "overdue" | "returned";
  fine?: number;
}

export default function StudentLibraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([]);

  useEffect(() => {
    const fetchBookIssues = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const data = await getCurrentStudentLibrary(token);
        const allIssues = [
          ...(data.active_issues || []),
          ...(data.overdue_issues || []),
        ];
        const formatted: BookIssue[] = allIssues.map((issue: any) => ({
          id: issue.id || "",
          bookTitle: issue.book_title || "Book",
          author: issue.book_author,
          issueDate: issue.issue_date || "",
          dueDate: issue.due_date || "",
          status: (issue.status || "").toLowerCase().includes("overdue") ? "overdue" : "active",
          fine: issue.fine_amount,
        }));
        setBookIssues(formatted);
        setError(null);
      } catch (err) {
        console.error("Error fetching book issues:", err);
        setError(err instanceof Error ? err.message : "Failed to load library data");
      } finally {
        setLoading(false);
      }
    };

    fetchBookIssues();
  }, [router]);

  const activeBooks = bookIssues.filter((b) => b.status === "active");
  const overdueBooks = bookIssues.filter((b) => b.status === "overdue");
  const returnedBooks = bookIssues.filter((b) => b.status === "returned");
  const totalFine = bookIssues.reduce((sum, b) => sum + (b.fine || 0), 0);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            Library
          </h1>
          <p className="text-slate-600 mt-1">Access your library notifications and issued book details</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading library data...</p>
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

        {!loading && !error && bookIssues.length === 0 && (
          <Card className="border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3 text-amber-700">
              <BookOpen className="h-5 w-5" />
              <p>You have not issued any books yet. Visit the library to borrow books.</p>
            </div>
          </Card>
        )}

        {!loading && !error && bookIssues.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-blue-50 p-6">
                <p className="text-sm font-medium text-slate-600">Active Books</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{activeBooks.length}</p>
              </Card>

              <Card className="border-red-200 bg-red-50 p-6">
                <p className="text-sm font-medium text-slate-600">Overdue Books</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{overdueBooks.length}</p>
              </Card>

              <Card className="border-green-200 bg-green-50 p-6">
                <p className="text-sm font-medium text-slate-600">Returned Books</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{returnedBooks.length}</p>
              </Card>

              {totalFine > 0 && (
                <Card className="border-amber-200 bg-amber-50 p-6">
                  <p className="text-sm font-medium text-slate-600">Total Fine</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">₹{totalFine}</p>
                </Card>
              )}
            </div>

            {overdueBooks.length > 0 && (
              <Card className="border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Overdue Books</p>
                    <p className="text-sm text-red-800 mt-1">
                      You have {overdueBooks.length} overdue book(s). Please return them as soon as possible to avoid fine penalties.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {activeBooks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Active Books</h2>
                <div className="space-y-3">
                  {activeBooks.map((book) => (
                    <Card key={book.id} className="hover:shadow-md transition">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-slate-900">{book.bookTitle}</p>
                            {book.author && (
                              <p className="text-sm text-slate-600 mt-1">By {book.author}</p>
                            )}
                          </div>
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                            Active
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <p>Issued: {book.issueDate}</p>
                          <p>Due: {book.dueDate}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {overdueBooks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                    {overdueBooks.length}
                  </span>
                  Overdue Books
                </h2>
                <div className="space-y-3">
                  {overdueBooks.map((book) => (
                    <Card key={book.id} className="border-red-200 bg-red-50 hover:shadow-md transition">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-slate-900">{book.bookTitle}</p>
                            {book.author && (
                              <p className="text-sm text-slate-600 mt-1">By {book.author}</p>
                            )}
                          </div>
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                            Overdue
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <p>Due: {book.dueDate}</p>
                          {book.fine && (
                            <p className="text-red-600 font-semibold">Fine: ₹{book.fine}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {returnedBooks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Returned Books</h2>
                <div className="space-y-3">
                  {returnedBooks.slice(0, 5).map((book) => (
                    <Card key={book.id} className="hover:shadow-md transition opacity-75">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-slate-900">{book.bookTitle}</p>
                            {book.author && (
                              <p className="text-sm text-slate-600 mt-1">By {book.author}</p>
                            )}
                          </div>
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            Returned
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {returnedBooks.length > 5 && (
                    <p className="text-sm text-slate-600 mt-2">
                      +{returnedBooks.length - 5} more returned book(s)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
