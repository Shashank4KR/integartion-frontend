/**
 * This data exists only for the approved Transport Overview UI implementation.
 * Replace it with backend API data during the later integration phase.
 */

export interface OverviewSummaryCard {
  title: string;
  value: string;
  footer: string;
  icon: "users-route" | "clock-check" | "bus-check" | "alert-bell";
  iconBg: string;
  iconColor: string;
  sparkline: number[];
  sparkColor: string;
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface ActivityRow {
  label: string;
  value: number;
  icon: "check-circle" | "bus" | "clock" | "tools";
  iconBg: string;
  iconColor: string;
  progressColor: string;
  progressValue: number;
}

export interface QuickNavItem {
  title: string;
  description: string;
  icon: "bus" | "map-pin" | "calendar-route" | "report";
  iconBg: string;
  iconColor: string;
  href?: string;
  action?: "tracking" | "schedule" | "report" | "driver-assignment";
}

export const OVERVIEW_SUMMARY_CARDS: OverviewSummaryCard[] = [
  {
    title: "Students on Route",
    value: "398",
    footer: "Currently assigned today",
    icon: "users-route",
    iconBg: "bg-purple-50",
    iconColor: "text-[#7c3aed]",
    sparkline: [12, 15, 14, 18, 16, 20, 19, 22, 21, 24],
    sparkColor: "#7c3aed",
  },
  {
    title: "Routes On Time",
    value: "10 / 12",
    footer: "83.3% schedule adherence",
    icon: "clock-check",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    sparkline: [8, 9, 8, 10, 9, 10, 10, 11, 10, 11],
    sparkColor: "#10b981",
  },
  {
    title: "Vehicles in Service",
    value: "16 / 18",
    footer: "2 under maintenance",
    icon: "bus-check",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    sparkline: [14, 14, 15, 15, 15, 16, 16, 16, 16, 16],
    sparkColor: "#3b82f6",
  },
  {
    title: "Transport Alerts",
    value: "3",
    footer: "Requires attention",
    icon: "alert-bell",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    sparkline: [1, 2, 1, 3, 2, 3, 2, 3, 3, 3],
    sparkColor: "#f97316",
  },
];

export const TRANSPORT_DONUT_SEGMENTS: DonutSegment[] = [
  { label: "Route 1 (Green)", value: 42, color: "#3b82f6" },
  { label: "Route 2 (Blue)", value: 38, color: "#10b981" },
  { label: "Route 3 (Yellow)", value: 35, color: "#eab308" },
  { label: "Route 4 (Red)", value: 40, color: "#ef4444" },
  { label: "Route 5 (Orange)", value: 32, color: "#f97316" },
  { label: "Other Routes", value: 239, color: "#7c3aed" },
];

export const TRANSPORT_TOTAL_STUDENTS = 426;

export const ACTIVITY_ROWS: ActivityRow[] = [
  {
    label: "Trips Completed",
    value: 8,
    icon: "check-circle",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    progressColor: "bg-emerald-500",
    progressValue: 80,
  },
  {
    label: "Trips Running",
    value: 16,
    icon: "bus",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    progressColor: "bg-blue-500",
    progressValue: 100,
  },
  {
    label: "Delayed Trips",
    value: 2,
    icon: "clock",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    progressColor: "bg-orange-500",
    progressValue: 20,
  },
  {
    label: "Vehicles Under Maintenance",
    value: 2,
    icon: "tools",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    progressColor: "bg-rose-500",
    progressValue: 20,
  },
];

export const QUICK_NAVIGATION_ITEMS: QuickNavItem[] = [
  {
    title: "Transport Management",
    description: "Manage routes, vehicles and drivers",
    icon: "bus",
    iconBg: "bg-purple-50",
    iconColor: "text-[#7c3aed]",
    href: "/dashboard/admin/transport/management",
  },
  {
    title: "Live Tracking",
    description: "View current vehicle positions",
    icon: "map-pin",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    action: "tracking",
  },
  {
    title: "Route Schedule",
    description: "Review pickup and drop schedules",
    icon: "calendar-route",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    action: "schedule",
  },
  {
    title: "Transport Report",
    description: "View transport performance summary",
    icon: "report",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    action: "report",
  },
];

export const OVERVIEW_PERIOD_OPTIONS = ["Today", "This Week", "This Month"];

export const TRANSPORT_GUIDELINES = [
  "Students must reach the pickup point 5 minutes before the scheduled time.",
  "Students must follow the instructions given by the driver / attendant.",
  "Any change in pickup / drop point must be informed to the transport in-charge.",
  "Misbehavior in the vehicle may result in withdrawal of transport facility.",
];
