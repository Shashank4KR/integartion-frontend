"use client";

import { ChevronRight } from "lucide-react";
import type { CollectionRow } from "@/lib/fixtures/mess-management-reference-fixture";

interface RecentMessCollectionsCardProps {
  rows: CollectionRow[];
  onViewAll: () => void;
}

export default function RecentMessCollectionsCard({ rows, onViewAll }: RecentMessCollectionsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
      <h2 className="text-base font-bold text-slate-900 mb-4">Recent Collections</h2>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Received From</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Block / Room</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount (₹)</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Received By</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">
                  No collections recorded yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.date}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-900">{row.receivedFrom}</td>
                  <td className="px-3 py-2.5 text-slate-600">{row.blockRoom}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-900 tabular-nums">{row.amount.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.receivedBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 pt-2">
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c3aed] hover:underline"
        >
          View All Collections
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
