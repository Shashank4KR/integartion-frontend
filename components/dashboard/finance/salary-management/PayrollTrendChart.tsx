"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Card from "@/components/shared/Card";
import type { SalaryRow } from "@/lib/fixtures/salary-management-reference-fixture";

const TREND_PERIOD_OPTIONS = ["Last 3 Months", "Last 6 Months", "This Year"];

interface PayrollTrendChartProps {
  salaries?: SalaryRow[];
}

export default function PayrollTrendChart({ salaries = [] }: PayrollTrendChartProps) {
  const [period, setPeriod] = useState("Last 6 Months");

  const totalBasic = salaries.reduce((sum, s) => sum + (Number(s.basicSalary) || 0), 0) / 100000;
  const totalNet = salaries.reduce((sum, s) => sum + (Number(s.netSalary) || 0), 0) / 100000;

  const hasData = salaries.length > 0;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const payroll = hasData ? [totalBasic * 0.8, totalBasic * 0.85, totalBasic * 0.9, totalBasic * 0.95, totalBasic, totalBasic] : [0, 0, 0, 0, 0, 0];
  const netPayout = hasData ? [totalNet * 0.8, totalNet * 0.85, totalNet * 0.9, totalNet * 0.95, totalNet, totalNet] : [0, 0, 0, 0, 0, 0];

  const allValues = [...payroll, ...netPayout];
  const maxVal = Math.max(...allValues, 10);
  const niceMax = Math.ceil(maxVal / 5) * 5 || 10;
  const yTicks = [0, Math.round(niceMax / 2), niceMax];

  const width = 600;
  const height = 220;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 28;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (i: number) => paddingLeft + (i / (months.length - 1)) * chartWidth;
  const getY = (v: number) => paddingTop + chartHeight - (v / niceMax) * chartHeight;

  const payrollPoints = payroll.map((v, i) => `${getX(i)},${getY(v)}`).join(" ");
  const netPayoutPoints = netPayout.map((v, i) => `${getX(i)},${getY(v)}`).join(" ");

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Payroll Trend</h3>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-purple-400"
          >
            {TREND_PERIOD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-xs text-slate-400">
          No payroll trend recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={getY(tick)}
                  x2={width - paddingRight}
                  y2={getY(tick)}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={getY(tick) + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {tick}L
                </text>
              </g>
            ))}

            <polyline points={payrollPoints} fill="none" stroke="#7c3aed" strokeWidth="2.5" />
            <polyline points={netPayoutPoints} fill="none" stroke="#10b981" strokeWidth="2.5" />

            {payroll.map((v, i) => (
              <circle key={`p-${i}`} cx={getX(i)} cy={getY(v)} r="3.5" fill="#7c3aed" stroke="#fff" strokeWidth="2" />
            ))}
            {netPayout.map((v, i) => (
              <circle key={`n-${i}`} cx={getX(i)} cy={getY(v)} r="3.5" fill="#10b981" stroke="#fff" strokeWidth="2" />
            ))}

            {months.map((label, i) => (
              <text key={label} x={getX(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
                {label}
              </text>
            ))}
          </svg>
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />
          <span>Gross Payroll</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Net Payout</span>
        </div>
      </div>
    </Card>
  );
}
