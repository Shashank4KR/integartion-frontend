"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken, getStoredUser } from "@/lib/auth";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, Wallet } from "lucide-react";
import { listFinePayments } from "@/lib/services/libraryService";

interface FineRecord {
  id: string;
  studentName: string;
  class: string;
  bookTitle: string;
  daysLate: number;
  fineAmount: number;
  status: "paid" | "pending" | "waived";
}

export default function FinesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fines, setFines] = useState<FineRecord[]>([]);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const token = getToken();
        const user = getStoredUser();

        if (!token || !user) {
          router.replace("/login");
          return;
        }

        const records = await listFinePayments(token);
        setFines(
          records.map((item) => ({
            id: String(item.id),
            studentName: item.student_name ?? "Unknown student",
            class: "-",
            bookTitle: item.book_title ?? "Untitled book",
            daysLate: 0,
            fineAmount: Number(item.amount ?? 0),
            status:
              String(item.status ?? "").toUpperCase() === "WAIVED"
                ? "waived"
                : String(item.status ?? "").toUpperCase() === "PAID"
                  ? "paid"
                  : "pending",
          })),
        );
        setError(null);
      } catch (err) {
        console.error("Error fetching fines:", err);
        setError(err instanceof Error ? err.message : "Failed to load fines");
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, [router]);

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
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="h-8 w-8 text-purple-600" />
            Fine Management
          </h1>
          <p className="text-slate-600 mt-1">Track and manage library fines</p>
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
                <p className="text-3xl font-bold text-amber-600 mt-2">₹{totalPending}</p>
                <p className="text-xs text-amber-600 mt-1">{fines.filter(f => f.status === "pending").length} records</p>
              </Card>
              <Card className="border-green-200 bg-green-50 p-6">
                <p className="text-sm font-medium text-slate-600">Collected</p>
                <p className="text-3xl font-bold text-green-600 mt-2">₹{totalCollected}</p>
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
                    <thead className="border-b border-slate-200 bg-slate-100 text-slate-900">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Class</th>
                        <th className="px-4 py-3">Book</th>
                        <th className="px-4 py-3">Days Late</th>
                        <th className="px-4 py-3">Fine</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fines.map((item) => (
                        <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-4 font-medium text-slate-900">{item.studentName}</td>
                          <td className="px-4 py-4">{item.class}</td>
                          <td className="px-4 py-4">{item.bookTitle}</td>
                          <td className="px-4 py-4">{item.daysLate}</td>
                          <td className="px-4 py-4">₹{item.fineAmount}</td>
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
          </>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
