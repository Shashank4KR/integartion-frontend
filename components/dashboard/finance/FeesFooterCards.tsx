"use client";

import { Calendar, CheckCircle, FileText, AlertCircle, Tag, Gift } from "lucide-react";
import Card from "@/components/shared/Card";
import type { FooterCard } from "@/lib/fixtures/fees-management-reference-fixture";

const DEFAULT_ZERO_FOOTER_CARDS: FooterCard[] = [
  {
    title: "Total Invoices",
    value: "0",
    footer: "All Records",
    iconBg: "bg-purple-50",
    iconColor: "text-[#7c3aed]",
    icon: "calendar",
  },
  {
    title: "Paid Invoices",
    value: "0",
    footer: "0%",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    icon: "calendar-check",
  },
  {
    title: "Pending Invoices",
    value: "0",
    footer: "0%",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    icon: "pending",
  },
  {
    title: "Overdue Invoices",
    value: "0",
    footer: "0%",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    icon: "overdue-calendar",
  },
  {
    title: "Total Collections",
    value: "₹ 0",
    footer: "Live from API",
    iconBg: "bg-purple-50",
    iconColor: "text-[#7c3aed]",
    icon: "tag",
  },
  {
    title: "Total Outstanding",
    value: "₹ 0",
    footer: "Current Balance",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    icon: "gift",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  calendar: <Calendar className="h-5 w-5" />,
  "calendar-check": <CheckCircle className="h-5 w-5" />,
  pending: <FileText className="h-5 w-5" />,
  "overdue-calendar": <AlertCircle className="h-5 w-5" />,
  tag: <Tag className="h-5 w-5" />,
  gift: <Gift className="h-5 w-5" />,
};

interface FeesFooterCardsProps {
  cards?: FooterCard[];
}

export default function FeesFooterCards({ cards }: FeesFooterCardsProps = {}) {
  const displayCards = cards && cards.length > 0 ? cards : DEFAULT_ZERO_FOOTER_CARDS;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {displayCards.map((card) => (
        <Card key={card.title} className="p-4">
          <div className="flex items-start gap-3">
            <div className={`${card.iconBg} p-2 rounded-lg`}>
              <span className={card.iconColor}>{iconMap[card.icon]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.title}</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.footer}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
