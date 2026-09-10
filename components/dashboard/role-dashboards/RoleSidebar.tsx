"use client";

import { useEffect, useState } from "react";
import { GraduationCap, ChevronRight, Headset } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RoleConfig } from "@/lib/dashboard/role-dashboards/types";
import { getStoredAvatar, subscribeAvatarChange } from "@/lib/auth";

interface RoleSidebarProps {
  config: RoleConfig;
}

export default function RoleSidebar({ config }: RoleSidebarProps) {
  const pathname = usePathname();
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    setAvatar(getStoredAvatar());
    return subscribeAvatarChange((newAvatar) => {
      setAvatar(newAvatar);
    });
  }, []);

  const isActive = (href: string) => {
    if (href === config.basePath) return pathname === config.basePath;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="hidden lg:flex w-[280px] bg-[#2a1f4d] flex-col h-screen fixed left-0 top-0 z-50 overflow-x-hidden">
      {/* Logo Section */}
      <div className="p-6 border-b border-purple-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white overflow-hidden shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">{config.name}</h1>
            <p className="text-purple-200 text-xs font-medium">
              {config.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        {config.nav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                active
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                  : "text-purple-200 hover:bg-purple-700/30"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Support Card */}
      <div className="p-4 border-t border-purple-700">
        <div className="bg-purple-600/40 rounded-2xl p-4 text-center">
          <div className="flex justify-center mb-3">
            <Headset className="w-6 h-6 text-purple-200" />
          </div>
          <h3 className="text-white font-semibold text-sm">Need Help?</h3>
          <p className="text-purple-200 text-xs mt-1">
            Contact our support team
          </p>
          <button className="w-full mt-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg py-2 text-xs font-semibold hover:from-purple-500 hover:to-purple-600 transition">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
