"use client";

import { useState } from "react";

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  unit?: "currency" | "percent" | "number";
}

export default function BarChart({
  data,
  color = "#7c3aed",
  height = 190,
  unit = "currency",
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-medium text-slate-400"
        style={{ height }}
      >
        No chart data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const niceMax =
    maxValue > 0
      ? maxValue > 10000
        ? Math.ceil(maxValue / 5000) * 5000
        : maxValue > 100
        ? Math.ceil(maxValue / 100) * 100
        : Math.ceil(maxValue / 10) * 10
      : 100;

  const yTicks = [1, 0.75, 0.5, 0.25, 0];

  const formatTick = (v: number): string => {
    if (unit === "percent") return `${Math.round(v)}%`;
    if (unit === "number") return v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${Math.round(v)}`;
    if (v >= 1000000) return `₹${(v / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return `₹${Math.round(v)}`;
  };

  const formatTooltipValue = (v: number): string => {
    if (unit === "percent") return `${v}%`;
    if (unit === "number") return v.toLocaleString();
    return `INR ${v.toLocaleString("en-IN")}`;
  };

  return (
    <div className="w-full flex flex-col justify-between font-sans select-none" style={{ height }}>
      {/* Chart Canvas Area */}
      <div className="relative flex-1 flex">
        {/* Y-Axis Labels */}
        <div className="w-14 flex flex-col justify-between items-end pr-2.5 py-1 text-[11px] font-medium text-slate-400">
          {yTicks.map((t) => (
            <span key={t} className="leading-none tracking-tight">
              {formatTick(t * niceMax)}
            </span>
          ))}
        </div>

        {/* Grid and Bars Area */}
        <div className="relative flex-1 h-full">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
            {yTicks.map((t) => (
              <div key={t} className="w-full border-b border-slate-100/90" />
            ))}
          </div>

          {/* Bars Flex Container */}
          <div className="absolute inset-0 flex items-end justify-around px-2 pt-2">
            {data.map((item, idx) => {
              const heightPct = niceMax > 0 ? (item.value / niceMax) * 100 : 0;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={item.label}
                  className="relative flex-1 flex flex-col items-center justify-end h-full group max-w-[56px] cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-9 z-20 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xl pointer-events-none transition-all animate-in fade-in zoom-in-95">
                      <span className="text-purple-300 font-bold">{item.label}: </span>
                      {formatTooltipValue(item.value)}
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    className="w-full max-w-[38px] rounded-t-lg transition-all duration-300 ease-out"
                    style={{
                      height: `${Math.max(heightPct, 2.5)}%`,
                      backgroundColor: isHovered ? "#6d28d9" : color,
                      opacity: hoveredIndex !== null && !isHovered ? 0.65 : 1,
                      boxShadow: isHovered
                        ? "0 4px 14px 0 rgba(124, 58, 237, 0.35)"
                        : "none",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="flex pl-14 pr-2 pt-2.5 border-t border-slate-100">
        <div className="flex-1 flex justify-around">
          {data.map((item, idx) => (
            <div
              key={item.label}
              className="flex-1 max-w-[56px] text-center"
            >
              <span
                className={`text-[11px] font-semibold tracking-wide transition-colors ${
                  hoveredIndex === idx ? "text-purple-700 font-bold" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
