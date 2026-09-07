"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentTeacher, getTeacherMessages, getTeacherClasses } from "@/lib/services/teacherService";
import { createAnnouncement, sendMessage, listAnnouncements } from "@/lib/services/communicationService";
import Card from "@/components/shared/Card";
import Badge from "@/components/shared/Badge";
import { Loader2, AlertCircle, CheckCircle2, MessageSquare, Send, Megaphone, Calendar, Users } from "lucide-react";

export default function TeacherMessagesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ id: string; class_name: string; section?: string }>>([]);

  const [activeTab, setActiveTab] = useState<"notice" | "inbox">("notice");

  // Announcement Form State
  const [noticeCategory, setNoticeCategory] = useState("HOMEWORK_UPDATE");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [targetClass, setTargetClass] = useState("");

  // Direct Message Form State
  const [recipient, setRecipient] = useState("PARENT");
  const [directMsgContent, setDirectMsgContent] = useState("");
  const [sendingDirect, setSendingDirect] = useState(false);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const storedToken = getToken();
        if (!storedToken) {
          router.replace("/login");
          return;
        }
        setToken(storedToken);

        const teacher = await getCurrentTeacher(storedToken);
        setTeacherId(teacher.id);

        const [clsList, loadedMsgs, loadedAnn] = await Promise.all([
          getTeacherClasses(storedToken, teacher.id).catch(() => []),
          getTeacherMessages(storedToken, teacher.id).catch(() => []),
          listAnnouncements(storedToken).catch(() => []),
        ]);

        setClasses(clsList);
        if (clsList.length > 0) setTargetClass(clsList[0].id);

        setMessages(loadedMsgs);
        setAnnouncements(loadedAnn);
      } catch (err: any) {
        setError(err?.message || "Failed to load messaging data.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      setError("Please fill in title and content.");
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        title: `[${noticeCategory.replace(/_/g, " ")}] ${noticeTitle.trim()}`,
        message: noticeContent.trim(),
        content: noticeContent.trim(),
        target_audience: "PARENTS",
        audience: "PARENTS",
        target_class_id: targetClass || null,
        announcement_type: noticeCategory,
      };

      const created = await createAnnouncement(token, payload);
      setSuccess("Notice broadcast sent successfully to parents!");
      setNoticeTitle("");
      setNoticeContent("");

      setAnnouncements((prev) => [created, ...prev]);
    } catch (err: any) {
      setError(err?.message || "Failed to send notice.");
    } finally {
      setSending(false);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMsgContent.trim()) {
      setError("Message text cannot be empty.");
      return;
    }

    setSendingDirect(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await sendMessage(token, {
        recipient_type: recipient,
        recipient: recipient,
        message: directMsgContent.trim(),
        content: directMsgContent.trim(),
      });

      setSuccess("Direct message sent successfully!");
      setDirectMsgContent("");
      setMessages((prev) => [created, ...prev]);
    } catch (err: any) {
      setError(err?.message || "Failed to send direct message.");
    } finally {
      setSendingDirect(false);
    }
  };

  if (loading) {
    return (
      <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
        <Card className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </Card>
      </RoleDashboardLayout>
    );
  }

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            Parent Communication & Notices
          </h1>
          <p className="text-slate-600 mt-1">Send updates, homework notices, reminders, and class announcements to parents.</p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </Card>
        )}

        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => { setActiveTab("notice"); setError(null); setSuccess(null); }}
            className={`py-2 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "notice"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Send Parent Notice / Update
          </button>
          <button
            onClick={() => { setActiveTab("inbox"); setError(null); setSuccess(null); }}
            className={`py-2 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "inbox"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Direct Messages ({messages.length})
          </button>
        </div>

        {activeTab === "notice" ? (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-600" />
                Broadcast Notice / Update
              </h2>

              <form onSubmit={handleSendNotice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notice Type *</label>
                    <select
                      value={noticeCategory}
                      onChange={(e) => setNoticeCategory(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="HOMEWORK_UPDATE">Homework Update</option>
                      <option value="DAILY_UPDATE">Daily Update</option>
                      <option value="ACADEMIC_UPDATE">Academic Update</option>
                      <option value="HOLIDAY_CLASS_NOTICE">Holiday / Class Notice</option>
                      <option value="ASSIGNMENT_REMINDER">Assignment Reminder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Class (Optional)</label>
                    <select
                      value={targetClass}
                      onChange={(e) => setTargetClass(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">All Assigned Classes</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name} {cls.section ? `(${cls.section})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title / Subject *</label>
                  <input
                    type="text"
                    placeholder="e.g. Maths Chapter 4 Homework & Due Date Reminder"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message Content *</label>
                  <textarea
                    rows={4}
                    placeholder="Write clear instructions or notice details for parents..."
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition cursor-pointer"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Broadcasting..." : "Broadcast Notice to Parents"}
                </button>
              </form>
            </Card>

            {/* Past Broadcast Notices List */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center justify-between">
                <span>Recent Broadcast Notices</span>
                <span className="text-xs font-normal text-slate-500">
                  {announcements.length} {announcements.length === 1 ? "notice" : "notices"}
                </span>
              </h2>

              {announcements.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No current data: No broadcast notices found.
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-lg border border-slate-200 hover:border-purple-300 transition bg-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h3 className="text-base font-semibold text-slate-900">{ann.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="info">
                            {ann.target_audience || "PARENTS"}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : "-"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{ann.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Direct Message Compose Card */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Send className="h-5 w-5 text-purple-600" />
                Compose Direct Message
              </h2>

              <form onSubmit={handleSendDirectMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Recipient Role</label>
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full md:w-1/2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="PARENT">Parents</option>
                    <option value="STUDENT">Students</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="TEACHER">Fellow Teachers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
                  <textarea
                    rows={3}
                    placeholder="Type your message here..."
                    value={directMsgContent}
                    onChange={(e) => setDirectMsgContent(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingDirect}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition cursor-pointer"
                >
                  {sendingDirect ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sendingDirect ? "Sending..." : "Send Message"}
                </button>
              </form>
            </Card>

            {/* Direct Messages List */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Inbox Messages ({messages.length})
              </h2>
              {messages.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No current data: No direct messages received.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {messages.map((msg) => (
                    <div key={msg.id} className="py-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">{msg.sender_name || "Sender"}</span>
                        <span className="text-xs text-slate-500">
                          {msg.sent_on ? new Date(msg.sent_on).toLocaleDateString() : "-"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
