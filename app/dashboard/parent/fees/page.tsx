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
};

function money(value: number): string {
  return `Rs. ${value.toLocaleString("en-IN")}`;
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

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.parent}>
      <div className="space-y-6">
        <ParentPageHeader
          icon={Wallet}
          title="Fees"
          description="View fee dues, invoices, and payments for your linked child."
        />

        <ParentChildSelector childrenList={children} selectedStudentId={selectedStudentId} onChange={setSelectedStudentId} />

        {loading && <LoadingState label="Loading fee information..." />}
        {error && <ErrorState message={error} />}

        {!loading && !error && selectedChild && summary && (
          <div className="space-y-6">
            <Card className="p-6">
              <p className="text-sm font-medium text-slate-600">Student</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{parentStudentName(selectedChild)}</p>
              <p className="mt-1 text-sm text-slate-500">{selectedChild.class_name ?? "Class not assigned"}</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200 p-6">
                <p className="text-sm font-medium text-slate-600">Total Fees</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">{money(summary.totalFees)}</p>
              </Card>
              <Card className="bg-green-50 border-green-200 p-6">
                <p className="text-sm font-medium text-slate-600">Paid Amount</p>
                <p className="text-3xl font-bold text-green-700 mt-2">{money(summary.paidAmount)}</p>
              </Card>
              <Card className={`${summary.pendingAmount > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"} p-6`}>
                <p className="text-sm font-medium text-slate-600">Pending Amount</p>
                <p className={`text-3xl font-bold mt-2 ${summary.pendingAmount > 0 ? "text-red-700" : "text-green-700"}`}>{money(summary.pendingAmount)}</p>
              </Card>
            </div>

            {invoices.length === 0 && payments.length === 0 && (
              <EmptyState icon={Wallet} message="No fee invoices or payment records are available for this child." />
            )}

            {invoices.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Invoices</h2>
                <div className="space-y-3">
                  {invoices.map((invoice) => {
                    const pending = Math.max(invoice.amount - invoice.paidAmount, 0);
                    return (
                      <Card key={invoice.id} className="p-6" hover>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{invoice.invoiceNo}</p>
                            {invoice.dueDate && <p className="text-sm text-slate-600 mt-1">Due {new Date(invoice.dueDate).toLocaleDateString("en-IN")}</p>}
                          </div>
                          <span className={`rounded-lg px-3 py-2 text-sm font-semibold ${pending > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                            {pending > 0 ? "Pending" : "Paid"}
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div><span className="text-slate-500">Amount</span><p className="font-semibold text-slate-900">{money(invoice.amount)}</p></div>
                          <div><span className="text-slate-500">Paid</span><p className="font-semibold text-green-700">{money(invoice.paidAmount)}</p></div>
                          <div><span className="text-slate-500">Pending</span><p className="font-semibold text-red-700">{money(pending)}</p></div>
                        </div>
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
