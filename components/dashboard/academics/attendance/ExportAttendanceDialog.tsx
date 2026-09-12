"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Download, FileSpreadsheet } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Dropdown from "@/components/shared/Dropdown";
import DatePicker from "@/components/shared/DatePicker";
import { getAllAttendance } from "@/lib/services/attendanceService";
import type { ClassResponse } from "@/types/entities/class";
import type { StudentResponse } from "@/types/entities/student";
import type { ClassSubjectSummary } from "@/types/entities/class-subject-summary";

interface ExportAttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  token: string;
  classes: ClassResponse[];
  initialClassId?: string;
  initialDateISO?: string;
  subjects?: ClassSubjectSummary[];
  students?: StudentResponse[];
  onSuccess?: (msg: string) => void;
}

export default function ExportAttendanceDialog({
  open,
  onClose,
  token,
  classes,
  initialClassId = "",
  initialDateISO = "",
  subjects = [],
  students = [],
  onSuccess,
}: ExportAttendanceDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [startDateISO, setStartDateISO] = useState(initialDateISO || new Date().toISOString().split("T")[0]);
  const [endDateISO, setEndDateISO] = useState(initialDateISO || new Date().toISOString().split("T")[0]);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialClassId) setSelectedClassId(initialClassId);
      if (initialDateISO) {
        setStartDateISO(initialDateISO);
        setEndDateISO(initialDateISO);
      }
      setSelectedSubjectId("");
      setError(null);
    }
  }, [open, initialClassId, initialDateISO]);

  const classOptions = [
    { value: "", label: "All Classes" },
    ...classes.map((c) => ({ value: c.id, label: `${c.class_name} — ${c.section}` })),
  ];

  const subjectOptions = [
    { value: "", label: "All Subjects" },
    ...subjects.map((s) => ({ value: s.id, label: s.subject_name })),
  ];

  const studentMap = new Map(students.map((s) => [s.id, s]));
  const classMap = new Map(classes.map((c) => [c.id, `${c.class_name} - ${c.section}`]));
  const subjectMap = new Map(subjects.map((sub) => [sub.id, sub.subject_name]));

  const handleExportCSV = async () => {
    if (!token) return;
    setExporting(true);
    setError(null);

    try {
      const records = await getAllAttendance(token, {
        class_id: selectedClassId || undefined,
        subject_id: selectedSubjectId || undefined,
        start_date: startDateISO,
        end_date: endDateISO,
      });

      if (!records || records.length === 0) {
        setError("No attendance records found to export for the selected criteria.");
        setExporting(false);
        return;
      }

      // Format CSV
      const headers = ["Date", "Student Name", "Roll No", "Admission No", "Class", "Subject", "Period", "Status", "Marked By"];
      const rows = records.map((r) => {
        const student = studentMap.get(r.student_id);
        const name = student
          ? `"${(student.first_name ?? "")} ${(student.last_name ?? "")}"`.trim()
          : '"Student"';
        const rollNo = `"${student?.roll_no || ""}"`;
        const admNo = `"${student?.admission_no || ""}"`;
        const className = `"${classMap.get(r.class_id) || r.class_id}"`;
        const subjectName = `"${subjectMap.get(r.subject_id) || r.subject_id}"`;
        const status = `"${r.status}"`;
        const date = `"${r.attendance_date}"`;
        const period = `"${r.period_no}"`;
        const markedBy = `"${r.marked_by || ""}"`;

        return [date, name, rollNo, admNo, className, subjectName, period, status, markedBy].join(",");
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `attendance_export_${startDateISO}_to_${endDateISO}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onSuccess?.(`Exported ${records.length} attendance records successfully.`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export attendance data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Export Attendance Data" maxWidth="max-w-lg">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Select filter criteria to export attendance records from the database into a CSV spreadsheet.
        </p>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Class</label>
            <Dropdown
              value={selectedClassId}
              items={classOptions}
              onChange={setSelectedClassId}
              className="w-full text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Subject</label>
            <Dropdown
              value={selectedSubjectId}
              items={subjectOptions}
              onChange={setSelectedSubjectId}
              className="w-full text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">From Date</label>
              <DatePicker value={startDateISO} onChange={setStartDateISO} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">To Date</label>
              <DatePicker value={endDateISO} onChange={setEndDateISO} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? "Generating CSV..." : "Download CSV"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
