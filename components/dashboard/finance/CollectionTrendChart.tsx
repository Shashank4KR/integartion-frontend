"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import Dropdown from "@/components/shared/Dropdown";

const ZERO_TREND = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const TREND_PERIOD_OPTIONS = ["Monthly", "Quarterly", "Yearly"];

interface CollectionTrendChartProps {
  expected?: number[];
  collected?: number[];
}

export default function CollectionTrendChart({ expected, collected }: CollectionTrendChartProps) {
  const [period, setPeriod] = useState("Monthly");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const data = {
    expected: expected && expected.length > 0 ? expected : ZERO_TREND,
    collected: collected && collected.length > 0 ? collected : ZERO_TREND,
  };
  const labels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const width = 400;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = [...data.expected, ...data.collected];
  const maxValue = Math.max(...allValues, 10);
  const minValue = 0;

  const xStep = chartWidth / (data.expected.length - 1 || 1);

  const getX = (i: number) => padding.left + i * xStep;
  const getY = (v: number) => padding.top + chartHeight - ((v - minValue) / (maxValue - minValue)) * chartHeight;

  const yTicks = [0, Math.round(maxValue / 2), maxValue];

  const expectedPoints = data.expected.map((v, i) => ({ x: getX(i), y: getY(v) }));
  const collectedPoints = data.collected.map((v, i) => ({ x: getX(i), y: getY(v) }));

  const expectedLine = expectedPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const collectedLine = collectedPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const collectedArea = `0,${padding.top + chartHeight} ${collectedPoints.map((p) => `${p.x},${p.y}`).join(" ")} ${getX(data.collected.length - 1)},${padding.top + chartHeight}`;

  const hasData = allValues.some((v) => v > 0);

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Collection Trend</h3>
        <Dropdown
          value={period}
          options={TREND_PERIOD_OPTIONS}
          onChange={setPeriod}
          className="w-24"
        />
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-xs text-slate-400">
          <span>No collection trend data recorded yet.</span>
        </div>
      ) : (
        <div className="relative">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Grid lines */}
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={getY(tick)}
                  x2={width - padding.right}
                  y2={getY(tick)}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={getY(tick) + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* Area fill */}
            <polygon points={collectedArea} fill="#10b981" fillOpacity="0.08" />

            {/* Expected line (dashed) */}
            <polyline
              points={expectedLine}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Collected line */}
            <polyline
              points={collectedLine}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />

            {/* Data points */}
            {collectedPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={hoverIndex === i ? 5 : 3}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer transition-all"
              />
            ))}

            {/* X-axis labels */}
            {labels.map((label, i) => (
              <text
                key={label}
                x={getX(i)}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
              >
                {label}
              </text>
            ))}
          </svg>
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-slate-300 border-dashed inline-block" />
          <span className="text-xs text-slate-500">Expected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-xs text-slate-500">Collected</span>
        </div>
      </div>
    </Card>
  );
}
