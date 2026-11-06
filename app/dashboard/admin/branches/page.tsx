"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import Card from "@/components/shared/Card";
import {
  Building2,
  Plus,
  MapPin,
  Users,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Compass,
} from "lucide-react";
import {
  getSubBranches,
  saveSubBranch,
  deleteSubBranch,
  getActiveCampusId,
  setActiveCampusId,
  type SubBranch,
  type CampusType,
} from "@/lib/services/branchService";

export default function CampusesBranchesPage() {
  const [branches, setBranches] = useState<SubBranch[]>([]);
  const [activeCampusId, setActiveId] = useState<string>("branch-main");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<SubBranch | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "SUB_BRANCH" as CampusType,
    boardAffiliation: "Central Board of Secondary Education (CBSE)",
    address: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    headName: "",
    headEmail: "",
    headPhone: "",
    studentCapacity: 500,
    currentEnrollment: 0,
    facultyCount: 0,
    status: "ACTIVE" as "ACTIVE" | "UPCOMING" | "MAINTENANCE",
    isHeadquarters: false,
  });

  useEffect(() => {
    setBranches(getSubBranches());
    setActiveId(getActiveCampusId());

    const handleCampusChange = () => {
      setActiveId(getActiveCampusId());
    };
    window.addEventListener("nomera_campus_changed", handleCampusChange);
    return () => window.removeEventListener("nomera_campus_changed", handleCampusChange);
  }, []);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({
      name: "",
      code: "",
      type: "SUB_BRANCH",
      boardAffiliation: "Central Board of Secondary Education (CBSE)",
      address: "",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      headName: "",
      headEmail: "",
      headPhone: "",
      studentCapacity: 500,
      currentEnrollment: 0,
      facultyCount: 0,
      status: "ACTIVE",
      isHeadquarters: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: SubBranch) => {
    setEditingBranch(b);
    setFormData({
      name: b.name,
      code: b.code,
      type: b.type,
      boardAffiliation: b.boardAffiliation,
      address: b.address,
      city: b.city,
      state: b.state,
      pincode: b.pincode,
      headName: b.headName,
      headEmail: b.headEmail,
      headPhone: b.headPhone,
      studentCapacity: b.studentCapacity,
      currentEnrollment: b.currentEnrollment,
      facultyCount: b.facultyCount,
      status: b.status,
      isHeadquarters: b.isHeadquarters,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const updated = saveSubBranch(
      editingBranch
        ? { ...formData, id: editingBranch.id }
        : formData
    );
    setBranches(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this sub-branch?")) {
      const updated = deleteSubBranch(id);
      setBranches(updated);
    }
  };

  const handleSelectActive = (id: string) => {
    setActiveCampusId(id);
    setActiveId(id);
  };

  const filtered = branches.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.headName.toLowerCase().includes(q)
    );
  });

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-white p-6 rounded-2xl border border-purple-100 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7c3aed] flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              Multi-Campus Infrastructure
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Campuses &amp; Sub-Branches
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Manage Nomera&apos;s main school campus and provision extra sub-branches across geographical zones, wings, and specialized centers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Sub-Branch
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block">Total Campuses</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{branches.length}</span>
            <span className="text-[11px] text-purple-600 font-medium">Headquarters &amp; Sub-branches</span>
          </Card>
          <Card className="p-4 border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block">Active Campuses</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {branches.filter((b) => b.status === "ACTIVE").length}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Operational units</span>
          </Card>
          <Card className="p-4 border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block">Total Student Capacity</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {branches.reduce((acc, b) => acc + b.studentCapacity, 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Across all campuses</span>
          </Card>
          <Card className="p-4 border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block">Active Session Campus</span>
            <span className="text-sm font-bold text-[#7c3aed] mt-2 block truncate">
              {branches.find((b) => b.id === activeCampusId)?.name || "Nomera Main Campus"}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Current Context</span>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search campuses by name, code, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Campuses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((b) => {
            const isActive = b.id === activeCampusId;
            return (
              <Card
                key={b.id}
                className={`p-5 border transition ${
                  isActive
                    ? "border-purple-400 ring-2 ring-purple-100 shadow-md bg-gradient-to-b from-purple-50/20 to-white"
                    : "border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        b.isHeadquarters
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
                        {b.isHeadquarters && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                            HQ
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-400">
                        {b.code} • {b.type.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : b.status === "UPCOMING"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 py-2 border-y border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      {b.address}, {b.city}, {b.state} - {b.pincode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{b.boardAffiliation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      Head: <strong className="text-slate-800">{b.headName}</strong> •{" "}
                      {b.headPhone}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 mt-1">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Capacity: <strong>{b.studentCapacity}</strong> students
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectActive(b.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : "bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active Campus</span>
                        </>
                      ) : (
                        <span>Switch Here</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
                      title="Edit Branch"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {!b.isHeadquarters && (
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Sub-branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingBranch ? "Edit Campus / Sub-Branch" : "Provision New Sub-Branch"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Branch / Campus Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nomera South Campus"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Branch Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NOM-SOUTH"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Campus Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as CampusType })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="SUB_BRANCH">Sub-Branch</option>
                      <option value="MAIN_CAMPUS">Main Campus (HQ)</option>
                      <option value="PRIMARY_WING">Primary Wing</option>
                      <option value="SENIOR_WING">Senior Wing</option>
                      <option value="SPORTS_ACADEMY">Sports Academy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Board Affiliation
                  </label>
                  <input
                    type="text"
                    value={formData.boardAffiliation}
                    onChange={(e) => setFormData({ ...formData, boardAffiliation: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Campus Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 42 Electronic City Phase 1"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Branch Head / Principal
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh Kumar"
                      value={formData.headName}
                      onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Student Capacity
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={5000}
                      value={formData.studentCapacity}
                      onChange={(e) => setFormData({ ...formData, studentCapacity: Number(e.target.value) })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Head Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 00000"
                      value={formData.headPhone}
                      onChange={(e) => setFormData({ ...formData, headPhone: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Campus Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="ACTIVE">Active (Live)</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    {editingBranch ? "Save Changes" : "Create Sub-Branch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
