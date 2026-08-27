"use client";

import { useEffect, useState } from "react";
import { getRecentActivities } from "@/lib/services/dashboardService";
import Card from "@/components/shared/Card";
import SectionHeader from "@/components/shared/SectionHeader";
import Modal from "@/components/shared/Modal";
import {
  Users,
  CheckCircle,
  Calendar,
  FileText,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const iconMap: { [key: string]: LucideIcon } = {
  Users,
  CheckCircle,
  Calendar,
  FileText,
  BookOpen,
};

const textColorMap: { [key: string]: string } = {
  "bg-purple-100": "text-purple-600",
  "bg-green-100": "text-green-600",
  "bg-yellow-100": "text-yellow-600",
  "bg-red-100": "text-red-600",
  "bg-blue-100": "text-blue-600",
};

interface ActivityItem {
  id: string;
  description: string;
  timeAgo: string;
  iconBg: string;
  icon: string;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getStyleForActivity(activity: string): { icon: string; iconBg: string } {
  const act = activity.toLowerCase();
  if (act.includes("student") || act.includes("admit") || act.includes("user")) {
    return { icon: "Users", iconBg: "bg-purple-100" };
  }
  if (act.includes("payment") || act.includes("fee") || act.includes("fine") || act.includes("pay")) {
    return { icon: "CheckCircle", iconBg: "bg-green-100" };
  }
  if (act.includes("timetable") || act.includes("schedule") || act.includes("event") || act.includes("meeting")) {
    return { icon: "Calendar", iconBg: "bg-yellow-100" };
  }
  if (act.includes("library") || act.includes("book") || act.includes("issue") || act.includes("return")) {
    return { icon: "BookOpen", iconBg: "bg-blue-100" };
  }
  return { icon: "FileText", iconBg: "bg-red-100" };
}

export default function RecentActivities() {
  const [open, setOpen] = useState(false);
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadActivities() {
      try {
        const rawLogs = await getRecentActivities();
        if (!mounted) return;

        const formatted = (rawLogs || []).map((log: any) => {
          const style = getStyleForActivity(log.activity);
          return {
            id: String(log.id),
            description: log.activity + (log.details ? `: ${log.details}` : ""),
            timeAgo: formatTimeAgo(log.activity_time || log.created_at),
            icon: style.icon,
            iconBg: style.iconBg,
          };
        });

        setActivitiesList(formatted);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadActivities();
    return () => {
      mounted = false;
    };
  }, []);

  const renderItem = (activity: ActivityItem, key: string) => {
    const IconComponent = iconMap[activity.icon as keyof typeof iconMap];
    const textColor = textColorMap[activity.iconBg] || "text-gray-600";

    return (
      <div
        key={key}
        className="flex items-start gap-4 border-b border-slate-100 py-3 last:border-0"
      >
        <div className={`${activity.iconBg} p-2.5 rounded-lg flex-shrink-0`}>
          {IconComponent && (
            <IconComponent className={`${textColor} w-4 h-4`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 break-words">
            {activity.description}
          </p>
          <p className="text-xs text-slate-500 mt-1">{activity.timeAgo}</p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div className="p-6">
        <SectionHeader
          title="Recent Activities"
          action={
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-purple-600 transition hover:bg-purple-50 hover:text-purple-700"
            >
              View All
            </button>
          }
        />

        {loading ? (
          <p className="text-sm text-slate-500 py-4">Loading activities...</p>
        ) : activitiesList.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No recent activities found.</p>
        ) : (
          <div className="space-y-4">
            {activitiesList.slice(0, 5).map((activity) => renderItem(activity, activity.id))}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="All Recent Activities"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {activitiesList.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No recent activities found.</p>
          ) : (
            activitiesList.map((activity) => renderItem(activity, activity.id))
          )}
        </div>
      </Modal>
    </Card>
  );
}
