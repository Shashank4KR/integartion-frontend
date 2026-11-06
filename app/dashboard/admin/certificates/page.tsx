"use client";

import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import Card from "@/components/shared/Card";
import CertificatePreview from "@/components/dashboard/certificates/CertificatePreview";
import type {
  CertificateFormData,
  CertificateType,
  IssuedCertificateRecord,
  SchoolCertificateSettings,
} from "@/types/certificates";
import {
  DEFAULT_SCHOOL_SETTINGS,
  INITIAL_FORM_DATA,
  deleteIssuedCertificate,
  getIssuedCertificates,
  getSavedSchoolSettings,
  saveIssuedCertificate,
  saveSchoolCertificateSettings,
} from "@/lib/services/certificateService";
import { listStudents } from "@/lib/services/studentService";
import { getToken } from "@/lib/auth";
import type { StudentResponse } from "@/types/entities/student";
import {
  Award,
  Calendar,
  Check,
  Download,
  FileCheck2,
  FileText,
  Filter,
  History,
  Info,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  User,
  Users,
} from "lucide-react";

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState<"issue" | "settings" | "register">("issue");
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateType>("TC");
  const [schoolSettings, setSchoolSettings] = useState<SchoolCertificateSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [formData, setFormData] = useState<CertificateFormData>(INITIAL_FORM_DATA.TC);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [issuedRecords, setIssuedRecords] = useState<IssuedCertificateRecord[]>([]);
  const [searchRegister, setSearchRegister] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Load initial settings and certificates
  useEffect(() => {
    const saved = getSavedSchoolSettings();
    setSchoolSettings(saved);
    const records = getIssuedCertificates();
    setIssuedRecords(records);

    // Fetch students list for quick selector
    const token = getToken();
    if (token) {
      listStudents(token)
        .then((data) => {
          if (Array.isArray(data)) setStudents(data);
        })
        .catch((err) => {
          console.warn("Could not fetch students list:", err);
        });
    }
  }, []);

  // When template changes, load default form data for that template
  const handleTemplateChange = (type: CertificateType) => {
    setSelectedTemplate(type);
    setFormData((prev) => ({
      ...INITIAL_FORM_DATA[type],
      // Retain student name / admission if already filled
      studentName: prev.studentName || INITIAL_FORM_DATA[type].studentName,
      admissionNo: prev.admissionNo || INITIAL_FORM_DATA[type].admissionNo,
      rollNo: prev.rollNo || INITIAL_FORM_DATA[type].rollNo,
      className: prev.className || INITIAL_FORM_DATA[type].className,
      fatherName: prev.fatherName || INITIAL_FORM_DATA[type].fatherName,
      motherName: prev.motherName || INITIAL_FORM_DATA[type].motherName,
      academicYear: prev.academicYear || INITIAL_FORM_DATA[type].academicYear,
    }));
  };

  // Student autofill selector
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (!studentId) return;
    const s = students.find((item) => item.id === studentId);
    if (!s) return;

    const fullName = [s.first_name, s.last_name].filter(Boolean).join(" ");
    setFormData((prev) => ({
      ...prev,
      studentId: s.id,
      studentName: fullName || prev.studentName,
      admissionNo: s.admission_no || prev.admissionNo,
      rollNo: s.roll_no || prev.rollNo,
      className: s.class_name || prev.className,
      gender: s.gender?.toLowerCase().includes("f") ? "Female" : "Male",
      dateOfAdmission: s.joining_date || prev.dateOfAdmission,
    }));
  };

  // Save / Issue certificate to register
  const handleIssueCertificate = () => {
    const newRecord: IssuedCertificateRecord = {
      id: "cert-" + Date.now(),
      certificateNo: formData.certificateNo || "CERT-" + Date.now().toString().slice(-4),
      templateType: selectedTemplate,
      studentName: formData.studentName || "Unnamed Student",
      admissionNo: formData.admissionNo || "-",
      className: formData.className || "-",
      issueDate: formData.issueDate || new Date().toISOString().split("T")[0],
      status: "ISSUED",
      formData: { ...formData },
      schoolSettings: { ...schoolSettings },
      createdAt: new Date().toISOString(),
    };

    const updated = saveIssuedCertificate(newRecord);
    setIssuedRecords(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Save school settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSchoolCertificateSettings(schoolSettings);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Delete certificate from register
  const handleDeleteRecord = (id: string) => {
    if (confirm("Are you sure you want to delete this issued certificate record?")) {
      const updated = deleteIssuedCertificate(id);
      setIssuedRecords(updated);
    }
  };

  // Print certificate
  const handlePrint = () => {
    window.print();
  };

  // Filtered issued records
  const filteredRecords = useMemo(() => {
    return issuedRecords.filter((rec) => {
      const matchType = filterType === "ALL" || rec.templateType === filterType;
      const q = searchRegister.toLowerCase();
      const matchSearch =
        rec.certificateNo.toLowerCase().includes(q) ||
        rec.studentName.toLowerCase().includes(q) ||
        rec.admissionNo.toLowerCase().includes(q) ||
        rec.className.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [issuedRecords, filterType, searchRegister]);

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Page Title & Tab Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-[#7c3aed]">
                <Award className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Certificates & Credentials</h1>
                <p className="text-xs md:text-sm text-slate-500">
                  Customizable school certificate templates (TC, Bonafide, Merit, Conduct, Caste & Scholarship Endorsement).
                </p>
              </div>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto border border-slate-200">
            <button
              onClick={() => setActiveTab("issue")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "issue"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-[#7c3aed]" />
              Issue & Preview
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "settings"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Settings className="w-4 h-4 text-amber-600" />
              School Customizer
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="w-4 h-4 text-emerald-600" />
              Issued Register ({issuedRecords.length})
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ISSUE & PREVIEW CERTIFICATES                      */}
        {/* ======================================================== */}
        {activeTab === "issue" && (
          <div className="space-y-6">
            {/* Template Selector Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 print:hidden">
              <TemplateCard
                title="Transfer Certificate (TC)"
                subtitle="School Leaving & Migration"
                type="TC"
                selected={selectedTemplate === "TC"}
                badge="CBSE / State / ICSE"
                onClick={() => handleTemplateChange("TC")}
              />
              <TemplateCard
                title="Bonafide Certificate"
                subtitle="Student Status & Conduct"
                type="BONAFIDE"
                selected={selectedTemplate === "BONAFIDE"}
                badge="Most Requested"
                onClick={() => handleTemplateChange("BONAFIDE")}
              />
              <TemplateCard
                title="Certificate of Merit"
                subtitle="Competitions & Sports"
                type="MERIT"
                selected={selectedTemplate === "MERIT"}
                badge="Award Layout"
                onClick={() => handleTemplateChange("MERIT")}
              />
              <TemplateCard
                title="Caste Endorsement"
                subtitle="NSP / Scholarship Portals"
                type="CASTE_ENDORSEMENT"
                selected={selectedTemplate === "CASTE_ENDORSEMENT"}
                badge="School Verification"
                onClick={() => handleTemplateChange("CASTE_ENDORSEMENT")}
              />
              <TemplateCard
                title="Character & Conduct"
                subtitle="Study Tenure & Behavior"
                type="CONDUCT"
                selected={selectedTemplate === "CONDUCT"}
                badge="Official Study"
                onClick={() => handleTemplateChange("CONDUCT")}
              />
            </div>

            {/* Note banner for Caste & Income */}
            {selectedTemplate === "CASTE_ENDORSEMENT" && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs md:text-sm text-amber-900 flex items-start gap-3 shadow-sm print:hidden">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Government Statutory Notice:</strong> Statutory Caste and Income Certificates are issued exclusively by Government Revenue Authorities (Tahsildar / Village Revenue Officer / Seva Sindhu). Schools issue this <em>Institutional Admission Record Endorsement</em> to verify admission register details for student government scholarships (NSP/SSP), fee concessions, and education board submissions.
                </div>
              </div>
            )}

            {/* Two-Column Editor & Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Controls Column */}
              <div className="lg:col-span-5 space-y-5 print:hidden">
                <Card className="p-5 shadow-sm border-slate-200">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-[#7c3aed]" />
                      Certificate Fields
                    </h3>
                    <span className="text-[11px] font-semibold bg-purple-50 text-[#7c3aed] px-2 py-0.5 rounded-full uppercase">
                      {selectedTemplate}
                    </span>
                  </div>

                  {/* Quick Student Selector */}
                  {students.length > 0 && (
                    <div className="mb-4 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                      <label className="block text-xs font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#7c3aed]" />
                        Autofill from Enrolled Students:
                      </label>
                      <select
                        value={selectedStudentId}
                        onChange={(e) => handleStudentSelect(e.target.value)}
                        className="w-full text-xs rounded-lg border border-purple-200 bg-white p-2 text-slate-800 outline-none focus:ring-2 focus:ring-purple-200"
                      >
                        <option value="">-- Choose student to auto-populate --</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {[s.first_name, s.last_name].filter(Boolean).join(" ") || "Unnamed"} ({s.admission_no} - {s.class_name || "No Class"})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-3.5 text-xs max-h-[600px] overflow-y-auto pr-1">
                    {/* Certificate No & Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Certificate / Sl. No</label>
                        <input
                          type="text"
                          value={formData.certificateNo}
                          onChange={(e) => setFormData({ ...formData, certificateNo: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Issue Date</label>
                        <input
                          type="date"
                          value={formData.issueDate}
                          onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Student Name */}
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Student Full Name</label>
                      <input
                        type="text"
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-slate-900"
                        placeholder="e.g. Aarav Sharma"
                      />
                    </div>

                    {/* Admission No & Roll No */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Admission No</label>
                        <input
                          type="text"
                          value={formData.admissionNo}
                          onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Roll No</label>
                        <input
                          type="text"
                          value={formData.rollNo}
                          onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Class & Academic Year */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Class / Grade</label>
                        <input
                          type="text"
                          value={formData.className}
                          onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                          placeholder="e.g. Class 10 - A"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Academic Year</label>
                        <input
                          type="text"
                          value={formData.academicYear}
                          onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                          placeholder="2025-2026"
                        />
                      </div>
                    </div>

                    {/* Parents Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Father's Name</label>
                        <input
                          type="text"
                          value={formData.fatherName}
                          onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Mother's Name</label>
                        <input
                          type="text"
                          value={formData.motherName}
                          onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Date of Birth & Words */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">DOB in Words</label>
                        <input
                          type="text"
                          value={formData.dobWords}
                          onChange={(e) => setFormData({ ...formData, dobWords: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
                          placeholder="e.g. Fifteenth of August..."
                        />
                      </div>
                    </div>

                    {/* Template Specific Fields */}
                    {selectedTemplate === "TC" && (
                      <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-200 mt-2">
                        <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                          TC Specific Attributes
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-medium text-slate-600 block mb-0.5">Date of Admission</label>
                            <input
                              type="date"
                              value={formData.dateOfAdmission}
                              onChange={(e) => setFormData({ ...formData, dateOfAdmission: e.target.value })}
                              className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="font-medium text-slate-600 block mb-0.5">Promoted to Class</label>
                            <input
                              type="text"
                              value={formData.passedToClass}
                              onChange={(e) => setFormData({ ...formData, passedToClass: e.target.value })}
                              className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                              placeholder="Class 11"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-medium text-slate-600 block mb-0.5">Reason for Leaving</label>
                          <select
                            value={formData.reasonForLeaving}
                            onChange={(e) => setFormData({ ...formData, reasonForLeaving: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                          >
                            <option value="Completion of School Course">Completion of School Course</option>
                            <option value="Unavoidable change of residence">Unavoidable change of residence</option>
                            <option value="Guardian / Parent option">Guardian / Parent option</option>
                            <option value="Ill health">Ill health</option>
                            <option value="Admission to Higher Studies">Admission to Higher Studies</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-medium text-slate-600 block mb-0.5">Dues Cleared</label>
                            <select
                              value={formData.duesCleared}
                              onChange={(e) => setFormData({ ...formData, duesCleared: e.target.value as any })}
                              className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-medium text-slate-600 block mb-0.5">Conduct</label>
                            <select
                              value={formData.conduct}
                              onChange={(e) => setFormData({ ...formData, conduct: e.target.value as any })}
                              className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                            >
                              <option value="Exemplary">Exemplary</option>
                              <option value="Very Good">Very Good</option>
                              <option value="Good">Good</option>
                              <option value="Satisfactory">Satisfactory</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTemplate === "MERIT" && (
                      <div className="p-3 bg-amber-50/50 rounded-xl space-y-3 border border-amber-200 mt-2">
                        <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wide">
                          Competition & Award Details
                        </p>
                        <div>
                          <label className="font-medium text-slate-700 block mb-0.5">Certificate Title</label>
                          <input
                            type="text"
                            value={formData.certificateTitle}
                            onChange={(e) => setFormData({ ...formData, certificateTitle: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white font-bold"
                            placeholder="CERTIFICATE OF PARTICIPATION / MERIT"
                          />
                        </div>
                        <div>
                          <label className="font-medium text-slate-700 block mb-0.5">Event / Competition Name</label>
                          <input
                            type="text"
                            value={formData.eventName}
                            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                            placeholder="e.g. Science Olympiad 2026"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-medium text-slate-700 block mb-0.5">Achievement / Rank</label>
                            <input
                              type="text"
                              value={formData.achievement}
                              onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                              className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                              placeholder="First Prize / Active Participant"
                            />
                          </div>
                          <div>
                            <label className="font-medium text-slate-700 block mb-0.5">Event Date</label>
                            <input
                              type="text"
                              value={formData.eventDate}
                              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                              className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                              placeholder="February 24, 2026"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-slate-700 block mb-0.5">Venue</label>
                          <input
                            type="text"
                            value={formData.eventVenue}
                            onChange={(e) => setFormData({ ...formData, eventVenue: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                            placeholder="Campus Auditorium"
                          />
                        </div>
                      </div>
                    )}

                    {selectedTemplate === "CASTE_ENDORSEMENT" && (
                      <div className="p-3 bg-purple-50/50 rounded-xl space-y-3 border border-purple-200 mt-2">
                        <p className="font-bold text-purple-900 text-[11px] uppercase tracking-wide">
                          Caste Category & Scholarship Endorsement
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-medium text-slate-700 block mb-0.5">Caste Category</label>
                            <select
                              value={formData.casteCategory}
                              onChange={(e) => setFormData({ ...formData, casteCategory: e.target.value })}
                              className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white font-semibold"
                            >
                              <option value="OBC">OBC</option>
                              <option value="SC">SC</option>
                              <option value="ST">ST</option>
                              <option value="EWS">EWS</option>
                              <option value="General">General</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-medium text-slate-700 block mb-0.5">Sub-Caste</label>
                            <input
                              type="text"
                              value={formData.subCaste}
                              onChange={(e) => setFormData({ ...formData, subCaste: e.target.value })}
                              className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                              placeholder="e.g. Category 3B"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-slate-700 block mb-0.5">Declared Annual Income (₹)</label>
                          <input
                            type="text"
                            value={formData.annualIncome}
                            onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                            placeholder="1,20,000"
                          />
                        </div>
                        <div>
                          <label className="font-medium text-slate-700 block mb-0.5">Endorsement Purpose</label>
                          <input
                            type="text"
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white"
                            placeholder="State / National Scholarship Portal (NSP / SSP) & Tuition Fee Concession"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-between">
                    <button
                      type="button"
                      onClick={() => handleTemplateChange(selectedTemplate)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleIssueCertificate}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        {saveSuccess ? "Saved to Register!" : "Save to Register"}
                      </button>

                      <button
                        type="button"
                        onClick={handlePrint}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#7c3aed] rounded-lg hover:bg-[#6d28d9] transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print / PDF
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Preview Column */}
              <div className="lg:col-span-7">
                <div className="flex items-center justify-between mb-3 px-1 print:hidden">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Live Certificate Preview (A4 Printable)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#7c3aed]" />
                      Print
                    </button>
                  </div>
                </div>

                {/* Printable Frame */}
                <div className="bg-slate-100/80 p-2 md:p-4 rounded-2xl border border-slate-200 overflow-x-auto">
                  <CertificatePreview data={formData} settings={schoolSettings} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SCHOOL CUSTOMIZER (Works for ANY School)          */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="p-6 md:p-8 shadow-sm border-slate-200">
              <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-600" />
                    School Certificate Brand & Details Customizer
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure your school details, affiliation, signatory designations, and watermark once. These settings will dynamically apply to all generated certificates!
                  </p>
                </div>
                {settingsSuccess && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <Check className="w-4 h-4" />
                    Settings Saved!
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-sm">
                {/* School Name & Affiliation */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    1. Institution Identity & Affiliation
                  </h3>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      School / College Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolSettings.schoolName}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolName: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 text-base"
                      placeholder="e.g. Nomera"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Affiliation / Recognition Text
                    </label>
                    <input
                      type="text"
                      value={schoolSettings.affiliation}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, affiliation: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800"
                      placeholder="e.g. Affiliated to CBSE, New Delhi, No. 230149 (or ICSE / State Board)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">School Code</label>
                      <input
                        type="text"
                        value={schoolSettings.schoolCode}
                        onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolCode: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800"
                        placeholder="e.g. 30138"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">U-DISE No / Reg No</label>
                      <input
                        type="text"
                        value={schoolSettings.udiseCode}
                        onChange={(e) => setSchoolSettings({ ...schoolSettings, udiseCode: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800"
                        placeholder="e.g. 18110200142"
                      />
                    </div>
                  </div>
                </div>

                {/* Address & Contact */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    2. Campus Location & Contact
                  </h3>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Street Address</label>
                    <input
                      type="text"
                      value={schoolSettings.address}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, address: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800"
                      placeholder="e.g. 14 Campus Road"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">District</label>
                      <input
                        type="text"
                        value={schoolSettings.district}
                        onChange={(e) => setSchoolSettings({ ...schoolSettings, district: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800"
                        placeholder="e.g. Bengaluru"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">State</label>
                      <input
                        type="text"
                        value={schoolSettings.state}
                        onChange={(e) => setSchoolSettings({ ...schoolSettings, state: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800"
                        placeholder="e.g. Karnataka"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={schoolSettings.pincode}
                        onChange={(e) => setSchoolSettings({ ...schoolSettings, pincode: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800"
                        placeholder="784180"
                      />
                    </div>
                  </div>
                </div>

                {/* Signatories Designations */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    3. Certificate Signatories (Designations & Titles)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-800 block text-xs mb-1">Left Signatory</label>
                      <input
                        type="text"
                        value={schoolSettings.signatory1.title}
                        onChange={(e) =>
                          setSchoolSettings({
                            ...schoolSettings,
                            signatory1: { ...schoolSettings.signatory1, title: e.target.value },
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold mb-2 bg-white"
                        placeholder="Prepared By / Clerk"
                      />
                      <input
                        type="text"
                        value={schoolSettings.signatory1.name}
                        onChange={(e) =>
                          setSchoolSettings({
                            ...schoolSettings,
                            signatory1: { ...schoolSettings.signatory1, name: e.target.value },
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white text-slate-600"
                        placeholder="Signatory Name"
                      />
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-800 block text-xs mb-1">Center Signatory</label>
                      <input
                        type="text"
                        value={schoolSettings.signatory2.title}
                        onChange={(e) =>
                          setSchoolSettings({
                            ...schoolSettings,
                            signatory2: { ...schoolSettings.signatory2, title: e.target.value },
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold mb-2 bg-white"
                        placeholder="Class Teacher / Coordinator"
                      />
                      <input
                        type="text"
                        value={schoolSettings.signatory2.name}
                        onChange={(e) =>
                          setSchoolSettings({
                            ...schoolSettings,
                            signatory2: { ...schoolSettings.signatory2, name: e.target.value },
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white text-slate-600"
                        placeholder="Signatory Name"
                      />
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-800 block text-xs mb-1">Right Signatory</label>
                      <input
                        type="text"
                        value={schoolSettings.signatory3.title}
                        onChange={(e) =>
                          setSchoolSettings({
                            ...schoolSettings,
                            signatory3: { ...schoolSettings.signatory3, title: e.target.value },
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold mb-2 bg-white"
                        placeholder="Principal / Headmaster"
                      />
                      <input
                        type="text"
                        value={schoolSettings.signatory3.name}
                        onChange={(e) =>
                          setSchoolSettings({
                            ...schoolSettings,
                            signatory3: { ...schoolSettings.signatory3, name: e.target.value },
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white text-slate-600"
                        placeholder="Signatory Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Watermark Toggle */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Central School Seal Watermark</p>
                    <p className="text-xs text-slate-500">Render an authentic institutional watermark in the center of certificates.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schoolSettings.showWatermark}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, showWatermark: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white font-bold text-sm hover:bg-[#6d28d9] transition shadow-md flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save & Apply School Branding
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ISSUED CERTIFICATES REGISTER                      */}
        {/* ======================================================== */}
        {activeTab === "register" && (
          <div className="space-y-4">
            <Card className="p-5 shadow-sm border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchRegister}
                      onChange={(e) => setSearchRegister(e.target.value)}
                      placeholder="Search certificate or student..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-slate-200 rounded-lg py-2 px-3 text-xs bg-white text-slate-700 outline-none"
                  >
                    <option value="ALL">All Types</option>
                    <option value="TC">Transfer Certificate</option>
                    <option value="BONAFIDE">Bonafide Certificate</option>
                    <option value="MERIT">Merit / Participation</option>
                    <option value="CASTE_ENDORSEMENT">Caste Endorsement</option>
                    <option value="CONDUCT">Conduct Certificate</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500 font-semibold self-end sm:self-auto">
                  Total Issued: {filteredRecords.length}
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">No issued certificates found.</p>
                  <p className="text-xs text-slate-400 mt-1">Switch to the "Issue & Preview" tab to generate a certificate.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                        <th className="py-2.5 px-3">Certificate No</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Admission No</th>
                        <th className="py-2.5 px-3">Class</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Issue Date</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {rec.certificateNo}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {rec.studentName}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono">
                            {rec.admissionNo}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {rec.className}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#7c3aed]">
                              {rec.templateType}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {rec.issueDate}
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setFormData(rec.formData);
                                setSelectedTemplate(rec.templateType);
                                if (rec.schoolSettings) setSchoolSettings(rec.schoolSettings);
                                setActiveTab("issue");
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 rounded hover:bg-purple-100 transition inline-flex items-center gap-1"
                            >
                              <Pencil className="w-3 h-3" />
                              View / Reprint
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition inline-block align-middle"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Subcomponent: Template Choice Card
function TemplateCard({
  title,
  subtitle,
  type,
  selected,
  badge,
  onClick,
}: {
  title: string;
  subtitle: string;
  type: CertificateType;
  selected: boolean;
  badge: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3.5 rounded-2xl text-left border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
        selected
          ? "bg-purple-50/70 border-purple-500 shadow-sm ring-2 ring-purple-400/30"
          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c3aed] bg-purple-100 px-2 py-0.5 rounded-full">
            {badge}
          </span>
          {selected && <Check className="w-4 h-4 text-[#7c3aed]" />}
        </div>
        <p className="font-bold text-slate-900 text-xs line-clamp-1">{title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>
      </div>
    </button>
  );
}
