"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Loader2 } from "lucide-react";
import type { SubjectCreate, SubjectResponse, SubjectUpdate } from "@/types/entities/subject";

export default function SubjectFormModal({
  open,
  onClose,
  onSubmit,
  submitting,
  formError,
  editingItem,
  departments = [],
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: SubjectCreate | SubjectUpdate) => Promise<void>;
  submitting: boolean;
  formError: string | null;
  editingItem: SubjectResponse | null;
  departments?: { id: string; department_name: string }[];
}) {
  const [subject_code, setSubjectCode] = useState("");
  const [subject_name, setSubjectName] = useState("");
  const [department_id, setDepartmentId] = useState("");
  const [subject_type, setSubjectType] = useState("THEORY");
  const [credits, setCredits] = useState<number>(3);
  const [periods_per_week, setPeriodsPerWeek] = useState<number>(4);
  const [status, setStatus] = useState("ACTIVE");
  const [touched, setTouched] = useState({ code: false, name: false });

  useEffect(() => {
    if (!open) return;
    setTouched({ code: false, name: false });
    if (editingItem) {
      setSubjectCode(editingItem.subject_code);
      setSubjectName(editingItem.subject_name);
      setDepartmentId(editingItem.department_id ?? "");
      setSubjectType(editingItem.subject_type || "THEORY");
      setCredits(editingItem.credits ?? 3);
      setPeriodsPerWeek(editingItem.periods_per_week ?? 4);
      setStatus(editingItem.status || "ACTIVE");
    } else {
      setSubjectCode("");
      setSubjectName("");
      setDepartmentId("");
      setSubjectType("THEORY");
      setCredits(3);
      setPeriodsPerWeek(4);
      setStatus("ACTIVE");
    }
  }, [open, editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ code: true, name: true });
    if (!subject_code.trim() || !subject_name.trim()) return;
    await onSubmit({
      subject_code: subject_code.trim(),
      subject_name: subject_name.trim(),
      department_id: department_id || null,
      subject_type: subject_type || "THEORY",
      credits: Number(credits) || 0,
      periods_per_week: Number(periods_per_week) || 0,
      status: status || "ACTIVE",
    });
  };

  const codeError = touched.code && !subject_code.trim();
  const nameError = touched.name && !subject_name.trim();

  return (
    <Modal open={open} onClose={onClose} title={editingItem ? "Edit Subject" : "Add New Subject"} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        )}

        {editingItem && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wider">Subject ID</label>
            <input
              type="text"
              value={editingItem.id}
              readOnly
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 font-mono"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Subject Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={subject_code}
            onChange={(e) => {
              setSubjectCode(e.target.value);
              if (!touched.code) setTouched((t) => ({ ...t, code: true }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, code: true }))}
            required
            aria-invalid={codeError}
            aria-describedby={codeError ? "code-error" : undefined}
            placeholder="e.g. MATH101"
            className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition ${
              codeError
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            }`}
          />
          {codeError && (
            <p id="code-error" className="text-xs text-red-500 mt-1">Subject Code is required.</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Subject Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={subject_name}
            onChange={(e) => {
              setSubjectName(e.target.value);
              if (!touched.name) setTouched((t) => ({ ...t, name: true }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            required
            aria-invalid={nameError}
            aria-describedby={nameError ? "name-error" : undefined}
            placeholder="e.g. Mathematics"
            className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition ${
              nameError
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            }`}
          />
          {nameError && (
            <p id="name-error" className="text-xs text-red-500 mt-1">Subject Name is required.</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Department
          </label>
          <select
            value={department_id}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          >
            <option value="">Select Department (Optional)</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Subject Type
            </label>
            <select
              value={subject_type}
              onChange={(e) => setSubjectType(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            >
              <option value="THEORY">Theory</option>
              <option value="PRACTICAL">Practical</option>
              <option value="CORE">Core</option>
              <option value="ELECTIVE">Elective</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Credits
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Periods / Week
            </label>
            <input
              type="number"
              min="0"
              max="40"
              value={periods_per_week}
              onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !subject_code.trim() || !subject_name.trim()}
            className="rounded-lg bg-[#6d28d9] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 active:scale-[0.98] transition disabled:opacity-70 shadow-sm shadow-purple-200"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : editingItem ? (
              "Update Subject"
            ) : (
              "Create Subject"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
