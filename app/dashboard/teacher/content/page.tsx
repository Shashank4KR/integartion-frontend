"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentTeacher, getTeacherClasses, getTeacherSubjects } from "@/lib/services/teacherService";
import {
  createContentResource,
  deleteContentResource,
  getContentResources,
  type ContentResource,
} from "@/lib/services/academicContentService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, CheckCircle2, Link, Plus, Trash2, ExternalLink, Globe } from "lucide-react";

export default function TeacherContentPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ id: string; class_name: string; section?: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; subject_name: string }>>([]);

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [chapterName, setChapterName] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const [resources, setResources] = useState<ContentResource[]>([]);
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

        const loaded = await getContentResources(storedToken);
        setResources(loaded);
      } catch (err: any) {
        setError(err?.message || "Failed to load content resources.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || !title || !url) {
      setError("Please fill required fields (Class, Subject, Title, URL).");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await createContentResource(token, {
        class_id: selectedClass,
        subject_id: selectedSubject,
        chapter_name: chapterName || null,
        title,
        url,
        description: description || null,
      });

      setSuccess(`Learning link "${created.title}" added.`);
      setTitle("");
      setUrl("");
      setDescription("");

      const updated = await getContentResources(token);
      setResources(updated);
    } catch (err: any) {
      setError(err?.message || "Failed to add content resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content link?")) return;
    try {
      await deleteContentResource(token, id);
      setSuccess("Link deleted.");
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete resource link.");
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
            <Link className="h-8 w-8 text-purple-600" />
            Learning Content & Resource Links
          </h1>
          <p className="text-slate-600 mt-1">Share external study links, videos, and online resources with your classes.</p>
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
            Add New Content Link
          </h2>

          <form onSubmit={handleAddResource} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Khan Academy Video Lecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chapter Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 2 - Derivatives"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL / Web Address *</label>
              <input
                type="url"
                placeholder="https://example.com/resource"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Optional details or instructions for students..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? "Adding..." : "Add Content Link"}
            </button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Learning Links ({resources.length})</h2>

          {resources.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No content resources added yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {resources.map((res) => (
                <div key={res.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Globe className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{res.title}</h3>
                      <p className="text-xs text-slate-500">
                        {res.class_name} · {res.subject_name} {res.chapter_name ? `· ${res.chapter_name}` : ""}
                      </p>
                      {res.description && <p className="text-xs text-slate-600 mt-1">{res.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Visit Link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </RoleDashboardLayout>
  );
}
