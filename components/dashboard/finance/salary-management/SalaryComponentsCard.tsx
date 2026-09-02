"use client";

import { ChevronRight } from "lucide-react";
import Card from "@/components/shared/Card";
import type { SalaryRow } from "@/lib/fixtures/salary-management-reference-fixture";

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface SalaryComponentsCardProps {
  salaries?: SalaryRow[];
}

export default function SalaryComponentsCard({ salaries = [] }: SalaryComponentsCardProps) {
  const totalBasic = salaries.reduce((sum, s) => sum + (Number(s.basicSalary) || 0), 0);
  const totalNet = salaries.reduce((sum, s) => sum + (Number(s.netSalary) || 0), 0);
  const totalAllowances = Math.max(0, totalNet - totalBasic);
  const totalDeductions = Math.max(0, totalBasic - totalNet);
  const totalPayroll = Math.max(totalBasic, totalNet);

  const components = [
    {
      component: "Basic Salary",
      amount: formatCurrency(totalBasic),
      percentage: totalPayroll > 0 ? `${((totalBasic / totalPayroll) * 100).toFixed(1)}%` : "0%",
    },
    {
      component: "Allowances",
      amount: formatCurrency(totalAllowances),
      percentage: totalPayroll > 0 ? `${((totalAllowances / totalPayroll) * 100).toFixed(1)}%` : "0%",
    },
    {
      component: "Deductions",
      amount: formatCurrency(totalDeductions),
      percentage: totalPayroll > 0 ? `${((totalDeductions / totalPayroll) * 100).toFixed(1)}%` : "0%",
    },
    {
      component: "Net Payout",
      amount: formatCurrency(totalNet),
      percentage: totalPayroll > 0 ? `${((totalNet / totalPayroll) * 100).toFixed(1)}%` : "0%",
    },
  ];

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Salary Components</h3>
      {salaries.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No salary components recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Component</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (₹)</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">% of Payroll</th>
              </tr>
            </thead>
            <tbody>
              {components.map((row) => (
                <tr key={row.component} className="border-b border-slate-50">
                  <td className="px-3 py-2.5 text-xs font-medium text-slate-700">{row.component}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-semibold text-slate-900">{row.amount}</td>
                  <td className="px-3 py-2.5 text-right text-xs text-slate-600">{row.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button className="mt-3 text-xs font-semibold text-[#7c3aed] hover:underline flex items-center gap-1">
        View Full Payroll Report
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </Card>
  );
}
