"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import Card from "@/components/shared/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ParentChildSelector,
  ParentPageHeader,
  parentStudentName,
  type ParentStudent,
} from "@/components/dashboard/parent/ParentModuleHelpers";
import { getToken } from "@/lib/auth";
import { getCurrentParentStudents } from "@/lib/services/dashboardService";
import { getStudentFeeSummary, listStudentInvoices, listStudentPayments } from "@/lib/services/feeService";
import { Wallet } from "lucide-react";

import { Download } from "lucide-react";
import { generateInvoicePdf } from "@/lib/utils/generateInvoicePdf";

type FeeSummary = {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
};

type Invoice = {
  id: string;
  invoiceNo: string;
  amount: number;
  paidAmount: number;
  dueDate?: string;
  date?: string;
};

function money(value: number): string {
  return `₹ ${value.toLocaleString("en-IN")}`;
}

export default function ParentFeesPage() {
  const router = useRouter();
  const [children, setChildren] = useState<ParentStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadChildren() {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const linkedChildren = await getCurrentParentStudents();
        if (!mounted) return;
        setChildren(linkedChildren);
        setSelectedStudentId(linkedChildren[0]?.id ?? "");
        if (linkedChildren.length === 0) {
          setError("No linked students were found for this parent account.");
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load linked students.");
        setLoading(false);
      }
    }

    void loadChildren();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    let mounted = true;

    async function loadFees() {
      const token = getToken();
      if (!token || !selectedStudentId) return;

      setLoading(true);
      setError(null);

      try {
        const [summaryData, invoiceData, paymentData] = await Promise.all([
          getStudentFeeSummary(token, selectedStudentId),
          listStudentInvoices(token, selectedStudentId),
          listStudentPayments(token, selectedStudentId),
        ]);

        if (!mounted) return;

        setSummary({
          totalFees: Number(summaryData.total_fees ?? 0),
          paidAmount: Number(summaryData.paid ?? 0),
          pendingAmount: Number(summaryData.pending ?? 0),
        });
        setInvoices((invoiceData ?? []).map((invoice: any) => {
          const amount = Number(invoice.amount ?? invoice.total_amount ?? 0);
          const invoiceId = String(invoice.id ?? invoice.invoice_id ?? "");
          const paidFromPayments = (paymentData ?? [])
            .filter((payment: any) => String(payment.invoice_id ?? "") === invoiceId)
            .reduce((total: number, payment: any) => total + Number(payment.amount_paid ?? payment.amount ?? 0), 0);
          const paidAmount = Number(invoice.paid_amount ?? paidFromPayments ?? 0);
          return {
            id: invoiceId || String(invoice.invoice_number ?? invoice.invoice_no ?? crypto.randomUUID()),
            invoiceNo: String(invoice.invoice_number ?? invoice.invoice_no ?? invoice.id ?? "Invoice"),
            amount,
            paidAmount,
            dueDate: invoice.due_date,
            date: invoice.date || invoice.invoice_date,
          };
        }));
        setPayments(paymentData ?? []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load fee information.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadFees();
    return () => {
      mounted = false;
    };
  }, [selectedStudentId]);

  const selectedChild = useMemo(
    () => children.find((student) => student.id === selectedStudentId),
    [children, selectedStudentId],
  );

  const handleDownloadInvoice = (invoice: Invoice) => {
    generateInvoicePdf({
      invoiceNumber: invoice.invoiceNo,
      studentName: selectedChild ? parentStudentName(selectedChild) : "Student",
      className: selectedChild?.class_name || "General",
      admissionNo: selectedChild?.admission_no || "ADM-001",
      feeType: "Tuition / Term Fee",
      amount: invoice.amount,
      paid: invoice.paidAmount,
      balance: Math.max(0, invoice.amount - invoice.paidAmount),
      status: (invoice.amount - invoice.paidAmount <= 0) ? "PAID" : "PENDING",
      invoiceDate: invoice.date || new Date().toISOString().split("T")[0],
      dueDate: invoice.dueDate || "N/A",
    });
  };

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.parent}>
      <div className="space-y-6">
        <ParentPageHeader
          icon={Wallet}
          title="Fees & Invoices"
          description="View fee dues, invoices, and payments for your linked child."
        />

        <ParentChildSelector childrenList={children} selectedStudentId={selectedStudentId} onChange={setSelectedStudentId} />

        {loading && <LoadingState label="Loading fee information..." />}
        {error && <ErrorState message={error} />}

        {!loading && !error && selectedChild && summary && (
          <div className="space-y-6">
            <Card className="p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Profile</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{parentStudentName(selectedChild)}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-600">
                {selectedChild.class_name ?? "Class not assigned"} • Admission No: {selectedChild.admission_no || "-"}
              </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-purple-50 border-purple-200 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Billed Fees</p>
                <p className="text-3xl font-extrabold text-[#7c3aed] mt-2">{money(summary.totalFees)}</p>
              </Card>
              <Card className="bg-emerald-50 border-emerald-200 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Paid Amount</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-2">{money(summary.paidAmount)}</p>
              </Card>
              <Card className={`${summary.pendingAmount > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"} p-6`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Balance</p>
                <p className={`text-3xl font-extrabold mt-2 ${summary.pendingAmount > 0 ? "text-amber-600" : "text-emerald-600"}`}>{money(summary.pendingAmount)}</p>
              </Card>
            </div>

            {invoices.length === 0 && payments.length === 0 && (
              <EmptyState icon={Wallet} message="No fee invoices or payment records are available for this child." />
            )}

            {invoices.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Fee Invoices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {invoices.map((invoice) => {
                    const pending = Math.max(invoice.amount - invoice.paidAmount, 0);
                    return (
                      <Card key={invoice.id} className="p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="font-bold text-slate-900 text-base">{invoice.invoiceNo}</p>
                            {invoice.dueDate && <p className="text-xs text-slate-500 mt-0.5">Due {invoice.dueDate}</p>}
                          </div>
                          <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${pending > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                            {pending > 0 ? "PENDING" : "PAID"}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                          <div className="flex justify-between"><span className="text-slate-600">Total Amount</span><span className="font-bold text-slate-900">{money(invoice.amount)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-600">Paid Amount</span><span className="font-bold text-emerald-600">{money(invoice.paidAmount)}</span></div>
                          <div className="flex justify-between pt-1 border-t border-slate-200"><span className="text-slate-700 font-semibold">Balance Due</span><span className={`font-bold ${pending > 0 ? "text-amber-600" : "text-emerald-600"}`}>{money(pending)}</span></div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#7c3aed] py-2 px-3 text-xs font-semibold border border-purple-200 transition"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF Invoice
                        </button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
