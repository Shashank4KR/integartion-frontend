"use client";

import React from "react";
import type { CertificateFormData, SchoolCertificateSettings } from "@/types/certificates";
import { Award, CheckCircle2, ShieldCheck } from "lucide-react";

interface CertificatePreviewProps {
  data: CertificateFormData;
  settings: SchoolCertificateSettings;
  id?: string;
}

export default function CertificatePreview({
  data,
  settings,
  id = "printable-certificate",
}: CertificatePreviewProps) {
  const { templateType } = data;

  return (
    <div
      id={id}
      className="relative mx-auto bg-white shadow-2xl transition-all duration-300 print:shadow-none print:m-0 print:p-0 print:w-full print:h-auto"
      style={{
        width: "100%",
        maxWidth: "840px",
        minHeight: templateType === "MERIT" ? "600px" : "800px",
      }}
    >
      {templateType === "TC" && (
        <TransferCertificateView data={data} settings={settings} />
      )}
      {templateType === "BONAFIDE" && (
        <BonafideCertificateView data={data} settings={settings} />
      )}
      {templateType === "MERIT" && (
        <MeritCertificateView data={data} settings={settings} />
      )}
      {templateType === "CASTE_ENDORSEMENT" && (
        <CasteEndorsementView data={data} settings={settings} />
      )}
      {templateType === "CONDUCT" && (
        <ConductCertificateView data={data} settings={settings} />
      )}
    </div>
  );
}

// ==========================================
// 1. TRANSFER CERTIFICATE (TC) VIEW (Image 1)
// ==========================================
function TransferCertificateView({
  data,
  settings,
}: {
  data: CertificateFormData;
  settings: SchoolCertificateSettings;
}) {
  return (
    <div className="relative p-8 md:p-12 border-[10px] border-emerald-900/10 text-slate-800 bg-[#fffdfa] overflow-hidden">
      {/* Background Watermark */}
      {settings.showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none">
          <div className="w-[420px] h-[420px] rounded-full border-[18px] border-emerald-900 flex items-center justify-center text-center p-8">
            <span className="text-4xl font-serif font-black uppercase text-emerald-950">
              {settings.schoolName || "SCHOOL SEAL"}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center relative z-10 mb-6 border-b-2 border-emerald-900/20 pb-4">
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold uppercase text-emerald-900 tracking-wider">
          {settings.schoolName}
        </h1>
        <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
          ({settings.affiliation})
        </p>
        <p className="text-xs text-slate-600 mt-0.5">
          {settings.address}, {settings.district}, {settings.state} - {settings.pincode}
        </p>
        <div className="flex justify-center gap-6 text-xs font-semibold text-emerald-800 mt-2">
          <span>School Code: {settings.schoolCode}</span>
          <span>UDISE No: {settings.udiseCode}</span>
        </div>
      </div>

      {/* Serial & Date Bar */}
      <div className="flex justify-between items-center text-sm font-semibold mb-6 px-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono">Sl. No:</span>
          <span className="text-rose-600 font-bold font-mono text-base">
            {data.certificateNo || "93"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono">Admission No:</span>
          <span className="text-slate-900 font-bold">{data.admissionNo || "ADM-2024"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Date:</span>
          <span className="text-slate-800 underline decoration-dotted font-medium">
            {data.issueDate || new Date().toISOString().split("T")[0]}
          </span>
        </div>
      </div>

      {/* Certificate Box Title */}
      <div className="text-center my-4">
        <div className="inline-block border-2 border-emerald-900 px-6 py-2 rounded-sm bg-emerald-50/50 shadow-sm">
          <h2 className="text-base md:text-lg font-serif font-bold uppercase tracking-widest text-emerald-950">
            TRANSFER / SCHOOL LEAVING CERTIFICATE
          </h2>
        </div>
      </div>

      {/* Certificate Body Paragraphs */}
      <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-slate-800 mt-6 relative z-10 font-serif">
        <p className="text-justify leading-loose">
          This is to certify that Shri/Miss{" "}
          <strong className="underline decoration-slate-400 font-bold text-slate-950 px-1 font-sans">
            {data.studentName || "____________________"}
          </strong>
          , Son/Daughter of Shri/Late{" "}
          <strong className="underline decoration-slate-400 font-semibold px-1 font-sans">
            {data.fatherName || "____________________"}
          </strong>{" "}
          and Smt.{" "}
          <strong className="underline decoration-slate-400 font-semibold px-1 font-sans">
            {data.motherName || "____________________"}
          </strong>
          , resident of Village/Town{" "}
          <span className="underline decoration-slate-400 px-1 font-medium font-sans">
            {data.villageTown || "____________________"}
          </span>
          , of District{" "}
          <span className="underline decoration-slate-400 px-1 font-medium font-sans">
            {data.district || "____________________"}
          </span>
          , State{" "}
          <span className="underline decoration-slate-400 px-1 font-medium font-sans">
            {data.state || "____________________"}
          </span>
          , was admitted to this School on{" "}
          <span className="underline decoration-slate-400 font-semibold px-1 font-sans">
            {data.dateOfAdmission || "01/04/2021"}
          </span>{" "}
          and left the School on{" "}
          <span className="underline decoration-slate-400 font-semibold px-1 font-sans">
            {data.dateOfLeaving || data.issueDate}
          </span>
          .
        </p>

        <p className="text-justify leading-loose">
          He / She was reading in Class{" "}
          <strong className="underline decoration-slate-400 font-bold font-sans">
            {data.className || "Class 10"}
          </strong>{" "}
          and has passed / been promoted to Class{" "}
          <strong className="underline decoration-slate-400 font-bold font-sans">
            {data.passedToClass || "Class 11 (Higher Secondary)"}
          </strong>
          .
        </p>

        <p className="text-justify leading-loose">
          He / She appeared in the{" "}
          <span className="underline decoration-slate-400 font-medium font-sans">
            {data.boardExamDetails || "Secondary School Examination"}
          </span>{" "}
          held in Academic Session{" "}
          <span className="underline decoration-slate-400 font-medium font-sans">
            {data.academicYear || "2025-2026"}
          </span>{" "}
          under {settings.affiliation}.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-sm font-sans">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">All school dues cleared:</span>
            <span className="font-bold text-emerald-800">{data.duesCleared || "Yes"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Roll No:</span>
            <span className="font-bold text-slate-900">{data.rollNo || "-"}</span>
          </div>
        </div>

        <p className="text-justify leading-loose font-serif">
          His / Her date of birth according to our official Admission Register is{" "}
          <strong className="underline decoration-slate-400 font-bold font-sans">
            {data.dob || "15/08/2009"}
          </strong>{" "}
          (in words:{" "}
          <em className="underline decoration-slate-400 text-slate-900 font-sans">
            {data.dobWords || "Fifteenth of August Two Thousand Nine"}
          </em>
          ).
        </p>

        <p className="text-justify leading-loose font-serif">
          His / Her character and conduct were{" "}
          <strong className="underline decoration-slate-400 font-bold text-emerald-900 font-sans">
            {data.conduct || "Exemplary"}
          </strong>
          .
        </p>

        {/* Reasons list */}
        <div className="pt-2 text-xs md:text-sm font-sans">
          <p className="font-bold text-slate-800 mb-1">Reason for Leaving School:</p>
          <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
            <span className="font-semibold text-slate-900">
              {data.reasonForLeaving || "Completion of School Course / Parent Guardian Option"}
            </span>
          </div>
        </div>
      </div>

      {/* Signatures Footer */}
      <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-3 text-center text-xs md:text-sm font-serif">
        <div>
          <div className="h-10"></div>
          <p className="font-bold text-slate-800">{settings.signatory1?.title || "Prepared By"}</p>
          <p className="text-[11px] text-slate-500">{settings.signatory1?.name || "Clerk / In-charge"}</p>
        </div>
        <div>
          <div className="h-10"></div>
          <p className="font-bold text-slate-800">{settings.signatory2?.title || "Class Teacher"}</p>
          <p className="text-[11px] text-slate-500">{settings.signatory2?.name || "Faculty In-charge"}</p>
        </div>
        <div>
          <div className="h-10 flex items-center justify-center">
            <span className="inline-block px-3 py-0.5 border border-dashed border-slate-400 rounded text-[10px] text-slate-400 uppercase">
              Official Seal
            </span>
          </div>
          <p className="font-bold text-emerald-950">{settings.signatory3?.title || "Principal"}</p>
          <p className="text-[11px] text-slate-600">{settings.schoolName}</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. BONAFIDE CERTIFICATE VIEW (Image 3)
// ==========================================
function BonafideCertificateView({
  data,
  settings,
}: {
  data: CertificateFormData;
  settings: SchoolCertificateSettings;
}) {
  return (
    <div className="relative p-10 md:p-14 border-[14px] border-amber-500/20 text-slate-900 bg-white overflow-hidden">
      {/* Decorative Corner Accents */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 transform -rotate-45 -translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-slate-900 to-slate-800 transform rotate-45 translate-x-12 translate-y-12"></div>

      {/* Gold Rosette Badge */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 shadow-md flex items-center justify-center border-4 border-white text-slate-900">
            <Award className="w-8 h-8 text-amber-900 drop-shadow-sm" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 uppercase">
              {settings.schoolName}
            </h1>
            <p className="text-xs text-slate-500">
              {settings.address}, {settings.district}, {settings.state}
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-500">
          <p>Certificate No: <strong className="text-slate-900">{data.certificateNo || "BON-2026-042"}</strong></p>
          <p>Date: <strong className="text-slate-900">{data.issueDate || new Date().toISOString().split("T")[0]}</strong></p>
        </div>
      </div>

      {/* Certificate Title */}
      <div className="text-center my-8">
        <h2 className="text-2xl md:text-3xl font-serif font-black tracking-widest uppercase text-slate-900 border-b-2 border-slate-900 inline-block pb-2">
          BONAFIDE CERTIFICATE
        </h2>
      </div>

      {/* Body Content */}
      <div className="my-10 text-base md:text-lg leading-loose text-slate-800 font-serif space-y-6">
        <p className="text-justify leading-loose">
          This is to certify that Mr. / Ms.{" "}
          <strong className="underline decoration-amber-500 decoration-2 font-sans font-bold text-slate-950 px-1">
            {data.studentName || "________________________"}
          </strong>
          , Son / Daughter of{" "}
          <strong className="underline decoration-slate-400 font-sans font-semibold text-slate-900 px-1">
            {data.fatherName || "________________________"}
          </strong>
          , of class / course{" "}
          <strong className="underline decoration-slate-400 font-sans font-bold text-slate-900 px-1">
            {data.className || "Class 10 - Science"}
          </strong>{" "}
          with Roll Number{" "}
          <span className="font-sans font-bold text-amber-700 px-1">
            {data.rollNo || "24"}
          </span>{" "}
          and Admission Number{" "}
          <span className="font-sans font-bold text-slate-800 px-1">
            {data.admissionNo || "ADM-1082"}
          </span>
          , for the academic year{" "}
          <strong className="underline decoration-slate-400 font-sans font-bold text-slate-900 px-1">
            {data.academicYear || "2025-2026"}
          </strong>
          , is a bonafide student of{" "}
          <strong className="text-slate-950 font-sans">
            {settings.schoolName}
          </strong>
          .
        </p>

        <p className="text-justify leading-loose">
          He / She is reliable, sincere, hardworking and bears a good moral character.
        </p>

        {data.customNote && (
          <p className="text-sm italic text-slate-600 bg-amber-50/50 p-3 rounded border border-amber-200/50">
            {data.customNote}
          </p>
        )}
      </div>

      {/* Signatures */}
      <div className="mt-16 pt-10 border-t border-slate-200 grid grid-cols-4 text-center text-xs md:text-sm">
        <div>
          <div className="h-12 flex items-end justify-center font-cursive text-slate-600"></div>
          <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
            {settings.signatory3?.title || "Principal"}
          </p>
        </div>
        <div>
          <div className="h-12 flex items-end justify-center font-cursive text-slate-600"></div>
          <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
            {settings.signatory2?.title || "Head of Foundation"}
          </p>
        </div>
        <div>
          <div className="h-12 flex items-end justify-center font-cursive text-slate-600"></div>
          <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
            {settings.signatory1?.title || "Master of Foundation"}
          </p>
        </div>
        <div>
          <div className="h-12 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border border-dashed border-amber-500/50 flex items-center justify-center text-[10px] text-amber-700 font-semibold uppercase">
              Seal
            </div>
          </div>
          <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
            Institutional Seal
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. MERIT / PARTICIPATION VIEW (Image 2)
// ==========================================
function MeritCertificateView({
  data,
  settings,
}: {
  data: CertificateFormData;
  settings: SchoolCertificateSettings;
}) {
  return (
    <div className="relative p-10 md:p-14 border-[12px] border-slate-900 bg-white text-slate-900 overflow-hidden shadow-xl">
      {/* Decorative Ornate Frame Corner Elements */}
      <div className="absolute top-0 left-0 w-28 h-28 border-r-4 border-b-4 border-amber-500/60 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-28 h-28 border-l-4 border-b-4 border-amber-500/60 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-28 h-28 border-r-4 border-t-4 border-amber-500/60 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-28 h-28 border-l-4 border-t-4 border-amber-500/60 pointer-events-none"></div>

      {/* Background Dots Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      ></div>

      {/* Top Header */}
      <div className="text-center relative z-10 mb-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-amber-600 mb-1">
          {settings.schoolName}
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-black tracking-wider text-slate-900 uppercase">
          {data.certificateTitle || "CERTIFICATE OF PARTICIPATION"}
        </h1>
        <div className="w-24 h-1 bg-amber-500 mx-auto mt-2 rounded-full"></div>
      </div>

      {/* Award Badge Ribbon */}
      <div className="absolute top-8 right-12 hidden md:block">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-500 shadow-lg flex items-center justify-center text-center p-2 border-2 border-white">
            <span className="text-[11px] font-black uppercase text-amber-950 leading-tight">
              {data.achievement?.includes("First") || data.achievement?.includes("Winner")
                ? "1st Place"
                : "Best Award"}
            </span>
          </div>
          <div className="w-6 h-6 bg-amber-600 transform rotate-45 -mt-3 z-0"></div>
        </div>
      </div>

      {/* Presentation Line */}
      <div className="text-center my-6 relative z-10">
        <p className="text-xs md:text-sm font-serif italic text-slate-500">
          This Certificate is Proudly Presented to:
        </p>
        <h2 className="text-2xl md:text-4xl font-serif font-black text-slate-900 mt-2 underline decoration-amber-400 decoration-2 underline-offset-8">
          {data.studentName || "Student Name Surname"}
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-3">
          Class: <span className="text-slate-900 font-bold">{data.className || "Class 10 - A"}</span> | Roll No: <span className="text-slate-900 font-bold">{data.rollNo || "-"}</span> | Admission No: <span className="text-slate-900 font-bold">{data.admissionNo || "-"}</span>
        </p>
      </div>

      {/* Event Details */}
      <div className="text-center max-w-xl mx-auto my-6 text-sm md:text-base leading-relaxed text-slate-700 relative z-10">
        <p>
          For outstanding dedication and distinguished achievement as{" "}
          <strong className="text-amber-700 font-bold">
            {data.achievement || "Active Participant"}
          </strong>{" "}
          in the{" "}
          <strong className="text-slate-950 font-bold">
            {data.eventName || "Annual Inter-School Science & Innovation Championship"}
          </strong>{" "}
          held on{" "}
          <span className="font-semibold text-slate-800">
            {data.eventDate || data.issueDate || "March 2026"}
          </span>{" "}
          at{" "}
          <span className="font-semibold text-slate-800">
            {data.eventVenue || "Campus Auditorium"}
          </span>
          .
        </p>
      </div>

      {/* Signatures & Date */}
      <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-3 text-center text-xs md:text-sm relative z-10">
        <div>
          <div className="h-10"></div>
          <p className="font-bold text-slate-800 border-t border-slate-400 pt-1">
            {settings.signatory1?.title || "Event Coordinator"}
          </p>
          <p className="text-[11px] text-slate-500">{settings.signatory1?.name || "Convener"}</p>
        </div>

        <div className="flex flex-col items-center justify-end">
          <p className="text-xs text-slate-600 font-medium">
            Location: {settings.district || settings.address || "-"}
          </p>
          <p className="text-xs text-slate-600 font-medium">
            Date: {data.issueDate || new Date().toISOString().split("T")[0]}
          </p>
        </div>

        <div>
          <div className="h-10"></div>
          <p className="font-bold text-slate-900 border-t border-slate-400 pt-1">
            {settings.signatory3?.title || "Principal"}
          </p>
          <p className="text-[11px] text-slate-600">{settings.schoolName}</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. CASTE & SCHOLARSHIP ENDORSEMENT VIEW
// ==========================================
function CasteEndorsementView({
  data,
  settings,
}: {
  data: CertificateFormData;
  settings: SchoolCertificateSettings;
}) {
  return (
    <div className="relative p-10 md:p-12 border-[8px] border-slate-300 text-slate-900 bg-white">
      {/* Informational Clarification Header */}
      <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2 print:hidden">
        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Institutional Endorsement Notice:</strong> Statutory Caste & Income Certificates are legally issued by Government Revenue Authorities (Tahsildar / Revenue Department). This document is an <em>Official School Admission Record Endorsement</em> certifying student caste category & declared annual income for scholarship portals (NSP, SSP), fee concessions, and board submissions.
        </div>
      </div>

      {/* School Header */}
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-black uppercase text-slate-900">
          {settings.schoolName}
        </h1>
        <p className="text-xs text-slate-600 font-medium">
          {settings.address}, {settings.district}, {settings.state} - {settings.pincode}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Affiliation: {settings.affiliation} | School Code: {settings.schoolCode}
        </p>
      </div>

      {/* Ref & Date */}
      <div className="flex justify-between items-center text-xs font-semibold mb-6">
        <div>Ref. No: <span className="font-mono text-slate-900">{data.certificateNo || "SCH-CERT-2026-081"}</span></div>
        <div>Date: <span className="text-slate-900">{data.issueDate || new Date().toISOString().split("T")[0]}</span></div>
      </div>

      {/* Title */}
      <div className="text-center my-6">
        <h2 className="text-lg md:text-xl font-serif font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4">
          CERTIFICATE OF CASTE CATEGORY & SCHOLARSHIP ENDORSEMENT
        </h2>
        <p className="text-xs text-slate-500 italic mt-1">(Issued for Educational Scholarship & Fee Concession Purpose)</p>
      </div>

      {/* Body */}
      <div className="space-y-4 text-sm md:text-base leading-loose text-slate-800 font-serif my-8">
        <p className="text-justify leading-loose">
          This is to certify that Master / Kumari{" "}
          <strong className="underline font-sans font-bold text-slate-950 px-1">
            {data.studentName || "________________________"}
          </strong>
          , Son / Daughter of Shri{" "}
          <strong className="underline font-sans font-semibold text-slate-900 px-1">
            {data.fatherName || "________________________"}
          </strong>{" "}
          and Smt.{" "}
          <strong className="underline font-sans font-semibold text-slate-900 px-1">
            {data.motherName || "________________________"}
          </strong>
          , residing at{" "}
          <span className="underline font-sans px-1">
            {data.villageTown || "Local Ward"}, {data.district || "District"}, {data.state || "State"}
          </span>
          , is a bonafide and regular student of this institution studying in{" "}
          <strong className="font-sans font-bold text-slate-900">
            {data.className || "Class 10"}
          </strong>{" "}
          bearing Admission No:{" "}
          <strong className="font-sans font-bold text-slate-900">
            {data.admissionNo || "ADM-2024"}
          </strong>{" "}
          and Roll No:{" "}
          <strong className="font-sans font-bold text-slate-900">
            {data.rollNo || "14"}
          </strong>{" "}
          for the Academic Year{" "}
          <strong className="font-sans font-bold text-slate-900">
            {data.academicYear || "2025-2026"}
          </strong>
          .
        </p>

        <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-sm font-sans">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500">Caste Category (As per Admission Register):</span>
              <p className="font-bold text-slate-900 text-base">{data.casteCategory || "OBC"} ({data.subCaste || "General / Sub-caste"})</p>
            </div>
            <div>
              <span className="text-slate-500">Declared Family Annual Income:</span>
              <p className="font-bold text-slate-900 text-base">₹ {data.annualIncome || "1,20,000"} / year</p>
            </div>
          </div>
          <div>
            <span className="text-slate-500">Purpose of Endorsement:</span>
            <p className="font-semibold text-emerald-800">{data.purpose || "Government Scholarship Portal (NSP / State Post-Matric) & Educational Fee Concession"}</p>
          </div>
        </div>

        <p className="text-justify leading-loose">
          As per the verified records and documentary declaration submitted by the parent / guardian at the time of admission, the particulars mentioned above are found to be true and correct according to the School Admission Register.
        </p>
      </div>

      {/* Signatures */}
      <div className="mt-16 pt-8 border-t border-slate-300 grid grid-cols-2 text-center text-xs md:text-sm">
        <div>
          <div className="h-10"></div>
          <p className="font-bold text-slate-800">{settings.signatory1?.title || "Verification Officer / Clerk"}</p>
          <p className="text-[11px] text-slate-500">Scholarship Section</p>
        </div>
        <div>
          <div className="h-10 flex items-center justify-center">
            <span className="text-[10px] text-slate-400 border border-dashed border-slate-400 px-2 py-0.5 rounded uppercase">
              Principal Signature & Seal
            </span>
          </div>
          <p className="font-bold text-slate-950">{settings.signatory3?.title || "Principal"}</p>
          <p className="text-[11px] text-slate-600">{settings.schoolName}</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. CONDUCT & STUDY CERTIFICATE VIEW
// ==========================================
function ConductCertificateView({
  data,
  settings,
}: {
  data: CertificateFormData;
  settings: SchoolCertificateSettings;
}) {
  return (
    <div className="relative p-10 md:p-14 border-[10px] border-slate-700/20 text-slate-900 bg-white">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-black uppercase text-slate-900">
          {settings.schoolName}
        </h1>
        <p className="text-xs text-slate-600 font-medium">
          {settings.address}, {settings.district}, {settings.state}
        </p>
      </div>

      <div className="flex justify-between text-xs font-mono text-slate-600 mb-6">
        <span>No: <strong>{data.certificateNo || "COND-2026-11"}</strong></span>
        <span>Date: <strong>{data.issueDate || new Date().toISOString().split("T")[0]}</strong></span>
      </div>

      <div className="text-center my-6">
        <h2 className="text-xl font-serif font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 inline-block pb-1">
          CHARACTER & CONDUCT CERTIFICATE
        </h2>
      </div>

      <div className="my-10 text-base md:text-lg leading-loose text-slate-800 font-serif space-y-6">
        <p className="text-justify leading-loose">
          This is to certify that{" "}
          <strong className="underline font-sans font-bold text-slate-950 px-1">
            {data.studentName || "Student Name"}
          </strong>
          , Son / Daughter of{" "}
          <strong className="underline font-sans font-semibold text-slate-900 px-1">
            {data.fatherName || "Parent Name"}
          </strong>
          , having Admission No{" "}
          <strong className="font-sans font-bold text-slate-900">
            {data.admissionNo || "ADM-001"}
          </strong>
          , was a bonafide student of this institution from Academic Year{" "}
          <span className="font-sans font-semibold">
            {data.dateOfAdmission || "2022"}
          </span>{" "}
          to{" "}
          <span className="font-sans font-semibold">
            {data.academicYear || "2026"}
          </span>
          .
        </p>

        <p className="text-justify leading-loose">
          During his / her period of study in this School, his / her character, behavior and conduct have been{" "}
          <strong className="underline decoration-emerald-500 font-bold text-emerald-800 font-sans">
            {data.conduct || "Exemplary and Satisfactory"}
          </strong>
          .
        </p>

        <p className="text-justify leading-loose">
          He / She bears good moral character to the best of our knowledge and official institutional records.
        </p>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs md:text-sm font-serif">
        <div>
          <div className="h-10"></div>
          <p className="font-bold text-slate-800">{settings.signatory2?.title || "Class Teacher"}</p>
        </div>
        <div>
          <div className="h-10 flex items-center justify-center">
            <span className="border border-dashed border-slate-400 px-2 py-0.5 rounded text-[10px] text-slate-400 uppercase">
              Principal Signature & Seal
            </span>
          </div>
          <p className="font-bold text-slate-950">{settings.signatory3?.title || "Principal"}</p>
          <p className="text-[11px] text-slate-600">{settings.schoolName}</p>
        </div>
      </div>
    </div>
  );
}
