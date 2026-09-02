"use client";

import {
  Map,
  Truck,
  User,
  CalendarClock,
  Wallet,
  FileText,
  UserPlus,
  UserCheck,
  Bus,
  Route,
  Calendar,
  IndianRupee,
} from "lucide-react";
import Card from "@/components/shared/Card";
import type { QuickAction } from "@/lib/fixtures/transport-management-reference-fixture";

const iconMap: Record<string, React.ReactNode> = {
  Map: <Map className="w-5 h-5" />,
  Truck: <Truck className="w-5 h-5" />,
  Bus: <Bus className="w-5 h-5" />,
  Route: <Route className="w-5 h-5" />,
  User: <User className="w-5 h-5" />,
  UserPlus: <UserPlus className="w-5 h-5" />,
  UserCheck: <UserCheck className="w-5 h-5" />,
  CalendarClock: <CalendarClock className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Wallet: <Wallet className="w-5 h-5" />,
  IndianRupee: <IndianRupee className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
};

interface TransportQuickActionsProps {
  actions: QuickAction[];
  onAction: (action: QuickAction) => void;
}

export default function TransportQuickActions({ actions, onAction }: TransportQuickActionsProps) {
  return (
    <Card className="flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
      </div>
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onAction(action)}
              className={`flex items-center gap-3 rounded-lg border ${action.borderColor} ${action.bgColor} px-4 py-3 text-left transition hover:shadow-sm`}
            >
              <span className={`${action.color} flex-shrink-0`}>
                {iconMap[action.icon]}
              </span>
              <span className={`text-sm font-semibold ${action.color}`}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
