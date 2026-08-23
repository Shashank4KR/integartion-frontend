import {
  Users2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileBarChart,
  MessageSquare,
  CalendarClock,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import type { RoleStat, RoleQuickAction, InfoRow } from "./types";

export const teacherStats: RoleStat[] = [
  {
    id: "classes",
    label: "Assigned Classes",
    value: 5,
    change: "180 students total",
    icon: Users2,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    id: "schedule",
    label: "Today's Periods",
    value: 6,
    change: "2 free periods",
    icon: CalendarDays,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "review",
    label: "To Review",
    value: 24,
    change: "Assignments pending",
    icon: ClipboardList,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    id: "avg",
    label: "Class Avg Marks",
    value: "78%",
    change: "+3% this term",
    icon: FileBarChart,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
];

import {
  FileText,
  FolderOpen,
  Link,
  UserCheck,
} from "lucide-react";

export const teacherQuickActions: RoleQuickAction[] = [
  { id: "attendance", label: "Mark Attendance", icon: CheckCircle2, href: "/dashboard/teacher/attendance" },
  { id: "assignment", label: "Create Assignment", icon: ClipboardList, href: "/dashboard/teacher/assignments" },
  { id: "notes", label: "Chapter Notes", icon: FolderOpen, href: "/dashboard/teacher/notes" },
  { id: "marks", label: "Enter Marks", icon: FileBarChart, href: "/dashboard/teacher/marks" },
  { id: "lesson_plans", label: "Lesson Plans", icon: FileText, href: "/dashboard/teacher/lesson-plans" },
  { id: "content", label: "Content Links", icon: Link, href: "/dashboard/teacher/content" },
  { id: "casestudy", label: "Student Case Study & Feedback", icon: Users2, href: "/dashboard/teacher/classes" },
  { id: "message", label: "Message Parents", icon: MessageSquare, href: "/dashboard/teacher/messages" },
];


export const assignedClasses: InfoRow[] = [
  { id: "1", title: "Class 10-A · Mathematics", description: "38 students · Room 201", meta: "Mon, Wed, Fri", iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "Class 10-B · Mathematics", description: "36 students · Room 202", meta: "Tue, Thu", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { id: "3", title: "Class 9-A · Mathematics", description: "40 students · Room 105", meta: "Mon, Thu", iconBg: "bg-green-50", iconColor: "text-green-500" },
  { id: "4", title: "Class 11-Sci · Calculus", description: "33 students · Room 301", meta: "Wed, Fri", iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { id: "5", title: "Class 12-Sci · Calculus", description: "33 students · Room 302", meta: "Tue, Fri", iconBg: "bg-pink-50", iconColor: "text-pink-500" },
];

export const todaysSchedule: InfoRow[] = [
  { id: "1", title: "Class 10-A", description: "Algebra · Room 201", meta: "08:30 - 09:15", iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "Class 10-B", description: "Geometry · Room 202", meta: "09:20 - 10:05", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { id: "3", title: "Free Period", description: "Staff room", meta: "10:20 - 11:05", iconBg: "bg-slate-100", iconColor: "text-slate-500" },
  { id: "4", title: "Class 11-Sci", description: "Calculus · Room 301", meta: "11:10 - 11:55", iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { id: "5", title: "Class 12-Sci", description: "Calculus · Room 302", meta: "12:30 - 01:15", iconBg: "bg-pink-50", iconColor: "text-pink-500" },
];

export const pendingReview: InfoRow[] = [
  { id: "1", title: "Class 10-A Algebra HW", description: "12 submissions", meta: "Due 12 Jun", badge: { label: "Pending", variant: "warning" } },
  { id: "2", title: "Class 9-A Geometry Test", description: "8 submissions", meta: "Due 14 Jun", badge: { label: "Pending", variant: "warning" } },
  { id: "3", title: "Class 10-B Project", description: "4 submissions", meta: "Due 18 Jun", badge: { label: "Urgent", variant: "error" } },
];

export const performanceOverview: InfoRow[] = [
  { id: "1", title: "Class 10-A", description: "Avg 82% · Top: Aarav", meta: "Good", badge: { label: "82%", variant: "success" } },
  { id: "2", title: "Class 10-B", description: "Avg 74% · Needs focus", meta: "Average", badge: { label: "74%", variant: "warning" } },
  { id: "3", title: "Class 11-Sci", description: "Avg 79% · Steady", meta: "Good", badge: { label: "79%", variant: "success" } },
];

export const teacherMessages: InfoRow[] = [
  { id: "1", title: "Mrs. Verma (Aarav's parent)", description: "Asked about exam schedule", meta: "10 min ago", icon: MessageSquare, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "Admin Office", description: "Marks entry deadline Fri", meta: "1 hour ago", icon: MessageSquare, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { id: "3", title: "Mr. Das", description: "Shared lesson plan", meta: "Yesterday", icon: MessageSquare, iconBg: "bg-green-50", iconColor: "text-green-500" },
];

export const teacherEvents: InfoRow[] = [
  { id: "1", title: "Staff Meeting", description: "Conference hall", meta: "11 Jun · 02:00 PM", icon: CalendarClock, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "PTM · Class 10", description: "School auditorium", meta: "22 Jun · 10:00 AM", icon: CalendarClock, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { id: "3", title: "Science Exhibition", description: "Lab block", meta: "28 Jun · 11:00 AM", icon: CalendarClock, iconBg: "bg-green-50", iconColor: "text-green-500" },
];
