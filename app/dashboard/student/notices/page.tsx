"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { listAnnouncements } from "@/lib/services/communicationService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, Megaphone } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  category?: string;
  date: string;
  priority?: "high" | "normal" | "low";
}

export default function StudentNoticesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const data = await listAnnouncements(token);
        const formatted: Notice[] = (data || []).map((notice: any) => ({
          id: notice.id || "",
          title: notice.title || "Notice",
          content: notice.content || notice.description || "",
          category: notice.category || "General",
          date: notice.created_at || notice.date || new Date().toISOString().split("T")[0],
          priority: notice.priority || "normal",
        }));

        // Sort by date descending
        formatted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotices(formatted);
        setError(null);
      } catch (err) {
        console.error("Error fetching notices:", err);
        setError(err instanceof Error ? err.message : "Failed to load notices");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [router]);

  const highPriorityNotices = notices.filter((n) => n.priority === "high");
  const normalNotices = notices.filter((n) => n.priority === "normal" || !n.priority);
  const lowPriorityNotices = notices.filter((n) => n.priority === "low");

  const getPriorityBg = (priority?: string) => {
    if (priority === "high") return "border-red-200 bg-red-50";
    if (priority === "low") return "border-slate-200 bg-slate-50";
    return "border-blue-200 bg-blue-50";
  };

  const getPriorityBadge = (priority?: string) => {
    if (priority === "high") return "bg-red-100 text-red-700";
    if (priority === "low") return "bg-slate-100 text-slate-700";
    return "bg-blue-100 text-blue-700";
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-purple-600" />
            Notices & Announcements
          </h1>
          <p className="text-slate-600 mt-1">See all student notices and announcements</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading notices...</p>
            </div>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {!loading && !error && notices.length === 0 && (
          <Card className="border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3 text-amber-700">
              <Megaphone className="h-5 w-5" />
              <p>No notices at the moment. Check back later for important announcements.</p>
            </div>
          </Card>
        )}

        {!loading && !error && notices.length > 0 && (
          <div className="space-y-6">
            {highPriorityNotices.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                    {highPriorityNotices.length}
                  </span>
                  Important Notices
                </h2>
                <div className="space-y-3">
                  {highPriorityNotices.map((notice) => (
                    <Card key={notice.id} className={`border-2 ${getPriorityBg(notice.priority)} hover:shadow-md transition`}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-slate-900">{notice.title}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityBadge(notice.priority)}`}>
                                {notice.priority ? notice.priority.toUpperCase() : "NORMAL"}
                              </span>
                              {notice.category && (
                                <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                                  {notice.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                            {formatDate(notice.date)}
                          </span>
                        </div>
                        {notice.content && (
                          <p className="text-sm text-slate-700 mt-4 leading-relaxed">
                            {notice.content.substring(0, 300)}
                            {notice.content.length > 300 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {normalNotices.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Notices</h2>
                <div className="space-y-3">
                  {normalNotices.map((notice) => (
                    <Card key={notice.id} className={`border ${getPriorityBg(notice.priority)} hover:shadow-md transition`}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-slate-900">{notice.title}</p>
                            {notice.category && (
                              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 mt-2">
                                {notice.category}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                            {formatDate(notice.date)}
                          </span>
                        </div>
                        {notice.content && (
                          <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                            {notice.content.substring(0, 300)}
                            {notice.content.length > 300 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {lowPriorityNotices.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Other Announcements</h2>
                <div className="space-y-3">
                  {lowPriorityNotices.map((notice) => (
                    <Card key={notice.id} className={`border ${getPriorityBg(notice.priority)} hover:shadow-md transition opacity-75`}>
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{notice.title}</p>
                            {notice.category && (
                              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 mt-2">
                                {notice.category}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                            {formatDate(notice.date)}
                          </span>
                        </div>
                        {notice.content && (
                          <p className="text-sm text-slate-700 mt-3 line-clamp-2">
                            {notice.content}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
