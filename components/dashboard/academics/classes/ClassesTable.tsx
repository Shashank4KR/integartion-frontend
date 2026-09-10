"use client";

import { Pencil, Trash2, Eye } from "lucide-react";
import { shortId } from "@/lib/utils/id";
import type { ClassResponse } from "@/types/entities/class";

export default function ClassesTable({
  items,
  onEdit,
  onDelete,
  onView,
  teacherLabel,
  classSubjectCount,
  classStudentCount,
  isClassActive,
}: {
  items: ClassResponse[];
  onEdit: (item: ClassResponse) => void;
  onDelete: (id: string) => void;
  onView: (item: ClassResponse) => void;
  teacherLabel: (teacherId?: string | null) => string;
  classSubjectCount: Record<string, number>;
  classStudentCount: Record<string, number>;
  isClassActive: (academicYear: string) => boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        No Classes have been created yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
            <th className="px-4 py-3">Class / Course</th>
            <th className="px-4 py-3">Section</th>
            <th className="px-4 py-3">Academic Year</th>
            <th className="px-4 py-3">Class Teacher</th>
            <th className="px-4 py-3">Students</th>
            <th className="px-4 py-3">Subjects</th>
            <th className="px-4 py-3">Room No.</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-slate-50 hover:bg-slate-50/50 transition"
            >
              <td className="px-4 py-3 font-medium text-slate-900">{item.class_name}</td>
              <td className="px-4 py-3">{item.section}</td>
              <td className="px-4 py-3">{item.academic_year}</td>
              <td className="px-4 py-3">{teacherLabel(item.class_teacher_id)}</td>
              <td className="px-4 py-3 text-slate-600">{classStudentCount[item.id] ?? 0}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onView(item)}
                  className="text-[#6d28d9] hover:underline font-medium"
                >
                  {classSubjectCount[item.id] ?? 0} Subjects
                </button>
              </td>
              <td className="px-4 py-3 text-slate-600">—</td>
              <td className="px-4 py-3">
                {isClassActive(item.academic_year) ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(item)}
                    className="p-2 rounded-lg hover:bg-purple-50 text-slate-600 hover:text-[#6d28d9] transition"
                    title="View / Select Class"
                    aria-label="View class"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 rounded-lg hover:bg-purple-50 text-slate-600 hover:text-[#6d28d9] transition"
                    title="Edit"
                    aria-label="Edit class"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition"
                    title="Delete"
                    aria-label="Delete class"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
