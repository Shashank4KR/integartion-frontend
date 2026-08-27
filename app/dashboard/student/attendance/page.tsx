"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentStudentAttendance } from "@/lib/services/studentService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function StudentAttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const data = await getCurrentStudentAttendance(token);
        setAttendance(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError(err instanceof Error ? err.message : "Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [router]);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getAttendanceBg = (percentage: number) => {
    if (percentage >= 80) return "bg-green-50 border-green-200";
    if (percentage >= 75) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const records = attendance?.records || [];

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-purple-600" />
            Attendance
          </h1>
          <p className="text-slate-600 mt-1">Track your verified subject-wise and daily attendance records</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading attendance data...</p>
            </div>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {!loading && !error && attendance && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`border ${getAttendanceBg(attendance.attendance_percentage || 0)} p-6`}>
              <p className="text-sm font-medium text-slate-600">Overall Attendance</p>
              <p className={`text-4xl font-bold ${getAttendanceColor(attendance.attendance_percentage || 0)} mt-2`}>
                {(attendance.attendance_percentage || 0).toFixed(1)}%
              </p>
            </Card>

            <Card className="border-blue-200 bg-blue-50 p-6">
              <p className="text-sm font-medium text-slate-600">Present</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{attendance.present || 0}</p>
              <p className="text-xs text-blue-600 mt-1">classes</p>
            </Card>

            <Card className="border-amber-200 bg-amber-50 p-6">
              <p className="text-sm font-medium text-slate-600">Absent</p>
              <p className="text-4xl font-bold text-amber-600 mt-2">{attendance.absent || 0}</p>
              <p className="text-xs text-amber-600 mt-1">classes</p>
            </Card>

            <Card className="border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-600">Late</p>
              <p className="text-4xl font-bold text-slate-600 mt-2">{attendance.late || 0}</p>
              <p className="text-xs text-slate-600 mt-1">classes</p>
            </Card>
          </div>
        )}

        {!loading && !error && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Records ({records.length})</h2>
            {records.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No individual attendance logs found for your profile.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-100 text-slate-900">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r: any) => (
                      <tr key={r.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{r.date}</td>
                        <td className="px-4 py-3">{r.subject_name}</td>
                        <td className="px-4 py-3">Period {r.period_no}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              r.status === "PRESENT"
                                ? "bg-emerald-100 text-emerald-800"
                                : r.status === "ABSENT"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </RoleDashboardLayout>
  );
}

