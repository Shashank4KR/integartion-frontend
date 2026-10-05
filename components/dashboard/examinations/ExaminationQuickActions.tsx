"use client";

import {
  Plus,
  Users,
  UserCheck,
  CalendarClock,
  FileText,
  Pencil,
  CheckCircle,
  BarChart3,
} from "lucide-react";

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  bg: string;
  color: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Plus: <Plus className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  UserCheck: <UserCheck className="h-4 w-4" />,
  CalendarClock: <CalendarClock className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Pencil: <Pencil className="h-4 w-4" />,
  CheckCircle: <CheckCircle className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
};

const actionItems: ActionItem[] = [
  { label: "Create Examination", icon: iconMap.Plus, bg: "bg-emerald-100", color: "text-emerald-600" },
  { label: "Assign Subjects", icon: iconMap.Users, bg: "bg-sky-100", color: "text-sky-600" },
  { label: "Assign Invigilators", icon: iconMap.UserCheck, bg: "bg-sky-100", color: "text-sky-600" },
  { label: "Exam Timetable", icon: iconMap.CalendarClock, bg: "bg-lime-100", color: "text-lime-600" },
  { label: "Generate Admit Card", icon: iconMap.FileText, bg: "bg-pink-100", color: "text-pink-600" },
  { label: "Publish Results", icon: iconMap.CheckCircle, bg: "bg-orange-100", color: "text-orange-600" },
  { label: "Exam Report", icon: iconMap.BarChart3, bg: "bg-sky-100", color: "text-sky-600" },
];

interface ExaminationQuickActionsProps {
  onAction: (action: string) => void;
}

export default function ExaminationQuickActions({ onAction }: ExaminationQuickActionsProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {actionItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onAction(item.label)}
            className="flex flex-col items-center gap-1.5 rounded-lg p-2 hover:bg-slate-50 transition"
          >
            <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${item.bg}`}>
              <span className={item.color}>{item.icon}</span>
            </div>
            <span className="text-[11px] font-medium text-slate-600 text-center leading-tight line-clamp-1">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
