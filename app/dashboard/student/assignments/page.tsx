"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import {
  getCurrentStudentAssignments,
  submitCurrentStudentAssignment,
} from "@/lib/services/studentService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, ClipboardList, Upload, CheckCircle2 } from "lucide-react";

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submissionUrlMap, setSubmissionUrlMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const storedToken = getToken();
        if (!storedToken) {
          router.replace("/login");
          return;
        }
        setToken(storedToken);

        const data = await getCurrentStudentAssignments(storedToken);
        setAssignments(data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError(err instanceof Error ? err.message : "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [router]);

  const handleSubmitAssignment = async (assignmentId: string) => {
    const fileUrl = submissionUrlMap[assignmentId] || "";
    if (!fileUrl.trim()) {
      alert("Please enter a submission document link / file path.");
      return;
    }
    try {
      setSubmittingId(assignmentId);
      await submitCurrentStudentAssignment(token, assignmentId, fileUrl);
      const updated = await getCurrentStudentAssignments(token);
      setAssignments(updated || []);
      alert("Assignment submitted successfully!");
    } catch (err: any) {
      alert(err?.message || "Failed to submit assignment.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-purple-600" />
            Assignments & Homework
          </h1>
          <p className="text-slate-600 mt-1">View assigned coursework, due dates, attachments, and submit your work</p>
        </div>

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading your assignments...</p>
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

        {!loading && !error && assignments.length === 0 && (
          <Card className="border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3 text-amber-700">
              <ClipboardList className="h-5 w-5" />
              <p>No assignments created for your class yet.</p>
            </div>
          </Card>
        )}

        {!loading && !error && assignments.length > 0 && (
          <div className="space-y-4">
            {assignments.map((item) => {
              const submission = item.submission;
              const isSubmitted = !!submission;

              return (
                <Card key={item.id} className="hover:shadow-md transition p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                        {isSubmitted ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-purple-700 mt-1">
                        Subject: {item.subject_name || "Assigned Subject"}
                      </p>
                      {item.teacher_name && (
                        <p className="text-xs text-slate-500 mt-0.5">Teacher: {item.teacher_name}</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <p className="text-xs text-slate-500">Due Date</p>
                      <p className="text-sm font-semibold text-rose-600">
                        {item.due_date ? new Date(item.due_date).toLocaleDateString() : "No deadline"}
                      </p>
                    </div>
                  </div>

                  {item.attachment && (
                    <div className="pt-2">
                      <a
                        href={item.attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-600 underline font-medium"
                      >
                        Download Teacher Attachment
                      </a>
                    </div>
                  )}

                  {submission ? (
                    <div className="border-t border-slate-100 pt-3 bg-emerald-50/50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-emerald-900">Your Submission</p>
                      <p className="text-xs text-slate-600 mt-1">Submitted file: {submission.file_path}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Date: {new Date(submission.submitted_on).toLocaleString()}
                      </p>
                      {submission.marks !== null && (
                        <p className="text-xs font-bold text-emerald-700 mt-1">
                          Marks: {submission.marks} | Remarks: {submission.remarks || "None"}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <label className="block text-xs font-medium text-slate-700">Submit Work (File Link / Document Path)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://... or /uploads/my-homework.pdf"
                          value={submissionUrlMap[item.id] || ""}
                          onChange={(e) =>
                            setSubmissionUrlMap({ ...submissionUrlMap, [item.id]: e.target.value })
                          }
                          className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                        />
                        <button
                          onClick={() => handleSubmitAssignment(item.id)}
                          disabled={submittingId === item.id}
                          className="px-4 py-1.5 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {submittingId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}

