"use client";

import { useEffect, useState } from "react";
import Card from "@/components/shared/Card";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/lib/services/dashboardService";
import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const iconMap: { [key: string]: LucideIcon } = {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function StatsCards() {
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

  if (loading) {
    return (
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Loading dashboard statistics...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
        {error ?? "No dashboard statistics available yet."}
      </div>
    );
  }

  const cards = [
    {
      id: "students",
      title: "Total Students",
      value: stats.total_students.toLocaleString(),
      change: `${stats.total_students > 0 ? "Live" : "No"} student records`,
      icon: "Users",
      backgroundColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      id: "teachers",
      title: "Total Teachers",
      value: stats.total_teachers.toLocaleString(),
      change: "Live backend count",
      icon: "Users",
      backgroundColor: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      id: "classes",
      title: "Total Classes",
      value: stats.total_classes.toLocaleString(),
      change: "Live backend count",
      icon: "GraduationCap",
      backgroundColor: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      id: "subjects",
      title: "Total Subjects",
      value: stats.total_subjects.toLocaleString(),
      change: "Live backend count",
      icon: "BookOpen",
      backgroundColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      id: "fees",
      title: "Fees Collected",
      value: formatCurrency(stats.total_fees_collected),
      change: `Outstanding ${formatCurrency(stats.outstanding_fees)}`,
      icon: "Wallet",
      backgroundColor: "bg-pink-50",
      iconColor: "text-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => {
        const IconComponent = iconMap[card.icon as keyof typeof iconMap];

        return (
          <Card key={card.id} hover>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">{card.title}</span>
                {IconComponent && (
                  <div className={`${card.backgroundColor} p-2 rounded-lg`}>
                    <IconComponent className={`${card.iconColor} w-5 h-5`} />
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">{card.change}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
