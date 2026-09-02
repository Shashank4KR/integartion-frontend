"use client";

import Link from "next/link";
import Card from "@/components/shared/Card";
import { Truck, MapPin, CalendarDays, FileText, ChevronRight } from "lucide-react";
import type { QuickNavItem } from "@/lib/fixtures/transport-overview-reference-fixture";

const iconMap: Record<string, React.ReactNode> = {
  bus: <Truck className="h-4 w-4" />,
  "map-pin": <MapPin className="h-4 w-4" />,
  "calendar-route": <CalendarDays className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
};

interface TransportQuickNavigationProps {
  items: QuickNavItem[];
  onTracking: () => void;
  onSchedule: () => void;
  onReport: () => void;
}

export default function TransportQuickNavigation({
  items,
  onTracking,
  onSchedule,
  onReport,
}: TransportQuickNavigationProps) {
  const handleClick = (item: QuickNavItem) => {
    if (item.action === "tracking") onTracking();
    else if (item.action === "schedule") onSchedule();
    else if (item.action === "report") onReport();
  };

  return (
    <Card className="p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Quick Navigation</h2>
          <span className="text-xs text-slate-400">Direct Actions</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const content = (
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition cursor-pointer group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`${item.iconBg} p-2 rounded-lg flex-shrink-0`}>
                    <span className={item.iconColor}>{iconMap[item.icon]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-[#7c3aed] transition truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#7c3aed] group-hover:translate-x-0.5 transition flex-shrink-0 ml-2" />
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.title} href={item.href} className="block">
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => handleClick(item)}
                className="block text-left w-full"
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
