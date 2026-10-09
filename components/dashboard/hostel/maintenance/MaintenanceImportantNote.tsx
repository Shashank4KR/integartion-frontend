"use client";

import { Info } from "lucide-react";

export default function MaintenanceImportantNote() {
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 flex items-start gap-3">
      <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-slate-700">
        <p className="font-semibold text-slate-900 mb-1">Important Note</p>
        <p>If any emergency maintenance is required, please contact the hostel administration or maintenance in-charge immediately.</p>
        <p className="text-[#7c3aed] font-semibold mt-1">Emergency Contact: 9876543210</p>
      </div>
    </div>
  );
}
