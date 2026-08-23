"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentTeacher, getTeacherClasses, getTeacherSubjects, getTeacherExamResults } from "@/lib/services/teacherService";
import { getAllExams } from "@/lib/services/examService";
import { getClassStudents } from "@/lib/services/classService";
import { createExamResult, updateExamResult, deleteExamResult } from "@/lib/services/examResultService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, CheckCircle2, FileBarChart, Save, Trash2 } from "lucide-react";

export default function TeacherMarksPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ id: string; class_name: string; section?: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; subject_name: string }>>([]);
  const [exams, setExams] = useState<Array<{ id: string; exam_name: string; max_marks?: number }>>([]);

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");

  const [students, setStudents] = useState<Array<{ id: string; first_name?: string; last_name?: string; admission_no: string; roll_no?: string }>>([]);
  const [marksState, setMarksState] = useState<Record<string, { resultId?: string; marks: string }>>({});

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        const [clsList, subjList, examList] = await Promise.all([
          getTeacherClasses(storedToken, teacher.id),
          getTeacherSubjects(storedToken, teacher.id),
          getAllExams(storedToken).catch(() => []),
        ]);

        setClasses(clsList);
        setSubjects(subjList);
        setExams(examList);

        if (clsList.length > 0) setSelectedClass(clsList[0].id);
        if (subjList.length > 0) setSelectedSubject(subjList[0].id);
        if (examList.length > 0) setSelectedExam(examList[0].id);
      } catch (err: any) {
        setError(err?.message || "Failed to load initial data.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  useEffect(() => {
    if (!selectedClass || !token) return;

    async function loadStudentsAndExistingResults() {
      setLoadingStudents(true);
      setError(null);
      setSuccess(null);
      try {
        const classStudents = await getClassStudents(token, selectedClass);
        setStudents(classStudents);

        const initialMarks: Record<string, { resultId?: string; marks: string }> = {};
        classStudents.forEach((s) => {
          initialMarks[s.id] = { marks: "" };
        });

        // Load existing exam results if available
        if (token) {
          const teacher = await getCurrentTeacher(token);
          const existing = await getTeacherExamResults(token, teacher.id);
          existing.forEach((res: any) => {
            if (res.student_id && initialMarks[res.student_id]) {
              initialMarks[res.student_id] = {
                resultId: res.id,
                marks: String(res.marks_obtained),
              };
            }
          });
        }

        setMarksState(initialMarks);
      } catch (err: any) {
        setError(err?.message || "Failed to load class students.");
      } finally {
        setLoadingStudents(false);
      }
    }

    void loadStudentsAndExistingResults();
  }, [selectedClass, selectedExam, token]);

  const handleMarkChange = (studentId: string, val: string) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], marks: val },
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedExam || !selectedClass || !selectedSubject) {
      setError("Please select exam, class, and subject.");
      return;
    }

    const currentExam = exams.find((e) => e.id === selectedExam);
    const maxMarks = currentExam?.max_marks || 100;

    // Validation
    for (const s of students) {
      const val = marksState[s.id]?.marks;
      if (val !== undefined && val !== "") {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > maxMarks) {
          setError(`Invalid marks for ${s.first_name || s.admission_no}. Marks must be between 0 and ${maxMarks}.`);
          return;
        }
      }
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let savedCount = 0;
      for (const s of students) {
        const entry = marksState[s.id];
        if (entry && entry.marks !== "") {
          const marksObtained = parseFloat(entry.marks);
          if (entry.resultId) {
            await updateExamResult(token, entry.resultId, {
              marks_obtained: marksObtained,
            });
          } else {
            const created = await createExamResult(token, {
              exam_id: selectedExam,
              student_id: s.id,
              subject_id: selectedSubject,
              marks_obtained: marksObtained,
              remarks: "Teacher entered",
            });
            setMarksState((prev) => ({
              ...prev,
              [s.id]: { resultId: created.id, marks: entry.marks },
            }));
          }
          savedCount++;
        }
      }

      setSuccess(`Successfully saved marks for ${savedCount} students.`);
    } catch (err: any) {
      setError(err?.message || "Failed to save exam marks.");
    } finally {
      setSaving(false);
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

  const selectedExamObj = exams.find((e) => e.id === selectedExam);
  const maxMarksDisplay = selectedExamObj?.max_marks || 100;

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="h-8 w-8 text-purple-600" />
            Enter Assessment Marks
          </h1>
          <p className="text-slate-600 mt-1">Select examination, class, and subject to record student marks.</p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">{success}</p>
          </Card>
        )}

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assessment / Exam</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                {exams.length === 0 ? (
                  <option value="">No active exams found</option>
                ) : (
                  exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.exam_name} (Max: {ex.max_marks || 100})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class / Section</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name} {cls.section ? `(${cls.section})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.subject_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {loadingStudents ? (
          <Card className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="ml-2 text-slate-600 text-sm">Loading student list...</span>
          </Card>
        ) : students.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No students found for the selected class.
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Marks Entry ({students.length} Students)</h2>
                <p className="text-xs text-slate-500">Max allowed marks: {maxMarksDisplay}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-3 px-4">Roll / Adm No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 text-center">Marks Obtained (Max: {maxMarksDisplay})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => {
                    const fullName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Student";
                    const currentVal = marksState[student.id]?.marks ?? "";


                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                          {student.roll_no || student.admission_no}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">{fullName}</td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={0}
                            max={maxMarksDisplay}
                            step="0.5"
                            placeholder={`0 - ${maxMarksDisplay}`}
                            value={currentVal}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                            className="w-32 rounded border border-slate-300 px-3 py-1 text-center font-mono text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveMarks}
                disabled={saving}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Marks"}
              </button>
            </div>
          </Card>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
