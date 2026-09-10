import { type LucideIcon } from "lucide-react";
import {
  Users,
  Briefcase,
  BookOpen,
  CalendarClock,
  CheckCircle,
  ClipboardList,
  Wallet,
  FileText,
  MessageSquare,
  Library,
  CalendarOff,
  Award,
  QrCode,
  Calendar,
  UserCheck,
  Truck,
  Building2,
  GraduationCap,
  BarChart3,
  Settings,
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
    description: "Manage student admission, profiles and information.",
    icon: Users,
    href: "/dashboard/admin/students",
    color: "#6d28d9",
    bg: "#f5f3ff",
  },
  {
    title: "Employee Management",
    description: "Manage staff, roles, departments and permissions.",
    icon: Briefcase,
    href: "/dashboard/admin/teachers",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    title: "Department Management",
    description: "Manage academic departments and faculty divisions.",
    icon: Building2,
    href: "/dashboard/admin/departments",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    title: "Academic Management",
    description: "Manage courses, classes, subjects and curriculum.",
    icon: BookOpen,
    href: "/dashboard/admin/academics",
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    title: "Timetable Management",
    description: "Create and manage class schedules and timetables.",
    icon: CalendarClock,
    href: "/dashboard/admin/academics/timetable",
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    title: "Attendance Management",
    description: "Track and manage student and staff attendance.",
    icon: CheckCircle,
    href: "/dashboard/admin/academics/attendance",
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    title: "Examination Management",
    description: "Create exams, schedules and manage results.",
    icon: ClipboardList,
    href: "/dashboard/admin/examinations",
    color: "#db2777",
    bg: "#fdf2f8",
  },
  {
    title: "Fee Management",
    description: "Manage fee structure, collections and payments.",
    icon: Wallet,
    href: "/dashboard/admin/finance/fees-management",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    title: "Assignment Management",
    description: "Create, assign and evaluate student assignments.",
    icon: FileText,
    href: "/dashboard/admin/assignments",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    title: "Communication",
    description: "Send notifications, messages and announcements.",
    icon: MessageSquare,
    href: "/dashboard/admin/communication",
    color: "#ea580c",
    bg: "#fff7ed",
  },
  {
    title: "Library Management",
    description: "Manage books, e-resources, issue and returns.",
    icon: Library,
    href: "/dashboard/admin/library",
    color: "#0d9488",
    bg: "#f0fdfa",
  },
  {
    title: "Leave Management",
    description: "Manage staff leave applications and approvals.",
    icon: CalendarOff,
    href: "/dashboard/admin/leave",
    color: "#e11d48",
    bg: "#fff1f2",
  },
  {
    title: "Certificate Management",
    description: "Generate and manage student and staff certificates.",
    icon: Award,
    href: "/dashboard/admin/certificates",
    color: "#ca8a04",
    bg: "#fefce8",
  },
  {
    title: "QR Attendance",
    description: "Mark and track attendance using QR codes.",
    icon: QrCode,
    href: "/dashboard/admin/qr-attendance",
    color: "#4f46e5",
    bg: "#eef2ff",
  },
  {
    title: "Calendar",
    description: "View important events and school calendar.",
    icon: Calendar,
    href: "/dashboard/admin/calendar",
    color: "#0284c7",
    bg: "#f0f9ff",
  },
  {
    title: "Visitor Management",
    description: "Track and manage visitor entries and logs.",
    icon: UserCheck,
    href: "/dashboard/admin/visitors",
    color: "#9333ea",
    bg: "#faf5ff",
  },
  {
    title: "Transport Management",
    description: "Manage vehicles, routes and transport staff.",
    icon: Truck,
    href: "/dashboard/admin/transport",
    color: "#c2410c",
    bg: "#fff7ed",
  },
  {
    title: "Hostel Management",
    description: "Manage hostel rooms, students and wardens.",
    icon: Building2,
    href: "/dashboard/admin/hostel",
    color: "#0e7490",
    bg: "#ecfeff",
  },
  {
    title: "Alumni Management",
    description: "Manage alumni records and stay connected.",
    icon: GraduationCap,
    href: "/dashboard/admin/alumni",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    title: "Reports & Analytics",
    description: "Generate insightful reports and analytics.",
    icon: BarChart3,
    href: "/dashboard/admin/reports",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    title: "System Settings",
    description: "Configure system settings and preferences.",
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
  { label: "Create Notice", icon: MessageSquare, href: "/dashboard/admin/communication" },
  { label: "Collect Fees", icon: Wallet, href: "/dashboard/admin/finance/fees-management" },
  { label: "View Reports", icon: BarChart3, href: "/dashboard/admin/reports" },
];
