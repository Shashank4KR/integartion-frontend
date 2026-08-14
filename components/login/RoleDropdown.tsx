"use client";

import {
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  GraduationCap,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type RoleOption = {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
};

const roles: RoleOption[] = [
  {
    value: "School Administrator",
    label: "School Administrator",
    icon: ShieldCheck,
    color: "text-[#4f46e5]",
  },
  {
    value: "Faculty / Teacher",
    label: "Faculty / Teacher",
    icon: Users,
    color: "text-[#7c3aed]",
  },
  {
    value: "Student",
    label: "Student",
    icon: GraduationCap,
    color: "text-[#0f766e]",
  },
  {
    value: "Parent / Guardian",
    label: "Parent / Guardian",
    icon: Users,
    color: "text-[#dc2626]",
  },
  {
    value: "Librarian",
    label: "Librarian",
    icon: BookOpen,
    color: "text-[#2563eb]",
  },
  {
    value: "Accountant / Finance",
    label: "Accountant / Finance",
    icon: BriefcaseBusiness,
    color: "text-[#ea580c]",
  },
];

export const ROLE_LABEL_TO_NAME: Record<string, string> = {
  "School Administrator": "ADMIN",
  "Faculty / Teacher": "TEACHER",
  Student: "STUDENT",
  "Parent / Guardian": "PARENT",
  Librarian: "LIBRARIAN",
  "Accountant / Finance": "ACCOUNTANT",
};

type RoleDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function RoleDropdown({ value, onChange }: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedRole = roles.find((role) => role.value === value);

  return (
    <div className="relative">
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        Role
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#6d28d9] focus:ring-4 focus:ring-purple-100"
      >
        <span className="flex items-center gap-2">
          {selectedRole ? (
            <>
              {selectedRole.icon && <selectedRole.icon className={`h-4 w-4 ${selectedRole.color}`} />}
              <span>{selectedRole.label}</span>
            </>
          ) : (
            <span className="text-slate-400">Select your role</span>
          )}
        </span>
        <ChevronDown className="h-4 h-4 text-slate-400" />
      </button>

      {isOpen ? (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => {
                  onChange(role.value);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-purple-50"
              >
                <Icon className={`h-4 w-4 ${role.color}`} />
                <span className="text-slate-700">{role.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}