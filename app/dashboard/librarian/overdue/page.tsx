"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken, getStoredUser } from "@/lib/auth";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, ScrollText } from "lucide-react";
import { listOverdueBookIssues } from "@/lib/services/libraryService";

interface OverdueRecord {
  id: string;
  bookTitle: string;
  studentName: string;
  class: string;
  issueDate: string;
  dueDate: string;
  daysLate: number;
  fine: number;
}

export default function OverduePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overdue, setOverdue] = useState<OverdueRecord[]>([]);

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const token = getToken();
        const user = getStoredUser();

        if (!token || !user) {
          router.replace("/login");
          return;
        }

        const records = await listOverdueBookIssues(token);
        const today = new Date();
        setOverdue(
          records.map((item) => {
            const dueDate = item.due_date ? new Date(item.due_date) : null;
            const daysLate = dueDate
              ? Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / 86400000))
              : 0;
            return {
              id: String(item.id),
              bookTitle: item.book_title ?? "Untitled book",
              studentName: item.student_name ?? "Unknown student",
              class: item.student_class ?? "-",
              issueDate: String(item.issue_date ?? "-"),
              dueDate: String(item.due_date ?? "-"),
              daysLate,
              fine: Number(item.fine_amount ?? 0),
            };
          }),
        );
        setError(null);
      } catch (err) {
        console.error("Error fetching overdue:", err);
        setError(err instanceof Error ? err.message : "Failed to load overdue books");
      } finally {
        setLoading(false);
      }
    };

    fetchOverdue();
  }, [router]);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.librarian}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ScrollText className="h-8 w-8 text-purple-600" />
            Overdue Books
          </h1>
          <p className="text-slate-600 mt-1">Track and manage overdue book returns</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading overdue books...</p>
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

        {!loading && !error && overdue.length === 0 && (
          <Card className="border-green-200 bg-green-50 p-6">
            <div className="flex items-center gap-3 text-green-700">
              <ScrollText className="h-5 w-5" />
              <p>No overdue books. Great job!</p>
            </div>
          </Card>
        )}

        {!loading && !error && overdue.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-100 text-slate-900">
                  <tr>
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Days Late</th>
                    <th className="px-4 py-3">Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">{item.bookTitle}</td>
                      <td className="px-4 py-4">{item.studentName}</td>
                      <td className="px-4 py-4">{item.class}</td>
                      <td className="px-4 py-4">{item.dueDate}</td>
                      <td className="px-4 py-4 text-red-600 font-semibold">{item.daysLate}</td>
                      <td className="px-4 py-4">₹{item.fine}</td>
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
