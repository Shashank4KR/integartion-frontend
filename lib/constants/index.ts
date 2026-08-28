import {
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  CheckCircle,
  ClipboardList,
  DollarSign,
  MessageSquare,
  Library,
  BarChart3,
  Settings,
  LayoutGrid,
  CalendarClock,
  TrendingUp,
  CircleDollarSign,
  Wallet,
  FileText,
  Receipt,
  Megaphone,
  Truck,
  BedDouble,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type MenuItemType = {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: MenuItemType[];
};

export const MENU_ITEMS: MenuItemType[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
  { label: "User Modules", icon: LayoutGrid, href: "/dashboard/admin/modules" },
  { label: "Students", icon: Users, href: "/dashboard/admin/students" },
  { label: "Parents", icon: Users, href: "/dashboard/admin/parents" },
  { label: "Parent-Student Mapping", icon: Users, href: "/dashboard/admin/parent-students" },
  { label: "Employees", icon: Briefcase, href: "/dashboard/admin/teachers" },
    {
      label: "Academics",
      icon: BookOpen,
      href: "/dashboard/admin/academics",
      children: [
        { label: "Classes / Courses", icon: LayoutGrid, href: "/dashboard/admin/academics/classes" },
        { label: "Subjects", icon: BookOpen, href: "/dashboard/admin/academics/subjects" },
        { label: "Timetable", icon: CalendarClock, href: "/dashboard/admin/academics/timetable" },
        { label: "Attendance", icon: CheckCircle, href: "/dashboard/admin/academics/attendance" },
      ],
    },
  { label: "Examinations", icon: ClipboardList, href: "/dashboard/admin/examinations" },
  { label: "Finance", icon: DollarSign, href: "/dashboard/admin/finance", children: [
    { label: "Finance Overview", icon: TrendingUp, href: "/dashboard/admin/finance/overview" },
    { label: "Fees Management", icon: CircleDollarSign, href: "/dashboard/admin/finance/fees-management" },
    { label: "Expenses Management", icon: Receipt, href: "/dashboard/admin/finance/expenses" },
    { label: "Invoices", icon: FileText, href: "/dashboard/admin/finance/invoices" },
    { label: "Transactions", icon: Wallet, href: "/dashboard/admin/finance/transactions" },
    { label: "Salary Management", icon: Wallet, href: "/dashboard/admin/finance/salary-management" },
  ]},
  {
    label: "Communication",
    icon: MessageSquare,
    href: "/dashboard/admin/communication",
    children: [
      {
        label: "Communications & Announcements",
        icon: MessageSquare,
        href: "/dashboard/admin/communication/communications-announcements",
      },
      {
        label: "Communication Statistics",
        icon: BarChart3,
        href: "/dashboard/admin/communication/statistics",
      },
    ],
  },
  { label: "Library", icon: Library, href: "/dashboard/admin/library" },
  {
    label: "Transport",
    icon: Truck,
    href: "/dashboard/admin/transport",
    children: [
      {
        label: "Transport Management",
        icon: Truck,
        href: "/dashboard/admin/transport/management",
      },
    ],
  },
  {
    label: "Hostel",
    icon: BedDouble,
    href: "/dashboard/admin/hostel",
    children: [
      {
        label: "Hostel Management",
        icon: BedDouble,
        href: "/dashboard/admin/hostel/management",
      },
      {
        label: "Rooms Management",
        icon: BedDouble,
        href: "/dashboard/admin/hostel/rooms",
      },
      {
        label: "Hostel Students",
        icon: Users,
        href: "/dashboard/admin/hostel/students",
      },
      {
        label: "Mess Management",
        icon: UtensilsCrossed,
        href: "/dashboard/admin/hostel/mess-management",
      },
      {
        label: "Maintenance Management",
        icon: Wrench,
        href: "/dashboard/admin/hostel/maintenance",
      },
    ],
  },
  { label: "Reports", icon: BarChart3, href: "/dashboard/admin/reports" },
  { label: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
];

export const TIMEFRAME_OPTIONS = [
  "Today",
  "This Week",
  "This Month",
  "This Year",
];

export const SESSION_OPTIONS = [
  "This Session",
  "Last Session",
  "2023-24",
  "2022-23",
];

export const COLORS = {
  purple: "#7c3aed",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  blue: "#3b82f6",
  pink: "#ec4899",
  orange: "#f97316",
  indigo: "#6366f1",
  teal: "#14b8a6",
  gray: "#6b7280",
};

export const SIDEBAR_WIDTH = "280px";

export const COMPANY_INFO = {
  name: "EdTech",
  tagline: "Smart Campus ERP",
  copyright: "© 2026 EdTech Smart Campus ERP. All rights reserved.",
  version: "1.0.0",
};

export const DEMO_USER = {
  name: "John Admin",
  role: "Super Admin",
  initials: "JA",
};
