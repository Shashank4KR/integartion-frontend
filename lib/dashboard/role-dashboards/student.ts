import {
  CalendarCheck,
  ClipboardList,
  FileBarChart,
  Wallet,
  Megaphone,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import type { RoleStat, RoleQuickAction, InfoRow, AttendanceBreakdown } from "./types";

export const studentStats: RoleStat[] = [
  {
    id: "attendance",
    label: "Attendance",
    value: "94%",
    change: "14 days present this month",
    icon: CalendarCheck,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    progress: 94,
  },
  {
    id: "assignments",
    label: "Pending Assignments",
    value: 3,
    change: "1 due tomorrow",
    icon: ClipboardList,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    id: "marks",
    label: "Average Marks",
    value: "82%",
    change: "+4% from last term",
    icon: FileBarChart,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "fees",
    label: "Fee Status",
    value: "₹12,000",
    change: "Due on 30 Jun",
    icon: Wallet,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
  },
];

import { FolderOpen } from "lucide-react";

export const studentQuickActions: RoleQuickAction[] = [
  { id: "timetable", label: "View Timetable", icon: CalendarClock, href: "/dashboard/student/timetable" },
  { id: "notes", label: "Chapter Notes", icon: FolderOpen, href: "/dashboard/student/notes" },
  { id: "assignment", label: "Submit Assignment", icon: ClipboardList, href: "/dashboard/student/assignments" },
  { id: "results", label: "Check Results", icon: FileBarChart, href: "/dashboard/student/results" },
  { id: "fees", label: "Pay Fees", icon: Wallet, href: "/dashboard/student/fees" },
];


export const todaysTimetable: InfoRow[] = [
  { id: "1", title: "Mathematics", description: "Room 201 · Mr. Rao", meta: "08:30 - 09:15", iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "English", description: "Room 201 · Ms. Nair", meta: "09:20 - 10:05", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { id: "3", title: "Science", description: "Lab 3 · Dr. Iyer", meta: "10:20 - 11:05", iconBg: "bg-green-50", iconColor: "text-green-500" },
  { id: "4", title: "Social Studies", description: "Room 201 · Mr. Das", meta: "11:10 - 11:55", iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { id: "5", title: "Computer Science", description: "Lab 1 · Ms. Roy", meta: "12:30 - 01:15", iconBg: "bg-pink-50", iconColor: "text-pink-500" },
];

export const pendingAssignments: InfoRow[] = [
  { id: "1", title: "Algebra Worksheet", description: "Mathematics · Mr. Rao", meta: "Due Tomorrow", badge: { label: "Urgent", variant: "error" } },
  { id: "2", title: "Essay: My City", description: "English · Ms. Nair", meta: "Due in 3 days", badge: { label: "Pending", variant: "warning" } },
  { id: "3", title: "Physics Lab Report", description: "Science · Dr. Iyer", meta: "Due in 5 days", badge: { label: "Pending", variant: "warning" } },
];

export const recentMarks: InfoRow[] = [
  { id: "1", title: "Mathematics Unit Test", description: "Score: 38/40", meta: "95%", badge: { label: "A+", variant: "success" } },
  { id: "2", title: "English Comprehension", description: "Score: 27/30", meta: "90%", badge: { label: "A", variant: "success" } },
  { id: "3", title: "Science Quiz", description: "Score: 17/25", meta: "68%", badge: { label: "B", variant: "warning" } },
];

export const studentNotices: InfoRow[] = [
  { id: "1", title: "Annual Sports Day", description: "Register by 20 Jun", meta: "2 days ago", icon: Megaphone, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "Library Book Return", description: "Return issued books this week", meta: "4 days ago", icon: Megaphone, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { id: "3", title: "Holiday Notice", description: "School closed on 25 Jun", meta: "1 week ago", icon: Megaphone, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
];

export const upcomingExams: InfoRow[] = [
  { id: "1", title: "Half-Yearly · Mathematics", description: "Syllabus: Ch 1-5", meta: "12 Jun", icon: CalendarClock, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: "2", title: "Half-Yearly · Science", description: "Syllabus: Physics & Chem", meta: "15 Jun", icon: CalendarClock, iconBg: "bg-green-50", iconColor: "text-green-500" },
  { id: "3", title: "Half-Yearly · English", description: "Syllabus: Full book", meta: "18 Jun", icon: CalendarClock, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
];

export const studentAttendanceBreakdown: AttendanceBreakdown[] = [
  { label: "Present", value: 94, color: "#10b981" },
  { label: "Absent", value: 4, color: "#ef4444" },
  { label: "Leave", value: 2, color: "#f59e0b" },
];
