"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import CommunicationOverviewPageHeader from "@/components/dashboard/communication/CommunicationOverviewPageHeader";
import CommunicationOverviewSummaryCards from "@/components/dashboard/communication/CommunicationOverviewSummaryCards";
import Card from "@/components/shared/Card";
import CommunicationRecentHighlights from "@/components/dashboard/communication/CommunicationRecentHighlights";
import CommunicationDeliveryHealth from "@/components/dashboard/communication/CommunicationDeliveryHealth";
import CommunicationQuickNavigation from "@/components/dashboard/communication/CommunicationQuickNavigation";
import CommunicationOverviewDialogs from "@/components/dashboard/communication/CommunicationOverviewDialogs";
import { getToken } from "@/lib/auth";
import { getCommunicationStats } from "@/lib/services/communicationService";

type OverviewSummaryCard = any;
type HighlightItem = any;
type DeliveryHealthData = any;
type QuickNavigationItem = any;

const QUICK_NAVIGATION_ITEMS: QuickNavigationItem[] = [
  {
    title: "Messages & Announcements",
    description: "Manage conversations and published updates",
    icon: "message-square",
    iconBg: "bg-purple-50",
    iconColor: "text-[#7c3aed]",
    href: "/dashboard/admin/communication/communications-announcements",
  },
  {
    title: "Communication Statistics",
    description: "Review delivery and audience performance",
    icon: "bar-chart",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    href: "/dashboard/admin/communication/statistics",
  },
  {
    title: "Send Notification",
    description: "Send or schedule a notification",
    icon: "bell",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    action: "send-notification",
  },
  {
    title: "Templates",
    description: "Reuse communication templates",
    icon: "file-text",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    action: "templates",
  },
];

export default function CommunicationOverviewPage() {
  const [summaryCards, setSummaryCards] = useState<OverviewSummaryCard[]>([]);
  const [deliveryHealth, setDeliveryHealth] = useState<DeliveryHealthData>({
    rate: 0,
    delivered: 0,
    failed: 0,
    topChannel: "-",
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [createAnnouncementOpen, setCreateAnnouncementOpen] = useState(false);
  const [sendNotificationOpen, setSendNotificationOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const showToast = (message: string) => {
    const toast = document.createElement("div");
    toast.className = "fixed bottom-6 right-6 z-[200] rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-2xl";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const handleSendMessage = () => {
    showToast("Message sent successfully");
  };

  const handleAnnouncementCreated = () => {
    showToast("Announcement published successfully");
  };

  const handleSendNotification = () => {
    showToast("Notification sent successfully");
  };

  const handleUseTemplate = (templateId: string) => {
    showToast("Template opened for editing");
  };

  useEffect(() => {
    const loadStats = async () => {
      const token = getToken();
      if (!token) {
        setLoadError("Please log in to view communication statistics.");
        return;
      }

      try {
        setLoadError(null);
        const stats = await getCommunicationStats(token);
        setSummaryCards([
          {
            title: "Messages This Month",
            value: String(stats.total_messages ?? 0),
            footer: "Loaded from communication API",
            icon: "send",
            iconBg: "bg-purple-50",
            iconColor: "text-[#7c3aed]",
            sparkline: [],
            sparkColor: "#7c3aed",
          },
          {
            title: "Delivery Rate",
            value: `${Number(stats.delivery_rate ?? 0)}%`,
            footer: `${stats.delivered ?? 0} delivered`,
            icon: "check-circle",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            sparkline: [],
            sparkColor: "#10b981",
          },
          {
            title: "Unread Messages",
            value: String(stats.unread_messages ?? 0),
            footer: "Loaded from communication API",
            icon: "chat",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
            sparkline: [],
            sparkColor: "#3b82f6",
          },
          {
            title: "Published Updates",
            value: String(stats.total_announcements ?? 0),
            footer: "Announcements from database",
            icon: "megaphone",
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
            sparkline: [],
            sparkColor: "#f97316",
          },
        ]);
        setDeliveryHealth({
          rate: Number(stats.delivery_rate ?? 0),
          delivered: Number(stats.delivered ?? 0),
          failed: Number(stats.failed ?? 0),
          topChannel: "-",
        });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load communication statistics.");
      }
    };

    void loadStats();
  }, []);

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <CommunicationOverviewPageHeader
            onNewMessage={() => setNewMessageOpen(true)}
            onCreateAnnouncement={() => setCreateAnnouncementOpen(true)}
          />

          {loadError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          <CommunicationOverviewSummaryCards cards={summaryCards} />

          <Card className="mb-6 p-5">
            <p className="text-sm text-slate-600">No communication activity trend data available.</p>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <CommunicationRecentHighlights items={[]} />
            <CommunicationDeliveryHealth data={deliveryHealth} />
          </div>

          <CommunicationQuickNavigation
            items={QUICK_NAVIGATION_ITEMS}
            onSendNotification={() => setSendNotificationOpen(true)}
            onTemplates={() => setTemplatesOpen(true)}
          />

          <footer className="flex items-center justify-between py-4 px-6 text-xs text-slate-500 border-t border-slate-200 mt-6">
            <span>© 2026 EdTech Smart Campus ERP. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </footer>
        </div>
      </div>

      <CommunicationOverviewDialogs
        newMessageOpen={newMessageOpen}
        onCloseNewMessage={() => setNewMessageOpen(false)}
        onSendMessage={handleSendMessage}
        createAnnouncementOpen={createAnnouncementOpen}
        onCloseCreateAnnouncement={() => setCreateAnnouncementOpen(false)}
        onAnnouncementCreated={handleAnnouncementCreated}
        sendNotificationOpen={sendNotificationOpen}
        onCloseSendNotification={() => setSendNotificationOpen(false)}
        onSendNotification={handleSendNotification}
        templatesOpen={templatesOpen}
        onCloseTemplates={() => setTemplatesOpen(false)}
        onUseTemplate={handleUseTemplate}
      />
    </MainLayout>
  );
}
