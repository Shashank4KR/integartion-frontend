"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import Card from "@/components/shared/Card";
import SectionHeader from "@/components/shared/SectionHeader";
import Badge from "@/components/shared/Badge";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/lib/services/dashboardService";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FeesCollectionOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const dashboardStats = await getDashboardStats();
        if (!mounted) {
          return;
        }
        setStats(dashboardStats);
      } catch {
        if (mounted) {
          setStats({
            total_students: 0,
            total_teachers: 0,
            total_classes: 0,
            total_subjects: 0,
            total_fees_invoiced: 0,
            total_fees_collected: 0,
            outstanding_fees: 0,
            today_collection: 0,
            monthly_collection: 0,
            upcoming_events: 0,
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card>
      <div className="p-6">
        <SectionHeader title="Fees Collection Overview" />

        {loading ? (
          <p className="text-sm text-slate-600">Loading fee overview...</p>
        ) : error || !stats ? (
          <p className="text-sm text-slate-600">{error ?? "No fee data available."}</p>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-slate-600 text-sm mb-1">Total Collection</p>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(stats.total_fees_collected)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="success" icon={<TrendingUp className="w-3 h-3" />}>
                  {formatCurrency(stats.outstanding_fees)} outstanding
                </Badge>
              </div>
            </div>

            {/* Visual Progress Bar */}
            {(() => {
              const total = (stats.total_fees_collected || 0) + (stats.outstanding_fees || 0);
              const percentage = total > 0 ? Math.round(((stats.total_fees_collected || 0) / total) * 100) : (stats.total_fees_collected > 0 ? 100 : 0);
              return (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Collection Rate</span>
                    <span className="text-emerald-600 font-bold">{percentage}% Collected</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(percentage, stats.total_fees_collected > 0 ? 5 : 0))}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 flex items-center justify-between">
              <span>Invoiced: <strong className="text-slate-800">{formatCurrency(stats.total_fees_invoiced)}</strong></span>
              <span>Collected: <strong className="text-emerald-700">{formatCurrency(stats.total_fees_collected)}</strong></span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
