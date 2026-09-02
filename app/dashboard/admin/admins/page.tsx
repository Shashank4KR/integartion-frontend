"use client";

import { useState, useEffect, useMemo } from "react";
import Card from "@/components/shared/Card";
import SectionHeader from "@/components/shared/SectionHeader";
import Modal from "@/components/shared/Modal";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import MainLayout from "@/components/shared/layout/MainLayout";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { listAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/lib/services/adminService";
import { listUsers, createUser } from "@/lib/services/userService";
import type { AdminResponse } from "@/types/entities/admin";
import { shortId } from "@/lib/utils/id";

type AdminUserOption = { id: string; username: string; email: string };

export default function AdminsPage() {
  const [items, setItems] = useState<AdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState<string>("");
  const [users, setUsers] = useState<
    { id: string; username: string; email: string; role_id: string; role?: { role_name: string } | null }[]
  >([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [mode, setMode] = useState<"link" | "create">("link");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({ username: "", email: "", password: "", phone: "", status: true });
  const [profileForm, setProfileForm] = useState({ user_id: "", admin_name: "", phone: "" });
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
        const [adminsData, usersData] = await Promise.all([listAdmins(token), listUsers(token)]);
        setItems(adminsData);
        setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admins.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const adminUserIds = useMemo(() => new Set(items.map((i) => i.user_id)), [items]);

  const adminRoleId = useMemo(
    () => users.find((u) => u.role?.role_name?.trim().toUpperCase() === "ADMIN")?.role_id ?? "",
    [users],
  );

  const eligibleUsers = useMemo<AdminUserOption[]>(
    () =>
      users
        .filter((u) => u.role?.role_name?.trim().toUpperCase() === "ADMIN")
        .filter((u) => !adminUserIds.has(u.id))
        .map((u) => ({ id: u.id, username: u.username, email: u.email })),
    [users, adminUserIds],
  );

  const closeForm = () => setIsFormOpen(false);

  const openAdd = () => {
    setEditingItem(null);
    setMode("link");
    setSelectedUserId("");
    setCreatedUserId(null);
    setUserForm({ username: "", email: "", password: "", phone: "", status: true });
    setProfileForm({ user_id: "", admin_name: "", phone: "" });
    setStep("user");
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: AdminResponse) => {
    setEditingItem(item);
    setProfileForm({ user_id: item.user_id, admin_name: item.admin_name, phone: item.phone ?? "" });
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
    if (!adminRoleId) {
      setFormError("Unable to determine the Admin role. Please try again.");
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
        role_id: adminRoleId,
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
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateAdmin(token, editingItem.id, profileForm);
        setSuccess("Admin profile updated successfully.");
      } else {
        await createAdmin(token, {
          user_id: targetUserId,
          admin_name: profileForm.admin_name,
          phone: profileForm.phone || null,
        });
        setSuccess("Admin profile created successfully.");
      }
      closeForm();
      const data = await listAdmins(token);
      setItems(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Operation failed.";
      if (!editingItem && createdUserId) {
        setFormError(
          `User account was created, but the Admin profile could not be created (${msg}). The user was not created again — you can retry the profile step.`,
        );
      } else if (!editingItem && mode === "link" && selectedUserId) {
        setFormError(`Could not create the Admin profile (${msg}).`);
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
      await deleteAdmin(token, deletingId);
      setIsDeleteOpen(false);
      setDeletingId(null);
      setSuccess(null);
      const data = await listAdmins(token);
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
    return (
      item.admin_name.toLowerCase().includes(term) ||
      item.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Admins"
          subtitle="Manage administrator profiles"
          action={
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
            >
              <Plus className="h-4 w-4" />
              Add Admin
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
                placeholder="Search admins..."
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
              {search ? "No admins found." : "No admins found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-4 py-3">Admin ID</th>
                    <th className="px-4 py-3">Admin Name</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Linked User</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const linkedUser = users.find((u) => u.id === item.user_id);
                    return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                    >
                      <td className="px-4 py-3 font-mono text-xs" title={item.id}>
                        {shortId(item.id)}
                      </td>
                      <td className="px-4 py-3 font-medium">{item.admin_name}</td>
                      <td className="px-4 py-3 font-mono text-xs" title={item.user_id}>
                        {shortId(item.user_id)}
                      </td>
                      <td className="px-4 py-3">
                        {linkedUser ? (
                          <span>
                            {linkedUser.username}
                            <span className="block text-xs text-slate-500">{linkedUser.email}</span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">{item.phone ?? "-"}</td>
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
          title={editingItem ? "Edit Admin" : "Add Admin"}
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
                    No available Admin users found. Create a new Admin user first.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Select Admin User <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        required
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                      >
                        <option value="">Select an Admin user...</option>
                        {eligibleUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.username} — {u.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Admin Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={profileForm.admin_name}
                          onChange={(e) => setProfileForm({ ...profileForm, admin_name: e.target.value })}
                          required
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
                    </div>
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
                      "Create Admin Profile"
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
                  {editingItem ? "Edit Admin Profile" : "Step 2: Admin Profile"}
                </p>
                {!editingItem && createdUserId && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    User account created successfully. Now create the admin profile.
                  </div>
                )}
                {editingItem && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">Admin ID</label>
                      <input
                        type="text"
                        value={editingItem?.id ?? ""}
                        readOnly
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">User ID</label>
                      <input
                        type="text"
                        value={editingItem?.user_id ?? ""}
                        readOnly
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600 outline-none"
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Admin Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.admin_name}
                      onChange={(e) => setProfileForm({ ...profileForm, admin_name: e.target.value })}
                      required
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
                </div>

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
                      "Save Admin"
                    ) : (
                      "Create Admin"
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
              Are you sure you want to delete this admin? This action cannot be undone.
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
}
