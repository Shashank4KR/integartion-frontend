"use client";

import { useMemo } from "react";
import Card from "@/components/shared/Card";
import DonutChart from "@/components/shared/charts/DonutChart";

interface InvoicesByStatusChartProps {
  invoices?: Array<{
    status?: string;
  }>;
}

export default function InvoicesByStatusChart({ invoices = [] }: InvoicesByStatusChartProps) {
  const data = useMemo(() => {
    let paid = 0;
    let partial = 0;
    let overdue = 0;
    let pending = 0;

    invoices.forEach((inv) => {
      const s = String(inv.status || "").toUpperCase();
      if (s === "PAID") {
        paid++;
      } else if (s === "PARTIAL") {
        partial++;
      } else if (s === "OVERDUE") {
        overdue++;
      } else {
        pending++;
      }
    });

    const total = invoices.length || (paid + partial + overdue + pending) || 1;
    const unpaidTotal = overdue + pending;

    const paidPct = Math.round((paid / total) * 100);
    const partialPct = Math.round((partial / total) * 100);
    const overduePct = Math.round((unpaidTotal / total) * 100);

    return {
      paid,
      partial,
      overdue: unpaidTotal,
      total: invoices.length,
      paidPct,
      partialPct,
      overduePct,
    };
  }, [invoices]);

  const segments = [
    { label: "Paid", value: data.paid || (data.total === 0 ? 1 : 0), color: "#10b981" },
    { label: "Partial", value: data.partial, color: "#f59e0b" },
    { label: "Pending/Overdue", value: data.overdue, color: "#ef4444" },
  ];

  return (
    <Card className="p-5 border border-slate-200 bg-white">
      <h3 className="text-base font-bold text-slate-900 mb-1">Invoices by Status</h3>
      <p className="text-xs text-slate-500 mb-4">Distribution of payment statuses</p>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <DonutChart
            segments={segments}
            value={data.total}
            label="Invoices"
            size={140}
            strokeWidth={14}
          />
        </div>
        <div className="space-y-3 flex-1 w-full">
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-emerald-950">Fully Paid</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-900">{data.paid}</span>
              <span className="text-[11px] text-emerald-700 ml-1">({data.paidPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-xs font-semibold text-amber-950">Partially Paid</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-900">{data.partial}</span>
              <span className="text-[11px] text-amber-700 ml-1">({data.partialPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/60 border border-rose-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-xs font-semibold text-rose-950">Pending / Overdue</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-rose-900">{data.overdue}</span>
              <span className="text-[11px] text-rose-700 ml-1">({data.overduePct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
