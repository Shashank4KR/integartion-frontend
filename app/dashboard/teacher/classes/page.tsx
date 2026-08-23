"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentTeacher, getTeacherClasses } from "@/lib/services/teacherService";
import { getClassStudents } from "@/lib/services/classService";
import { getStudentAttendanceSummary } from "@/lib/services/attendanceService";
import { getStudentExamResults } from "@/lib/services/studentService";
import {
  createStudentFeedback,
  deleteStudentFeedback,
  getStudentFeedback,
  type StudentFeedback,
} from "@/lib/services/academicContentService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, Users2, UserCheck, X, Plus, Trash2, Award, CheckCircle } from "lucide-react";

export default function TeacherClassesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ id: string; class_name: string; section?: string; academic_year?: string }>>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  // Case Study Modal State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentAttendance, setStudentAttendance] = useState<any | null>(null);
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  
  const [newFeedbackType, setNewFeedbackType] = useState("ACADEMIC");
  const [newFeedbackComment, setNewFeedbackComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCaseStudy, setLoadingCaseStudy] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const storedToken = getToken();
        if (!storedToken) {
          router.replace("/login");
          return;
        }
        setToken(storedToken);

        const teacher = await getCurrentTeacher(storedToken);
        const assigned = await getTeacherClasses(storedToken, teacher.id);
        setClasses(assigned);

        if (assigned.length > 0) {
          setSelectedClassId(assigned[0].id);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load assigned classes.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  useEffect(() => {
    if (!selectedClassId || !token) return;

    async function loadStudents() {
      setLoadingStudents(true);
      try {
        const list = await getClassStudents(token, selectedClassId!);
        setStudents(list);
      } catch (err: any) {
        setError(err?.message || "Failed to load class students.");
      } finally {
        setLoadingStudents(false);
      }
    }
    void loadStudents();
  }, [selectedClassId, token]);

  const openCaseStudy = async (student: any) => {
    setSelectedStudent(student);
    setLoadingCaseStudy(true);
    setFeedbackSuccess(null);
    try {
      const [att, res, fb] = await Promise.all([
        getStudentAttendanceSummary(token, student.id).catch(() => null),
        getStudentExamResults(token, student.id).catch(() => []),
        getStudentFeedback(token, student.id).catch(() => []),
      ]);
      setStudentAttendance(att);
      setStudentResults(res);
      setFeedbacks(fb);
    } catch {
      // Ignore fallback
    } finally {
      setLoadingCaseStudy(false);
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newFeedbackComment) return;

    setSavingFeedback(true);
    setFeedbackSuccess(null);
    try {
      const created = await createStudentFeedback(token, {
        student_id: selectedStudent.id,
        feedback_type: newFeedbackType,
        comment: newFeedbackComment,
        feedback_date: new Date().toISOString().split("T")[0],
      });

      setFeedbacks((prev) => [created, ...prev]);
      setNewFeedbackComment("");
      setFeedbackSuccess("Student feedback recorded successfully.");
    } catch (err: any) {
      alert(err?.message || "Failed to save feedback.");
    } finally {
      setSavingFeedback(false);
    }
  };

  const handleDeleteFeedback = async (fbId: string) => {
    if (!confirm("Delete this observation/feedback?")) return;
    try {
      await deleteStudentFeedback(token, fbId);
      setFeedbacks((prev) => prev.filter((f) => f.id !== fbId));
      setFeedbackSuccess("Feedback deleted.");
    } catch (err: any) {
      alert(err?.message || "Failed to delete feedback.");
    }
  };

  if (loading) {
    return (
      <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
        <Card className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </Card>
      </RoleDashboardLayout>
    );
  }

  const activeClass = classes.find((c) => c.id === selectedClassId);

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users2 className="h-8 w-8 text-purple-600" />
            My Classes & Student Case Studies
          </h1>
          <p className="text-slate-600 mt-1">Select class to view student list, perform student case study, and record feedback.</p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </Card>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                selectedClassId === cls.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cls.class_name} {cls.section ? `(${cls.section})` : ""}
            </button>
          ))}
        </div>

        {loadingStudents ? (
          <Card className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="ml-2 text-slate-600 text-sm">Loading class roster...</span>
          </Card>
        ) : students.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No students enrolled in {activeClass?.class_name || "this class"}.
          </Card>
        ) : (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Students Roster - {activeClass?.class_name} ({students.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => {
                const fullName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Student";

                return (
                  <div
                    key={student.id}
                    onClick={() => void openCaseStudy(student)}
                    className="p-4 border border-slate-200 rounded-lg hover:border-purple-400 hover:shadow-md transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{fullName}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Roll: {student.roll_no || "-"} · Adm: {student.admission_no}
                      </p>
                    </div>
                    <button className="px-3 py-1 text-xs font-semibold bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
                      Case Study
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Case Study Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Student Case Study: {selectedStudent.first_name} {selectedStudent.last_name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Admission No: {selectedStudent.admission_no} · Class: {activeClass?.class_name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {loadingCaseStudy ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : (
                <>
                  {/* Attendance & Academic Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-purple-50/50 border-purple-100">
                      <h4 className="font-semibold text-purple-900 text-sm flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-purple-600" /> Attendance Summary
                      </h4>
                      {studentAttendance ? (
                        <div className="mt-2 space-y-1 text-xs text-slate-700">
                          <p>Present: <strong className="text-emerald-600">{studentAttendance.present || 0}</strong> days</p>
                          <p>Absent: <strong className="text-rose-600">{studentAttendance.absent || 0}</strong> days</p>
                          <p>Late: <strong className="text-amber-600">{studentAttendance.late || 0}</strong> days</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-2">No attendance records found.</p>
                      )}
                    </Card>

                    <Card className="p-4 bg-blue-50/50 border-blue-100">
                      <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-blue-600" /> Academic Results
                      </h4>
                      {studentResults.length > 0 ? (
                        <div className="mt-2 space-y-1 text-xs text-slate-700 max-h-24 overflow-y-auto">
                          {studentResults.map((r: any, idx) => (
                            <p key={idx}>
                              {r.exam_name || "Exam"}: <strong>{r.marks_obtained}</strong> marks
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-2">No exam results recorded.</p>
                      )}
                    </Card>
                  </div>

                  {/* Feedback / Observations Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900">Teacher Observations & Feedback</h3>

                    {feedbackSuccess && (
                      <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded">
                        {feedbackSuccess}
                      </p>
                    )}

                    <form onSubmit={handleAddFeedback} className="space-y-3 bg-slate-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Feedback Category</label>
                          <select
                            value={newFeedbackType}
                            onChange={(e) => setNewFeedbackType(e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:outline-none"
                          >
                            <option value="ACADEMIC">Academic Progress</option>
                            <option value="BEHAVIOR">Behavior & Conduct</option>
                            <option value="GENERAL">General Observation</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Observation Details</label>
                        <textarea
                          rows={2}
                          placeholder="Write observation or feedback for student & parent..."
                          value={newFeedbackComment}
                          onChange={(e) => setNewFeedbackComment(e.target.value)}
                          className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:outline-none"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingFeedback}
                        className="px-4 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 shadow-sm disabled:opacity-50"
                      >
                        {savingFeedback ? "Saving..." : "Save Observation"}
                      </button>
                    </form>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {feedbacks.length === 0 ? (
                        <p className="text-xs text-slate-500 py-2">No observations recorded for this student yet.</p>
                      ) : (
                        feedbacks.map((fb) => (
                          <div key={fb.id} className="p-3 border border-slate-200 rounded text-xs flex justify-between items-start">
                            <div>
                              <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                {fb.feedback_type}
                              </span>
                              <p className="text-slate-800 mt-1.5">{fb.comment}</p>
                              <p className="text-[10px] text-slate-400 mt-1">Date: {fb.feedback_date}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteFeedback(fb.id)}
                              className="text-rose-600 hover:bg-rose-50 p-1 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
