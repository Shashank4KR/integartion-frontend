"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Card from "@/components/shared/Card";
import type { SalaryRow } from "@/lib/fixtures/salary-management-reference-fixture";

const TOP_DEPARTMENTS_PERIOD_OPTIONS = ["This Month", "Last Month", "This Quarter", "This Year"];

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface TopDepartmentsByPayrollProps {
  salaries?: SalaryRow[];
}

export default function TopDepartmentsByPayroll({ salaries = [] }: TopDepartmentsByPayrollProps) {
  const [period, setPeriod] = useState("This Month");

  const deptMap = salaries.reduce<Record<string, number>>((acc, s) => {
    const dept = s.department && s.department !== "-" ? s.department : "General Staff";
    acc[dept] = (acc[dept] ?? 0) + (Number(s.basicSalary) || 0);
    return acc;
  }, {});

  const totalPayroll = Object.values(deptMap).reduce((sum, val) => sum + val, 0);

  const colors = [
    { color: "#7c3aed", bg: "bg-purple-50", text: "text-[#7c3aed]" },
    { color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-500" },
    { color: "#f97316", bg: "bg-orange-50", text: "text-orange-500" },
    { color: "#6366f1", bg: "bg-indigo-50", text: "text-indigo-500" },
    { color: "#ec4899", bg: "bg-pink-50", text: "text-pink-500" },
    { color: "#3b82f6", bg: "bg-blue-50", text: "text-blue-500" },
  ];

  const deptList = Object.entries(deptMap).map(([dept, amount], i) => {
    const theme = colors[i % colors.length];
    const percentage = totalPayroll > 0 ? Number(((amount / totalPayroll) * 100).toFixed(1)) : 0;
    return {
      label: dept,
      amount: formatCurrency(amount),
      percentage,
      color: theme.color,
      iconBg: theme.bg,
      iconColor: theme.text,
    };
  });

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Top Departments by Payroll</h3>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-purple-400"
          >
            {TOP_DEPARTMENTS_PERIOD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {deptList.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No department payroll records found.
        </div>
      ) : (
        <div className="space-y-4">
          {deptList.map((dept) => (
            <div key={dept.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`h-6 w-6 rounded-md flex items-center justify-center ${dept.iconBg}`}>
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: dept.color }} />
                  </span>
                  <span className="text-xs font-medium text-slate-700">{dept.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-900">{dept.amount}</span>
                  <span className="text-[11px] text-slate-500 ml-1">{dept.percentage}%</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${dept.percentage}%`, backgroundColor: dept.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
