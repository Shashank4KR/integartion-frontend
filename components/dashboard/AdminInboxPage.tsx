"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Bell, MessageSquare, RefreshCw, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import Header from "@/components/shared/layout/Header";
import { getToken } from "@/lib/auth";
import { listMessages, listNotifications, markAllNotificationsRead } from "@/lib/services/communicationService";

type InboxKind = "messages" | "notifications";

type InboxConfig = {
  title: string;
  emptyLabel: string;
  icon: LucideIcon;
  load: (token: string) => Promise<unknown[]>;
};

const inboxes: Record<InboxKind, InboxConfig> = {
  messages: { title: "Messages", emptyLabel: "No messages are available.", icon: MessageSquare, load: listMessages },
  notifications: { title: "Notifications", emptyLabel: "No notifications are available.", icon: Bell, load: listNotifications },
};

function readText(item: unknown, fields: string[], fallback: string): string {
  if (!item || typeof item !== "object") return fallback;
  const record = item as Record<string, unknown>;
  for (const field of fields) {
    const value = record[field];
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback;
}

function InboxRow({ item, kind }: { item: unknown; kind: InboxKind }) {
  const title = readText(item, kind === "messages" ? ["subject", "title", "sender_name"] : ["title", "subject", "type"], kind === "messages" ? "Message" : "Notification");
  const body = readText(item, ["body", "content", "message", "description"], "No additional details were provided.");
  const timestamp = readText(item, ["created_at", "sent_at", "timestamp", "date"], "");

  return <li className="border-b border-slate-100 px-5 py-4 last:border-0"><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-1 text-sm text-slate-600">{body}</p>{timestamp && <p className="mt-2 text-xs text-slate-400">{timestamp}</p>}</li>;
}

export default function AdminInboxPage({ kind }: { kind: InboxKind }) {
  const router = useRouter();
  const config = inboxes[kind];
  const Icon = config.icon;
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    try {
      if (kind === "notifications") {
        try {
          localStorage.setItem("edtech_notifications_viewed_at", new Date().toISOString());
          window.dispatchEvent(new CustomEvent("edtech_notifications_viewed"));
          void markAllNotificationsRead(token).catch(() => {});
        } catch {}
      } else {
        try {
          localStorage.setItem("edtech_messages_viewed_at", new Date().toISOString());
          window.dispatchEvent(new CustomEvent("edtech_messages_viewed"));
        } catch {}
      }

      setItems(await config.load(token));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Failed to load ${kind}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  let content: ReactNode;
  if (loading) content = <p className="p-6 text-sm text-slate-500">Loading {kind}…</p>;
  else if (error) content = <p role="alert" className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  else if (items.length === 0) content = <div className="grid min-h-64 place-items-center p-8 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-violet-100 text-violet-700"><Icon className="h-6 w-6" /></span><p className="mt-4 text-sm text-slate-500">{config.emptyLabel}</p></div></div>;
  else content = <ul>{items.map((item, index) => <InboxRow key={readText(item, ["id", "message_id", "notification_id"], String(index))} item={item} kind={kind} />)}</ul>;

  return <MainLayout sidebar={<Sidebar />} header={<Header />}><div className="mx-auto max-w-5xl p-6"><div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">{config.title}</h1><p className="mt-1 text-sm text-slate-500">Live updates from the communication service.</p></div><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Refresh</button></div><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{content}</section></div></MainLayout>;
}
