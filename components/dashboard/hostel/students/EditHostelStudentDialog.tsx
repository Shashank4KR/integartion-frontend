"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";
import DatePicker from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";
import type { HostelStudent } from "@/lib/fixtures/hostel-students-reference-fixture";

interface EditHostelStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: HostelStudent) => void;
  row: HostelStudent | null;
}

const BLOCK_OPTIONS = ["Block A (Boys)", "Block B (Boys)", "Block C (Girls)", "Block D (Girls)"];
const ROOM_MAP: Record<string, string[]> = {
  "Block A (Boys)": ["A-101", "A-102", "A-103", "A-104"],
  "Block B (Boys)": ["B-201", "B-202", "B-203"],
  "Block C (Girls)": ["C-301", "C-302", "C-303"],
  "Block D (Girls)": ["D-401", "D-402"],
};
const CLASS_OPTIONS = [
  "Class 10-A",
  "Class 10-B",
];

export default function EditHostelStudentDialog({
  open,
  onClose,
  onSave,
  row,
}: EditHostelStudentDialogProps) {
  const [admissionNo, setAdmissionNo] = useState(row?.admissionNo || "");
  const [rollNo, setRollNo] = useState(row?.rollNo || "");
  const [studentName, setStudentName] = useState(row?.studentName || "");
  const [gender, setGender] = useState(row?.gender || "Male");
  const [dateOfBirth, setDateOfBirth] = useState(row?.dateOfBirth || "15/04/2007");
  const [classSection, setClassSection] = useState(row?.classSection || "XII - A");
  const [block, setBlock] = useState(row?.block || BLOCK_OPTIONS[0]);
  const [roomNo, setRoomNo] = useState(row?.roomNo || "");
  const [checkInDate, setCheckInDate] = useState(row?.checkInDate || "01/01/2025");
  const [guardianName, setGuardianName] = useState(row?.guardianName || "");
  const [guardianContact, setGuardianContact] = useState(row?.guardianContact || "");
  const [studentContact, setStudentContact] = useState(row?.contactNo || "");
  const [status, setStatus] = useState<HostelStudent["status"]>(row?.status || "Active");
  const [notes, setNotes] = useState(row?.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableRooms = ROOM_MAP[block] || [];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!admissionNo.trim()) newErrors.admissionNo = "Admission number is required";
    if (!rollNo.trim()) newErrors.rollNo = "Roll number is required";
    if (!studentName.trim()) newErrors.studentName = "Student name is required";
    if (!guardianName.trim()) newErrors.guardianName = "Guardian name is required";
    if (!guardianContact.trim()) newErrors.guardianContact = "Guardian contact is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (!row) return;
    const initials = studentName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    onSave({
      ...row,
      admissionNo,
      rollNo,
      studentName,
      classSection,
      roomNo,
      block,
      gender,
      dateOfBirth,
      contactNo: studentContact || guardianContact,
      status,
      initials,
      checkInDate,
      guardianName,
      guardianContact,
      notes,
    });
    handleClose();
  };

  const handleClose = () => {
    setAdmissionNo("");
    setRollNo("");
    setStudentName("");
    setGender("Male");
    setDateOfBirth("15/04/2007");
    setClassSection("XII - A");
    setBlock(BLOCK_OPTIONS[0]);
    setRoomNo(ROOM_MAP[BLOCK_OPTIONS[0]][0]);
    setCheckInDate("01/01/2025");
    setGuardianName("");
    setGuardianContact("");
    setStudentContact("");
    setStatus("Active");
    setNotes("");
    setErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Edit Hostel Student" maxWidth="max-w-2xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Admission Number</label>
            <Input
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              placeholder="Admission Number"
              className={errors.admissionNo ? "border-red-300" : ""}
            />
            {errors.admissionNo && (
              <p className="mt-1 text-xs text-red-600">{errors.admissionNo}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Roll Number</label>
            <Input
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="Roll Number"
              className={errors.rollNo ? "border-red-300" : ""}
            />
            {errors.rollNo && <p className="mt-1 text-xs text-red-600">{errors.rollNo}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Student Name</label>
            <Input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student Name"
              className={errors.studentName ? "border-red-300" : ""}
            />
            {errors.studentName && (
              <p className="mt-1 text-xs text-red-600">{errors.studentName}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Gender</label>
            <Dropdown
              value={gender}
              options={["Male", "Female"]}
              onChange={setGender}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Date of Birth</label>
            <DatePicker value={dateOfBirth} onChange={setDateOfBirth} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Class</label>
            <Dropdown
              value={classSection.split(" - ")[0]}
              options={CLASS_OPTIONS.map((c) => c.split(" - ")[0])}
              onChange={(v) => {
                const found = CLASS_OPTIONS.find((c) => c.startsWith(v));
                setClassSection(found || CLASS_OPTIONS[0]);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Section</label>
            <Dropdown
              value={classSection.split(" - ")[1] || "A"}
              options={["A", "B"]}
              onChange={(v) => {
                const cls = classSection.split(" - ")[0];
                setClassSection(`${cls} - ${v}`);
              }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Hostel Block</label>
            <Dropdown
              value={block}
              options={BLOCK_OPTIONS}
              onChange={(v) => {
                setBlock(v);
                setRoomNo(ROOM_MAP[v]?.[0] || "");
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Room Number</label>
            <Dropdown
              value={roomNo}
              options={availableRooms}
              onChange={setRoomNo}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Check-In Date</label>
            <DatePicker value={checkInDate} onChange={setCheckInDate} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Guardian Name</label>
            <Input
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Guardian Name"
              className={errors.guardianName ? "border-red-300" : ""}
            />
            {errors.guardianName && (
              <p className="mt-1 text-xs text-red-600">{errors.guardianName}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Guardian Contact</label>
            <Input
              value={guardianContact}
              onChange={(e) => setGuardianContact(e.target.value)}
              placeholder="Guardian Contact"
              className={errors.guardianContact ? "border-red-300" : ""}
            />
            {errors.guardianContact && (
              <p className="mt-1 text-xs text-red-600">{errors.guardianContact}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Student Contact</label>
            <Input
              value={studentContact}
              onChange={(e) => setStudentContact(e.target.value)}
              placeholder="Student Contact"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Status</label>
            <Dropdown
              value={status}
              options={["Active", "Inactive", "Checked Out"]}
              onChange={(v) => setStatus(v as HostelStudent["status"])}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
