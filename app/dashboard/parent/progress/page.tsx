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
import { getStudentExamResults, getStudentPerformance, getStudentReportCards } from "@/lib/services/studentService";
import { FileBarChart } from "lucide-react";

type ProgressResult = {
  id: string;
  title: string;
  subject: string;
  score: number;
  total: number;
  grade: string;
  date?: string;
};

type PerformanceSummary = {
  attendance_percentage?: number;
  average_percentage?: number;
  overall_percentage?: number;
  total_exams?: number;
  rank?: string | number;
};

function toProgressResult(item: any): ProgressResult {
  const total = Number(item.total_marks ?? item.max_marks ?? 100) || 100;
  const score = Number(item.marks_obtained ?? item.score ?? 0) || 0;

  return {
    id: String(item.id ?? `${item.exam_id ?? "exam"}-${item.subject_id ?? "subject"}`),
    title: String(item.exam_name ?? item.exam?.name ?? "Exam"),
    subject: String(item.subject_name ?? item.subject?.name ?? item.subject_id ?? "Subject"),
    score,
    total,
    grade: String(item.grade ?? "N/A"),
    date: item.exam_date ?? item.created_at,
  };
}

export default function ParentProgressPage() {
  const router = useRouter();
  const [children, setChildren] = useState<ParentStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [results, setResults] = useState<ProgressResult[]>([]);
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
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

    async function loadProgress() {
      const token = getToken();
      if (!token || !selectedStudentId) return;

      setLoading(true);
      setError(null);

      try {
        const [resultResponse, reportCardResponse, performanceResponse] = await Promise.allSettled([
          getStudentExamResults(token, selectedStudentId),
          getStudentReportCards(token, selectedStudentId),
          getStudentPerformance(token, selectedStudentId),
        ]);

        if (!mounted) return;

        if (resultResponse.status === "rejected" && reportCardResponse.status === "rejected" && performanceResponse.status === "rejected") {
          throw resultResponse.reason;
        }

        setResults(resultResponse.status === "fulfilled" ? (resultResponse.value ?? []).map(toProgressResult) : []);
        setReportCards(reportCardResponse.status === "fulfilled" ? reportCardResponse.value ?? [] : []);
        setSummary(performanceResponse.status === "fulfilled" ? performanceResponse.value ?? null : null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load progress data.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProgress();
    return () => {
      mounted = false;
    };
  }, [selectedStudentId]);

  const selectedChild = useMemo(
    () => children.find((student) => student.id === selectedStudentId),
    [children, selectedStudentId],
  );

  const average = results.length > 0
    ? results.reduce((total, item) => total + (item.score / item.total) * 100, 0) / results.length
    : Number(summary?.average_percentage ?? summary?.overall_percentage ?? 0) || 0;

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.parent}>
      <div className="space-y-6">
        <ParentPageHeader
          icon={FileBarChart}
          title="Progress"
          description="Review academic performance for your linked child."
        />

        <ParentChildSelector childrenList={children} selectedStudentId={selectedStudentId} onChange={setSelectedStudentId} />

        {loading && <LoadingState label="Loading progress data..." />}
        {error && <ErrorState message={error} />}

        {!loading && !error && selectedChild && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-purple-50 border-purple-200 p-6">
                <p className="text-sm font-medium text-slate-600">Student</p>
                <p className="text-2xl font-bold text-purple-700 mt-2">{parentStudentName(selectedChild)}</p>
                <p className="text-xs text-slate-600 mt-1">{selectedChild.class_name ?? "Class not assigned"}</p>
              </Card>
              <Card className="bg-blue-50 border-blue-200 p-6">
                <p className="text-sm font-medium text-slate-600">Average</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">{average.toFixed(1)}%</p>
              </Card>
              <Card className="bg-emerald-50 border-emerald-200 p-6">
                <p className="text-sm font-medium text-slate-600">Records</p>
                <p className="text-3xl font-bold text-emerald-700 mt-2">{results.length + reportCards.length}</p>
              </Card>
            </div>

            {results.length === 0 && reportCards.length === 0 && (
              <EmptyState icon={FileBarChart} message="No progress records are available yet for this child." />
            )}

            {results.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Exam Results</h2>
                <div className="space-y-3">
                  {results.map((result) => {
                    const percentage = result.total > 0 ? (result.score / result.total) * 100 : 0;
                    return (
                      <Card key={result.id} className="p-6" hover>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{result.title}</p>
                            <p className="text-sm text-slate-600 mt-1">{result.subject}</p>
                            {result.date && <p className="text-xs text-slate-500 mt-1">{new Date(result.date).toLocaleDateString("en-IN")}</p>}
                          </div>
                          <span className="rounded-lg bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700">{result.grade}</span>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Marks</span>
                            <span className="font-semibold text-slate-900">{result.score} / {result.total}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-slate-200">
                            <div className="h-2 rounded-full bg-purple-600" style={{ width: `${Math.min(percentage, 100)}%` }} />
                          </div>
                          <p className="mt-1 text-right text-xs font-semibold text-purple-700">{percentage.toFixed(1)}%</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
