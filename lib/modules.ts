import { type LucideIcon } from "lucide-react";
import {
  Users,
  Briefcase,
  BookOpen,
  CalendarClock,
  CheckCircle,
  ClipboardList,
  DollarSign,
  MessageSquare,
  Library,
  Truck,
  Building2,
  BarChart3,
  Settings,
  ShieldCheck,
  UserCheck,
  Link2,
} from "lucide-react";

export type ModuleCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bg: string;
};

export const MODULES: ModuleCard[] = [
  {
    title: "Student Management",
    description: "Manage student admissions, profiles and academic information.",
    icon: Users,
    href: "/dashboard/admin/students",
    color: "#6d28d9",
    bg: "#f5f3ff",
  },
  {
    title: "Parents Management",
    description: "Manage parent profiles, credentials and contact information.",
    icon: UserCheck,
    href: "/dashboard/admin/parents",
    color: "#7c3aed",
    bg: "#faf5ff",
  },
  {
    title: "Parent-Student Mapping",
    description: "Link students with their respective parents and guardians.",
    icon: Link2,
    href: "/dashboard/admin/parent-students",
    color: "#9333ea",
    bg: "#fdf4ff",
  },
  {
    title: "Employee Management",
    description: "Manage teaching and non-teaching staff, roles and departments.",
    icon: Briefcase,
    href: "/dashboard/admin/teachers",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    title: "Academic Management",
    description: "Manage courses, classes, sections, subjects and curriculum.",
    icon: BookOpen,
    href: "/dashboard/admin/academics/classes",
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    title: "Timetable Management",
    description: "Create and organize class schedules, periods and timetables.",
    icon: CalendarClock,
    href: "/dashboard/admin/academics/timetable",
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    title: "Attendance Management",
    description: "Track and manage student and faculty daily attendance.",
    icon: CheckCircle,
    href: "/dashboard/admin/academics/attendance",
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    title: "Examination Management",
    description: "Create exam terms, manage mark entries and generate report cards.",
    icon: ClipboardList,
    href: "/dashboard/admin/examinations",
    color: "#db2777",
    bg: "#fdf2f8",
  },
  {
    title: "Finance & Fee Management",
    description: "Manage fee structures, collections, expenses, invoices and salaries.",
    icon: DollarSign,
    href: "/dashboard/admin/finance/overview",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    title: "Communication Hub",
    description: "Send notices, messages, circulars and campus announcements.",
    icon: MessageSquare,
    href: "/dashboard/admin/communication",
    color: "#ea580c",
    bg: "#fff7ed",
  },
  {
    title: "Library Management",
    description: "Manage book catalog, categories, student borrowing and returns.",
    icon: Library,
    href: "/dashboard/admin/library",
    color: "#0d9488",
    bg: "#f0fdfa",
  },
  {
    title: "Transport Management",
    description: "Manage school vehicles, routes, drivers and student allocations.",
    icon: Truck,
    href: "/dashboard/admin/transport",
    color: "#c2410c",
    bg: "#fff7ed",
  },
  {
    title: "Hostel Management",
    description: "Manage hostel rooms, student allocations, mess and maintenance.",
    icon: Building2,
    href: "/dashboard/admin/hostel",
    color: "#0e7490",
    bg: "#ecfeff",
  },
  {
    title: "Reports & Analytics",
    description: "Generate comprehensive academic, financial and institutional reports.",
    icon: BarChart3,
    href: "/dashboard/admin/reports",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    title: "Roles & Permissions",
    description: "Manage system roles, assign permissions, and control access.",
    icon: ShieldCheck,
    href: "/dashboard/admin/roles",
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    title: "System Settings",
    description: "Configure school profile, academic sessions and system preferences.",
    icon: Settings,
    href: "/dashboard/admin/settings",
    color: "#475569",
    bg: "#f8fafc",
  },
];

export type QuickAccess = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export const QUICK_ACCESS: QuickAccess[] = [
  { label: "Add Student", icon: Users, href: "/dashboard/admin/students" },
  { label: "Mark Attendance", icon: CheckCircle, href: "/dashboard/admin/academics/attendance" },
  { label: "Create Notice", icon: MessageSquare, href: "/dashboard/admin/communication/communications-announcements" },
  { label: "Collect Fees", icon: DollarSign, href: "/dashboard/admin/finance/fees-management" },
  { label: "View Reports", icon: BarChart3, href: "/dashboard/admin/reports" },
];
