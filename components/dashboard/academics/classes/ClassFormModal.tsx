"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Loader2 } from "lucide-react";
import type { ClassResponse, ClassCreate, ClassUpdate } from "@/types/entities/class";

export default function ClassFormModal({
  open,
  onClose,
  onSubmit,
  submitting,
  formError,
  editingItem,
  teacherOptions,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ClassCreate | ClassUpdate) => Promise<void>;
  submitting: boolean;
  formError: string | null;
  editingItem: ClassResponse | null;
  teacherOptions: { id: string; label: string }[];
}) {
  const [class_name, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [academic_year, setAcademicYear] = useState("");
  const [class_teacher_id, setClassTeacherId] = useState("");
  const [room_number, setRoomNumber] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setClassName(editingItem.class_name);
      setSection(editingItem.section);
      setAcademicYear(editingItem.academic_year);
      setClassTeacherId(editingItem.class_teacher_id ?? "");
      setRoomNumber(editingItem.room_number ?? "");
      setStatus(editingItem.status ?? "ACTIVE");
    } else {
      setClassName("");
      setSection("");
      setAcademicYear("");
      setClassTeacherId("");
      setRoomNumber("");
      setStatus("ACTIVE");
    }
  }, [open, editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ClassCreate | ClassUpdate = {
      class_name,
      section,
      academic_year,
      class_teacher_id: class_teacher_id || null,
      room_number: room_number.trim() || null,
      status: status || "ACTIVE",
    };
    await onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingItem ? "Edit Class" : "Add Class"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </p>
        )}
        {editingItem && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Class ID</label>
            <input
              type="text"
              value={editingItem.id}
              readOnly
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600 outline-none"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Class Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={class_name}
            onChange={(e) => setClassName(e.target.value)}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Section <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Academic Year <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={academic_year}
            onChange={(e) => setAcademicYear(e.target.value)}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Class Teacher
          </label>
            <select
              value={class_teacher_id}
              onChange={(e) => setClassTeacherId(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            >
              <option value="">None</option>
              {teacherOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Room Number
            </label>
            <input
              type="text"
              value={room_number}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. Room 101, Lab 2"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : editingItem ? (
              "Update"
            ) : (
              "Create"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
