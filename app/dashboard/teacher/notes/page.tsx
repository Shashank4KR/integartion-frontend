"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getCurrentTeacher, getTeacherClasses, getTeacherSubjects } from "@/lib/services/teacherService";
import {
  deleteChapterNote,
  getChapterNotes,
  uploadChapterNote,
  type ChapterNote,
} from "@/lib/services/academicContentService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, CheckCircle2, FolderOpen, Upload, Trash2, ExternalLink, FileText } from "lucide-react";

export default function TeacherNotesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ id: string; class_name: string; section?: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; subject_name: string }>>([]);

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [chapterName, setChapterName] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [notes, setNotes] = useState<ChapterNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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

        const initialNotes = await getChapterNotes(storedToken);
        setNotes(initialNotes);
      } catch (err: any) {
        setError(err?.message || "Failed to load chapter notes.");
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, [router]);

  const loadNotes = async (classId?: string, subjectId?: string) => {
    if (!token) return;
    try {
      const fetched = await getChapterNotes(token, {
        class_id: classId || selectedClass,
        subject_id: subjectId || selectedSubject,
      });
      setNotes(fetched);
    } catch {
      // Keep existing list on error
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || !chapterName || !noteTitle || !selectedFile) {
      setError("Please fill all required fields and choose a file.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("class_id", selectedClass);
      formData.append("subject_id", selectedSubject);
      formData.append("chapter_name", chapterName);
      formData.append("title", noteTitle);
      formData.append("file", selectedFile);

      const created = await uploadChapterNote(token, formData);
      setSuccess(`Note "${created.title}" uploaded successfully!`);
      setNoteTitle("");
      setSelectedFile(null);
      await loadNotes();
    } catch (err: any) {
      setError(err?.message || "Failed to upload chapter note.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this chapter note?")) return;
    try {
      await deleteChapterNote(token, noteId);
      setSuccess("Chapter note deleted.");
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err: any) {
      setError(err?.message || "Failed to delete chapter note.");
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
            <FolderOpen className="h-8 w-8 text-purple-600" />
            Upload Chapter Notes
          </h1>
          <p className="text-slate-600 mt-1">Upload learning notes for your assigned class, subject, and chapter.</p>
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
            <Upload className="h-5 w-5 text-purple-600" />
            New Chapter Note Upload
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grade / Class *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    void loadNotes(e.target.value, selectedSubject);
                  }}
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
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    void loadNotes(selectedClass, e.target.value);
                  }}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Chapter Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 1 - Quadratic Equations"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Formula Sheet & Worked Examples"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload File (PDF / Doc / Image) *</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-600 border border-slate-300 rounded-md p-2 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading Note..." : "Upload Note"}
            </button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Uploaded Notes ({notes.length})</h2>

          {notes.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No chapter notes found for the selected filter.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {notes.map((note) => (
                <div key={note.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{note.title}</h3>
                      <p className="text-xs text-purple-700 font-medium">{note.chapter_name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {note.class_name} · {note.subject_name} · File: {note.file_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={note.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Open File"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Note"
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
