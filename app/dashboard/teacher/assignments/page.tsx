"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getCurrentTeacher,
  getTeacherClasses,
  getTeacherSubjects,
  getTeacherAssignments,
} from "@/lib/services/teacherService";
import {
  createAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  type AssignmentSubmissionItem,
} from "@/lib/services/assignmentService";
import Card from "@/components/shared/Card";
import Modal from "@/components/shared/Modal";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Plus,
  Trash2,
  Users,
  Calendar,
  BookOpen,
  Search,
  ExternalLink,
  GraduationCap,
  Save,
  Clock,
} from "lucide-react";

interface FormattedAssignment {
  id: string;
  title: string;
  subject_name?: string | null;
  class_name?: string | null;
  due_date: string;
  description?: string | null;
  created_at?: string | null;
}

export default function TeacherAssignmentsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [classes, setClasses] = useState<Array<{ id: string; class_name: string; section?: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; subject_name: string }>>([]);
  const [assignments, setAssignments] = useState<FormattedAssignment[]>([]);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

  // Create Assignment Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [newClassId, setNewClassId] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newAttachment, setNewAttachment] = useState("");

  // Submissions Modal
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<FormattedAssignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmissionItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingState, setGradingState] = useState<Record<string, { marks: string; remarks: string; saving?: boolean }>>({});

  const loadAllData = async (activeToken: string) => {
    try {
      setLoading(true);
      const teacher = await getCurrentTeacher(activeToken);
      setTeacherId(teacher.id);

      const [clsList, subjList, teacherAssignments] = await Promise.all([
        getTeacherClasses(activeToken, teacher.id).catch(() => []),
        getTeacherSubjects(activeToken, teacher.id).catch(() => []),
        getTeacherAssignments(activeToken, teacher.id).catch(() => []),
      ]);

      setClasses(clsList);
      setSubjects(subjList);

      if (clsList.length > 0 && !newClassId) setNewClassId(clsList[0].id);
      if (subjList.length > 0 && !newSubjectId) setNewSubjectId(subjList[0].id);

      setAssignments(
        teacherAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          subject_name: a.subject_name ?? "Subject",
          class_name: a.class_name ?? "Class",
          due_date: a.due_date ?? "",
          description: a.description,
          created_at: a.created_at,
        }))
      );
      setError(null);
    } catch (err: any) {
      console.error("Error fetching teacher data:", err);
      setError(err?.message || "Failed to load assignments and classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userToken = getToken();
    const user = getStoredUser();

    if (!userToken || !user) {
      router.replace("/login");
      return;
    }

    setToken(userToken);
    void loadAllData(userToken);
  }, [router]);

  const handleOpenCreateModal = () => {
    setModalError(null);
    // Set default due date to 2 days in the future
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 2);
    defaultDate.setHours(23, 59, 0, 0);
    const isoString = defaultDate.toISOString().slice(0, 16);
    setNewDueDate(isoString);

    if (classes.length > 0) setNewClassId(classes[0].id);
    if (subjects.length > 0) setNewSubjectId(subjects[0].id);

    setNewTitle("");
    setNewDescription("");
    setNewAttachment("");
    setCreateModalOpen(true);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassId || !newSubjectId || !newTitle.trim() || !newDueDate) {
      setModalError("Please fill all required fields (Class, Subject, Title, Due Date).");
      return;
    }

    try {
      setCreating(true);
      setModalError(null);

      // Ensure ISO format for backend datetime parser
      const dueDateTime = new Date(newDueDate).toISOString();

      await createAssignment(token, {
        teacher_id: teacherId,
        class_id: newClassId,
        subject_id: newSubjectId,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        due_date: dueDateTime,
        attachment: newAttachment.trim() || null,
      });

      setSuccess(`Assessment / Assignment "${newTitle.trim()}" created successfully!`);
      setTimeout(() => setSuccess(null), 4000);
      setCreateModalOpen(false);
      await loadAllData(token);
    } catch (err: any) {
      console.error("Error creating assignment:", err);
      setModalError(err?.message || "Failed to create assignment. Ensure due date is in the future.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? All student submissions will also be removed.`)) {
      return;
    }

    try {
      await deleteAssignment(token, id);
      setSuccess(`Assignment "${title}" deleted.`);
      setTimeout(() => setSuccess(null), 3000);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete assignment.");
    }
  };

  const handleOpenSubmissions = async (assignment: FormattedAssignment) => {
    setSelectedAssignment(assignment);
    setSubmissionsModalOpen(true);
    setLoadingSubmissions(true);
    try {
      const list = await getAssignmentSubmissions(token, assignment.id);
      setSubmissions(list);

      const initialGrading: Record<string, { marks: string; remarks: string }> = {};
      list.forEach((sub) => {
        initialGrading[sub.id] = {
          marks: sub.marks !== null && sub.marks !== undefined ? String(sub.marks) : "",
          remarks: sub.remarks || "",
        };
      });
      setGradingState(initialGrading);
    } catch (err: any) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    const current = gradingState[submissionId];
    if (!current) return;

    try {
      setGradingState((prev) => ({
        ...prev,
        [submissionId]: { ...prev[submissionId], saving: true },
      }));

      const marksVal = current.marks !== "" ? parseFloat(current.marks) : null;
      await gradeSubmission(token, submissionId, {
        marks: marksVal,
        remarks: current.remarks || null,
      });

      setSuccess("Grade and feedback saved successfully!");
      setTimeout(() => setSuccess(null), 3000);

      // Update in memory list
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, marks: marksVal, remarks: current.remarks } : s))
      );
    } catch (err: any) {
      alert(err?.message || "Failed to save grade.");
    } finally {
      setGradingState((prev) => ({
        ...prev,
        [submissionId]: { ...prev[submissionId], saving: false },
      }));
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.subject_name && a.subject_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = filterClass === "all" || a.class_name === filterClass;
    const matchesSubject = filterSubject === "all" || a.subject_name === filterSubject;
    return matchesSearch && matchesClass && matchesSubject;
  });

  const uniqueClassNames = Array.from(new Set(assignments.map((a) => a.class_name).filter(Boolean)));
  const uniqueSubjectNames = Array.from(new Set(assignments.map((a) => a.subject_name).filter(Boolean)));

  return (
    <RoleDashboardLayout config={ROLE_CONFIGS.teacher}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2.5">
              <ClipboardList className="h-8 w-8 text-purple-600" />
              Assessments & Assignments
            </h1>
            <p className="text-slate-600 mt-1">
              Create and manage tests, mock exams, homework, and grade student submissions.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-purple-700 transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Create Assessment / Assignment
          </button>
        </div>

        {/* Global Feedback Messages */}
        {error && (
          <Card className="border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </Card>
        )}

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assessments, topics, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 shadow-sm"
            />
          </div>

          <div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 shadow-sm"
            >
              <option value="all">All Classes & Grades</option>
              {uniqueClassNames.map((c) => (
                <option key={c as string} value={c as string}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 shadow-sm"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjectNames.map((s) => (
                <option key={s as string} value={s as string}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-sm font-medium text-slate-600">Loading assignments & assessments...</p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredAssignments.length === 0 && (
          <Card className="border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mb-4">
              <ClipboardList className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No assessments created yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Get started by creating your first homework, periodic assessment, or mock test for your students.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-purple-700 transition"
            >
              <Plus className="h-4 w-4" />
              Create Assessment Now
            </button>
          </Card>
        )}

        {/* Assignments Cards Grid */}
        {!loading && filteredAssignments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((assignment) => {
              const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date();

              return (
                <div
                  key={assignment.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-purple-300 hover:shadow-md transition duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {assignment.class_name}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          <BookOpen className="h-3.5 w-3.5" />
                          {assignment.subject_name}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                        title="Delete Assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                      {assignment.title}
                    </h3>

                    {assignment.description && (
                      <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line">
                        {assignment.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className={isPastDue ? "font-semibold text-rose-600" : "text-slate-600"}>
                        Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "No due date"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenSubmissions(assignment)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-100 hover:text-purple-700 transition"
                    >
                      <Users className="h-3.5 w-3.5" />
                      Submissions & Grading
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Assessment / Assignment */}
        <Modal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Assessment / Assignment"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Class / Grade *
                </label>
                <select
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assessment / Assignment Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 4 Assessment - Quadratic Equations"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Questions, Study Notes & Instructions
              </label>
              <textarea
                rows={5}
                placeholder="Enter instructions, questions, formulas, or guidelines for the students..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Attachment / Reference URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/math-study-notes.pdf"
                value={newAttachment}
                onChange={(e) => setNewAttachment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-purple-700 transition disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? "Publishing..." : "Publish Assessment"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Submissions & Grading */}
        <Modal
          open={submissionsModalOpen}
          onClose={() => setSubmissionsModalOpen(false)}
          title={`Submissions — ${selectedAssignment?.title ?? ""}`}
          maxWidth="max-w-3xl"
        >
          {loadingSubmissions ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
              <p className="text-sm text-slate-600">Loading student submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No submissions received yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Students will appear here once they turn in their answers or files.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {submissions.map((sub) => {
                const grading = gradingState[sub.id] || { marks: "", remarks: "" };

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {sub.student_name || `Student (${sub.student_id.slice(0, 8)})`}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Submitted on: {new Date(sub.submitted_on).toLocaleString()}
                        </p>
                      </div>

                      {sub.file_path && (
                        <a
                          href={sub.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Attachment
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Marks / Score
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          placeholder="e.g. 85"
                          value={grading.marks}
                          onChange={(e) =>
                            setGradingState((prev) => ({
                              ...prev,
                              [sub.id]: { ...prev[sub.id], marks: e.target.value },
                            }))
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-purple-500 focus:outline-none bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Teacher Feedback / Remarks
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Excellent solution on quadratic formulas."
                            value={grading.remarks}
                            onChange={(e) =>
                              setGradingState((prev) => ({
                                ...prev,
                                [sub.id]: { ...prev[sub.id], remarks: e.target.value },
                              }))
                            }
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-purple-500 focus:outline-none bg-white"
                          />
                          <button
                            type="button"
                            disabled={grading.saving}
                            onClick={() => handleSaveGrade(sub.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 transition disabled:opacity-50"
                          >
                            {grading.saving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      </div>
    </RoleDashboardLayout>
  );
}
