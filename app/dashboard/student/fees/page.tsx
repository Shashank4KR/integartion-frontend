"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentStudentFees } from "@/lib/services/studentService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, Wallet, Download, CheckCircle2, FileText } from "lucide-react";
import { generateInvoicePdf } from "@/lib/utils/generateInvoicePdf";

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
  studentName?: string;
  classGrade?: string;
}

interface PaymentHistoryItem {
  payment_id: string;
  date: string | null;
  amount: number;
  method: string;
  receipt: string;
  status: string;
  remarks?: string;
}

export default function StudentFeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const data = await getCurrentStudentFees(token);
        setSummary({
          totalFees: data.total_fees || 0,
          paidAmount: data.paid_amount || 0,
          pendingAmount: data.pending_amount || 0,
        });

        const formattedInvoices: Invoice[] = (data.invoices || []).map((inv: any) => ({
          id: inv.id || "",
          invoiceNo: inv.invoice_number || inv.id || "Invoice",
          amount: inv.amount || 0,
          paidAmount: inv.paid_amount || 0,
          pendingAmount: inv.pending_amount || 0,
          status: (inv.status || "").toLowerCase().includes("paid") ? "paid" : "pending",
          dueDate: inv.due_date,
          date: inv.invoice_date,
          studentName: inv.student_name,
          classGrade: inv.class_grade,
        }));

        setInvoices(formattedInvoices);
        setPaymentHistory(data.payment_history || []);
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
    if (status === "paid") return "text-emerald-700 bg-emerald-50 border border-emerald-200";
    if (status === "partial") return "text-amber-700 bg-amber-50 border border-amber-200";
    return "text-red-700 bg-red-50 border border-red-200";
  };

  const handleDownloadInvoice = (inv: Invoice) => {
    generateInvoicePdf({
      invoiceNumber: inv.invoiceNo,
      studentName: inv.studentName || "Student",
      className: inv.classGrade || "Class",
      admissionNo: "MY-ACCOUNT",
      feeType: "Tuition / Term Fee",
      amount: inv.amount,
      paid: inv.paidAmount,
      balance: inv.pendingAmount,
      status: inv.status === "paid" ? "PAID" : "PENDING",
      invoiceDate: inv.date || new Date().toISOString().split("T")[0],
      dueDate: inv.dueDate || "N/A",
    });
  };

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="h-8 w-8 text-[#7c3aed]" />
            Fee Invoices & Payments
          </h1>
          <p className="text-slate-600 mt-1">View your fee invoices, balance due, and official payment receipts</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#7c3aed]" />
              <p className="text-slate-600">Loading fee records...</p>
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
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Billed Fees</p>
                <p className="text-3xl font-extrabold text-[#7c3aed] mt-2">
                  ₹ {summary.totalFees.toLocaleString("en-IN")}
                </p>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Amount Paid</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                  ₹ {summary.paidAmount.toLocaleString("en-IN")}
                </p>
              </Card>

              <Card className={`bg-gradient-to-br ${summary.pendingAmount > 0 ? "from-amber-50 to-amber-100/50 border-amber-200" : "from-emerald-50 to-emerald-100/50 border-emerald-200"} p-6`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Balance</p>
                <p className={`text-3xl font-extrabold mt-2 ${summary.pendingAmount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  ₹ {summary.pendingAmount.toLocaleString("en-IN")}
                </p>
              </Card>
            </div>

            {/* Invoices List */}
            {invoices.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-600" />
                  Your Fee Invoices
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id} className="border border-slate-200 shadow-sm hover:shadow-md transition">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-slate-900 text-base">{invoice.invoiceNo}</p>
                            {invoice.date && (
                              <p className="text-xs text-slate-500 mt-0.5">Invoice Date: {invoice.date}</p>
                            )}
                            {invoice.dueDate && (
                              <p className="text-xs text-slate-500">Due Date: {invoice.dueDate}</p>
                            )}
                          </div>
                          <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${getStatusColor(invoice.status)}`}>
                            {invoice.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Invoice Amount</span>
                            <span className="font-bold text-slate-900">₹ {invoice.amount.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Amount Paid</span>
                            <span className="font-bold text-emerald-600">₹ {invoice.paidAmount.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-200">
                            <span className="text-slate-700 font-semibold">Balance Due</span>
                            <span className={`font-bold ${invoice.pendingAmount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                              ₹ {invoice.pendingAmount.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#7c3aed] py-2 px-3 text-xs font-semibold border border-purple-200 transition"
                        >
                          <Download className="h-4 w-4" />
                          Download Official PDF Invoice
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-slate-200 p-8 text-center">
                <Wallet className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No fee invoices currently assigned to your account.</p>
              </Card>
            )}

            {/* Payment History */}
            {paymentHistory.length > 0 && (
              <div className="space-y-3 pt-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Recent Payment Transactions
                </h2>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Receipt / Ref</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Payment Mode</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paymentHistory.map((p, idx) => (
                        <tr key={p.payment_id || idx} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-semibold text-slate-900">{p.receipt || `RCPT-${idx + 1}`}</td>
                          <td className="p-3 text-slate-600">{p.date || "-"}</td>
                          <td className="p-3 text-slate-700">{p.method}</td>
                          <td className="p-3 font-bold text-emerald-600">₹ {p.amount.toLocaleString("en-IN")}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {p.status || "COMPLETED"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
