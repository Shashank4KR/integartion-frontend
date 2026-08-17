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
import { listMessages } from "@/lib/services/communicationService";
import { MessageSquare } from "lucide-react";

type ParentMessage = {
  id: string;
  title: string;
  body: string;
  sender: string;
  date?: string;
  status?: string;
};

function mapMessage(item: any): ParentMessage {
  return {
    id: String(item.id ?? crypto.randomUUID()),
    title: String(item.subject ?? item.title ?? "Message"),
    body: String(item.body ?? item.message ?? item.content ?? ""),
    sender: String(item.sender_name ?? item.sender?.name ?? item.from_name ?? "School"),
    date: item.created_at ?? item.sent_at ?? item.date,
    status: item.status,
  };
}

export default function ParentMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await listMessages(token);
        if (!mounted) return;
        const formatted = (data ?? []).map(mapMessage);
        formatted.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
        setMessages(formatted);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load messages.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadMessages();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.parent}>
      <div className="space-y-6">
        <ParentPageHeader
          icon={MessageSquare}
          title="Messages"
          description="View school and teacher messages sent to your parent account."
        />

        {loading && <LoadingState label="Loading messages..." />}
        {error && <ErrorState message={error} />}

        {!loading && !error && messages.length === 0 && (
          <EmptyState icon={MessageSquare} message="No messages are available for this parent account." />
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((message) => (
              <Card key={message.id} className="p-6" hover>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{message.title}</p>
                    <p className="text-sm text-slate-600 mt-1">From {message.sender}</p>
                  </div>
                  {message.date && (
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(message.date).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
                {message.body && <p className="text-sm text-slate-700 leading-relaxed mt-4">{message.body}</p>}
                {message.status && (
                  <span className="inline-flex mt-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {message.status}
                  </span>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
