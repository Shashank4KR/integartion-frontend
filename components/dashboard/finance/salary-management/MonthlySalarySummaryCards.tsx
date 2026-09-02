"use client";

import { Wallet, MinusCircle, Clock, CreditCard } from "lucide-react";
import Card from "@/components/shared/Card";
import type { SalaryRow } from "@/lib/fixtures/salary-management-reference-fixture";

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const iconMap: Record<string, React.ReactNode> = {
  wallet: <Wallet className="h-5 w-5" />,
  deduct: <MinusCircle className="h-5 w-5" />,
  clock: <Clock className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
};

interface MonthlySalarySummaryCardsProps {
  salaries?: SalaryRow[];
}

export default function MonthlySalarySummaryCards({ salaries = [] }: MonthlySalarySummaryCardsProps) {
  const totalBasic = salaries.reduce((sum, s) => sum + (Number(s.basicSalary) || 0), 0);
  const totalNet = salaries.reduce((sum, s) => sum + (Number(s.netSalary) || 0), 0);
  const totalAllowances = Math.max(0, totalNet - totalBasic);
  const totalDeductions = Math.max(0, totalBasic - totalNet);

  const cards = [
    {
      title: "Total Allowances",
      value: formatCurrency(totalAllowances),
      footer: "Computed from records",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      icon: "wallet",
    },
    {
      title: "Total Deductions",
      value: formatCurrency(totalDeductions),
      footer: "Computed from records",
      iconBg: "bg-pink-50",
      iconColor: "text-pink-500",
      icon: "deduct",
    },
    {
      title: "Active Staff",
      value: String(salaries.length),
      footer: "Payroll eligible",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      icon: "clock",
    },
    {
      title: "Net Disbursal",
      value: formatCurrency(totalNet),
      footer: "Total paid/payable",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      icon: "card",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="p-4">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.title}</span>
            <div className={`${card.iconBg} p-2 rounded-lg`}>
              <span className={card.iconColor}>{iconMap[card.icon]}</span>
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900">{card.value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{card.footer}</p>
        </Card>
      ))}
    </div>
  );
}
