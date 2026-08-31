"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import DatePicker from "@/components/shared/DatePicker";
import { createBookIssue, listBooks } from "@/lib/services/libraryService";
import { listStudents } from "@/lib/services/studentService";
import type { BookResponse } from "@/types/entities/library";
import type { StudentResponse } from "@/types/entities/student";
import { BookMarked, Loader2, Search, User } from "lucide-react";

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
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [studentSearch, setStudentSearch] = useState<string>("");

  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setStudentSearch("");

    const now = new Date();
    const plusTwoWeeks = new Date();
    plusTwoWeeks.setDate(now.getDate() + 14);

    setIssueDate(formatDate(now));
    setDueDate(formatDate(plusTwoWeeks));

    const loadData = async () => {
      setLoadingData(true);
      try {
        const [bookList, studentList] = await Promise.all([
          listBooks(token).catch((err) => {
            console.error("Error fetching books for issue:", err);
            return [];
          }),
          listStudents(token).catch((err) => {
            console.error("Error fetching students for issue:", err);
            return [];
          }),
        ]);

        setBooks(bookList);
        setStudents(studentList);

        if (defaultBookId) {
          setBookId(defaultBookId);
        } else if (bookList.length > 0) {
          const firstAvailable = bookList.find((b) => b.available_copies > 0);
          setBookId(firstAvailable?.id ?? bookList[0].id);
        }

        if (studentList.length > 0) {
          setStudentId(studentList[0].id);
        }
      } catch (err) {
        console.error("Failed to load issue data:", err);
        setError("Failed to load library and student records.");
      } finally {
        setLoadingData(false);
      }
    };

    void loadData();
  }, [open, token, defaultBookId]);

  const selectedBook = books.find((b) => b.id === bookId);

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    const fullName = `${s.first_name ?? ""} ${s.last_name ?? ""}`.toLowerCase();
    const admission = (s.admission_no ?? "").toLowerCase();
    const grade = (s.class_name ?? "").toLowerCase();
    const id = (s.id ?? "").toLowerCase();
    return fullName.includes(q) || admission.includes(q) || grade.includes(q) || id.includes(q);
  });

  // Ensure an active student is selected if search filter changes
  useEffect(() => {
    if (filteredStudents.length > 0) {
      const exists = filteredStudents.some((s) => s.id === studentId);
      if (!exists) {
        setStudentId(filteredStudents[0].id);
      }
    } else {
      setStudentId("");
    }
  }, [studentSearch, filteredStudents, studentId]);

  const selectedStudent = students.find((s) => s.id === studentId);

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
      setError("No available copies of this book remain.");
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
    <Modal open={open} onClose={onClose} title="Issue / Lend Book" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {loadingData ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-purple-600 mr-2" />
            Loading library and student records...
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Book <span className="text-red-500">*</span>
              </label>
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {books.length === 0 ? (
                  <option value="">No books available in catalog</option>
                ) : (
                  books.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      disabled={b.available_copies <= 0}
                    >
                      {b.title} — by {b.author} ({b.available_copies}/{b.total_copies} available)
                    </option>
                  ))
                )}
              </select>
              {selectedBook && (
                <p className="mt-1 text-xs text-slate-500">
                  ISBN: <span className="font-mono text-slate-700">{selectedBook.isbn}</span> ·
                  Available Copies:{" "}
                  <span className={`font-semibold ${selectedBook.available_copies > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {selectedBook.available_copies} of {selectedBook.total_copies}
                  </span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Borrower / Student <span className="text-red-500">*</span>
                </label>
                {students.length > 0 && (
                  <span className="text-xs text-slate-500">
                    {filteredStudents.length} of {students.length} students
                  </span>
                )}
              </div>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter student by name, admission no, or class..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-500"
                />
              </div>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {filteredStudents.length === 0 ? (
                  <option value="">
                    {students.length === 0
                      ? "No students registered in database"
                      : "No students match your filter"}
                  </option>
                ) : (
                  filteredStudents.map((s) => {
                    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Student";
                    const adm = s.admission_no ? ` · Adm: ${s.admission_no}` : "";
                    const cls = s.class_name ? ` · Class: ${s.class_name}` : "";
                    return (
                      <option key={s.id} value={s.id}>
                        {fullName}{adm}{cls}
                      </option>
                    );
                  })
                )}
              </select>
              {selectedStudent && (
                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                  <User className="h-3.5 w-3.5 text-purple-600" />
                  <span>
                    Selected: <strong className="text-slate-800">{selectedStudent.first_name} {selectedStudent.last_name}</strong>
                    {selectedStudent.admission_no && ` (Adm #${selectedStudent.admission_no})`}
                    {selectedStudent.class_name && ` · Grade ${selectedStudent.class_name}`}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <DatePicker value={issueDate} onChange={setIssueDate} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <DatePicker value={dueDate} onChange={setDueDate} />
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              submitting ||
              loadingData ||
              !studentId ||
              (selectedBook ? selectedBook.available_copies <= 0 : false)
            }
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Issuing Book...
              </>
            ) : (
              <>
                <BookMarked className="h-4 w-4" />
                Confirm Loan
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
