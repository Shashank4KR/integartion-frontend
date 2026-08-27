"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentStudentExamResults } from "@/lib/services/studentService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, FileBarChart } from "lucide-react";

interface ExamResult {
  id: string;
  examName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  date?: string;
}

export default function StudentResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const data = await getCurrentStudentExamResults(token);
        const formattedResults: ExamResult[] = (data || []).map((result: any) => ({
          id: result.id || "",
          examName: result.exam_name || "Exam",
          subject: result.subject_name || result.subject_id || "Subject",
          marksObtained: result.marks_obtained || 0,
          totalMarks: result.total_marks || 100,
          percentage: ((result.marks_obtained || 0) / (result.total_marks || 100)) * 100,
          grade: result.grade || "N/A",
          date: result.exam_date || undefined,
        }));
        setResults(formattedResults);
        setError(null);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [router]);

  const getGradeColor = (grade: string) => {
    const g = grade.toUpperCase();
    if (g === "A+" || g === "A") return "text-green-600 bg-green-50";
    if (g === "B") return "text-blue-600 bg-blue-50";
    if (g === "C") return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const averagePercentage = results.length > 0
    ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
    : 0;

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="h-8 w-8 text-purple-600" />
            Results
          </h1>
          <p className="text-slate-600 mt-1">Review your exam scores and performance summaries</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading results...</p>
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

        {!loading && !error && results.length === 0 && (
          <Card className="border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3 text-amber-700">
              <FileBarChart className="h-5 w-5" />
              <p>No exam results yet. Results will appear here once exams are graded.</p>
            </div>
          </Card>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-6">
            {results.length > 1 && (
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 p-6">
                <p className="text-sm font-medium text-slate-600">Average Performance</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {averagePercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-600 mt-2">Across {results.length} exam(s)</p>
              </Card>
            )}

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Exam Results</h2>
              <div className="space-y-3">
                {results.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-slate-900">{result.examName}</p>
                          <p className="text-sm text-slate-600 mt-1">{result.subject}</p>
                          {result.date && (
                            <p className="text-xs text-slate-500 mt-1">{result.date}</p>
                          )}
                        </div>
                        <span className={`px-3 py-2 rounded-lg font-bold text-sm ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Marks Obtained</span>
                          <span className="font-semibold text-slate-900">
                            {result.marksObtained} / {result.totalMarks}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${Math.min(result.percentage, 100)}%` }}
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-purple-600">
                            {result.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
