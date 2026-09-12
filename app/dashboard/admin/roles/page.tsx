"use client";

import { useState, useEffect } from "react";
import Card from "@/components/shared/Card";
import SectionHeader from "@/components/shared/SectionHeader";
import Badge from "@/components/shared/Badge";
import { Search, Loader2, Shield, Key } from "lucide-react";
import { listRoles, listPermissions, type RoleResponse, type PermissionResponse } from "@/lib/services/roleService";
import { shortId } from "@/lib/utils/id";

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

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
        const [rolesData, permsData] = await Promise.all([
          listRoles(token),
          listPermissions(token),
        ]);
        setRoles(rolesData);
        setPermissions(permsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load roles and permissions.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filteredRoles = roles.filter((r) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return r.role_name.toLowerCase().includes(term) || r.description?.toLowerCase().includes(term);
  });

  const filteredPermissions = permissions.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term);
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Roles & Permissions"
          subtitle="View system roles and permission access definitions"
        />

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Tab Selection */}
        <div className="mb-6 flex gap-3 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === "roles"
                ? "bg-[#6d28d9] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Shield className="h-4 w-4" />
            Roles ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === "permissions"
                ? "bg-[#6d28d9] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Key className="h-4 w-4" />
            Permissions ({permissions.length})
          </button>
        </div>

        <Card>
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === "roles" ? "Search roles..." : "Search permissions..."}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#6d28d9]" />
            </div>
          ) : activeTab === "roles" ? (
            filteredRoles.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No roles found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="px-4 py-3">Role ID</th>
                      <th className="px-4 py-3">Role Name</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.map((role) => (
                      <tr
                        key={role.id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                      >
                        <td className="px-4 py-3 font-mono text-xs" title={role.id}>
                          {shortId(role.id)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {role.role_name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {role.description || "System role"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="success">Active</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : filteredPermissions.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No permissions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-4 py-3">Permission ID</th>
                    <th className="px-4 py-3">Permission Name</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPermissions.map((perm) => (
                    <tr
                      key={perm.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                    >
                      <td className="px-4 py-3 font-mono text-xs" title={perm.id}>
                        {shortId(perm.id)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {perm.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {perm.description || "System permission"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
