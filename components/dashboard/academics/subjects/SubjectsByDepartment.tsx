"use client";

import { useMemo } from "react";
import Card from "@/components/shared/Card";
import DonutChart from "@/components/shared/charts/DonutChart";
import type { SubjectResponse } from "@/types/entities/subject";

const DEPT_COLORS = ["#6d28d9", "#10b981", "#3b82f6", "#f97316", "#ec4899", "#14b8a6", "#6366f1", "#f59e0b"];

export default function SubjectsByDepartment({
  subjects,
  departments = [],
}: {
  subjects: SubjectResponse[];
  departments?: { id: string; department_name: string }[];
}) {
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    subjects.forEach((s) => {
      const deptId = s.department_id;
      const deptName = departments.find((d) => d.id === deptId)?.department_name || (deptId ? "Other" : null);
      if (deptName) counts[deptName] = (counts[deptName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [subjects, departments]);

  const hasRealDepartments = deptCounts.length > 0;
  const total = subjects.length;

  const segments = deptCounts.map((d, i) => ({
    label: d.name,
    value: d.count,
    color: DEPT_COLORS[i % DEPT_COLORS.length],
  }));

  return (
    <Card className="h-full">
      <div className="flex h-full flex-col p-5">
        <h3 className="text-sm font-semibold text-slate-900">Subjects by Department</h3>
        <p className="mb-4 text-xs text-slate-500">Distribution across departments</p>

        <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="flex-shrink-0">
            {hasRealDepartments ? (
              <DonutChart value={total} segments={segments} size={120} strokeWidth={14} label="Total" />
            ) : (
              <svg width={120} height={120} viewBox="0 0 120 120" aria-hidden="true">
                <circle cx={60} cy={60} r={46} fill="none" stroke="#e2e8f0" strokeWidth={14} />
                <text x={60} y={54} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#64748b">
                  Total
                </text>
                <text x={60} y={74} textAnchor="middle" dominantBaseline="middle" fontSize="28" fontWeight="bold" fill="#0f172a">
                  {total}
                </text>
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {hasRealDepartments ? (
              deptCounts.map((d, i) => {
                const percentage = total > 0 ? Math.round((d.count / total) * 100) : 0;
                return (
                  <div key={d.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}
                    />
                    <span className="flex-1 truncate text-xs text-slate-600">{d.name}</span>
                    <span className="text-xs font-semibold text-slate-700">{d.count}</span>
                    <span className="w-9 text-right text-[11px] text-slate-400">{percentage}%</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">Department distribution is not available.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
