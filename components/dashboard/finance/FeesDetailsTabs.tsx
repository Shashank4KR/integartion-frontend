"use client";

import { useState } from "react";
import { Search, Download, Printer } from "lucide-react";
import Card from "@/components/shared/Card";
import StudentFeeDetailsTable from "./StudentFeeDetailsTable";
import FeeInstallmentsTab from "./FeeInstallmentsTab";
import FeeTypesTab from "./FeeTypesTab";
import DiscountsConcessionsTab from "./DiscountsConcessionsTab";

import type { StudentFeeRow } from "@/lib/fixtures/fees-management-reference-fixture";

type TabKey = "student" | "installments" | "types" | "discounts";

interface FeesDetailsTabsProps {
  data?: StudentFeeRow[];
  loading?: boolean;
}

export default function FeesDetailsTabs({ data, loading }: FeesDetailsTabsProps = {}) {
  const [activeTab, setActiveTab] = useState<TabKey>("student");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "student", label: "Student Fee Details" },
    { key: "installments", label: "Fee Installments" },
    { key: "types", label: "Fee Types" },
    { key: "discounts", label: "Discounts & Concessions" },
  ];

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "text-[#7c3aed] border-[#7c3aed]"
                  : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by student name or roll no."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 pr-9 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent w-64"
            />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
          <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition" aria-label="Download">
            <Download className="h-4 w-4 text-[#7c3aed]" />
          </button>
          <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition" aria-label="Print">
            <Printer className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === "student" && (
          <StudentFeeDetailsTable
            searchQuery={searchQuery}
            data={data}
            loading={loading}
          />
        )}
        {activeTab === "installments" && <FeeInstallmentsTab />}
        {activeTab === "types" && <FeeTypesTab />}
        {activeTab === "discounts" && <DiscountsConcessionsTab />}
      </div>
    </Card>
  );
}
