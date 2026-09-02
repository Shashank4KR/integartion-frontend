"use client";

import { useState, useEffect, useMemo } from "react";
import Card from "@/components/shared/Card";
import SectionHeader from "@/components/shared/SectionHeader";
import Modal from "@/components/shared/Modal";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import MainLayout from "@/components/shared/layout/MainLayout";
import { Plus, Search, Pencil, Trash2, Loader2, Eye } from "lucide-react";
import { listTeachers, createTeacher, updateTeacher, deleteTeacher, getTeacherClasses, getTeacherSubjects } from "@/lib/services/teacherService";
import { listUsers, createUser } from "@/lib/services/userService";
import { listDepartments } from "@/lib/services/departmentService";
import type { TeacherResponse } from "@/types/entities/teacher";
import type { ClassResponse } from "@/types/entities/class";
import type { SubjectResponse } from "@/types/entities/subject";
import { shortId } from "@/lib/utils/id";

type TeacherUserOption = { id: string; username: string; email: string };

export default function TeachersPage() {
  const [items, setItems] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState<string>("");
  const [users, setUsers] = useState<
    { id: string; username: string; email: string; role_id: string; role?: { role_name: string } | null }[]
  >([]);
  const [departments, setDepartments] = useState<{ id: string; department_name: string }[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeacherResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<TeacherResponse | null>(null);
  const [viewingClasses, setViewingClasses] = useState<ClassResponse[]>([]);
  const [viewingSubjects, setViewingSubjects] = useState<SubjectResponse[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);

  const [mode, setMode] = useState<"link" | "create">("link");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({ username: "", email: "", password: "", phone: "", status: true });
  const [profileForm, setProfileForm] = useState({ user_id: "", employee_id: "", qualification: "", department_id: "", join_date: "", phone: "", address: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"user" | "profile">("user");

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
        const [teachersData, usersData, deptsData] = await Promise.all([
          listTeachers(token),
          listUsers(token),
          listDepartments(token),
        ]);
        setItems(teachersData);
        setUsers(usersData);
        setDepartments(deptsData.map((d) => ({ id: d.id, department_name: d.department_name })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load teachers.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const teacherUserIds = useMemo(() => new Set(items.map((i) => i.user_id)), [items]);

  const teacherRoleId = useMemo(
    () => users.find((u) => u.role?.role_name?.trim().toUpperCase() === "TEACHER")?.role_id ?? "",
    [users],
  );

  const eligibleUsers = useMemo<TeacherUserOption[]>(
    () =>
      users
        .filter((u) => u.role?.role_name?.trim().toUpperCase() === "TEACHER")
        .filter((u) => !teacherUserIds.has(u.id))
        .map((u) => ({ id: u.id, username: u.username, email: u.email })),
    [users, teacherUserIds],
  );

  const closeForm = () => setIsFormOpen(false);

  const openAdd = () => {
    setEditingItem(null);
    setMode("link");
    setSelectedUserId("");
    setCreatedUserId(null);
    setUserForm({ username: "", email: "", password: "", phone: "", status: true });
    setProfileForm({ user_id: "", employee_id: "", qualification: "", department_id: "", join_date: "", phone: "", address: "" });
    setStep("user");
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: TeacherResponse) => {
    setEditingItem(item);
    setProfileForm({
      user_id: item.user_id,
      employee_id: item.employee_id,
      qualification: item.qualification ?? "",
      department_id: item.department_id ?? "",
      join_date: item.join_date ?? "",
      phone: item.phone ?? "",
      address: item.address ?? "",
    });
    setStep("profile");
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const openView = async (item: TeacherResponse) => {
    setViewingItem(item);
    setViewLoading(true);
    setViewError(null);
    setViewingClasses([]);
    setViewingSubjects([]);
    setIsViewOpen(true);
    try {
      const [classesData, subjectsData] = await Promise.all([
        getTeacherClasses(token, item.id),
        getTeacherSubjects(token, item.id),
      ]);
      setViewingClasses(classesData);
      setViewingSubjects(subjectsData);
    } catch (err) {
      setViewError(err instanceof Error ? err.message : "Failed to load teacher details.");
    } finally {
      setViewLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherRoleId) {
      setFormError("Unable to determine the Teacher role. Please try again.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const user = await createUser(token, {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        phone: userForm.phone || null,
        status: userForm.status,
        role_id: teacherRoleId,
      });
      setCreatedUserId(user.id);
      setProfileForm({ ...profileForm, user_id: user.id });
      setStep("profile");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "User creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const targetUserId = editingItem
    ? profileForm.user_id
    : mode === "link"
      ? selectedUserId
      : profileForm.user_id;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!targetUserId) {
      setFormError("Please select a user to link.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateTeacher(token, editingItem.id, {
          employee_id: profileForm.employee_id,
          qualification: profileForm.qualification || null,
          department_id: profileForm.department_id || null,
          join_date: profileForm.join_date || null,
          phone: profileForm.phone || null,
          address: profileForm.address || null,
        });
        setSuccess("Teacher profile updated successfully.");
      } else {
        await createTeacher(token, {
          user_id: targetUserId,
          employee_id: profileForm.employee_id,
          qualification: profileForm.qualification || null,
          department_id: profileForm.department_id || null,
          join_date: profileForm.join_date || null,
          phone: profileForm.phone || null,
          address: profileForm.address || null,
        });
        setSuccess("Teacher profile created successfully.");
      }
      closeForm();
      const data = await listTeachers(token);
      setItems(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Operation failed.";
      if (!editingItem && createdUserId) {
        setFormError(
          `User account was created, but the Teacher profile could not be created (${msg}). The user was not created again — you can retry the profile step.`,
        );
      } else if (!editingItem && mode === "link" && selectedUserId) {
        setFormError(`Could not create the Teacher profile (${msg}).`);
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
      await deleteTeacher(token, deletingId);
      setIsDeleteOpen(false);
      setDeletingId(null);
      setSuccess(null);
      const data = await listTeachers(token);
      setItems(data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const departmentName = (id?: string | null) =>
    departments.find((d) => d.id === id)?.department_name ?? "-";

  const linkedUsername = (id: string) => users.find((u) => u.id === id)?.username ?? null;

  const filtered = items.filter((item) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const username = linkedUsername(item.user_id)?.toLowerCase() ?? "";
    return (
      item.employee_id.toLowerCase().includes(term) ||
      (item.qualification?.toLowerCase().includes(term) ?? false) ||
      username.includes(term)
    );
  });

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Teachers"
          subtitle="Manage teaching staff"
          action={
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
            >
              <Plus className="h-4 w-4" />
              Add Teacher
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
                placeholder="Search teachers..."
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
              {search ? "No teachers found." : "No teachers found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-4 py-3">Teacher ID</th>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Linked User</th>
                    <th className="px-4 py-3">Qualification</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Join Date</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const username = linkedUsername(item.user_id);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                      >
                        <td className="px-4 py-3 font-mono text-xs" title={item.id}>
                          {shortId(item.id)}
                        </td>
                        <td className="px-4 py-3 font-medium">{item.employee_id}</td>
                        <td className="px-4 py-3 font-mono text-xs" title={item.user_id}>
                          {shortId(item.user_id)}
                        </td>
                        <td className="px-4 py-3">{username ?? "-"}</td>
                        <td className="px-4 py-3">{item.qualification ?? "-"}</td>
                        <td className="px-4 py-3">{departmentName(item.department_id)}</td>
                        <td className="px-4 py-3">{item.join_date ?? "-"}</td>
                        <td className="px-4 py-3">{item.phone ?? "-"}</td>
                        <td className="px-4 py-3">{item.address ?? "-"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openView(item)}
                              className="p-2 rounded-lg hover:bg-purple-50 text-slate-600 hover:text-[#6d28d9] transition"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
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
          onClose={closeForm}
          title={editingItem ? "Edit Teacher" : "Add Teacher"}
          maxWidth="max-w-2xl"
        >
          <form
            onSubmit={(e) => {
              if (mode === "create" && step === "user" && !editingItem) {
                handleUserSubmit(e);
              } else {
                handleProfileSubmit(e);
              }
            }}
            className="space-y-4"
          >
            {formError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </p>
            )}

            {!editingItem && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("link")}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                    mode === "link"
                      ? "border-[#6d28d9] bg-purple-50 text-[#6d28d9]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Link Existing User
                </button>
                <button
                  type="button"
                  onClick={() => setMode("create")}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                    mode === "create"
                      ? "border-[#6d28d9] bg-purple-50 text-[#6d28d9]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Create New User
                </button>
              </div>
            )}

            {/* LINK EXISTING USER */}
            {!editingItem && mode === "link" && (
              <>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Link Existing User
                </p>

                {eligibleUsers.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    No available Teacher users found. Create a new Teacher user first.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Select Teacher User <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        required
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                      >
                        <option value="">Select a Teacher user...</option>
                        {eligibleUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.username} — {u.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    {ProfileFields()}
                  </>
                )}

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || eligibleUsers.length === 0}
                    className="rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-70"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Create Teacher Profile"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* CREATE NEW USER — STEP 1 */}
            {!editingItem && mode === "create" && step === "user" && (
              <>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Step 1: User Account
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      required
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      required
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      required
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Phone</label>
                    <input
                      type="text"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={userForm.status ? "true" : "false"}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value === "true" })}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
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
                        Creating User...
                      </span>
                    ) : (
                      "Next: Create Profile"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* CREATE NEW USER — STEP 2 / EDIT */}
            {((!editingItem && mode === "create" && step === "profile") || editingItem) && (
              <>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {editingItem ? "Edit Teacher Profile" : "Step 2: Teacher Profile"}
                </p>
                {editingItem && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">Teacher ID</label>
                      <input
                        type="text"
                        value={editingItem.id}
                        readOnly
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">User ID</label>
                      <input
                        type="text"
                        value={editingItem.user_id}
                        readOnly
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600 outline-none"
                      />
                    </div>
                  </div>
                )}
                {!editingItem && createdUserId && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    User account created successfully. Now create the teacher profile.
                  </div>
                )}
                {ProfileFields()}
                <div className="flex items-center justify-end gap-3 pt-4">
                  {!editingItem && (
                    <button
                      type="button"
                      onClick={() => setStep("user")}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                  )}
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
                      "Save Teacher"
                    ) : (
                      "Create Teacher"
                    )}
                  </button>
                </div>
              </>
            )}
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
              Are you sure you want to delete this teacher? This action cannot be undone.
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

        {/* Teacher Detail Modal */}
        <Modal
          open={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={viewingItem ? `Teacher Details — ${viewingItem.employee_id}` : "Teacher Details"}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {viewError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {viewError}
              </p>
            )}
            {viewLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#6d28d9]" />
              </div>
            ) : viewingItem ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Teacher ID</p>
                    <p className="text-sm font-mono text-slate-900">{shortId(viewingItem.id)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Employee ID</p>
                    <p className="text-sm font-medium text-slate-900">{viewingItem.employee_id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">User ID</p>
                    <p className="text-sm font-mono text-slate-900">{shortId(viewingItem.user_id)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Department</p>
                    <p className="text-sm text-slate-900">{departmentName(viewingItem.department_id)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Qualification</p>
                    <p className="text-sm text-slate-900">{viewingItem.qualification || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Join Date</p>
                    <p className="text-sm text-slate-900">{viewingItem.join_date || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Phone</p>
                    <p className="text-sm text-slate-900">{viewingItem.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Address</p>
                    <p className="text-sm text-slate-900">{viewingItem.address || "—"}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Assigned Classes</h4>
                  {viewingClasses.length === 0 ? (
                    <p className="text-sm text-slate-500">No classes assigned to this teacher yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {viewingClasses.map((cls) => (
                        <div key={cls.id} className="rounded-lg border border-slate-100 px-4 py-2.5">
                          <span className="text-sm font-medium text-slate-900">{cls.class_name} — {cls.section}</span>
                          <span className="text-xs text-slate-500 ml-2">{cls.academic_year}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Assigned Subjects</h4>
                  {viewingSubjects.length === 0 ? (
                    <p className="text-sm text-slate-500">No subjects assigned to this teacher yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {viewingSubjects.map((subj) => (
                        <div key={subj.id} className="rounded-lg border border-slate-100 px-4 py-2.5">
                          <span className="text-sm font-medium text-slate-900">{subj.subject_code} — {subj.subject_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </Modal>
      </div>
    </div>
    </MainLayout>
  );

  function ProfileFields() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profileForm.employee_id}
            onChange={(e) => setProfileForm({ ...profileForm, employee_id: e.target.value })}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Qualification</label>
          <input
            type="text"
            value={profileForm.qualification}
            onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Department</label>
          <select
            value={profileForm.department_id}
            onChange={(e) => setProfileForm({ ...profileForm, department_id: e.target.value })}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          >
            <option value="">Select department...</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Join Date</label>
          <input
            type="date"
            value={profileForm.join_date}
            onChange={(e) => setProfileForm({ ...profileForm, join_date: e.target.value })}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Phone</label>
          <input
            type="text"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Address</label>
          <input
            type="text"
            value={profileForm.address}
            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>
    );
  }
}
