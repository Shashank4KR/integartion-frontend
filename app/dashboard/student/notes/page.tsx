"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken } from "@/lib/auth";
import { getChapterNotes, type ChapterNote } from "@/lib/services/academicContentService";
import Card from "@/components/shared/Card";
import { Loader2, AlertCircle, FolderOpen, Download, FileText, BookOpen } from "lucide-react";

export default function StudentNotesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [notes, setNotes] = useState<ChapterNote[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const storedToken = getToken();
        if (!storedToken) {
          router.replace("/login");
          return;
        }
        setToken(storedToken);

        const fetchedNotes = await getChapterNotes(storedToken);
        setNotes(fetchedNotes);
      } catch (err: any) {
        setError(err?.message || "Failed to load chapter notes.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  const uniqueSubjects = Array.from(new Set(notes.map((n) => n.subject_name).filter(Boolean))) as string[];
  const uniqueChapters = Array.from(
    new Set(
      notes
        .filter((n) => !selectedSubject || n.subject_name === selectedSubject)
        .map((n) => n.chapter_name)
        .filter(Boolean)
    )
  ) as string[];

  const filteredNotes = notes.filter((n) => {
    if (selectedSubject && n.subject_name !== selectedSubject) return false;
    if (selectedChapter && n.chapter_name !== selectedChapter) return false;
    return true;
  });

  if (loading) {
    return (
      <RoleDashboardLayout config={ROLE_CONFIGS.student}>
        <Card className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </Card>
      </RoleDashboardLayout>
    );
  }

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.student}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-blue-600" />
            Chapter Notes & Study Materials
          </h1>
          <p className="text-slate-600 mt-1">Access uploaded class chapter notes, study materials, and formula sheets.</p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </Card>
        )}

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter("");
                }}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Chapters</option>
                {uniqueChapters.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Notes ({filteredNotes.length})</h2>

          {filteredNotes.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No chapter notes available for your class with selected filters.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="h-7 w-7 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{note.title}</h3>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">{note.chapter_name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Subject: {note.subject_name} · Class: {note.class_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                    <span className="text-xs text-slate-400 font-mono truncate max-w-[180px]">{note.file_name}</span>
                    <a
                      href={note.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Download / Open
                    </a>
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
