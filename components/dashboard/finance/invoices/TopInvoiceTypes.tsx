"use client";

import { useState, useMemo } from "react";
import { ChevronDown, FileText, User, Receipt, Layers } from "lucide-react";
import Card from "@/components/shared/Card";

const TOP_INVOICE_PERIOD_OPTIONS = ["This Month", "This Quarter", "This Academic Year"];

interface TopInvoiceTypesProps {
  invoices?: Array<{
    invoiceType?: string;
    amount?: number;
  }>;
}

export default function TopInvoiceTypes({ invoices = [] }: TopInvoiceTypesProps) {
  const [period, setPeriod] = useState("This Academic Year");

  const typeData = useMemo(() => {
    let feeSum = 0;
    let salarySum = 0;
    let expenseSum = 0;
    let otherSum = 0;

    invoices.forEach((inv) => {
      const amt = Number(inv.amount || 0);
      const t = String(inv.invoiceType || "").toLowerCase();
      if (t.includes("salary")) {
        salarySum += amt;
      } else if (t.includes("expense")) {
        expenseSum += amt;
      } else if (t.includes("fee") || t.includes("tuition") || t.includes("term")) {
        feeSum += amt;
      } else {
        otherSum += amt;
      }
    });

    const total = feeSum + salarySum + expenseSum + otherSum;

    // If invoices are loaded, show proportional live data
    const rows = [
      {
        label: "Fee Invoices",
        amount: `₹ ${feeSum.toLocaleString("en-IN")}`,
        rawAmount: feeSum,
        percentage: total > 0 ? Number(((feeSum / total) * 100).toFixed(1)) : 100,
        iconBg: "bg-purple-50",
        iconColor: "text-[#7c3aed]",
        barColor: "bg-[#7c3aed]",
        icon: "fee",
      },
      {
        label: "Salary Invoices",
        amount: `₹ ${salarySum.toLocaleString("en-IN")}`,
        rawAmount: salarySum,
        percentage: total > 0 ? Number(((salarySum / total) * 100).toFixed(1)) : 0,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        barColor: "bg-emerald-500",
        icon: "salary",
      },
      {
        label: "Expense Invoices",
        amount: `₹ ${expenseSum.toLocaleString("en-IN")}`,
        rawAmount: expenseSum,
        percentage: total > 0 ? Number(((expenseSum / total) * 100).toFixed(1)) : 0,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        barColor: "bg-amber-500",
        icon: "expense",
      },
      {
        label: "Other Invoices",
        amount: `₹ ${otherSum.toLocaleString("en-IN")}`,
        rawAmount: otherSum,
        percentage: total > 0 ? Number(((otherSum / total) * 100).toFixed(1)) : 0,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        barColor: "bg-blue-500",
        icon: "other",
      },
    ];

    return { rows, total };
  }, [invoices]);

  const iconMap: Record<string, React.ReactNode> = {
    fee: <FileText className="h-4 w-4" />,
    salary: <User className="h-4 w-4" />,
    expense: <Receipt className="h-4 w-4" />,
    other: <Layers className="h-4 w-4" />,
  };

  return (
    <Card className="p-5 border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Invoices by Category</h3>
          <p className="text-xs text-slate-500 mt-0.5">Billed amount volume by invoice type</p>
        </div>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 pr-7 text-xs font-semibold text-slate-700 outline-none focus:border-[#7c3aed]"
          >
            {TOP_INVOICE_PERIOD_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {typeData.rows.map((row) => (
          <div key={row.label} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`${row.iconBg} ${row.iconColor} p-1.5 rounded-md`}>
                  {iconMap[row.icon]}
                </div>
                <span className="text-xs font-bold text-slate-800">{row.label}</span>
              </div>
              <span className="text-xs font-bold text-slate-500">{row.percentage}%</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 mb-2">{row.amount}</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className={`${row.barColor} h-1.5 rounded-full transition-all`}
                style={{ width: `${Math.min(100, Math.max(row.rawAmount > 0 ? 8 : 0, row.percentage))}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
