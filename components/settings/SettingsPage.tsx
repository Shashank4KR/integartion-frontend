"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, BookOpen, Building2, ChevronDown, ChevronRight, ClipboardCheck, FileBarChart,
  GraduationCap, KeyRound, Landmark, Menu, Palette, ShieldCheck, SlidersHorizontal,
  UserCircle, UsersRound, X, type LucideIcon,
} from "lucide-react";
import {
  AcademicConfiguration, AccountSecurity, AppearancePreferences, AttendanceConfiguration,
  AuditActivityLogs, CommunicationTemplates, ExaminationConfiguration, FinanceConfiguration,
  HostelConfiguration, Integrations, LibraryConfiguration, NotificationPreferences,
  OrganizationSettings, ProfileSettings, ReportsExportSettings, RolesPermissions,
  SystemConfiguration, TransportConfiguration,
} from "@/components/settings/sections";
import { getToken, saveUser } from "@/lib/auth";
import { getCurrentUser } from "@/lib/services/authService";
import type { UserResponse } from "@/types/auth";

export type SchoolRole = "Admin" | "Teacher" | "Student" | "Parent" | "Librarian" | "Accountant";
export type SettingsUser = Pick<UserResponse, "username" | "email" | "phone" | "role">;
type SectionProps = { currentRole: SchoolRole; user: SettingsUser };
type SettingsSection = { id: string; label: string; description: string; icon: LucideIcon; roles: SchoolRole[]; component: ComponentType<SectionProps> };
type SettingsGroup = { label: string; sections: SettingsSection[] };

const EVERYONE: SchoolRole[] = ["Admin", "Teacher", "Student", "Parent", "Librarian", "Accountant"];
const ADMIN: SchoolRole[] = ["Admin"];

const groups: SettingsGroup[] = [
  { label: "Personal", sections: [
    { id: "profile", label: "Profile", description: "Your personal information", icon: UserCircle, roles: EVERYONE, component: ProfileSettings },
    { id: "security", label: "Account & Security", description: "Sign-in and account protection", icon: ShieldCheck, roles: EVERYONE, component: AccountSecurity },
    { id: "notifications", label: "Notification Preferences", description: "Choose what updates you receive", icon: Bell, roles: EVERYONE, component: NotificationPreferences },
    { id: "appearance", label: "Appearance & Preferences", description: "Display and language preferences", icon: Palette, roles: EVERYONE, component: AppearancePreferences },
  ] },
  { label: "School configuration", sections: [
    { id: "organization", label: "School / Organization", description: "Identity, sessions and contacts", icon: Building2, roles: ADMIN, component: OrganizationSettings },
    { id: "academics", label: "Academic Configuration", description: "Terms, classes and curriculum", icon: GraduationCap, roles: ADMIN, component: AcademicConfiguration },
    { id: "attendance", label: "Attendance Configuration", description: "Working days and attendance rules", icon: ClipboardCheck, roles: ADMIN, component: AttendanceConfiguration },
    { id: "examination", label: "Examination Configuration", description: "Grading and result settings", icon: BookOpen, roles: ADMIN, component: ExaminationConfiguration },
  ] },
  { label: "Operations", sections: [
    { id: "library", label: "Library Configuration", description: "Issue rules and circulation", icon: BookOpen, roles: ["Admin", "Librarian"], component: LibraryConfiguration },
    { id: "hostel", label: "Hostel Configuration", description: "Blocks, rooms and policies", icon: Building2, roles: ADMIN, component: HostelConfiguration },
    { id: "transport", label: "Transport Configuration", description: "Routes and transport policies", icon: SlidersHorizontal, roles: ADMIN, component: TransportConfiguration },
    { id: "finance", label: "Finance Configuration", description: "Fees, taxes and receipts", icon: Landmark, roles: ["Admin", "Accountant"], component: FinanceConfiguration },
  ] },
  { label: "Administration", sections: [
    { id: "communication", label: "Communication & Templates", description: "Message channels and templates", icon: Bell, roles: ADMIN, component: CommunicationTemplates },
    { id: "roles", label: "Roles & Permissions", description: "Module access and permissions", icon: UsersRound, roles: ADMIN, component: RolesPermissions },
    { id: "reports", label: "Reports & Export Settings", description: "Report delivery and exports", icon: FileBarChart, roles: ADMIN, component: ReportsExportSettings },
    { id: "audit", label: "Audit & Activity Logs", description: "Read-only system history", icon: ShieldCheck, roles: ADMIN, component: AuditActivityLogs },
    { id: "integrations", label: "Integrations", description: "Connected services and APIs", icon: KeyRound, roles: ADMIN, component: Integrations },
    { id: "system", label: "System Configuration", description: "Global application controls", icon: SlidersHorizontal, roles: ADMIN, component: SystemConfiguration },
  ] },
];

export default function SettingsPage({ currentRole }: { currentRole: SchoolRole }) {
  const router = useRouter();
  const [user, setUser] = useState<SettingsUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let active = true;
    const loadIdentity = async () => {
      const token = getToken();
      if (!token) {
        if (active) setUser(null);
        if (active) setLoadingUser(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        // Do not apply a response for a token that was replaced while it loaded.
        if (!active || getToken() !== token) return;
        saveUser(currentUser);
        setUser(currentUser);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    const refreshIdentity = () => { setLoadingUser(true); void loadIdentity(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "edtech_access_token" || event.key === "edtech_user") refreshIdentity();
    };

    void loadIdentity();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshIdentity);
    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshIdentity);
    };
  }, []);

  const apiRole = user?.role?.role_name?.trim().toLowerCase();
  const resolvedRole = (["admin", "teacher", "student", "parent", "librarian", "accountant"] as const).find((role) => role === apiRole);
  const activeRole = resolvedRole ? `${resolvedRole[0].toUpperCase()}${resolvedRole.slice(1)}` as SchoolRole : null;
  const roleRoute = activeRole ? activeRole.toLowerCase() : null;
  const isRouteMismatch = activeRole !== null && activeRole !== currentRole;
  const visibleGroups = useMemo(() => activeRole ? groups.map((group) => ({ ...group, sections: group.sections.filter((section) => section.roles.includes(activeRole)) })).filter((group) => group.sections.length) : [], [activeRole]);
  const [activeId, setActiveId] = useState("profile");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Personal: true, "School configuration": true, Operations: true, Administration: true });
  const activeSection = visibleGroups.flatMap((group) => group.sections).find((section) => section.id === activeId) ?? visibleGroups[0]?.sections[0];
  const Section = activeSection?.component;

  useEffect(() => {
    setActiveId("profile");
    setOpenGroups({ Personal: true, "School configuration": false, Operations: false, Administration: false });
  }, [activeRole]);

  useEffect(() => {
    if (isRouteMismatch && roleRoute) router.replace(`/dashboard/${roleRoute}/settings`);
  }, [isRouteMismatch, roleRoute, router]);

  const selectSection = (id: string) => { setActiveId(id); setMobileOpen(false); };
  const sidebar = (
    <aside className="flex h-full flex-col bg-[#211a3d] text-white shadow-xl lg:shadow-none">
      <div className="flex h-[74px] items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600"><GraduationCap className="h-5 w-5" /></span><div><p className="text-sm font-bold">Cognora School</p><p className="text-xs text-violet-200">Settings center</p></div></div>
        <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-violet-100 lg:hidden" aria-label="Close settings menu"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-5 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2.5"><p className="text-[11px] font-medium uppercase tracking-wider text-violet-200">Signed in as</p><p className="mt-0.5 text-sm font-semibold">{loadingUser ? "Loading…" : user?.role?.role_name ?? "Role unavailable"}</p></div>
        {visibleGroups.map((group) => <div className="mb-4" key={group.label}>
          <button onClick={() => setOpenGroups((current) => ({ ...current, [group.label]: !current[group.label] }))} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-violet-200 hover:bg-white/5"><span>{group.label}</span>{openGroups[group.label] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>
          {openGroups[group.label] && <div className="mt-1 space-y-0.5">{group.sections.map((section) => { const Icon = section.icon; const active = section.id === activeSection?.id; return <button key={section.id} onClick={() => selectSection(section.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${active ? "bg-gradient-to-r from-violet-500 to-purple-600 font-semibold text-white shadow" : "text-violet-100 hover:bg-white/10"}`}><Icon className="h-4 w-4 shrink-0" /><span className="truncate">{section.label}</span></button>; })}</div>}
        </div>)}
      </div>
    </aside>
  );

  if (loadingUser) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-500">Loading your settings…</div>;
  if (!user || !activeRole || !Section) return <div className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center text-sm font-medium text-slate-600">We couldn’t verify your account role. Please sign in again and retry.</div>;
  if (isRouteMismatch) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-500">Opening your settings…</div>;

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="hidden fixed inset-y-0 left-0 z-30 w-72 lg:block">{sidebar}</div>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} aria-label="Close settings menu" /><div className="relative h-full w-80 max-w-[86vw]">{sidebar}</div></div>}
    <main className="lg:ml-72"><header className="sticky top-0 z-20 flex h-[74px] items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8"><button onClick={() => setMobileOpen(true)} className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden" aria-label="Open settings menu"><Menu className="h-5 w-5" /></button><div><p className="text-xs font-medium text-slate-500">Settings</p><h1 className="text-lg font-bold text-slate-900">{activeSection.label}</h1></div></header>
      <div className="mx-auto max-w-5xl p-4 sm:p-8"><div className="mb-7"><h2 className="text-2xl font-bold tracking-tight">{activeSection.label}</h2><p className="mt-1 text-sm text-slate-500">{activeSection.description}</p></div><Section currentRole={activeRole} user={user} /></div>
    </main>
  </div>;
}
