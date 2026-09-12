"use client";

import type { ExaminationRow } from "@/lib/fixtures/examinations-reference-fixture";

const EXAM_TYPE_COLORS: Record<string, string> = {
  "Unit Test": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Periodic Test": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Half Yearly": "bg-sky-50 text-sky-700 border-sky-100",
  "Pre Final": "bg-orange-50 text-orange-700 border-orange-100",
  "Final": "bg-rose-50 text-rose-700 border-rose-100",
  "Annual": "bg-sky-50 text-sky-700 border-sky-100",
  "Others": "bg-violet-50 text-violet-700 border-violet-100",
};

const STATUS_COLORS: Record<string, string> = {
  Upcoming: "bg-orange-50 text-orange-700 border-orange-100",
  Ongoing: "bg-blue-50 text-blue-700 border-blue-100",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

interface ExaminationsTableProps {
  rows: ExaminationRow[];
  loading: boolean;
  onView: (row: ExaminationRow) => void;
  onEdit: (row: ExaminationRow) => void;
  onDelete: (row: ExaminationRow) => void;
}

export default function ExaminationsTable({
  rows,
  loading,
  onView,
  onEdit,
  onDelete,
}: ExaminationsTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Exam ID</th>
                <th className="px-4 py-3">Examination Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Class / Grade</th>
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Subjects</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-100" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-slate-100" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-100" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-12 rounded bg-slate-100" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-slate-100" /></td>
                  <td className="px-4 py-3"><div className="h-7 w-24 rounded bg-slate-100 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 mb-6 overflow-hidden">
        <div className="py-12 text-center text-sm text-slate-500">
          No examinations found for the selected filters.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 mb-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">Exam ID</th>
              <th className="px-4 py-3">Examination Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Class / Grade</th>
              <th className="px-4 py-3">Term</th>
              <th className="px-4 py-3">Schedule</th>
              <th className="px-4 py-3">Subjects</th>
              <th className="px-4 py-3">Students</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <p className="font-medium text-slate-700">No examinations found</p>
                    <p className="text-xs text-slate-400 mt-1">Create an examination to get started.</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-100">
                    {row.displayCode}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.examName}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${EXAM_TYPE_COLORS[row.type] || "bg-slate-50 text-slate-700 border-slate-100"}`}>
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{row.classGrade}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{row.term}</td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{row.schedule}</td>
                <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate" title={row.subjects}>{row.subjects}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{row.students}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[row.status] || "bg-slate-50 text-slate-700 border-slate-100"}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView(row)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-purple-50 text-[#7c3aed] hover:bg-purple-100 transition"
                      aria-label={`View ${row.displayCode}`}
                      title="View"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(row)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      aria-label={`Edit ${row.displayCode}`}
                      title="Edit"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(row)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition"
                      aria-label={`Delete ${row.displayCode}`}
                      title="Delete"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
