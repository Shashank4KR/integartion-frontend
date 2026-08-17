"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import Card from "@/components/shared/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ParentPageHeader,
} from "@/components/dashboard/parent/ParentModuleHelpers";
import { getToken } from "@/lib/auth";
import { listAnnouncements, listNotifications } from "@/lib/services/communicationService";
import { Bell } from "lucide-react";

type ParentNotification = {
  id: string;
  title: string;
  content: string;
  category?: string;
  priority?: string;
  date?: string;
};

function mapNotification(item: any): ParentNotification {
  return {
    id: String(item.id ?? crypto.randomUUID()),
    title: String(item.title ?? "Notification"),
    content: String(item.content ?? item.description ?? item.message ?? ""),
    category: item.category ?? item.type,
    priority: item.priority,
    date: item.created_at ?? item.published_at ?? item.date,
  };
}

function mapUserNotification(item: any): ParentNotification {
  return {
    id: String(item.id ?? crypto.randomUUID()),
    title: String(item.title ?? "Notification"),
    content: String(item.message ?? item.content ?? ""),
    category: "Notification",
    priority: item.is_read ? "low" : "normal",
    date: item.sent_on ?? item.created_at,
  };
}

function priorityClass(priority?: string): string {
  if (priority === "high") return "bg-red-50 text-red-700";
  if (priority === "low") return "bg-slate-100 text-slate-700";
  return "bg-blue-50 text-blue-700";
}

export default function ParentNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const [announcementData, notificationData] = await Promise.all([
          listAnnouncements(token),
          listNotifications(token),
        ]);
        if (!mounted) return;
        const formatted = [
          ...(announcementData ?? []).map(mapNotification),
          ...(notificationData ?? []).map(mapUserNotification),
        ];
        formatted.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
        setNotifications(formatted);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load notifications.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadNotifications();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.parent}>
      <div className="space-y-6">
        <ParentPageHeader
          icon={Bell}
          title="Notifications"
          description="View notices, circulars, and announcements available to your parent account."
        />

        {loading && <LoadingState label="Loading notifications..." />}
        {error && <ErrorState message={error} />}

        {!loading && !error && notifications.length === 0 && (
          <EmptyState icon={Bell} message="No notifications are available right now." />
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className="p-6" hover>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{notification.title}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {notification.category && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {notification.category}
                        </span>
                      )}
                      {notification.priority && (
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  {notification.date && (
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(notification.date).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
                {notification.content && (
                  <p className="text-sm text-slate-700 leading-relaxed mt-4">{notification.content}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
