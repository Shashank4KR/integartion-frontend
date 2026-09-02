"use client";

import { useState } from "react";
import { ChevronDown, Users, Lock } from "lucide-react";
import Card from "@/components/shared/Card";
import DonutChart from "@/components/shared/charts/DonutChart";
import type { SalaryRow } from "@/lib/fixtures/salary-management-reference-fixture";

const PAYROLL_PERIOD_OPTIONS = ["This Month", "Last Month", "This Quarter", "This Year"];

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface PayrollSummaryChartProps {
  salaries?: SalaryRow[];
}

export default function PayrollSummaryChart({ salaries = [] }: PayrollSummaryChartProps) {
  const [period, setPeriod] = useState("This Month");

  const totalPayroll = salaries.reduce((sum, s) => sum + (Number(s.basicSalary) || 0), 0);
  const paidSalaries = salaries.filter((s) => s.status === "Paid");
  const paidAmount = paidSalaries.reduce((sum, s) => sum + (Number(s.netSalary) || 0), 0);
  const pendingSalaries = salaries.filter((s) => s.status !== "Paid");
  const pendingAmount = pendingSalaries.reduce((sum, s) => sum + (Number(s.basicSalary) || 0), 0);

  const paidPct = totalPayroll > 0 ? Number(((paidAmount / totalPayroll) * 100).toFixed(1)) : 0;
  const pendingPct = totalPayroll > 0 ? Number(((pendingAmount / totalPayroll) * 100).toFixed(1)) : 0;

  const segments = totalPayroll > 0 ? [
    { label: "Paid Amount", value: paidPct, color: "#10b981" },
    { label: "Pending Amount", value: pendingPct, color: "#f97316" },
  ] : [
    { label: "No Records", value: 100, color: "#e2e8f0" }
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Payroll Summary</h3>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-purple-400"
          >
            {PAYROLL_PERIOD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-center mb-4">
        <DonutChart
          segments={segments}
          size={160}
          strokeWidth={14}
          label="Total Payroll"
          value={formatCurrency(totalPayroll)}
        />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600">Paid Amount</span>
          </div>
          <span className="text-xs font-semibold text-slate-900">{formatCurrency(paidAmount)} ({paidPct}%)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-xs text-slate-600">Pending Amount</span>
          </div>
          <span className="text-xs font-semibold text-slate-900">{formatCurrency(pendingAmount)} ({pendingPct}%)</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span>Employees Paid:</span>
          <span className="font-semibold text-slate-700">{paidSalaries.length} / {salaries.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          <span>Pending:</span>
          <span className="font-semibold text-amber-600">{pendingSalaries.length}</span>
        </div>
      </div>
    </Card>
  );
}
