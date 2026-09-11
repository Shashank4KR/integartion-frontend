"use client";

import { Eye, Pencil, Trash2, Link2, BookOpen, FlaskConical, MonitorPlay, Palette, Calculator, FlaskRound } from "lucide-react";
import type { SubjectResponse } from "@/types/entities/subject";

const ICON_FAMILIES = [
  BookOpen,
  FlaskConical,
  MonitorPlay,
  Palette,
  Calculator,
  FlaskRound,
];

function getSubjectIcon(id: string) {
  const idx = Number(id) || id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ICON_FAMILIES[idx % ICON_FAMILIES.length];
}

function getSubjectColor(id: string) {
  const colors = [
    { bg: "bg-purple-50", text: "text-purple-600" },
    { bg: "bg-emerald-50", text: "text-emerald-600" },
    { bg: "bg-blue-50", text: "text-blue-600" },
    { bg: "bg-amber-50", text: "text-amber-600" },
    { bg: "bg-rose-50", text: "text-rose-600" },
    { bg: "bg-teal-50", text: "text-teal-600" },
  ];
  const idx = Number(id) || id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[idx % colors.length];
}

function UnavailablePill() {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-400">
      —
    </span>
  );
}

export default function SubjectsTable({
  items,
  onEdit,
  onDelete,
  onView,
  classCountBySubject,
  onManageAssignments,
  departments = [],
}: {
  items: SubjectResponse[];
  onEdit: (item: SubjectResponse) => void;
  onDelete: (id: string) => void;
  onView: (item: SubjectResponse) => void;
  classCountBySubject: Record<string, number>;
  onManageAssignments: (item: SubjectResponse) => void;
  departments?: { id: string; department_name: string }[];
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <BookOpen className="h-12 w-12 text-slate-300 mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-500">No Subjects have been created yet.</p>
        <p className="text-xs text-slate-400 mt-1">Click &quot;Add Subject&quot; to create your first subject.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="px-4 py-3.5 min-w-[140px]">Subject Code</th>
            <th className="px-4 py-3.5 min-w-[180px]">Subject Name</th>
            <th className="px-4 py-3.5 min-w-[100px]">Subject Type</th>
            <th className="px-4 py-3.5 min-w-[120px]">Department</th>
            <th className="px-4 py-3.5 min-w-[100px]">Classes</th>
            <th className="px-4 py-3.5 min-w-[120px]">Credits / Periods</th>
            <th className="px-4 py-3.5 min-w-[90px]">Status</th>
            <th className="px-4 py-3.5 w-[140px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const Icon = getSubjectIcon(item.id);
            const colorSet = getSubjectColor(item.id);
            const classCount = classCountBySubject[item.id] ?? 0;
            const deptName = departments.find((d) => d.id === item.department_id)?.department_name;

            return (
              <tr
                key={item.id}
                className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorSet.bg} ${colorSet.text} flex-shrink-0`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-sm font-semibold text-[#6d28d9]">{item.subject_code}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-medium text-slate-800">{item.subject_name}</span>
                </td>
                <td className="px-4 py-3.5">
                  <UnavailablePill />
                </td>
                <td className="px-4 py-3.5">
                  {deptName ? (
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                      {deptName}
                    </span>
                  ) : (
                    <UnavailablePill />
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => onView(item)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#6d28d9] hover:underline underline-offset-2 transition-colors"
                    aria-label={`${classCount} classes assigned to ${item.subject_name}`}
                  >
                    {classCount} {classCount === 1 ? "Class" : "Classes"}
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <UnavailablePill />
                </td>
                <td className="px-4 py-3.5">
                  <UnavailablePill />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                      aria-label={`View ${item.subject_name}`}
                      title="View Subject"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onManageAssignments(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                      aria-label={`Manage assignments for ${item.subject_name}`}
                      title="Manage Classes and Teachers"
                    >
                      <Link2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      aria-label={`Edit ${item.subject_name}`}
                      title="Edit Subject"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      aria-label={`Delete ${item.subject_name}`}
                      title="Delete Subject"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
