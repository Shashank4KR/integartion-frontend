"use client";

import { useEffect, useState } from "react";
import { GraduationCap, ChevronRight, ChevronDown, Headset, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MENU_ITEMS, COMPANY_INFO, type MenuItemType } from "@/lib/constants";
import { getStoredAvatar, subscribeAvatarChange } from "@/lib/auth";
import ContactSupportModal from "@/components/shared/ContactSupportModal";
import { useMobileNavigation } from "@/components/shared/layout/MobileNavigationContext";

export default function Sidebar() {
  const mobileNavigation = useMobileNavigation();
  const { open: mobileOpen, close: onClose } = mobileNavigation;
  const pathname = usePathname();
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    setAvatar(getStoredAvatar());
    return subscribeAvatarChange((newAvatar) => {
      setAvatar(newAvatar);
    });
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard/admin") return pathname === "/dashboard/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-slate-950/50 lg:hidden"
        />
      )}
      <div className={`${mobileOpen ? "fixed inset-y-0 left-0 z-[61] flex w-[280px]" : "hidden lg:flex w-[280px]"} bg-[#2a1f4d] flex-col h-screen lg:fixed lg:left-0 lg:top-0 lg:z-50 overflow-x-hidden`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-6 border-b border-purple-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white overflow-hidden shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">{COMPANY_INFO.name}</h1>
            <p className="text-purple-200 text-xs font-medium">
              {COMPANY_INFO.tagline}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-purple-100 hover:bg-purple-700/40 lg:hidden" aria-label="Close navigation menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        {MENU_ITEMS.map((item) => (
          <SidebarMenuItem
            key={item.label}
            item={item}
            pathname={pathname}
            isActive={isActive}
            router={router}
            onNavigate={onClose}
          />
        ))}
      </div>

      {/* Support Card */}
      <div className="p-4 border-t border-purple-700">
        <div className="bg-purple-600/40 rounded-2xl p-4 text-center">
          <div className="flex justify-center mb-3">
            <Headset className="w-6 h-6 text-purple-200" />
          </div>
          <h3 className="text-white font-semibold text-sm">Need Help?</h3>
          <p className="text-purple-200 text-xs mt-1">
            We're here to assist you
          </p>
          <button
            type="button"
            onClick={() => setIsSupportOpen(true)}
            className="w-full mt-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg py-2 text-xs font-semibold hover:from-purple-500 hover:to-purple-600 transition"
          >
            Contact Support
          </button>
        </div>
      </div>

      <ContactSupportModal
        open={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
      </div>
    </>
  );
}

function SidebarMenuItem({
  item,
  pathname,
  isActive,
  router,
  onNavigate,
}: {
  item: MenuItemType;
  pathname: string;
  isActive: (href: string) => boolean;
  router: ReturnType<typeof useRouter>;
  onNavigate?: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const parentActive = item.href ? isActive(item.href) : false;
  const anyChildActive = hasChildren
    ? item.children!.some((child) => isActive(child.href ?? ""))
    : false;
  const active = parentActive || anyChildActive;
  const [expanded, setExpanded] = useState(anyChildActive);
  const Icon = item.icon;

  return (
    <div className="mb-2">
      {hasChildren ? (
        <button
          type="button"
          onClick={() => {
            const isComm = item.label === "Communication";
            const isTransport = item.label === "Transport";
            const isHostel = item.label === "Hostel";
            setExpanded((e) => !e);
            if (isComm && pathname !== "/dashboard/admin/communication") {
              router.push("/dashboard/admin/communication");
              onNavigate?.();
            }
            if (isTransport && pathname !== "/dashboard/admin/transport") {
              router.push("/dashboard/admin/transport");
              onNavigate?.();
            }
            if (isHostel && pathname !== "/dashboard/admin/hostel") {
              router.push("/dashboard/admin/hostel");
              onNavigate?.();
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            active
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
              : "text-purple-200 hover:bg-purple-700/30"
          }`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-left">
            {item.label}
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )}
        </button>
      ) : (
        <Link
          href={item.href ?? "#"}
          onClick={onNavigate}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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
      )}
      {hasChildren && expanded && (
        <div className="ml-4 mt-1 space-y-1">
          {item.children!.map((child) => {
            const childActive = isActive(child.href ?? "");
            const ChildIcon = child.icon;
            return (
              <Link
                key={child.label}
                href={child.href ?? "#"}
                onClick={onNavigate}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  childActive
                    ? "bg-purple-500/40 text-white"
                    : "text-purple-200 hover:bg-purple-700/30"
                }`}
              >
                {ChildIcon && <ChildIcon className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {child.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
