"use client";

import { useEffect, useState, useMemo } from "react";
import Modal from "@/components/shared/Modal";
import DatePicker from "@/components/shared/DatePicker";
import { createBookIssue, listBooks, listCategories } from "@/lib/services/libraryService";
import { listStudents } from "@/lib/services/studentService";
import type { BookResponse, BookCategoryResponse } from "@/types/entities/library";
import type { StudentResponse } from "@/types/entities/student";
import {
  BookMarked,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Layers,
  Library,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";

interface IssueBookDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  defaultBookId?: string;
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CATEGORY_STYLES: Record<string, { badge: string; border: string; bg: string }> = {
  mathematics: { badge: "bg-blue-50 text-blue-700 border-blue-200", border: "border-blue-300", bg: "bg-blue-500/10" },
  science: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", border: "border-emerald-300", bg: "bg-emerald-500/10" },
  "social science": { badge: "bg-amber-50 text-amber-700 border-amber-200", border: "border-amber-300", bg: "bg-amber-500/10" },
  english: { badge: "bg-purple-50 text-purple-700 border-purple-200", border: "border-purple-300", bg: "bg-purple-500/10" },
  hindi: { badge: "bg-rose-50 text-rose-700 border-rose-200", border: "border-rose-300", bg: "bg-rose-500/10" },
  kannada: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", border: "border-indigo-300", bg: "bg-indigo-500/10" },
  "physical education": { badge: "bg-orange-50 text-orange-700 border-orange-200", border: "border-orange-300", bg: "bg-orange-500/10" },
};

export default function IssueBookDialog({
  open,
  onClose,
  onSuccess,
  token,
  defaultBookId,
}: IssueBookDialogProps) {
  const [bookId, setBookId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const [books, setBooks] = useState<BookResponse[]>([]);
  const [categories, setCategories] = useState<BookCategoryResponse[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);

  // Search & Filter state
  const [bookSearch, setBookSearch] = useState<string>("");
  const [selectedSubjectPill, setSelectedSubjectPill] = useState<string>("ALL");
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [isBookPickerExpanded, setIsBookPickerExpanded] = useState<boolean>(true);

  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setBookSearch("");
    setStudentSearch("");
    setSelectedSubjectPill("ALL");

    const now = new Date();
    const plusTwoWeeks = new Date();
    plusTwoWeeks.setDate(now.getDate() + 14);

    setIssueDate(formatDate(now));
    setDueDate(formatDate(plusTwoWeeks));

    const loadData = async () => {
      setLoadingData(true);
      try {
        const [bookList, catList, studentList] = await Promise.all([
          listBooks(token).catch(() => []),
          listCategories(token).catch(() => []),
          listStudents(token).catch(() => []),
        ]);

        setBooks(bookList);
        setCategories(catList);
        setStudents(studentList);

        if (defaultBookId) {
          setBookId(defaultBookId);
          setIsBookPickerExpanded(false);
        } else if (bookList.length > 0) {
          const firstAvailable = bookList.find((b) => b.available_copies > 0);
          setBookId(firstAvailable?.id ?? bookList[0].id);
          setIsBookPickerExpanded(true);
        }

        if (studentList.length > 0) {
          setStudentId(studentList[0].id);
        }
      } catch (err) {
        console.error("Failed to load issue data:", err);
        setError("Failed to load library catalog and student records.");
      } finally {
        setLoadingData(false);
      }
    };

    void loadData();
  }, [open, token, defaultBookId]);

  // Map category ID to Category Name
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.category_name));
    return map;
  }, [categories]);

  // Selected Book Object
  const selectedBook = useMemo(() => {
    return books.find((b) => b.id === bookId) || null;
  }, [books, bookId]);

  // Filtered Books List
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const catName = categoryMap.get(b.category_id) || "";
      if (selectedSubjectPill !== "ALL" && catName.toLowerCase() !== selectedSubjectPill.toLowerCase()) {
        return false;
      }

      if (!bookSearch.trim()) return true;
      const q = bookSearch.toLowerCase();
      const title = (b.title ?? "").toLowerCase();
      const author = (b.author ?? "").toLowerCase();
      const isbn = (b.isbn ?? "").toLowerCase();
      const sub = (b.subtitle ?? "").toLowerCase();
      return title.includes(q) || author.includes(q) || isbn.includes(q) || sub.includes(q) || catName.toLowerCase().includes(q);
    });
  }, [books, selectedSubjectPill, bookSearch, categoryMap]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (!studentSearch.trim()) return true;
      const q = studentSearch.toLowerCase();
      const fullName = `${s.first_name ?? ""} ${s.last_name ?? ""}`.toLowerCase();
      const admission = (s.admission_no ?? "").toLowerCase();
      const roll = (s.roll_no ? String(s.roll_no) : "").toLowerCase();
      const grade = (s.class_name ?? "").toLowerCase();
      return fullName.includes(q) || admission.includes(q) || roll.includes(q) || grade.includes(q);
    });
  }, [students, studentSearch]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === studentId) || null;
  }, [students, studentId]);

  // Quick preset helper for due date
  const setDueDatePreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(formatDate(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId) {
      setError("Please select a book to issue.");
      return;
    }
    if (!studentId) {
      setError("Please select a student borrower.");
      return;
    }
    if (!issueDate) {
      setError("Please select an issue date.");
      return;
    }
    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }
    if (dueDate <= issueDate) {
      setError("Due date must be after the issue date.");
      return;
    }
    if (selectedBook && selectedBook.available_copies <= 0) {
      setError("No available copies of this book remain in library stock.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createBookIssue(token, {
        book_id: bookId,
        student_id: studentId,
        issue_date: issueDate,
        due_date: dueDate,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to issue book.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Issue / Lend Book" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-slate-600 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span>Loading Nomera library catalog & students...</span>
          </div>
        ) : (
          <>
            {/* 1. BOOK SELECTION SECTION */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Library className="w-4 h-4 text-purple-600" />
                  <span>Select Curriculum Book</span>
                  <span className="text-red-500">*</span>
                </label>
                {selectedBook && (
                  <button
                    type="button"
                    onClick={() => setIsBookPickerExpanded(!isBookPickerExpanded)}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>{isBookPickerExpanded ? "Collapse Catalog" : "Change Book"}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isBookPickerExpanded ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>

              {/* Active Selected Book Banner */}
              {selectedBook && !isBookPickerExpanded && (
                <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50/80 via-white to-purple-50/40 p-3.5 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md shadow-purple-600/20">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">{selectedBook.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200 flex-shrink-0">
                          {categoryMap.get(selectedBook.category_id) || "General"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Author: <strong className="text-slate-700 font-medium">{selectedBook.author}</strong> · ISBN:{" "}
                        <span className="font-mono text-slate-600">{selectedBook.isbn}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {selectedBook.available_copies} of {selectedBook.total_copies} In Stock
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">{selectedBook.rack_number || "Main Rack"}</p>
                  </div>
                </div>
              )}

              {/* Expanded Searchable Book Picker */}
              {isBookPickerExpanded && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-3">
                  {/* Live Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Class 10 books by title, author, subject, or ISBN..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-8 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                    {bookSearch && (
                      <button
                        type="button"
                        onClick={() => setBookSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Subject Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedSubjectPill("ALL")}
                      className={`px-2.5 py-1 rounded-full font-semibold transition whitespace-nowrap ${
                        selectedSubjectPill === "ALL"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      All ({books.length})
                    </button>
                    {categories.map((cat) => {
                      const count = books.filter((b) => b.category_id === cat.id).length;
                      const isSelected = selectedSubjectPill.toLowerCase() === cat.category_name.toLowerCase();
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedSubjectPill(cat.category_name)}
                          className={`px-2.5 py-1 rounded-full font-semibold transition whitespace-nowrap ${
                            isSelected
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {cat.category_name} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Scrollable Book Cards */}
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {filteredBooks.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
                        No Class 10 books match your search or filter.
                      </div>
                    ) : (
                      filteredBooks.map((b) => {
                        const isSelected = b.id === bookId;
                        const isAvailable = b.available_copies > 0;
                        const catName = categoryMap.get(b.category_id) || "General";
                        const style = CATEGORY_STYLES[catName.toLowerCase()] || {
                          badge: "bg-slate-100 text-slate-700 border-slate-200",
                          border: "border-slate-300",
                          bg: "bg-slate-100",
                        };

                        return (
                          <div
                            key={b.id}
                            onClick={() => {
                              if (isAvailable) {
                                setBookId(b.id);
                                setIsBookPickerExpanded(false);
                              }
                            }}
                            className={`p-2.5 rounded-lg border transition flex items-center justify-between gap-3 text-left ${
                              !isAvailable
                                ? "bg-slate-50/70 border-slate-200 opacity-60 cursor-not-allowed"
                                : isSelected
                                ? "bg-purple-50/90 border-purple-400 shadow-sm cursor-pointer"
                                : "bg-white border-slate-200 hover:border-purple-200 hover:bg-purple-50/30 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                  isSelected ? "bg-purple-600 text-white" : style.bg + " text-slate-700"
                                }`}
                              >
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold truncate ${isSelected ? "text-purple-900" : "text-slate-800"}`}>
                                    {b.title}
                                  </span>
                                  <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded border flex-shrink-0 ${style.badge}`}>
                                    {catName}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {b.author} · <span className="font-mono text-slate-400">{b.isbn}</span> · {b.rack_number || "General"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  isAvailable
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}
                              >
                                {isAvailable ? `${b.available_copies} Available` : "Checked Out"}
                              </span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. BORROWER / STUDENT SELECTION */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>Select Student Borrower</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-500">Nomera Class 10 Students</span>
              </div>

              {/* Student Filter & Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-5 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full h-10 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-7">
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    className="w-full h-10 px-3 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    {filteredStudents.length === 0 ? (
                      <option value="">No students found</option>
                    ) : (
                      filteredStudents.map((s) => {
                        const fullName = `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Student";
                        const adm = s.admission_no ? ` · Adm: ${s.admission_no}` : "";
                        const cls = s.class_name ? ` · ${s.class_name}` : " · Class 10";
                        return (
                          <option key={s.id} value={s.id}>
                            {fullName} ({cls}{adm})
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
              </div>

              {/* Active Student Pill Preview */}
              {selectedStudent && (
                <div className="flex items-center gap-2 p-2 bg-purple-50/50 rounded-lg border border-purple-100 text-xs text-purple-900">
                  <div className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 font-bold flex items-center justify-center text-[10px]">
                    {(selectedStudent.first_name?.[0] || "S").toUpperCase()}
                  </div>
                  <span className="font-semibold">{selectedStudent.first_name} {selectedStudent.last_name}</span>
                  <span className="text-purple-600">· Admission No: {selectedStudent.admission_no || "NOM-2026-001"}</span>
                  <span className="ml-auto font-medium text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded text-[11px]">
                    {selectedStudent.class_name || "Class 10"}
                  </span>
                </div>
              )}
            </div>

            {/* 3. LOAN TIMELINE & DUE DATES */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Circulation Schedule</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Issue Date</label>
                  <DatePicker value={issueDate} onChange={setIssueDate} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Due Date (Expected Return)</label>
                  <DatePicker value={dueDate} onChange={setDueDate} />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-500 font-medium">Quick Presets:</span>
                {[
                  { label: "7 Days", days: 7 },
                  { label: "14 Days (Standard)", days: 14 },
                  { label: "21 Days", days: 21 },
                  { label: "30 Days", days: 30 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setDueDatePreset(preset.days)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 rounded text-slate-600 font-medium transition cursor-pointer"
                  >
                    +{preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (selectedBook ? selectedBook.available_copies <= 0 : false)}
                className="px-5 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Issuing Book...</span>
                  </>
                ) : (
                  <>
                    <BookMarked className="w-4 h-4" />
                    <span>Lend & Issue Book</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
