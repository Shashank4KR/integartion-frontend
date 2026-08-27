"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentTeacher, getTeacherClasses, getTeacherSubjects } from "@/lib/services/teacherService";
import {
  createLessonPlan,
  deleteLessonPlan,
  getLessonPlans,
  type LessonPlan,
} from "@/lib/services/academicContentService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, CheckCircle2, FileText, Plus, Trash2, Calendar, BookOpen } from "lucide-react";

export default function TeacherLessonPlansPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ id: string; class_name: string; section?: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; subject_name: string }>>([]);

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const [chapterName, setChapterName] = useState("");
  const [topic, setTopic] = useState("");
  const [planDate, setPlanDate] = useState(new Date().toISOString().split("T")[0]);
  const [objectives, setObjectives] = useState("");
  const [materialsNeeded, setMaterialsNeeded] = useState("");
  const [procedureSummary, setProcedureSummary] = useState("");
  const [homeworkNotes, setHomeworkNotes] = useState("");

  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
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
        const [clsList, subjList] = await Promise.all([
          getTeacherClasses(storedToken, teacher.id),
          getTeacherSubjects(storedToken, teacher.id),
        ]);

        setClasses(clsList);
        setSubjects(subjList);

        if (clsList.length > 0) setSelectedClass(clsList[0].id);
        if (subjList.length > 0) setSelectedSubject(subjList[0].id);

        const loadedPlans = await getLessonPlans(storedToken);
        setPlans(loadedPlans);
      } catch (err: any) {
        setError(err?.message || "Failed to initialize lesson plans.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || !chapterName || !topic) {
      setError("Please fill required fields (Class, Subject, Chapter, Topic).");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await createLessonPlan(token, {
        class_id: selectedClass,
        subject_id: selectedSubject,
        chapter_name: chapterName,
        topic,
        plan_date: planDate,
        objectives,
        materials_needed: materialsNeeded,
        procedure_summary: procedureSummary,
        homework_notes: homeworkNotes,
        status: "PUBLISHED",
      });

      setSuccess(`Lesson Plan "${created.topic}" created successfully.`);
      setTopic("");
      setObjectives("");
      setMaterialsNeeded("");
      setProcedureSummary("");
      setHomeworkNotes("");

      const updated = await getLessonPlans(token);
      setPlans(updated);
    } catch (err: any) {
      setError(err?.message || "Failed to create lesson plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Delete this lesson plan?")) return;
    try {
      await deleteLessonPlan(token, planId);
      setSuccess("Lesson plan deleted.");
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (err: any) {
      setError(err?.message || "Failed to delete lesson plan.");
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

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-purple-600" />
            Teacher Lesson Plans
          </h1>
          <p className="text-slate-600 mt-1">Create, organize, and view structured chapter lesson plans.</p>
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-purple-600" />
            Create Lesson Plan
          </h2>

          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class / Section *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} {cls.section ? `(${cls.section})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                >
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan Date *</label>
                <input
                  type="date"
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chapter Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 3 - Thermodynamics"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topic *</label>
                <input
                  type="text"
                  placeholder="e.g. Laws of Heat Transfer & Practical Applications"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Learning Objectives</label>
                <textarea
                  rows={2}
                  placeholder="What students should learn by the end of this lesson..."
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Materials / Teaching Aids Needed</label>
                <textarea
                  rows={2}
                  placeholder="Smartboard, Lab Kits, Handouts..."
                  value={materialsNeeded}
                  onChange={(e) => setMaterialsNeeded(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Procedure & Teaching Summary</label>
              <textarea
                rows={3}
                placeholder="Brief outline of lesson steps, activities, Q&A session..."
                value={procedureSummary}
                onChange={(e) => setProcedureSummary(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Lesson Plan"}
            </button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Saved Lesson Plans ({plans.length})</h2>

          {plans.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No lesson plans created yet.</p>
          ) : (
            <div className="space-y-4">
              {plans.map((p) => (
                <div key={p.id} className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                        {p.class_name} · {p.subject_name}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{p.topic}</h3>
                      <p className="text-xs font-medium text-slate-500">{p.chapter_name} · Date: {p.plan_date}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {p.objectives && (
                    <div className="mt-3 text-xs text-slate-600">
                      <strong className="text-slate-700">Objectives:</strong> {p.objectives}
                    </div>
                  )}

                  {p.procedure_summary && (
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded">
                      <strong className="text-slate-700">Procedure:</strong> {p.procedure_summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </RoleDashboardLayout>
  );
}
