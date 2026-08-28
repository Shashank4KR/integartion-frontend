"use client";

import { useState, useEffect, useMemo } from "react";
import Card from "@/components/shared/Card";
import SectionHeader from "@/components/shared/SectionHeader";
import Modal from "@/components/shared/Modal";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { listParentStudents, createParentStudent, updateParentStudent, deleteParentStudent } from "@/lib/services/parentStudentService";
import { listParents, createParent } from "@/lib/services/parentService";
import { listStudents } from "@/lib/services/studentService";
import { listUsers } from "@/lib/services/userService";
import { listClasses } from "@/lib/services/classService";
import type { ParentStudentResponse } from "@/types/entities/parent-student";
import { shortId } from "@/lib/utils/id";

const RELATIONSHIP_OPTIONS = ["Father", "Mother", "Guardian", "Brother", "Sister", "Other"];

export default function ParentStudentsPage() {
  const [items, setItems] = useState<ParentStudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState<string>("");
  const [parents, setParents] = useState<
    { id: string; user_id: string; phone?: string | null; username: string; email: string }[]
  >([]);
  const [students, setStudents] = useState<
    {
      id: string;
      user_id: string;
      first_name?: string | null;
      last_name?: string | null;
      admission_no?: string | null;
      class_id?: string | null;
      username: string;
    }[]
  >([]);
  const [classes, setClasses] = useState<{ id: string; class_name: string }[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ParentStudentResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ parent_id: "", student_id: "", relationship: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("edtech_access_token");
    if (!storedToken) return;
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [relsData, parentsData, studentsData, usersData, classesData] = await Promise.all([
          listParentStudents(token),
          listParents(token),
          listStudents(token),
          listUsers(token),
          listClasses(token),
        ]);
        setItems(relsData);
        const parentsList: any[] = [];
        const parentUsers = usersData.filter(
          (u) => u.role?.role_name === "PARENT" || u.role_id === "0003"
        );
        for (const u of parentUsers) {
          const profile = parentsData.find((p) => p.user_id === u.id);
          if (profile) {
            parentsList.push({
              id: profile.id,
              user_id: profile.user_id,
              phone: profile.phone,
              username: u.username,
              email: u.email,
            });
          } else {
            parentsList.push({
              id: `USER_ID:${u.id}`,
              user_id: u.id,
              phone: u.phone,
              username: u.username,
              email: u.email,
              isVirtual: true,
            });
          }
        }
        setParents(parentsList);
        setStudents(
          studentsData.map((s) => {
            const user = usersData.find((u) => u.id === s.user_id);
            return {
              id: s.id,
              user_id: s.user_id,
              first_name: s.first_name,
              last_name: s.last_name,
              admission_no: s.admission_no,
              class_id: s.class_id,
              username: user?.username ?? s.user_id,
            };
          }),
        );
        setClasses(classesData.map((c) => ({ id: c.id, class_name: c.class_name })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load parent-student relationships.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const className = (id?: string | null) => classes.find((c) => c.id === id)?.class_name ?? "";

  const studentLabel = (s: (typeof students)[number]) => {
    const name = [s.first_name, s.last_name].filter(Boolean).join(" ");
    const parts = [name || s.username, s.admission_no ? `Adm: ${s.admission_no}` : "", className(s.class_id)].filter(Boolean);
    return parts.join(" • ");
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ parent_id: "", student_id: "", relationship: "" });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: ParentStudentResponse) => {
    setEditingItem(item);
    setFormData({ parent_id: item.parent_id, student_id: item.student_id, relationship: item.relationship ?? "" });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!formData.parent_id || !formData.student_id) {
      setFormError("Please select both a parent and a student.");
      return;
    }
    if (!formData.relationship.trim()) {
      setFormError("Relationship is required.");
      return;
    }
    const duplicate = items.find(
      (i) =>
        i.parent_id === formData.parent_id &&
        i.student_id === formData.student_id &&
        i.id !== editingItem?.id,
    );
    if (duplicate) {
      setFormError("This parent-student relationship already exists.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      let finalParentId = formData.parent_id;

      if (finalParentId.startsWith("USER_ID:")) {
        const userId = finalParentId.substring(8);
        const newProfile = await createParent(token, {
          user_id: userId,
          phone: null,
          occupation: null,
          address: null,
        });
        finalParentId = newProfile.id;
      }

      if (editingItem) {
        await updateParentStudent(token, editingItem.id, {
          parent_id: finalParentId,
          student_id: formData.student_id,
          relationship: formData.relationship,
        });
        setSuccess("Relationship updated successfully.");
      } else {
        await createParentStudent(token, {
          parent_id: finalParentId,
          student_id: formData.student_id,
          relationship: formData.relationship,
        });
        setSuccess("Relationship created successfully.");
      }
      setIsFormOpen(false);
      
      const [relsData, parentsData, studentsData, usersData, classesData] = await Promise.all([
        listParentStudents(token),
        listParents(token),
        listStudents(token),
        listUsers(token),
        listClasses(token),
      ]);
      setItems(relsData);

      const parentsList: any[] = [];
      const parentUsers = usersData.filter(
        (u) => u.role?.role_name === "PARENT" || u.role_id === "0003"
      );
      for (const u of parentUsers) {
        const profile = parentsData.find((p) => p.user_id === u.id);
        if (profile) {
          parentsList.push({
            id: profile.id,
            user_id: profile.user_id,
            phone: profile.phone,
            username: u.username,
            email: u.email,
          });
        } else {
          parentsList.push({
            id: `USER_ID:${u.id}`,
            user_id: u.id,
            phone: u.phone,
            username: u.username,
            email: u.email,
            isVirtual: true,
          });
        }
      }
      setParents(parentsList);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Operation failed.";
      if (/already exists|duplicate/i.test(msg)) {
        setFormError("This parent-student relationship already exists.");
      } else {
        setFormError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId || submitting) return;
    setSubmitting(true);
    try {
      await deleteParentStudent(token, deletingId);
      setIsDeleteOpen(false);
      setDeletingId(null);
      setSuccess(null);
      const data = await listParentStudents(token);
      setItems(data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const parent = parents.find((p) => p.id === item.parent_id);
    const student = students.find((s) => s.id === item.student_id);
    return (
      (parent?.username.toLowerCase().includes(term) ?? false) ||
      (student?.username.toLowerCase().includes(term) ?? false) ||
      (item.relationship?.toLowerCase().includes(term) ?? false)
    );
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Parent-Student Relationships"
          subtitle="Link parents to students"
          action={
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
            >
              <Plus className="h-4 w-4" />
              Add Relationship
            </button>
          }
        />

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <Card>
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search relationships..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#6d28d9]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {search ? "No relationships found." : "No relationships found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-4 py-3">PS ID</th>
                    <th className="px-4 py-3">Parent ID</th>
                    <th className="px-4 py-3">Parent</th>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Relationship</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const parent = parents.find((p) => p.id === item.parent_id);
                    const student = students.find((s) => s.id === item.student_id);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                      >
                        <td className="px-4 py-3 font-mono text-xs" title={item.id}>
                          {shortId(item.id)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs" title={item.parent_id}>
                          {shortId(item.parent_id)}
                        </td>
                        <td className="px-4 py-3">
                          {parent ? (
                            <span>
                              {parent.username}
                              {parent.email && (
                                <span className="block text-xs text-slate-500">{parent.email}</span>
                              )}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs" title={item.student_id}>
                          {shortId(item.student_id)}
                        </td>
                        <td className="px-4 py-3">{student ? studentLabel(student) : "-"}</td>
                        <td className="px-4 py-3">{item.relationship}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-2 rounded-lg hover:bg-purple-50 text-slate-600 hover:text-[#6d28d9] transition"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDelete(item.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Form Modal */}
        <Modal
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingItem ? "Edit Relationship" : "Add Relationship"}
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
                <label className="mb-1 block text-xs font-semibold text-slate-700">PS ID</label>
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
                Parent <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
              >
                <option value="">Select parent...</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.username}
                    {p.email ? ` — ${p.email}` : ""}
                    {p.phone ? ` • ${p.phone}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
              >
                <option value="">Select student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {studentLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Relationship <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                required
                placeholder="e.g. Father, Mother, Guardian"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                list="relationship-options"
              />
              <datalist id="relationship-options">
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
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

        {/* Delete Confirmation Modal */}
        <Modal
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Delete Confirmation"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete this relationship? This action cannot be undone.
            </p>
            {formError && isDeleteOpen && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </p>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
