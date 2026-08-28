"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import CommunicationsAnnouncementsPageHeader from "@/components/dashboard/communication/CommunicationsAnnouncementsPageHeader";
import CommunicationSummaryCards from "@/components/dashboard/communication/CommunicationSummaryCards";
import CommunicationActionCards from "@/components/dashboard/communication/CommunicationActionCards";
import RecentConversationsCard from "@/components/dashboard/communication/RecentConversationsCard";
import AnnouncementsCircularsCard from "@/components/dashboard/communication/AnnouncementsCircularsCard";
import CommunicationQuickFilters from "@/components/dashboard/communication/CommunicationQuickFilters";
import CommunicationTemplates from "@/components/dashboard/communication/CommunicationTemplates";
import NewMessageDialog from "@/components/dashboard/communication/NewMessageDialog";
import SendNotificationDialog from "@/components/dashboard/communication/SendNotificationDialog";
import CreateAnnouncementDialog from "@/components/dashboard/communication/CreateAnnouncementDialog";
import CommunicationActionDialog from "@/components/dashboard/communication/CommunicationActionDialog";
import ConversationPreviewDialog from "@/components/dashboard/communication/ConversationPreviewDialog";
import AnnouncementDetailsDialog from "@/components/dashboard/communication/AnnouncementDetailsDialog";
import TemplateEditorDialog from "@/components/dashboard/communication/TemplateEditorDialog";
import { getToken } from "@/lib/auth";
import { getCommunicationStats, listAnnouncements, listMessages } from "@/lib/services/communicationService";

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "send-message",
    title: "Send Message",
    description: "Send messages to students, parents or staff",
    icon: "send-message",
    iconBg: "bg-purple-50",
  },
  {
    id: "send-email",
    title: "Send Email",
    description: "Compose and send emails",
    icon: "send-email",
    iconBg: "bg-emerald-50",
  },
  {
    id: "send-sms",
    title: "Send SMS",
    description: "Send SMS to any contact",
    icon: "send-sms",
    iconBg: "bg-blue-50",
  },
  {
    id: "send-notification",
    title: "Send Notification",
    description: "Send push notifications",
    icon: "send-notification",
    iconBg: "bg-orange-50",
  },
  {
    id: "create-announcement",
    title: "Create Announcement",
    description: "Publish announcements",
    icon: "create-announcement",
    iconBg: "bg-purple-50",
  },
  {
    id: "create-circular",
    title: "Create Circular",
    description: "Create and share circulars",
    icon: "create-circular",
    iconBg: "bg-pink-50",
  },
];

type Conversation = any;
type Announcement = any;
type Template = any;
type SummaryCard = any;
type QuickAction = any;

const TEMPLATES: Template[] = [];

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-IN");
}

function mapMessage(item: Record<string, unknown>): Conversation {
  const title = String(item.sender_name ?? item.receiver_name ?? item.sender_id ?? item.receiver_id ?? "Conversation");
  return {
    id: String(item.id),
    initials: title.slice(0, 2).toUpperCase(),
    title,
    preview: String(item.message ?? ""),
    time: formatDate(item.sent_on ?? item.created_at),
    unread: item.is_read === false ? 1 : undefined,
    avatarColor: "bg-purple-100 text-purple-700",
  };
}

function mapAnnouncement(item: Record<string, unknown>): Announcement {
  return {
    id: String(item.id),
    icon: "megaphone",
    iconBg: "bg-emerald-50",
    title: String(item.title ?? "Untitled announcement"),
    badge: "Announcement",
    badgeColor: "text-emerald-700",
    badgeBg: "bg-emerald-50",
    description: String(item.message ?? ""),
    date: formatDate(item.created_at),
    author: String(item.created_by ?? "Admin"),
  };
}

export default function CommunicationsAnnouncementsPage() {
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [sendNotificationOpen, setSendNotificationOpen] = useState(false);
  const [createAnnouncementOpen, setCreateAnnouncementOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const [dateRange, setDateRange] = useState("This Month");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const loadCommunication = async () => {
    const token = getToken();
    if (!token) {
      setLoadError("Please log in to view communication records.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const [messages, announcementRows, stats] = await Promise.all([
        listMessages(token),
        listAnnouncements(token),
        getCommunicationStats(token),
      ]);
      setConversations(messages.map((item) => mapMessage(item as Record<string, unknown>)));
      setAnnouncements(announcementRows.map((item) => mapAnnouncement(item as Record<string, unknown>)));
      setSummaryCards([
        {
          title: "Total Messages Sent",
          value: String(stats.total_messages ?? messages.length),
          footer: "Loaded from communication API",
          iconBg: "bg-purple-50",
          iconColor: "text-[#7c3aed]",
          sparkline: [],
          sparkColor: "#7c3aed",
        },
        {
          title: "Emails Sent",
          value: "0",
          footer: "No email channel records",
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-500",
          sparkline: [],
          sparkColor: "#10b981",
        },
        {
          title: "SMS Sent",
          value: "0",
          footer: "No SMS channel records",
          iconBg: "bg-blue-50",
          iconColor: "text-blue-500",
          sparkline: [],
          sparkColor: "#3b82f6",
        },
        {
          title: "Notifications Sent",
          value: String(stats.total_notifications ?? 0),
          footer: "Loaded from communication API",
          iconBg: "bg-orange-50",
          iconColor: "text-orange-500",
          sparkline: [],
          sparkColor: "#f97316",
        },
        {
          title: "Delivery Rate",
          value: `${Number(stats.delivery_rate ?? 0)}%`,
          footer: "Loaded from communication API",
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-500",
          sparkline: [],
          sparkColor: "#10b981",
        },
      ]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load communication records.");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string) => {
    const toast = document.createElement("div");
    toast.className = "fixed bottom-6 right-6 z-[200] rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-2xl";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const handleActionCard = (actionId: string) => {
    const actionTitles: Record<string, string> = {
      "send-message": "Send Message",
      "send-email": "Send Email",
      "send-sms": "Send SMS",
      "send-notification": "Send Notification",
      "create-announcement": "Create Announcement",
      "create-circular": "Create Circular",
    };

    if (actionId === "send-message" || actionId === "send-email" || actionId === "send-sms") {
      setNewMessageOpen(true);
    } else if (actionId === "send-notification") {
      setSendNotificationOpen(true);
    } else if (actionId === "create-announcement") {
      setCreateAnnouncementOpen(true);
    } else {
      setActionDialog({
        open: true,
        title: actionTitles[actionId] || actionId,
        message: `The "${actionTitles[actionId] || actionId}" workflow will be connected to the backend in the integration phase.`,
      });
    }
  };

  const handleNewMessage = () => {
    setNewMessageOpen(true);
  };

  const handleSendNotification = () => {
    setSendNotificationOpen(true);
  };

  const handleMessageSend = () => {
    showToast("Message sent successfully");
  };

  const handleNotificationSend = () => {
    showToast("Notification sent successfully");
  };

  const handleAnnouncementCreated = () => {
    showToast("Announcement published successfully");
    void loadCommunication();
  };

  const handleMoreOptions = () => {
    setActionDialog({
      open: true,
      title: "More Options",
      message: "Export Communication View, Print Current View, and Communication Settings will be available here.",
    });
  };

  const handleViewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleViewAllConversations = () => {
    setActionDialog({
      open: true,
      title: "All Conversations",
      message: "A full conversation history view will be available here in a future update.",
    });
  };

  const handleViewAllAnnouncements = () => {
    setActionDialog({
      open: true,
      title: "All Announcements",
      message: "A full announcements and circulars view will be available here in a future update.",
    });
  };

  const handleApplyFilters = () => {
    showToast("Filters applied");
  };

  const handleUseTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setEditingTemplate(template);
      setTemplateEditorOpen(true);
    }
  };

  const handleEditTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setEditingTemplate(template);
      setTemplateEditorOpen(true);
    }
  };

  useEffect(() => {
    void loadCommunication();
  }, []);

  const handleTemplateSave = () => {
    showToast("Template saved successfully");
    setTemplateEditorOpen(false);
    setEditingTemplate(null);
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <CommunicationsAnnouncementsPageHeader
            onNewMessage={handleNewMessage}
            onSendNotification={handleSendNotification}
            onMoreOptions={handleMoreOptions}
          />

          {loadError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Loading communication records...
            </div>
          )}

          <CommunicationSummaryCards cards={summaryCards} />

          <CommunicationActionCards items={QUICK_ACTIONS} onAction={handleActionCard} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-1">
              <RecentConversationsCard
                conversations={conversations}
                onViewConversation={handleViewConversation}
                onViewAll={handleViewAllConversations}
              />
            </div>
            <div className="xl:col-span-1">
              <AnnouncementsCircularsCard
                announcements={announcements}
                onViewAnnouncement={handleViewAnnouncement}
                onViewAll={handleViewAllAnnouncements}
              />
            </div>
            <div className="xl:col-span-1 space-y-6">
              <CommunicationQuickFilters
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onApply={handleApplyFilters}
              />
              <CommunicationTemplates templates={TEMPLATES} onUse={handleUseTemplate} onEdit={handleEditTemplate} />
            </div>
          </div>

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2026 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>

      <NewMessageDialog open={newMessageOpen} onClose={() => setNewMessageOpen(false)} onSend={handleMessageSend} />

      <SendNotificationDialog open={sendNotificationOpen} onClose={() => setSendNotificationOpen(false)} onSend={handleNotificationSend} />

      <CreateAnnouncementDialog open={createAnnouncementOpen} onClose={() => setCreateAnnouncementOpen(false)} onCreated={handleAnnouncementCreated} />

      <CommunicationActionDialog
        open={actionDialog.open}
        onClose={() =>
          setActionDialog({ open: false, title: "", message: "" })
        }
        title={actionDialog.title}
        message={actionDialog.message}
      />

      <ConversationPreviewDialog
        open={!!selectedConversation}
        onClose={() => setSelectedConversation(null)}
        conversation={selectedConversation}
      />

      <AnnouncementDetailsDialog
        open={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        announcement={selectedAnnouncement}
      />

      <TemplateEditorDialog
        open={templateEditorOpen}
        onClose={() => {
          setTemplateEditorOpen(false);
          setEditingTemplate(null);
        }}
        templateName={editingTemplate?.title}
        onSave={handleTemplateSave}
      />
    </MainLayout>
  );
}
