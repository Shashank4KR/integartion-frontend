"use client";

import { ArrowRight } from "lucide-react";
import Card from "@/components/shared/Card";
import type { DonutSegment } from "@/lib/fixtures/communication-statistics-reference-fixture";

interface NotificationSummaryCardProps {
  period: string;
  segments: DonutSegment[];
  total: number;
  onViewReport: () => void;
}

const DonutChart = ({
  segments,
  total,
  size = 150,
  strokeWidth = 14,
}: {
  segments: DonutSegment[];
  total: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapSize = 6;
  const totalAvailable = circumference - segments.length * gapSize;

  let cumulativeArc = 0;
  const safeTotal = total > 0 ? total : 1;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={strokeWidth}
      />
      {segments.map((segment, i) => {
        const segmentArc = (segment.value / safeTotal) * totalAvailable;
        const offset = cumulativeArc + i * gapSize;
        cumulativeArc += segmentArc;

        return (
          <circle
            key={segment.label}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segmentArc} ${circumference - segmentArc}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${center} ${center})`}
            strokeLinecap="butt"
          />
        );
      })}
      <text
        x={center}
        y={center - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size > 120 ? "26" : "20"}
        fontWeight="bold"
        fill="#0f172a"
      >
        {total.toLocaleString()}
      </text>
      <text
        x={center}
        y={center + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size > 120 ? "11" : "9"}
        fill="#64748b"
      >
        Total
      </text>
    </svg>
  );
};

export default function NotificationSummaryCard({
  period,
  segments,
  total,
  onViewReport,
}: NotificationSummaryCardProps) {
  return (
    <Card className="p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Notification Summary ({period})
        </h2>
        <button
          type="button"
          onClick={onViewReport}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c3aed] hover:underline"
        >
          View Report
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <DonutChart segments={segments} total={total} />
        </div>
        <div className="flex-1 w-full">
          <div className="space-y-3">
            {segments.map((segment) => (
              <div
                key={segment.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {segment.label}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-900">
                    {segment.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 w-12 text-right">
                    {segment.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
