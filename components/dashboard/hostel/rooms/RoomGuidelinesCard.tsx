"use client";

import Card from "@/components/shared/Card";

const guidelines = [
  "Students must keep their rooms clean and tidy.",
  "Do not damage hostel property and furniture.",
  "Follow hostel rules and maintain discipline.",
  "Any issue in room or facility must be reported to the hostel administration immediately.",
];

export default function RoomGuidelinesCard() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <svg className="w-5 h-5 text-[#7c3aed]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4zm2 8h-8V9h6c1.1 0 2 .9 2 2v4z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Room Guidelines</h3>
          </div>
          <ul className="space-y-2.5">
            {guidelines.map((guideline, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#7c3aed] flex-shrink-0" />
                <span className="text-sm text-slate-700 leading-relaxed">{guideline}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden md:flex w-64 items-center justify-center bg-purple-50/50 p-6 border-l border-slate-100">
          <svg viewBox="0 0 240 160" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="200" height="110" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5"/>
            <rect x="20" y="30" width="200" height="20" rx="4" fill="#f1f5f9"/>
            <rect x="30" y="40" width="60" height="6" rx="2" fill="#cbd5e1"/>
            <rect x="30" y="50" width="40" height="4" rx="1" fill="#e2e8f0"/>
            <rect x="30" y="58" width="50" height="4" rx="1" fill="#e2e8f0"/>
            <rect x="140" y="35" width="30" height="30" rx="2" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
            <rect x="145" y="42" width="20" height="16" rx="1" fill="#dbeafe"/>
            <rect x="155" y="48" width="3" height="3" rx="0.5" fill="#3b82f6"/>
            <rect x="150" y="55" width="14" height="2" rx="1" fill="#60a5fa"/>
            <rect x="30" y="75" width="70" height="55" rx="3" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1"/>
            <rect x="35" y="80" width="60" height="8" rx="1" fill="#fef9c3"/>
            <rect x="35" y="92" width="60" height="8" rx="1" fill="#fef9c3"/>
            <rect x="35" y="104" width="60" height="8" rx="1" fill="#fef9c3"/>
            <rect x="70" y="75" width="30" height="55" rx="2" fill="#fed7aa" stroke="#fdba74" strokeWidth="1"/>
            <rect x="75" y="82" width="20" height="40" rx="1" fill="#ffedd5"/>
            <rect x="80" y="85" width="3" height="14" rx="0.5" fill="#f97316"/>
            <rect x="87" y="85" width="3" height="14" rx="0.5" fill="#f97316"/>
            <rect x="110" y="75" width="60" height="55" rx="3" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1"/>
            <rect x="115" y="80" width="50" height="6" rx="1" fill="#c7d2fe"/>
            <rect x="115" y="90" width="50" height="6" rx="1" fill="#c7d2fe"/>
            <rect x="115" y="100" width="50" height="6" rx="1" fill="#c7d2fe"/>
            <rect x="115" y="110" width="22" height="18" rx="1" fill="#d4d4d8"/>
            <rect x="140" y="110" width="22" height="18" rx="1" fill="#d4d4d8"/>
            <rect x="165" y="75" width="45" height="55" rx="3" fill="#d1fae5" stroke="#6ee7b7" strokeWidth="1"/>
            <rect x="170" y="80" width="35" height="40" rx="1" fill="#ecfdf5"/>
            <rect x="170" y="82" width="35" height="4" rx="1" fill="#a7f3d0"/>
            <rect x="170" y="90" width="35" height="4" rx="1" fill="#a7f3d0"/>
            <rect x="170" y="98" width="35" height="4" rx="1" fill="#a7f3d0"/>
            <rect x="175" y="110" width="12" height="16" rx="1" fill="#6ee7b7"/>
            <rect x="190" y="110" width="12" height="16" rx="1" fill="#6ee7b7"/>
            <circle cx="45" cy="22" r="8" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1"/>
            <path d="M40 22h10M45 17v10" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </Card>
  );
}
