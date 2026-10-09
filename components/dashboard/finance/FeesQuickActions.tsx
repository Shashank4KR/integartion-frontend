"use client";

import React from "react";
import { Wallet, CalendarPlus, FileText, Bell, Percent, Download, BookOpen, Settings } from "lucide-react";
import Card from "@/components/shared/Card";

const QUICK_ACTIONS = [
  { label: "Collect Fee", icon: "Wallet", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { label: "Add Installment", icon: "CalendarPlus", color: "text-blue-600", bgColor: "bg-blue-50" },
  { label: "Generate Invoice", icon: "FileText", color: "text-orange-600", bgColor: "bg-orange-50" },
  { label: "Fee Reminder", icon: "Bell", color: "text-[#7c3aed]", bgColor: "bg-purple-50" },
  { label: "Fee Concession", icon: "Percent", color: "text-pink-600", bgColor: "bg-pink-50" },
  { label: "Export Report", icon: "Download", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { label: "Fee Ledger", icon: "BookOpen", color: "text-[#7c3aed]", bgColor: "bg-purple-50" },
  { label: "Fee Settings", icon: "Settings", color: "text-slate-600", bgColor: "bg-slate-100" },
];

const iconMap: Record<string, React.ReactNode> = {
  Wallet: <Wallet className="h-5 w-5" />,
  CalendarPlus: <CalendarPlus className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Bell: <Bell className="h-5 w-5" />,
  Percent: <Percent className="h-5 w-5" />,
  Download: <Download className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
};

interface FeesQuickActionsProps {
  onAction?: (action: string) => void;
}

export default function FeesQuickActions({ onAction }: FeesQuickActionsProps) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => onAction?.(action.label)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 ${action.bgColor} hover:brightness-95 transition`}
          >
            <span className={action.color}>{iconMap[action.icon]}</span>
            <span className="text-xs font-medium text-slate-700">{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
