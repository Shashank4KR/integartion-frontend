"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getStudentFeeSummary, listStudentInvoices } from "@/lib/services/feeService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, Wallet } from "lucide-react";

interface FeeSummary {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: "paid" | "pending" | "partial";
  dueDate?: string;
  date?: string;
}

export default function StudentFeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        const token = getToken();
        const studentJson = localStorage.getItem("edtech_student");

        if (!token || !studentJson) {
          router.replace("/login");
          return;
        }

        const student = JSON.parse(studentJson);
        if (!student.id) {
          setError("Student ID not found");
          setLoading(false);
          return;
        }

        const [summaryData, invoicesData] = await Promise.all([
          getStudentFeeSummary(token, student.id),
          listStudentInvoices(token, student.id),
        ]);

        setSummary({
          totalFees: summaryData.total_fees || 0,
          paidAmount: summaryData.paid || 0,
          pendingAmount: summaryData.pending || 0,
        });

        const formattedInvoices: Invoice[] = (invoicesData || []).map((inv: any) => ({
          id: inv.id || "",
          invoiceNo: inv.invoice_no || inv.id || "Invoice",
          amount: inv.amount || 0,
          paidAmount: inv.paid_amount || 0,
          pendingAmount: (inv.amount || 0) - (inv.paid_amount || 0),
          status: (inv.paid_amount || 0) >= (inv.amount || 0) ? "paid" : (inv.paid_amount || 0) > 0 ? "partial" : "pending",
          dueDate: inv.due_date,
          date: inv.invoice_date,
        }));

        setInvoices(formattedInvoices);
        setError(null);
      } catch (err) {
        console.error("Error fetching fee data:", err);
        setError(err instanceof Error ? err.message : "Failed to load fee information");
      } finally {
        setLoading(false);
      }
    };

    fetchFeeData();
  }, [router]);

  const getStatusColor = (status: string) => {
    if (status === "paid") return "text-green-600 bg-green-50";
    if (status === "partial") return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="h-8 w-8 text-purple-600" />
            Fees
          </h1>
          <p className="text-slate-600 mt-1">View fee dues and payment status for your account</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading fee information...</p>
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

        {!loading && !error && summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-6">
                <p className="text-sm font-medium text-slate-600">Total Fees</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ₹{summary.totalFees.toLocaleString("en-IN")}
                </p>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-6">
                <p className="text-sm font-medium text-slate-600">Paid Amount</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ₹{summary.paidAmount.toLocaleString("en-IN")}
                </p>
              </Card>

              <Card className={`bg-gradient-to-br ${summary.pendingAmount > 0 ? "from-red-50 to-red-100 border-red-200" : "from-green-50 to-green-100 border-green-200"} p-6`}>
                <p className="text-sm font-medium text-slate-600">Pending Amount</p>
                <p className={`text-3xl font-bold mt-2 ${summary.pendingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                  ₹{summary.pendingAmount.toLocaleString("en-IN")}
                </p>
              </Card>
            </div>

            {summary.pendingAmount > 0 && (
              <Card className="border-orange-200 bg-orange-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900">Amount Due</p>
                    <p className="text-sm text-orange-800 mt-1">
                      You have a pending fee amount of ₹{summary.pendingAmount.toLocaleString("en-IN")}. Please make payment at the earliest.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {invoices.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Invoice History</h2>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id} className="hover:shadow-md transition">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-semibold text-slate-900">{invoice.invoiceNo}</p>
                            {invoice.date && (
                              <p className="text-sm text-slate-600 mt-1">Invoice Date: {invoice.date}</p>
                            )}
                            {invoice.dueDate && (
                              <p className="text-sm text-slate-600">Due Date: {invoice.dueDate}</p>
                            )}
                          </div>
                          <span className={`px-3 py-2 rounded-lg font-semibold text-sm ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Amount</span>
                            <span className="font-semibold text-slate-900">₹{invoice.amount.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Paid Amount</span>
                            <span className="font-semibold text-green-600">₹{invoice.paidAmount.toLocaleString("en-IN")}</span>
                          </div>
                          {invoice.pendingAmount > 0 && (
                            <div className="flex justify-between pt-2 border-t border-slate-200">
                              <span className="text-slate-600">Pending Amount</span>
                              <span className="font-semibold text-red-600">₹{invoice.pendingAmount.toLocaleString("en-IN")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {invoices.length === 0 && (
              <Card className="border-amber-200 bg-amber-50 p-6">
                <div className="flex items-center gap-3 text-amber-700">
                  <Wallet className="h-5 w-5" />
                  <p>No invoices found. Contact the admin for fee information.</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
