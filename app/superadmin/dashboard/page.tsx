"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isSuperAdminAuthenticated,
  superAdminLogout,
  getInstitutions,
  provisionNewInstitution,
  toggleInstitutionStatus,
  deleteInstitution,
  getPlatformSummary,
  updateInstitution,
  updateNomeraRealStats,
} from "@/lib/services/superAdminService";
import type {
  Institution,
  InstitutionType,
  DatabaseStrategy,
  InstitutionStatus,
} from "@/types/superadmin";
import Card from "@/components/shared/Card";
import {
  Building2,
  Database,
  Server,
  ShieldCheck,
  Users,
  Plus,
  Search,
  ExternalLink,
  Power,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  Layers,
  Sparkles,
  ChevronRight,
  LogOut,
  Sliders,
  X,
  GraduationCap,
  Briefcase,
  Activity,
  Check,
  Lock,
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Provisioning Modal State
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [selectedDbModal, setSelectedDbModal] = useState<Institution | null>(null);

  // Form State for new institution
  const [formState, setFormState] = useState({
    name: "",
    code: "",
    type: "COLLEGE" as InstitutionType,
    boardAffiliation: "State Technical University / AICTE",
    city: "Bengaluru",
    state: "Karnataka",
    databaseName: "",
    databaseStrategy: "DEDICATED_DATABASE" as DatabaseStrategy,
    dbHost: "pg-cluster-01.nomera.internal:5432",
    storageQuotaGb: 100,
    adminName: "College Director",
    adminEmail: "",
    adminPhone: "+91 98765 00000",
    plan: "ENTERPRISE" as const,
  });

  // Verify Super Admin Session & load live institutions
  useEffect(() => {
    if (!isSuperAdminAuthenticated()) {
      router.replace("/superadmin/login");
      return;
    }
    const currentList = getInstitutions();
    setInstitutions(currentList);
  }, [router]);

  // Platform Summary
  const summary = useMemo(() => {
    return getPlatformSummary();
  }, [institutions]);

  // Filtered List
  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst) => {
      const matchType = filterType === "ALL" || inst.type === filterType;
      const matchStatus = filterStatus === "ALL" || inst.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        inst.name.toLowerCase().includes(q) ||
        inst.code.toLowerCase().includes(q) ||
        inst.database.databaseName.toLowerCase().includes(q) ||
        inst.admin.email.toLowerCase().includes(q) ||
        inst.city.toLowerCase().includes(q);

      return matchType && matchStatus && matchSearch;
    });
  }, [institutions, filterType, filterStatus, searchQuery]);

  // Open Provisioning Modal
  const handleOpenProvision = () => {
    setFormState({
      name: "",
      code: "",
      type: "COLLEGE",
      boardAffiliation: "State Technical University / AICTE",
      city: "Bengaluru",
      state: "Karnataka",
      databaseName: "",
      databaseStrategy: "DEDICATED_DATABASE",
      dbHost: "pg-cluster-01.nomera.internal:5432",
      storageQuotaGb: 100,
      adminName: "College Director",
      adminEmail: "",
      adminPhone: "+91 98765 00000",
      plan: "ENTERPRISE",
    });
    setIsProvisionOpen(true);
  };

  // Auto-generate DB name when institution name changes
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 20);
    const dbName = slug ? `nomera_${slug}_db` : "";
    const code = name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 6);

    setFormState((prev) => ({
      ...prev,
      name,
      code: prev.code || `${code}-2026`,
      databaseName: prev.databaseName && !prev.databaseName.startsWith("nomera_") ? prev.databaseName : dbName,
    }));
  };

  // Submit Provisioning
  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.adminEmail.trim()) {
      alert("Institution Name and Admin Email are required.");
      return;
    }

    const updated = provisionNewInstitution({
      ...formState,
      databaseName: formState.databaseName || `nomera_${Date.now()}_db`,
    });
    setInstitutions(updated);
    setIsProvisionOpen(false);
  };

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    const updated = toggleInstitutionStatus(id);
    setInstitutions(updated);
  };

  // Delete Institution
  const handleDeleteInstitution = (id: string, name: string) => {
    if (id === "inst-nomera") {
      alert("The primary Nomera institution cannot be deleted.");
      return;
    }
    if (confirm(`Are you sure you want to decommission institution "${name}" and drop its isolated database?`)) {
      const updated = deleteInstitution(id);
      setInstitutions(updated);
    }
  };

  // Switch / Launch School Portal as Admin
  const handleSwitchToSchoolPortal = (inst: Institution) => {
    // Set active school context in local storage so the standard admin dashboard loads for this institution
    localStorage.setItem(
      "nomera_school_certificate_settings",
      JSON.stringify({
        schoolName: inst.name,
        affiliation: inst.boardAffiliation,
        schoolCode: inst.code,
        district: inst.city,
        state: inst.state,
      }),
    );
    router.push("/dashboard/admin");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Root Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider uppercase text-white">
                Nomera Service Top
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SUPER ADMIN ROOT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Multi-Tenant Architecture Control Plane • Current School:{" "}
              <strong className="text-purple-300">Nomera</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right text-xs">
            <span className="font-semibold text-slate-200">superadmin@example.com</span>
            <span className="text-[11px] text-purple-400 font-mono">Service Owner Console</span>
          </div>

          <button
            onClick={superAdminLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition border border-slate-800"
            title="Sign out of Super Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Banner Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Infrastructure Operations
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Multi-Campus & Database Provisioning
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Super Administrators manage institutions from the service top level. Assign names to new colleges and schools, provision dedicated isolated databases, and monitor tenant health.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 self-start lg:self-auto">
            <button
              onClick={handleOpenProvision}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Provision New College / School
            </button>
          </div>
        </div>

        {/* Global Platform KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
            <p className="text-[11px] font-semibold text-slate-400">Total Institutions</p>
            <h3 className="text-2xl font-black text-white">{summary.total}</h3>
            <p className="text-[10px] text-emerald-400">{summary.active} Active Live</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
            <p className="text-[11px] font-semibold text-slate-400">Colleges & Univs</p>
            <h3 className="text-2xl font-black text-indigo-400">{summary.colleges}</h3>
            <p className="text-[10px] text-slate-500">Degree & Tech Tier</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
            <p className="text-[11px] font-semibold text-slate-400">Schools & Academies</p>
            <h3 className="text-2xl font-black text-purple-400">{summary.schools}</h3>
            <p className="text-[10px] text-slate-500">CBSE / ICSE / State</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
            <p className="text-[11px] font-semibold text-slate-400">Aggregated Students</p>
            <h3 className="text-2xl font-black text-white">
              {summary.totalStudents.toLocaleString()}
            </h3>
            <p className="text-[10px] text-blue-400">Cross-Tenant Roster</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
            <p className="text-[11px] font-semibold text-slate-400">Active Faculty</p>
            <h3 className="text-2xl font-black text-white">
              {summary.totalFaculty.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-500">Professors & Staff</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
            <p className="text-[11px] font-semibold text-slate-400">Database Clusters</p>
            <h3 className="text-2xl font-black text-emerald-400">{summary.totalDatabases}</h3>
            <p className="text-[10px] text-slate-400">{summary.totalStorageGb} GB Provisioned</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search college, code, database, or admin..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
            >
              <option value="ALL">All Institution Types</option>
              <option value="COLLEGE">Colleges</option>
              <option value="SCHOOL">Schools</option>
              <option value="UNIVERSITY">Universities</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PROVISIONING">Provisioning</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {(filterType !== "ALL" || filterStatus !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setFilterType("ALL");
                  setFilterStatus("ALL");
                  setSearchQuery("");
                }}
                className="p-2 text-slate-500 hover:text-slate-300"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Institutions & Database Management Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Monitored Institutions & Provisioned Databases
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of tenant databases, enrollment stats, and institute administrators.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              {filteredInstitutions.length} of {institutions.length} Shown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Institution & Code</th>
                  <th className="py-3 px-4">Type & Board</th>
                  <th className="py-3 px-4">Isolated Database</th>
                  <th className="py-3 px-4">Institute Admin</th>
                  <th className="py-3 px-4">Enrollment & Load</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInstitutions.map((inst) => {
                  const isNomeraMain = inst.id === "inst-nomera";
                  return (
                    <tr
                      key={inst.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isNomeraMain ? "bg-purple-950/20" : ""
                      }`}
                    >
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isNomeraMain
                                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                : "bg-slate-800 text-slate-200"
                            }`}
                          >
                            {inst.code.slice(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm">{inst.name}</span>
                              {isNomeraMain && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  CURRENT NOMERA
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {inst.code} • {inst.city}, {inst.state}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type & Board */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200 block">{inst.type}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {inst.boardAffiliation}
                        </span>
                      </td>

                      {/* Isolated Database */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Database className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{inst.database.databaseName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{inst.database.strategy.replace(/_/g, " ")}</span>
                          <span>•</span>
                          <span>{inst.database.storageUsedGb} GB / {inst.database.storageQuotaGb} GB</span>
                        </div>
                      </td>

                      {/* Institute Admin */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200">{inst.admin.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{inst.admin.email}</p>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white">
                          {inst.stats.studentsCount} Students
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {inst.stats.facultyCount} Faculty • {inst.stats.classesCount} Classes
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inst.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : inst.status === "PROVISIONING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inst.status === "ACTIVE"
                                ? "bg-emerald-400 animate-pulse"
                                : inst.status === "PROVISIONING"
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                          ></span>
                          {inst.status}
                        </span>
                      </td>

                      {/* Super Admin Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleSwitchToSchoolPortal(inst)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 rounded-lg transition inline-flex items-center gap-1 shadow-sm"
                          title="Switch into School Admin Portal view"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Launch Portal
                        </button>

                        <button
                          onClick={() => setSelectedDbModal(inst)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition inline-block align-middle"
                          title="Database Config"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(inst.id)}
                          className={`p-1.5 rounded-lg transition inline-block align-middle ${
                            inst.status === "ACTIVE"
                              ? "text-amber-400 hover:bg-amber-950/40"
                              : "text-emerald-400 hover:bg-emerald-950/40"
                          }`}
                          title={inst.status === "ACTIVE" ? "Suspend Institution" : "Activate Institution"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {!isNomeraMain && (
                          <button
                            onClick={() => handleDeleteInstitution(inst.id, inst.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition inline-block align-middle"
                            title="Decommission Institution"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Architecture & Cluster Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-purple-400" />
                PostgreSQL Cluster 01 (Primary)
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Node Host:</span>
                <span className="text-slate-200">pg-cluster-01.nomera:5432</span>
              </div>
              <div className="flex justify-between">
                <span>Active DBs:</span>
                <span className="text-slate-200">2 Dedicated Databases</span>
              </div>
              <div className="flex justify-between">
                <span>Query Latency:</span>
                <span className="text-emerald-400">2.8 ms (P99)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                Tenant Storage Isolation
              </span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                HEALTHY
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Total Pool Size:</span>
                <span className="text-slate-200">1,000 GB NVMe</span>
              </div>
              <div className="flex justify-between">
                <span>Allocated:</span>
                <span className="text-slate-200">{summary.totalStorageGb} GB (6.7%)</span>
              </div>
              <div className="flex justify-between">
                <span>Backup Snapshots:</span>
                <span className="text-emerald-400">Automated Hourly Active</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Service Health & Uptime
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                99.99%
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Auth Handshake:</span>
                <span className="text-emerald-400">Operational</span>
              </div>
              <div className="flex justify-between">
                <span>Multi-Tenant Router:</span>
                <span className="text-emerald-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Super Admin Session:</span>
                <span className="text-purple-300">Root Authorized</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: PROVISION NEW COLLEGE / SCHOOL & DATABASE       */}
        {/* ======================================================== */}
        {isProvisionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Provision New College / School
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure institution identity, provision an isolated database, and assign an institute administrator.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProvisionOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProvisionSubmit} className="space-y-5 text-xs">
                {/* 1. Identity */}
                <div className="space-y-3">
                  <h4 className="font-bold text-purple-400 uppercase tracking-wider text-[11px]">
                    1. Institution Details & Board
                  </h4>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">
                      College / School Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Apex Institute of Technology & Management"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-2.5 text-sm text-white font-semibold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Institution Code</label>
                      <input
                        type="text"
                        value={formState.code}
                        onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                        placeholder="APEX-2026"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-2 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Institution Type</label>
                      <select
                        value={formState.type}
                        onChange={(e) => setFormState({ ...formState, type: e.target.value as InstitutionType })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-2 text-white outline-none"
                      >
                        <option value="COLLEGE">College / Higher Ed</option>
                        <option value="UNIVERSITY">University</option>
                        <option value="SCHOOL">School (K-12)</option>
                        <option value="POLYTECHNIC">Polytechnic Institute</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Affiliation / Board</label>
                      <input
                        type="text"
                        value={formState.boardAffiliation}
                        onChange={(e) => setFormState({ ...formState, boardAffiliation: e.target.value })}
                        placeholder="CBSE / AICTE / State Tech"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">City / Campus</label>
                      <input
                        type="text"
                        value={formState.city}
                        onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                        placeholder="Bengaluru"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">State</label>
                      <input
                        type="text"
                        value={formState.state}
                        onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                        placeholder="Karnataka"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-2 text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Database Provisioning */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    2. Tenant Database Architecture
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">
                        Isolated Database Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.databaseName}
                        onChange={(e) => setFormState({ ...formState, databaseName: e.target.value })}
                        placeholder="nomera_apex_college_db"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2 text-emerald-400 font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">
                        Database Isolation Strategy
                      </label>
                      <select
                        value={formState.databaseStrategy}
                        onChange={(e) =>
                          setFormState({ ...formState, databaseStrategy: e.target.value as DatabaseStrategy })
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2 text-white outline-none"
                      >
                        <option value="DEDICATED_DATABASE">Dedicated Database (Separate Postgres DB)</option>
                        <option value="MULTI_TENANT_SCHEMA">Multi-Tenant Schema (Isolated Schema in Shared DB)</option>
                        <option value="VIRTUAL_PARTITION">Virtual Partitioning (Tenant-ID Scoped)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">PostgreSQL Host</label>
                      <input
                        type="text"
                        value={formState.dbHost}
                        onChange={(e) => setFormState({ ...formState, dbHost: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-400 font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Storage Quota (GB)</label>
                      <input
                        type="number"
                        value={formState.storageQuotaGb}
                        onChange={(e) => setFormState({ ...formState, storageQuotaGb: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Institute Admin */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    3. Institute Administrator Account
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Admin Full Name</label>
                      <input
                        type="text"
                        value={formState.adminName}
                        onChange={(e) => setFormState({ ...formState, adminName: e.target.value })}
                        placeholder="Dr. S. K. Narayanan"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">
                        Admin Login Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.adminEmail}
                        onChange={(e) => setFormState({ ...formState, adminEmail: e.target.value })}
                        placeholder="director@apexcollege.edu"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">
                        Admin Phone (Numbers only)
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={15}
                        placeholder="e.g. 9876543210"
                        value={formState.adminPhone}
                        onKeyDown={(e) => {
                          if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => setFormState({ ...formState, adminPhone: e.target.value.replace(/\D/g, '').slice(0, 15) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProvisionOpen(false)}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Deploy & Provision College Database
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: DATABASE TELEMETRY & CONFIG                     */}
        {/* ======================================================== */}
        {selectedDbModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {selectedDbModal.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Database: {selectedDbModal.database.databaseName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDbModal(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Connection Host:</span>
                  <span className="text-slate-200">{selectedDbModal.database.dbHost}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Isolation Strategy:</span>
                  <span className="text-emerald-400 font-bold">{selectedDbModal.database.strategy}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Storage Used:</span>
                  <span className="text-slate-200">
                    {selectedDbModal.database.storageUsedGb} GB / {selectedDbModal.database.storageQuotaGb} GB
                  </span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Connection Pool:</span>
                  <span className="text-slate-200">{selectedDbModal.database.connectionPoolSize} active pools</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Last Snapshot:</span>
                  <span className="text-slate-300">
                    {new Date(selectedDbModal.database.lastBackupAt || "").toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedDbModal(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
