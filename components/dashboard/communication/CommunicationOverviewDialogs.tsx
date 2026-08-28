"use client";

import { useState } from "react";
import NewMessageDialog from "@/components/dashboard/communication/NewMessageDialog";
import SendNotificationDialog from "@/components/dashboard/communication/SendNotificationDialog";
import CreateAnnouncementDialog from "@/components/dashboard/communication/CreateAnnouncementDialog";
import Modal from "@/components/shared/Modal";
import type { Template } from "@/lib/fixtures/communications-announcements-reference-fixture";

const TEMPLATES: Template[] = [
  {
    id: "fee-reminder",
    icon: "bell",
    iconBg: "bg-purple-50",
    title: "Fee Reminder",
    channels: "Email / SMS",
  },
  {
    id: "holiday-notice",
    icon: "holiday",
    iconBg: "bg-blue-50",
    title: "Holiday Notice",
    channels: "Email / SMS",
  },
  {
    id: "exam-schedule",
    icon: "schedule",
    iconBg: "bg-emerald-50",
    title: "Exam Schedule",
    channels: "Email / SMS",
  },
  {
    id: "event-invitation",
    icon: "event",
    iconBg: "bg-pink-50",
    title: "Event Invitation",
    channels: "Email / SMS",
  },
];
import TemplateEditorDialog from "@/components/dashboard/communication/TemplateEditorDialog";

interface CommunicationOverviewDialogsProps {
  newMessageOpen: boolean;
  onCloseNewMessage: () => void;
  onSendMessage: () => void;
  createAnnouncementOpen: boolean;
  onCloseCreateAnnouncement: () => void;
  onAnnouncementCreated: () => void;
  sendNotificationOpen: boolean;
  onCloseSendNotification: () => void;
  onSendNotification: () => void;
  templatesOpen: boolean;
  onCloseTemplates: () => void;
  onUseTemplate: (templateId: string) => void;
}

export default function CommunicationOverviewDialogs({
  newMessageOpen,
  onCloseNewMessage,
  onSendMessage,
  createAnnouncementOpen,
  onCloseCreateAnnouncement,
  onAnnouncementCreated,
  sendNotificationOpen,
  onCloseSendNotification,
  onSendNotification,
  templatesOpen,
  onCloseTemplates,
  onUseTemplate,
}: CommunicationOverviewDialogsProps) {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);

  const handleUseTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setEditingTemplate(template);
      setTemplateEditorOpen(true);
    }
  };

  const handleTemplateSave = () => {
    setTemplateEditorOpen(false);
    setEditingTemplate(null);
    onCloseTemplates();
  };

  return (
    <>
      <NewMessageDialog
        open={newMessageOpen}
        onClose={onCloseNewMessage}
        onSend={onSendMessage}
      />

      <SendNotificationDialog
        open={sendNotificationOpen}
        onClose={onCloseSendNotification}
        onSend={onSendNotification}
      />

      <CreateAnnouncementDialog
        open={createAnnouncementOpen}
        onClose={onCloseCreateAnnouncement}
        onCreated={onAnnouncementCreated}
      />

      <Modal
        open={templatesOpen}
        onClose={onCloseTemplates}
        maxWidth="max-w-lg"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Templates</h2>
          <button
            onClick={onCloseTemplates}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => { onUseTemplate(template.id); onCloseTemplates(); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{template.title}</p>
                  <p className="text-xs text-slate-500">{template.channels}</p>
                </div>
                <span className="text-[#7c3aed] text-sm font-medium" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <TemplateEditorDialog
        open={templateEditorOpen}
        onClose={() => {
          setTemplateEditorOpen(false);
          setEditingTemplate(null);
        }}
        templateName={editingTemplate?.title}
        onSave={handleTemplateSave}
      />
    </>
  );
}
