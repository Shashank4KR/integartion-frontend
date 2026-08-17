"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import Card from "@/components/shared/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ParentChildSelector,
  ParentPageHeader,
  parentStudentName,
  type ParentStudent,
} from "@/components/dashboard/parent/ParentModuleHelpers";
import { getToken } from "@/lib/auth";
import { getCurrentParentStudents } from "@/lib/services/dashboardService";
import { getStudentAttendanceSummary } from "@/lib/services/attendanceService";
import { CheckCircle2 } from "lucide-react";

type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
};

export default function ParentAttendancePage() {
  const router = useRouter();
  const [children, setChildren] = useState<ParentStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadChildren() {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const linkedChildren = await getCurrentParentStudents();
        if (!mounted) return;
        setChildren(linkedChildren);
        setSelectedStudentId(linkedChildren[0]?.id ?? "");
        if (linkedChildren.length === 0) {
          setError("No linked students were found for this parent account.");
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load linked students.");
        setLoading(false);
      }
    }

    void loadChildren();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    let mounted = true;

    async function loadAttendance() {
      const token = getToken();
      if (!token || !selectedStudentId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getStudentAttendanceSummary(token, selectedStudentId);
        if (!mounted) return;
        setAttendance({
          present: data.present ?? 0,
          absent: data.absent ?? 0,
          late: data.late ?? 0,
          total: data.total_classes ?? (data.present ?? 0) + (data.absent ?? 0) + (data.late ?? 0),
          percentage: data.attendance_percentage ?? 0,
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load attendance data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadAttendance();
    return () => {
      mounted = false;
    };
  }, [selectedStudentId]);

  const selectedChild = useMemo(
    () => children.find((student) => student.id === selectedStudentId),
    [children, selectedStudentId],
  );

  const percentageColor = attendance && attendance.percentage >= 80
    ? "text-green-700"
    : attendance && attendance.percentage >= 75
      ? "text-amber-700"
      : "text-red-700";

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.parent}>
      <div className="space-y-6">
        <ParentPageHeader
          icon={CheckCircle2}
          title="Attendance"
          description="Track attendance for your linked child."
        />

        <ParentChildSelector childrenList={children} selectedStudentId={selectedStudentId} onChange={setSelectedStudentId} />

        {loading && <LoadingState label="Loading attendance data..." />}
        {error && <ErrorState message={error} />}

        {!loading && !error && selectedChild && attendance && (
          <div className="space-y-6">
            <Card className="p-6">
              <p className="text-sm font-medium text-slate-600">Student</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{parentStudentName(selectedChild)}</p>
              <p className="mt-1 text-sm text-slate-500">{selectedChild.class_name ?? "Class not assigned"}</p>
            </Card>

            {attendance.total === 0 ? (
              <EmptyState icon={CheckCircle2} message="No attendance records are available yet for this child." />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-purple-50 border-purple-200 p-6">
                    <p className="text-sm font-medium text-slate-600">Overall Attendance</p>
                    <p className={`text-4xl font-bold ${percentageColor} mt-2`}>{attendance.percentage.toFixed(1)}%</p>
                  </Card>
                  <Card className="bg-green-50 border-green-200 p-6">
                    <p className="text-sm font-medium text-slate-600">Present</p>
                    <p className="text-4xl font-bold text-green-700 mt-2">{attendance.present}</p>
                  </Card>
                  <Card className="bg-red-50 border-red-200 p-6">
                    <p className="text-sm font-medium text-slate-600">Absent</p>
                    <p className="text-4xl font-bold text-red-700 mt-2">{attendance.absent}</p>
                  </Card>
                  <Card className="bg-amber-50 border-amber-200 p-6">
                    <p className="text-sm font-medium text-slate-600">Late</p>
                    <p className="text-4xl font-bold text-amber-700 mt-2">{attendance.late}</p>
                  </Card>
                </div>

                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">Total Classes</span><span className="font-semibold">{attendance.total}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Present</span><span className="font-semibold text-green-700">{attendance.present}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Absent</span><span className="font-semibold text-red-700">{attendance.absent}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Late</span><span className="font-semibold text-amber-700">{attendance.late}</span></div>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
