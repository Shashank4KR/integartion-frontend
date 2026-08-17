"use client";

import Card from "@/components/shared/Card";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Loader2 } from "lucide-react";

export type ParentStudent = {
  id: string;
  admission_no: string;
  first_name?: string | null;
  last_name?: string | null;
  class_name?: string | null;
  roll_no?: string | null;
};

type PageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type ChildSelectorProps = {
  childrenList: ParentStudent[];
  selectedStudentId: string;
  onChange: (studentId: string) => void;
};

export function parentStudentName(student: ParentStudent): string {
  return [student.first_name, student.last_name].filter(Boolean).join(" ") || student.admission_no || "Student";
}

export function ParentPageHeader({ icon: Icon, title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Icon className="h-8 w-8 text-purple-600" />
        {title}
      </h1>
      <p className="text-slate-600 mt-1">{description}</p>
    </div>
  );
}

export function ParentChildSelector({ childrenList, selectedStudentId, onChange }: ChildSelectorProps) {
  if (childrenList.length <= 1) {
    return null;
  }

  return (
    <Card className="p-4">
      <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="parent-child-selector">
        Child
      </label>
      <select
        id="parent-child-selector"
        value={selectedStudentId}
        onChange={(event) => onChange(event.target.value)}
        className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
      >
        {childrenList.map((student) => (
          <option key={student.id} value={student.id}>
            {parentStudentName(student)}
            {student.class_name ? ` - ${student.class_name}` : ""}
            {student.roll_no ? ` / Roll ${student.roll_no}` : ""}
          </option>
        ))}
      </select>
    </Card>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <Card className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-slate-600">{label}</p>
      </div>
    </Card>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-red-200 bg-red-50 p-6">
      <div className="flex items-center gap-3 text-red-700">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p>{message}</p>
      </div>
    </Card>
  );
}

export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <Card className="border-amber-200 bg-amber-50 p-6">
      <div className="flex items-center gap-3 text-amber-700">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <p>{message}</p>
      </div>
    </Card>
  );
}
