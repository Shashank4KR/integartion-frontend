"use client";

import { useState } from "react";
import { ChevronDown, Users, Bus, Armchair, TrendingUp } from "lucide-react";
import Card from "@/components/shared/Card";
import type { DonutSegment } from "@/lib/fixtures/transport-overview-reference-fixture";

export interface RouteDetail {
  id?: string;
  name: string;
  startPoint?: string;
  endPoint?: string;
  vehicleNo?: string;
  students: number;
  color?: string;
}

interface TransportSummaryChartProps {
  segments?: DonutSegment[];
  total?: number;
  totalStudents?: number;
  totalCapacity?: number;
  routes?: RouteDetail[];
}

const OVERVIEW_PERIOD_OPTIONS = ["Today", "This Week", "This Month"];

export default function TransportSummaryChart({
  segments = [],
  total,
  totalStudents,
  totalCapacity = 60,
  routes = [],
}: TransportSummaryChartProps) {
  const [period, setPeriod] = useState("This Month");
  const [isOpen, setIsOpen] = useState(false);

  const displayTotal = total ?? totalStudents ?? 0;
  const capacity = Math.max(displayTotal, totalCapacity || 60);
  const availableSeats = Math.max(0, capacity - displayTotal);
  const occupancyRate = capacity > 0 ? ((displayTotal / capacity) * 100).toFixed(1) : "0";

  const circumference = 2 * Math.PI * 54;
  const gap = 3;
  const totalValue = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const segmentsWithOffset = segments.map((segment, i) => {
    const prevOffset = segments.slice(0, i).reduce((sum, s) => sum + (s.value / totalValue) * circumference, 0);
    return { ...segment, offset: prevOffset };
  });

  return (
    <Card className="p-5 h-full flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Transport & Fleet Summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">Route passenger distribution and vehicle seat occupancy</p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              {period}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {isOpen && (
              <div className="absolute right-0 z-50 mt-2 min-w-max overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                {OVERVIEW_PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setPeriod(option);
                      setIsOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-purple-50 ${
                      option === period ? "font-semibold text-purple-700" : "text-slate-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Fleet Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Bus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">Total Capacity</p>
              <p className="text-sm font-bold text-slate-900">{capacity} <span className="text-[10px] font-normal text-slate-400">Seats</span></p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">Allocated</p>
              <p className="text-sm font-bold text-slate-900">{displayTotal} <span className="text-[10px] font-normal text-slate-400">Students</span></p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Armchair className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">Available</p>
              <p className="text-sm font-bold text-slate-900">{availableSeats} <span className="text-[10px] font-normal text-slate-400">Seats</span></p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">Occupancy</p>
              <p className="text-sm font-bold text-slate-900">{occupancyRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart and Route Breakdown */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
        {/* Donut Chart */}
        <div className="relative flex-shrink-0">
          <svg width="170" height="170" viewBox="0 0 180 180">
            {segments.length === 0 ? (
              <circle
                cx="90"
                cy="90"
                r="54"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="16"
              />
            ) : (
              segmentsWithOffset.map((segment) => {
                const percentage = segment.value / totalValue;
                const dashArrayLength = percentage * circumference - gap;

                return (
                  <circle
                    key={segment.label}
                    cx="90"
                    cy="90"
                    r="54"
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="16"
                    strokeDasharray={`${dashArrayLength} ${circumference}`}
                    strokeDashoffset={-segment.offset}
                    transform="rotate(-90 90 90)"
                    strokeLinecap="butt"
                  />
                );
              })
            )}
            <text x="90" y="82" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="bold" fill="#0f172a">
              {displayTotal.toLocaleString()}
            </text>
            <text x="90" y="104" textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#64748b">
              Total Students
            </text>
          </svg>
        </div>

        {/* Route Details Breakdown */}
        <div className="flex-1 w-full space-y-3">
          {routes.length > 0 ? (
            routes.map((route, idx) => {
              const routeColor = route.color || segments[idx]?.color || "#3b82f6";
              const percentage = displayTotal > 0 ? Math.round((route.students / displayTotal) * 100) : 0;
              return (
                <div key={route.name || idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: routeColor }} />
                      <span className="font-semibold text-slate-900">{route.name}</span>
                      {route.vehicleNo && route.vehicleNo !== "Unassigned" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          {route.vehicleNo}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-800">
                      {route.students} {route.students === 1 ? "student" : "students"} ({percentage}%)
                    </span>
                  </div>
                  {route.startPoint && route.endPoint && (
                    <p className="text-[11px] text-slate-500 mb-1.5 truncate">
                      {route.startPoint} ➔ {route.endPoint}
                    </p>
                  )}
                  <div className="h-1.5 w-full rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(percentage, 5)}%`,
                        backgroundColor: routeColor,
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : segments.length > 0 ? (
            segments.map((segment) => (
              <div key={segment.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: segment.color }} />
                  <span className="text-sm text-slate-600">{segment.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{segment.value}</span>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No routes or students registered yet.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
