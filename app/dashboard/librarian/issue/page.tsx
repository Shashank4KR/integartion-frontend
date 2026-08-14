"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken, getStoredUser } from "@/lib/auth";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
import { listBookIssues } from "@/lib/services/libraryService";

interface IssueRecord {
  id: string;
  bookTitle: string;
  studentName: string;
  class: string;
  issueDate: string;
  dueDate: string;
  status: "issued" | "returned" | "overdue";
}

export default function IssueBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<IssueRecord[]>([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = getToken();
        const user = getStoredUser();

        if (!token || !user) {
          router.replace("/login");
          return;
        }

        const records = await listBookIssues(token);
        setIssues(
          records
            .filter((item) => String(item.status ?? "").toUpperCase() === "ISSUED")
            .map((item) => ({
              id: String(item.id),
              bookTitle: item.book_title ?? "Untitled book",
              studentName: item.student_name ?? "Unknown student",
              class: item.student_class ?? "-",
              issueDate: String(item.issue_date ?? "-"),
              dueDate: String(item.due_date ?? "-"),
              status: "issued",
            })),
        );
        setError(null);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError(err instanceof Error ? err.message : "Failed to load book issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "issued": return "bg-blue-100 text-blue-700";
      case "returned": return "bg-green-100 text-green-700";
      case "overdue": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.librarian}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            Issue Book
          </h1>
          <p className="text-slate-600 mt-1">Manage book issuance to students and staff</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading issues...</p>
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

        {!loading && !error && issues.length === 0 && (
          <Card className="border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3 text-amber-700">
              <BookOpen className="h-5 w-5" />
              <p>No books issued yet.</p>
            </div>
          </Card>
        )}

        {!loading && !error && issues.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-100 text-slate-900">
                  <tr>
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">{item.bookTitle}</td>
                      <td className="px-4 py-4">{item.studentName}</td>
                      <td className="px-4 py-4">{item.class}</td>
                      <td className="px-4 py-4">{item.issueDate}</td>
                      <td className="px-4 py-4">{item.dueDate}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
