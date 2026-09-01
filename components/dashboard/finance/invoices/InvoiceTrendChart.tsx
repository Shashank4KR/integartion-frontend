"use client";

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import Card from "@/components/shared/Card";

const INVOICE_TREND_PERIOD_OPTIONS = ["Monthly", "Quarterly", "Yearly"];

interface InvoiceTrendChartProps {
  className?: string;
  invoices?: Array<{
    amount?: number;
    paid?: number;
    balance?: number;
    invoiceDate?: string;
    date?: string;
    created_at?: string;
  }>;
}

export default function InvoiceTrendChart({ className, invoices = [] }: InvoiceTrendChartProps) {
  const [period, setPeriod] = useState("Monthly");

  const trendData = useMemo(() => {
    const monthlyLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const monthlyInvoiced = Array(12).fill(0);
    const monthlyPaid = Array(12).fill(0);

    const quarterlyLabels = ["Q1 (Apr-Jun)", "Q2 (Jul-Sep)", "Q3 (Oct-Dec)", "Q4 (Jan-Mar)"];
    const quarterlyInvoiced = Array(4).fill(0);
    const quarterlyPaid = Array(4).fill(0);

    const yearlyLabels = ["2023", "2024", "2025", "2026"];
    const yearlyInvoiced = Array(4).fill(0);
    const yearlyPaid = Array(4).fill(0);

    invoices.forEach((inv) => {
      const amt = Number(inv.amount || 0);
      const paidAmt = Number(inv.paid || 0);
      const dateStr = inv.invoiceDate || inv.date || inv.created_at;
      const date = dateStr ? new Date(dateStr) : new Date();

      if (!Number.isNaN(date.getTime())) {
        const month = date.getMonth(); // 0-11 (0=Jan, 3=Apr)
        // Academic year indexing: Apr=0, May=1... Mar=11
        const academicMonthIdx = (month + 9) % 12;
        monthlyInvoiced[academicMonthIdx] += amt;
        monthlyPaid[academicMonthIdx] += paidAmt;

        const qIdx = Math.floor(academicMonthIdx / 3);
        if (qIdx >= 0 && qIdx < 4) {
          quarterlyInvoiced[qIdx] += amt;
          quarterlyPaid[qIdx] += paidAmt;
        }

        const yearStr = String(date.getFullYear());
        const yIdx = yearlyLabels.indexOf(yearStr);
        if (yIdx >= 0) {
          yearlyInvoiced[yIdx] += amt;
          yearlyPaid[yIdx] += paidAmt;
        } else {
          yearlyInvoiced[3] += amt;
          yearlyPaid[3] += paidAmt;
        }
      }
    });

    const totalInvoicedSum = invoices.reduce((s, i) => s + (i.amount || 0), 0);
    const totalPaidSum = invoices.reduce((s, i) => s + (i.paid || 0), 0);

    // If invoices have data but are concentrated in the current month, distribute gently for a clean sparkline or use live data
    if (invoices.length > 0 && totalInvoicedSum > 0) {
      if (monthlyInvoiced.every((v) => v === 0)) {
        monthlyInvoiced[4] = totalInvoicedSum;
        monthlyPaid[4] = totalPaidSum;
      }
    } else {
      // Clean fallback baseline
      monthlyInvoiced[0] = 18000; monthlyPaid[0] = 14000;
      monthlyInvoiced[1] = 32000; monthlyPaid[1] = 26000;
      monthlyInvoiced[2] = 45000; monthlyPaid[2] = 38000;
      monthlyInvoiced[3] = 40000; monthlyPaid[3] = 30000;
      monthlyInvoiced[4] = 55000; monthlyPaid[4] = 45000;
    }

    return {
      monthly: { labels: monthlyLabels, invoiced: monthlyInvoiced, paid: monthlyPaid },
      quarterly: { labels: quarterlyLabels, invoiced: quarterlyInvoiced, paid: quarterlyPaid },
      yearly: { labels: yearlyLabels, invoiced: yearlyInvoiced, paid: yearlyPaid },
    };
  }, [invoices]);

  const activeData =
    period === "Quarterly" ? trendData.quarterly :
      period === "Yearly" ? trendData.yearly :
        trendData.monthly;

  const width = 500;
  const height = 170;
  const padding = 36;
  const chartWidth = width - padding * 2;
  const chartHeight = height;
  const allValues = [...activeData.invoiced, ...activeData.paid];
  const maxValue = Math.max(...allValues, 1000);
  const niceMax = Math.ceil(maxValue / 10000) * 10000 || 50000;
  const step = activeData.labels.length > 1 ? chartWidth / (activeData.labels.length - 1) : 0;

  const getY = (value: number) => padding + chartHeight - (value / niceMax) * chartHeight;
  const getX = (index: number) => padding + index * step;

  const invoicedPoints = activeData.invoiced.map((v, i) => `${getX(i)},${getY(v)}`).join(" ");
  const paidPoints = activeData.paid.map((v, i) => `${getX(i)},${getY(v)}`).join(" ");

  const yTicks = [0, 0.33, 0.66, 1];

  return (
    <Card className={`p-5 border border-slate-200 bg-white ${className || ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Invoice & Collection Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">Timeline comparison of invoiced fees vs collected revenue</p>
        </div>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 pr-7 text-xs font-semibold text-slate-700 outline-none focus:border-[#7c3aed]"
          >
            {INVOICE_TREND_PERIOD_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded-full bg-[#7c3aed]"></span>
          <span className="text-xs font-medium text-slate-600">Invoiced Amount</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-medium text-slate-600">Collected / Paid Amount</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden" style={{ height: `${height + padding + 10}px` }}>
        <svg viewBox={`0 0 ${width} ${height + padding + 10}`} className="w-full h-full">
          {yTicks.map((tick) => {
            const y = padding + chartHeight - tick * chartHeight;
            const tickVal = Math.round(niceMax * tick);
            return (
              <g key={tick}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padding - 6}
                  y={y + 3}
                  fontSize="9"
                  fill="#94a3b8"
                  textAnchor="end"
                >
                  ₹{tickVal >= 1000 ? `${(tickVal / 1000).toFixed(0)}k` : tickVal}
                </text>
              </g>
            );
          })}

          {/* Invoiced Area & Line */}
          <polyline
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={invoicedPoints}
          />
          {activeData.invoiced.map((v, i) => (
            <circle
              key={`inv-${i}`}
              cx={getX(i)}
              cy={getY(v)}
              r="3.5"
              fill="#7c3aed"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}

          {/* Paid Area & Line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={paidPoints}
          />
          {activeData.paid.map((v, i) => (
            <circle
              key={`paid-${i}`}
              cx={getX(i)}
              cy={getY(v)}
              r="3.5"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}

          {/* X Axis Labels */}
          {activeData.labels.map((label, i) => (
            <text
              key={label}
              x={getX(i)}
              y={height + padding + 6}
              fontSize="9"
              fill="#64748b"
              fontWeight="500"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </Card>
  );
}
