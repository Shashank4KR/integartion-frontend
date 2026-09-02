"use client";

import { useState, useEffect, useMemo } from "react";
import Card from "@/components/shared/Card";
import SectionHeader from "@/components/shared/SectionHeader";
import Modal from "@/components/shared/Modal";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import MainLayout from "@/components/shared/layout/MainLayout";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { listStudents, createStudent, updateStudent, deleteStudent } from "@/lib/services/studentService";
import { listUsers, createUser } from "@/lib/services/userService";
import { listClasses } from "@/lib/services/classService";
import type { StudentResponse } from "@/types/entities/student";
import { shortId } from "@/lib/utils/id";

type StudentUserOption = { id: string; username: string; email: string };

export default function StudentsPage() {
  const [items, setItems] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState<string>("");
  const [users, setUsers] = useState<
    { id: string; username: string; email: string; role_id: string; role?: { role_name: string } | null }[]
  >([]);
  const [classes, setClasses] = useState<{ id: string; class_name: string; section: string }[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [mode, setMode] = useState<"link" | "create">("link");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({ username: "", email: "", password: "", phone: "", status: true });
  const [profileForm, setProfileForm] = useState({
    user_id: "",
    admission_no: "",
    first_name: "",
    last_name: "",
    gender: "",
    blood_group: "",
    class_id: "",
    roll_no: "",
    joining_date: "",
    photo: "",
  });
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
        const [studentsData, usersData, classesData] = await Promise.all([
          listStudents(token),
          listUsers(token),
          listClasses(token),
        ]);
        setItems(studentsData);
        setUsers(usersData);
        setClasses(classesData.map((c) => ({ id: c.id, class_name: c.class_name, section: c.section })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load students.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const studentUserIds = useMemo(() => new Set(items.map((i) => i.user_id)), [items]);

  const studentRoleId = useMemo(
    () => users.find((u) => u.role?.role_name?.trim().toUpperCase() === "STUDENT")?.role_id ?? "",
    [users],
  );

  const eligibleUsers = useMemo<StudentUserOption[]>(
    () =>
      users
        .filter((u) => u.role?.role_name?.trim().toUpperCase() === "STUDENT")
        .filter((u) => !studentUserIds.has(u.id))
        .map((u) => ({ id: u.id, username: u.username, email: u.email })),
    [users, studentUserIds],
  );

  const closeForm = () => setIsFormOpen(false);

  const openAdd = () => {
    setEditingItem(null);
    setMode("link");
    setSelectedUserId("");
    setCreatedUserId(null);
    setUserForm({ username: "", email: "", password: "", phone: "", status: true });
    setProfileForm({
      user_id: "",
      admission_no: "",
      first_name: "",
      last_name: "",
      gender: "",
      blood_group: "",
      class_id: "",
      roll_no: "",
      joining_date: "",
      photo: "",
    });
    setStep("user");
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: StudentResponse) => {
    setEditingItem(item);
    setProfileForm({
      user_id: item.user_id,
      admission_no: item.admission_no ?? "",
      first_name: item.first_name ?? "",
      last_name: item.last_name ?? "",
      gender: item.gender ?? "",
      blood_group: item.blood_group ?? "",
      class_id: item.class_id ?? "",
      roll_no: item.roll_no ?? "",
      joining_date: item.joining_date ?? "",
      photo: item.photo ?? "",
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

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentRoleId) {
      setFormError("Unable to determine the Student role. Please try again.");
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
        role_id: studentRoleId,
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
    if (!profileForm.admission_no.trim()) {
      setFormError("Admission Number is required.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateStudent(token, editingItem.id, {
          admission_no: profileForm.admission_no,
          first_name: profileForm.first_name || null,
          last_name: profileForm.last_name || null,
          gender: profileForm.gender || null,
          blood_group: profileForm.blood_group || null,
          class_id: profileForm.class_id || null,
          roll_no: profileForm.roll_no || null,
          joining_date: profileForm.joining_date || null,
          photo: profileForm.photo || null,
        });
        setSuccess("Student profile updated successfully.");
      } else {
        await createStudent(token, {
          user_id: targetUserId,
          admission_no: profileForm.admission_no,
          first_name: profileForm.first_name || null,
          last_name: profileForm.last_name || null,
          gender: profileForm.gender || null,
          blood_group: profileForm.blood_group || null,
          class_id: profileForm.class_id || null,
          roll_no: profileForm.roll_no || null,
          joining_date: profileForm.joining_date || null,
          photo: profileForm.photo || null,
        });
        setSuccess("Student profile created successfully.");
      }
      closeForm();
      const data = await listStudents(token);
      setItems(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Operation failed.";
      if (!editingItem && createdUserId) {
        setFormError(
          `User account was created, but the Student profile could not be created (${msg}). The user was not created again — you can retry the profile step.`,
        );
      } else if (!editingItem && mode === "link" && selectedUserId) {
        setFormError(`Could not create the Student profile (${msg}).`);
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
      await deleteStudent(token, deletingId);
      setIsDeleteOpen(false);
      setDeletingId(null);
      setSuccess(null);
      const data = await listStudents(token);
      setItems(data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const className = (id?: string | null) => classes.find((c) => c.id === id)?.class_name ?? "-";
  const linkedUsername = (id: string) => users.find((u) => u.id === id)?.username ?? null;

  const filtered = items.filter((item) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const username = linkedUsername(item.user_id)?.toLowerCase() ?? "";
    const fullName = `${item.first_name ?? ""} ${item.last_name ?? ""}`.toLowerCase();
    return (
      (item.admission_no?.toLowerCase().includes(term) ?? false) ||
      fullName.includes(term) ||
      (item.roll_no?.toLowerCase().includes(term) ?? false) ||
      username.includes(term)
    );
  });

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Students"
          subtitle="Manage student records"
          action={
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
            >
              <Plus className="h-4 w-4" />
              Add Student
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
                placeholder="Search students..."
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
              {search ? "No students found." : "No students found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Admission No</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Linked User</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Blood Group</th>
                    <th className="px-4 py-3">Class ID</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Joining Date</th>
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const username = linkedUsername(item.user_id);
                    const initials = `${item.first_name?.[0] ?? ""}${item.last_name?.[0] ?? ""}`.toUpperCase() || "?";
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                      >
                        <td className="px-4 py-3 font-mono text-xs" title={item.id}>
                          {shortId(item.id)}
                        </td>
                        <td className="px-4 py-3 font-medium">{item.admission_no}</td>
                        <td className="px-4 py-3">
                          {[item.first_name, item.last_name].filter(Boolean).join(" ") || "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs" title={item.user_id}>
                          {shortId(item.user_id)}
                        </td>
                        <td className="px-4 py-3">{username ?? "-"}</td>
                        <td className="px-4 py-3">{item.gender ?? "-"}</td>
                        <td className="px-4 py-3">{item.blood_group ?? "-"}</td>
                        <td className="px-4 py-3 font-mono text-xs" title={item.class_id ?? ""}>
                          {item.class_id ? shortId(item.class_id) : "-"}
                        </td>
                        <td className="px-4 py-3">{className(item.class_id)}</td>
                        <td className="px-4 py-3">{item.roll_no ?? "-"}</td>
                        <td className="px-4 py-3">{item.joining_date ?? "-"}</td>
                        <td className="px-4 py-3">
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt="student"
                              className="h-8 w-8 rounded-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-[#6d28d9]">
                              {initials}
                            </span>
                          )}
                        </td>
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
          onClose={closeForm}
          title={editingItem ? "Edit Student" : "Add Student"}
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
                    No available Student users found. Create a new Student user first.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Select Student User <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        required
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                      >
                        <option value="">Select a Student user...</option>
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
                      "Create Student Profile"
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
                  {editingItem ? "Edit Student Profile" : "Step 2: Student Profile"}
                </p>
                {editingItem && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">Student ID</label>
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
                    User account created successfully. Now create the student profile.
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
                      "Save Student"
                    ) : (
                      "Create Student"
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
              Are you sure you want to delete this student? This action cannot be undone.
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
    </MainLayout>
  );

  function ProfileFields() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Admission Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profileForm.admission_no}
            onChange={(e) => setProfileForm({ ...profileForm, admission_no: e.target.value })}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profileForm.first_name}
            onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profileForm.last_name}
            onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            value={profileForm.gender}
            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          >
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Blood Group</label>
          <input
            type="text"
            value={profileForm.blood_group}
            onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })}
            placeholder="e.g. O+"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            value={profileForm.class_id}
            onChange={(e) => setProfileForm({ ...profileForm, class_id: e.target.value })}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          >
            <option value="">Select class...</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name} {c.section ? `(${c.section})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Roll Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profileForm.roll_no}
            onChange={(e) => setProfileForm({ ...profileForm, roll_no: e.target.value })}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Joining Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={profileForm.joining_date}
            onChange={(e) => setProfileForm({ ...profileForm, joining_date: e.target.value })}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Photo URL</label>
          <input
            type="url"
            value={profileForm.photo}
            onChange={(e) => setProfileForm({ ...profileForm, photo: e.target.value })}
            placeholder="https://..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>
    );
  }
}
