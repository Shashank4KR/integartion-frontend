import {
  UserCircle,
  CheckCircle2,
  FileBarChart,
  Wallet,
  MessageSquare,
  Megaphone,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import type { RoleStat, RoleQuickAction, InfoRow, AttendanceBreakdown } from "./types";

export const parentStats: RoleStat[] = [
  {
    id: "child",
    label: "Child",
    value: "Aarav S.",
    change: "Class 10-A · Roll 12",
    icon: UserCircle,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    id: "attendance",
    label: "Attendance",
    value: "94%",
    change: "8 days present",
    icon: CheckCircle2,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
  {
    id: "marks",
    label: "Avg Marks",
    value: "82%",
    change: "+4% this term",
    icon: FileBarChart,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "fees",
    label: "Fee Due",
    value: "₹12,000",
    change: "Due on 30 Jun",
    icon: Wallet,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
  },
];

export const parentQuickActions: RoleQuickAction[] = [
  { id: "progress", label: "View Progress", icon: FileBarChart, href: "/dashboard/parent/progress" },
  { id: "fees", label: "Pay Fees", icon: Wallet, href: "/dashboard/parent/fees" },
  { id: "message", label: "Message Teacher", icon: MessageSquare, href: "/dashboard/parent/messages" },
  { id: "attendance", label: "View Attendance", icon: CheckCircle2, href: "/dashboard/parent/attendance" },
  { id: "notifications", label: "Notifications", icon: Megaphone, href: "/dashboard/parent/notifications" },
  { id: "events", label: "Events", icon: CalendarClock, href: "/dashboard/parent/events" },
];

export const childProfile: InfoRow[] = [
  { id: "1", title: "Aarav Sharma", description: "Class 10-A · Roll No. 12", meta: "Sec-A", iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "House", description: "Blue House", meta: "Captain", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { id: "3", title: "Bus Route", description: "Route 7 · Stop Sector 12", meta: "On time", iconBg: "bg-green-50", iconColor: "text-green-500" },
];

export const childAttendance: InfoRow[] = [
  { id: "1", title: "This Month", description: "Present 18 / 19 days", meta: "95%", badge: { label: "Good", variant: "success" } },
  { id: "2", title: "This Term", description: "Present 142 / 150 days", meta: "95%", badge: { label: "Good", variant: "success" } },
  { id: "3", title: "Last Absent", description: "Sick leave", meta: "3 Jun", badge: { label: "Leave", variant: "warning" } },
];

export const childMarks: InfoRow[] = [
  { id: "1", title: "Mathematics", description: "Unit Test 1", meta: "95%", badge: { label: "A+", variant: "success" } },
  { id: "2", title: "English", description: "Comprehension", meta: "90%", badge: { label: "A", variant: "success" } },
  { id: "3", title: "Science", description: "Quiz 2", meta: "68%", badge: { label: "B", variant: "warning" } },
];

export const feeDue: InfoRow[] = [
  { id: "1", title: "Term 2 Tuition Fee", description: "₹10,000", meta: "Due 30 Jun", badge: { label: "Pending", variant: "error" } },
  { id: "2", title: "Transport Fee", description: "₹2,000", meta: "Due 30 Jun", badge: { label: "Pending", variant: "error" } },
  { id: "3", title: "Term 1 (Paid)", description: "₹12,000", meta: "Paid 10 Jan", badge: { label: "Paid", variant: "success" } },
];

export const teacherMessages: InfoRow[] = [
  { id: "1", title: "Ms. Nair (English)", description: "Aarav did well in essay", meta: "1 day ago", icon: MessageSquare, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "Mr. Rao (Math)", description: "Please revise geometry at home", meta: "2 days ago", icon: MessageSquare, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { id: "3", title: "Admin Office", description: "Fee reminder for Term 2", meta: "3 days ago", icon: MessageSquare, iconBg: "bg-pink-50", iconColor: "text-pink-500" },
];

export const parentNotices: InfoRow[] = [
  { id: "1", title: "PTM Scheduled", description: "22 Jun · 10:00 AM", meta: "2 days ago", icon: Megaphone, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "Exam Schedule Released", description: "Half-yearly from 12 Jun", meta: "4 days ago", icon: Megaphone, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { id: "3", title: "Summer Break", description: "School closes 25 Jun", meta: "1 week ago", icon: Megaphone, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
];

export const parentEvents: InfoRow[] = [
  { id: "1", title: "Half-Yearly Exam · Math", description: "Class 10-A", meta: "12 Jun", icon: CalendarClock, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "Parent Teacher Meeting", description: "Auditorium", meta: "22 Jun", icon: CalendarClock, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { id: "3", title: "Annual Sports Day", description: "Ground", meta: "25 Jun", icon: CalendarClock, iconBg: "bg-green-50", iconColor: "text-green-500" },
];

export const childAttendanceBreakdown: AttendanceBreakdown[] = [
  { label: "Present", value: 94, color: "#10b981" },
  { label: "Absent", value: 4, color: "#ef4444" },
  { label: "Leave", value: 2, color: "#f59e0b" },
];
