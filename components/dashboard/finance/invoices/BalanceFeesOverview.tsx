"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Clock, AlertCircle, ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import Card from "@/components/shared/Card";

const BALANCE_FEES_PERIOD_OPTIONS = ["This Month", "This Quarter", "This Academic Year"];

interface BalanceFeeRow {
  label: string;
  value: string;
  amount: number;
  percentage: number;
  iconBg: string;
  iconColor: string;
  icon: "current" | "overdue1" | "overdue2";
}

interface BalanceFeesOverviewProps {
  invoices?: Array<{
    amount?: number;
    paid?: number;
    balance: number;
    dueDate?: string;
    studentId?: string;
    studentName?: string;
  }>;
}

export default function BalanceFeesOverview({ invoices = [] }: BalanceFeesOverviewProps) {
  const [period, setPeriod] = useState("This Academic Year");
  const [reportOpen, setReportOpen] = useState(false);

  const stats = useMemo(() => {
    const totalBalance = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);
    const uniqueStudents = new Set(invoices.filter((i) => i.balance > 0).map((i) => i.studentId || i.studentName || i)).size;

    const now = new Date().getTime();
    let currentAmount = 0;
    let overdue30Amount = 0;
    let overdue60Amount = 0;

    invoices.forEach((inv) => {
      if (!inv.balance || inv.balance <= 0) return;
      const dueTime = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
      const diffDays = Math.floor((now - dueTime) / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) {
        currentAmount += inv.balance;
      } else if (diffDays <= 60) {
        overdue30Amount += inv.balance;
      } else {
        overdue60Amount += inv.balance;
      }
    });

    // If invoices have no balance or list is small, provide realistic breakdown proportional to totalBalance or sensible defaults
    if (totalBalance === 0 && invoices.length > 0) {
      currentAmount = 0;
      overdue30Amount = 0;
      overdue60Amount = 0;
    } else if (currentAmount === 0 && overdue30Amount === 0 && overdue60Amount === 0 && totalBalance > 0) {
      currentAmount = totalBalance;
    }

    const safeTotal = totalBalance || 1;
    const currentPct = totalBalance > 0 ? ((currentAmount / safeTotal) * 100) : 0;
    const overdue30Pct = totalBalance > 0 ? ((overdue30Amount / safeTotal) * 100) : 0;
    const overdue60Pct = totalBalance > 0 ? ((overdue60Amount / safeTotal) * 100) : 0;

    const rows: BalanceFeeRow[] = [
      {
        label: "Current (0-30 Days)",
        value: `₹ ${currentAmount.toLocaleString("en-IN")}`,
        amount: currentAmount,
        percentage: Number(currentPct.toFixed(1)),
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        icon: "current",
      },
      {
        label: "Overdue (31-60 Days)",
        value: `₹ ${overdue30Amount.toLocaleString("en-IN")}`,
        amount: overdue30Amount,
        percentage: Number(overdue30Pct.toFixed(1)),
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        icon: "overdue1",
      },
      {
        label: "Overdue (60+ Days)",
        value: `₹ ${overdue60Amount.toLocaleString("en-IN")}`,
        amount: overdue60Amount,
        percentage: Number(overdue60Pct.toFixed(1)),
        iconBg: "bg-rose-50",
        iconColor: "text-rose-600",
        icon: "overdue2",
      },
    ];

    return {
      totalBalance,
      studentCount: uniqueStudents,
      rows,
    };
  }, [invoices]);

  const iconMap = {
    current: <TrendingUp className="h-4 w-4" />,
    overdue1: <Clock className="h-4 w-4" />,
    overdue2: <AlertCircle className="h-4 w-4" />,
  };

  return (
    <Card className="p-5 border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Balance Fees Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">Outstanding fee balances by aging period</p>
        </div>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 pr-7 text-xs font-semibold text-slate-700 outline-none focus:border-[#7c3aed]"
          >
            {BALANCE_FEES_PERIOD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-900">Total Outstanding Balance</p>
          <p className="text-2xl font-extrabold text-[#7c3aed] mt-1">
            ₹ {stats.totalBalance.toLocaleString("en-IN")}
          </p>
          <p className="text-xs font-medium text-purple-700 mt-0.5">
            Pending across {stats.studentCount} {stats.studentCount === 1 ? "student" : "students"}
          </p>
        </div>

        <div className="space-y-3">
          {stats.rows.map((row) => (
            <div key={row.label} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`${row.iconBg} ${row.iconColor} p-1.5 rounded-md`}>
                    {iconMap[row.icon]}
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{row.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">{row.value}</span>
                  <span className="text-[11px] text-slate-500 ml-1">({row.percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${row.icon === "current" ? "bg-emerald-500" : row.icon === "overdue1" ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(100, Math.max(row.percentage > 0 ? 5 : 0, row.percentage))}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setReportOpen(true)}
          className="w-full text-xs font-semibold text-[#7c3aed] border-purple-200 hover:bg-purple-50 flex items-center justify-center gap-2"
        >
          <FileText className="h-3.5 w-3.5" />
          View Detailed Balance Report
        </Button>
      </div>

      {reportOpen && (
        <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Balance Fees Aging Report" maxWidth="max-w-xl">
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-xs font-bold uppercase text-purple-900">Total Unpaid Balance</p>
              <p className="text-2xl font-extrabold text-[#7c3aed] mt-1">₹ {stats.totalBalance.toLocaleString("en-IN")}</p>
              <p className="text-xs text-purple-700 mt-0.5">Calculated from live student invoice balances</p>
            </div>

            <div className="space-y-2.5">
              {stats.rows.map((row) => (
                <div key={row.label} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2.5">
                    <div className={`${row.iconBg} ${row.iconColor} p-2 rounded-lg`}>
                      {iconMap[row.icon]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{row.label}</p>
                      <p className="text-[11px] text-slate-500">{row.percentage}% of overall pending fees</p>
                    </div>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">{row.value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setReportOpen(false)} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold">
                Close Report
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
