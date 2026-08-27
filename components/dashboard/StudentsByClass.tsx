"use client";

import { useEffect, useState } from "react";
import { getClasses, getStudents } from "@/lib/services/dashboardService";
import { SESSION_OPTIONS } from "@/lib/constants";
import Card from "@/components/shared/Card";
import SectionHeader from "@/components/shared/SectionHeader";
import DonutChart from "@/components/shared/charts/DonutChart";
import Dropdown from "@/components/shared/Dropdown";

interface ClassCountItem {
  id: string;
  name: string;
  count: number;
  color: string;
}

const COLORS = [
  "bg-blue-500", "bg-fuchsia-500", "bg-teal-500", "bg-orange-500", 
  "bg-indigo-500", "bg-pink-500", "bg-emerald-500", "bg-cyan-500", 
  "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-slate-500"
];

export default function StudentsByClass() {
  const [timeframe, setTimeframe] = useState("This Session");
  const [classesStats, setClassesStats] = useState<ClassCountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [classesList, studentsList] = await Promise.all([
          getClasses().catch(() => []),
          getStudents().catch(() => []),
        ]);

        if (!mounted) return;

        const mappedClasses = (classesList || []).map((cls: any, index: number) => {
          const count = (studentsList || []).filter(
            (s: any) => String(s.class_id) === String(cls.id)
          ).length;

          return {
            id: String(cls.id),
            name: `${cls.class_name}-${cls.section}`,
            count,
            color: COLORS[index % COLORS.length],
          };
        });

        // Filter to classes that have at least 1 student or sort them
        const sortedClasses = mappedClasses
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 10); // Limit to top 10 for clean layout

        setClassesStats(sortedClasses);
        setTotalStudentsCount(studentsList?.length || 0);
      } catch (err) {
        console.error("Failed to load class distribution stats:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const chartSegments = classesStats.map((cls) => ({
    label: cls.name,
    value: totalStudentsCount > 0 ? (cls.count / totalStudentsCount) * 100 : 0,
    color: cls.color,
  }));

  return (
    <Card>
      <div className="p-6">
        <SectionHeader
          title="Students by Class"
          action={
            <Dropdown
              value={timeframe}
              options={SESSION_OPTIONS}
              onChange={setTimeframe}
              className="text-sm"
            />
          }
        />

        {loading ? (
          <p className="text-sm text-slate-500 py-4 text-center">Loading distribution...</p>
        ) : classesStats.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No class or student records found.</p>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {/* Donut Chart */}
            <DonutChart
              segments={chartSegments}
              size={140}
              value={totalStudentsCount}
              label="Total Students"
            />

            {/* Legend */}
            <div className="w-full grid grid-cols-2 gap-3 mt-6 max-h-[160px] overflow-y-auto pr-1">
              {classesStats.map((cls) => (
                <div key={cls.id} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cls.color}`}></div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{cls.name}</p>
                    <p className="text-xs text-slate-500">
                      {cls.count} ({totalStudentsCount > 0 ? Math.round((cls.count / totalStudentsCount) * 100) : 0}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
