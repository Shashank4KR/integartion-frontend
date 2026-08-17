"use client";

import { useEffect, useState } from "react";
import { Bell, MessageSquare, RefreshCw, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { listMessages, listNotifications } from "@/lib/services/communicationService";

type Role = "student" | "teacher" | "parent" | "accountant" | "librarian" | "warden";
type InboxKind = "messages" | "notifications";

const inboxes: Record<InboxKind, { title: string; emptyLabel: string; icon: LucideIcon; load: (token: string) => Promise<unknown[]> }> = {
  messages: { title: "Messages", emptyLabel: "No messages are available.", icon: MessageSquare, load: listMessages },
  notifications: { title: "Notifications", emptyLabel: "No notifications are available.", icon: Bell, load: listNotifications },
};

function text(item: unknown, fields: string[], fallback: string) {
  if (!item || typeof item !== "object") return fallback;
  const record = item as Record<string, unknown>;
  return fields.map((field) => record[field]).find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? fallback;
}

export default function RoleInboxPage({ role, kind }: { role: Role; kind: InboxKind }) {
  const router = useRouter();
  const config = inboxes[kind];
  const Icon = config.icon;
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const token = getToken();
    if (!token) return router.replace("/login");
    setLoading(true);
    try { setItems(await config.load(token)); setError(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : `Failed to load ${kind}.`); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  return <RoleDashboardLayout config={ROLE_CONFIGS[role]}><div className="mx-auto max-w-5xl"><div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">{config.title}</h1><p className="mt-1 text-sm text-slate-500">Live updates from the communication service.</p></div><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Refresh</button></div><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{loading ? <p className="p-6 text-sm text-slate-500">Loading {kind}…</p> : error ? <p role="alert" className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : items.length === 0 ? <div className="grid min-h-64 place-items-center p-8 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-violet-100 text-violet-700"><Icon className="h-6 w-6" /></span><p className="mt-4 text-sm text-slate-500">{config.emptyLabel}</p></div></div> : <ul>{items.map((item, index) => <li key={text(item, ["id", "message_id", "notification_id"], String(index))} className="border-b border-slate-100 px-5 py-4 last:border-0"><p className="text-sm font-semibold text-slate-900">{text(item, kind === "messages" ? ["subject", "title", "sender_name"] : ["title", "subject", "type"], kind === "messages" ? "Message" : "Notification")}</p><p className="mt-1 text-sm text-slate-600">{text(item, ["body", "content", "message", "description"], "No additional details were provided.")}</p><p className="mt-2 text-xs text-slate-400">{text(item, ["created_at", "sent_at", "timestamp", "date"], "")}</p></li>)}</ul>}</section></div></RoleDashboardLayout>;
}
