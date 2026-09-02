"use client";

import Card from "@/components/shared/Card";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface TransportGuidelinesCardProps {
  guidelines: string[];
}

export default function TransportGuidelinesCard({ guidelines }: TransportGuidelinesCardProps) {
  return (
    <Card className="p-5 h-full flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Transport Guidelines</h2>
              <p className="text-xs text-slate-500">Fleet safety & operational rules</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-[#7c3aed]">
            Active
          </span>
        </div>

        <ul className="space-y-2 mb-4">
          {guidelines.map((guideline, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
              <span>{guideline}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Responsive School Bus Illustration Banner */}
      <div className="rounded-xl bg-gradient-to-br from-purple-50/70 via-amber-50/40 to-blue-50/50 p-3 border border-purple-100/50 flex flex-col items-center justify-center">
        <svg
          viewBox="0 0 280 140"
          className="w-full h-auto max-h-[125px] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Road line */}
          <line x1="8" y1="124" x2="272" y2="124" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="6 4" />

          {/* Bus Shadow */}
          <ellipse cx="120" cy="122" rx="100" ry="5" fill="#94a3b8" fillOpacity="0.25" />

          {/* Bus body */}
          <rect x="20" y="32" width="200" height="78" rx="10" fill="#f59e0b" />
          <rect x="28" y="40" width="184" height="42" rx="6" fill="#fbbf24" />

          {/* Roof highlight */}
          <path d="M28 32 H212 C216 32 219 35 220 38 H20 C21 35 24 32 28 32 Z" fill="#d97706" />

          {/* Windows */}
          <rect x="36" y="46" width="28" height="22" rx="3" fill="#1e3a8a" />
          <rect x="70" y="46" width="28" height="22" rx="3" fill="#1e3a8a" />
          <rect x="104" y="46" width="28" height="22" rx="3" fill="#1e3a8a" />
          <rect x="138" y="46" width="28" height="22" rx="3" fill="#1e3a8a" />
          {/* Front windshield */}
          <path d="M172 46 H198 C200 46 202 48 202 51 L200 68 H172 V46 Z" fill="#0284c7" />

          {/* Window Reflections */}
          <line x1="40" y1="49" x2="50" y2="65" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="74" y1="49" x2="84" y2="65" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="108" y1="49" x2="118" y2="65" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="142" y1="49" x2="152" y2="65" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* School Bus Label stripe */}
          <rect x="36" y="73" width="130" height="6" rx="1.5" fill="#1e293b" />
          <rect x="42" y="74.5" width="24" height="3" rx="1" fill="#fbbf24" />
          <rect x="72" y="74.5" width="48" height="3" rx="1" fill="#fbbf24" />

          {/* Passenger Door */}
          <rect x="180" y="52" width="24" height="48" rx="2" fill="#d97706" />
          <rect x="182" y="54" width="9" height="20" rx="1" fill="#1e3a8a" />
          <rect x="193" y="54" width="9" height="20" rx="1" fill="#1e3a8a" />
          <line x1="192" y1="52" x2="192" y2="100" stroke="#78350f" strokeWidth="1.5" />

          {/* Headlights */}
          <rect x="216" y="72" width="5" height="10" rx="2" fill="#fef08a" stroke="#eab308" strokeWidth="1" />
          <rect x="216" y="86" width="4" height="5" rx="1" fill="#f97316" />

          {/* Front Grille / Bumper */}
          <rect x="20" y="104" width="202" height="7" rx="3" fill="#1e293b" />

          {/* Wheels */}
          {/* Back wheel */}
          <circle cx="56" cy="110" r="14" fill="#0f172a" />
          <circle cx="56" cy="110" r="8" fill="#64748b" />
          <circle cx="56" cy="110" r="3" fill="#0f172a" />

          {/* Front wheel */}
          <circle cx="166" cy="110" r="14" fill="#0f172a" />
          <circle cx="166" cy="110" r="8" fill="#64748b" />
          <circle cx="166" cy="110" r="3" fill="#0f172a" />

          {/* Students boarding group */}
          <g transform="translate(18, 0)">
            {/* Student 1 */}
            <circle cx="232" cy="74" r="5" fill="#fed7aa" />
            <rect x="227" y="80" width="10" height="16" rx="2" fill="#3b82f6" />
            <rect x="229" y="96" width="3" height="18" rx="1" fill="#1e293b" />
            <rect x="233" y="96" width="3" height="18" rx="1" fill="#1e293b" />
            {/* Backpack */}
            <rect x="224" y="81" width="4" height="10" rx="1" fill="#ef4444" />

            {/* Student 2 */}
            <circle cx="248" cy="70" r="5.5" fill="#fbcfe8" />
            <rect x="242" y="76" width="12" height="18" rx="2" fill="#10b981" />
            <rect x="244" y="94" width="3.5" height="20" rx="1" fill="#1e293b" />
            <rect x="249" y="94" width="3.5" height="20" rx="1" fill="#1e293b" />
            {/* Backpack */}
            <rect x="253" y="78" width="4" height="11" rx="1" fill="#8b5cf6" />
          </g>
        </svg>

        <div className="flex items-center justify-between w-full mt-2 text-[11px] text-slate-500 font-medium">
          <span>Safe Student Commute</span>
          <span className="text-emerald-600 font-semibold">100% Monitored</span>
        </div>
      </div>
    </Card>
  );
}
