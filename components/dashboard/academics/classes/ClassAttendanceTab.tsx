"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ClassAttendanceTab({ classId }: { classId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    total_records: number;
    present: number;
    absent: number;
    late: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("nomera_access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`/api/attendance/class/${classId}/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json()) as { detail?: string };
          throw new Error(data.detail || "Failed to load attendance summary.");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load attendance.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-[#6d28d9]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        Attendance overview is not available yet.
      </div>
    );
  }

  const percentage =
    summary.total_records > 0
      ? Math.round((summary.present / summary.total_records) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-slate-900">{summary.total_records}</p>
          <p className="text-xs text-slate-500">Total Records</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-green-600">{summary.present}</p>
          <p className="text-xs text-slate-500">Present</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-red-600">{summary.absent}</p>
          <p className="text-xs text-slate-500">Absent</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-amber-600">{summary.late}</p>
          <p className="text-xs text-slate-500">Late</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">Attendance Percentage</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#6d28d9]"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-700">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}
