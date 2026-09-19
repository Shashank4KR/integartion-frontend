"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { listFeeStructures } from "@/lib/services/financeService";

export interface FeeTypeRow {
  id: string;
  name: string;
  amount: number;
  collected: number;
  pending?: number;
}

interface FeeTypesTabProps {
  feeTypes?: FeeTypeRow[];
}

export default function FeeTypesTab({ feeTypes: initialFeeTypes }: FeeTypesTabProps = {}) {
  const [items, setItems] = useState<FeeTypeRow[]>(initialFeeTypes || []);
  const [loading, setLoading] = useState(!initialFeeTypes);

  useEffect(() => {
    if (initialFeeTypes) {
      setItems(initialFeeTypes);
      return;
    }

    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    listFeeStructures(token)
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(
            data.map((item: any) => ({
              id: String(item.id || item.fee_type || ""),
              name: String(item.name || item.fee_type || "Fee"),
              amount: Number(item.amount || item.total_amount || 0),
              collected: Number(item.collected || item.amount_paid || 0),
              pending: Math.max(0, Number(item.amount || 0) - Number(item.collected || item.amount_paid || 0)),
            })),
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialFeeTypes]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Type</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount (₹)</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Collected (₹)</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Pending (₹)</th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                Loading fee types...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                No fee types configured yet.
              </td>
            </tr>
          ) : (
            items.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                <td className="py-3 pr-4 text-sm font-medium text-slate-900">{row.name}</td>
                <td className="py-3 pr-4 text-sm text-slate-900 text-right font-medium">₹ {row.amount.toLocaleString()}</td>
                <td className="py-3 pr-4 text-sm text-emerald-700 text-right font-medium">₹ {row.collected.toLocaleString()}</td>
                <td className="py-3 pr-4 text-sm text-orange-700 text-right font-medium">₹ {(row.amount - row.collected).toLocaleString()}</td>
                <td className="py-3 text-center">
                  <button className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-purple-50 hover:text-[#7c3aed] hover:border-[#7c3aed] transition">
                    View Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
