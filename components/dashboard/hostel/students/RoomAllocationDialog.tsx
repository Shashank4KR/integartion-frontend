"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";
import { Button } from "@/components/ui/button";

interface RoomAllocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { student: string; rollNo: string; block: string; room: string; checkInDate: string }) => void;
}

const BLOCK_OPTIONS = ["Block A (Boys)", "Block B (Boys)", "Block C (Girls)", "Block D (Girls)"];
const ROOM_MAP: Record<string, string[]> = {
  "Block A (Boys)": ["A-101", "A-102", "A-103", "A-104"],
  "Block B (Boys)": ["B-201", "B-202", "B-203"],
  "Block C (Girls)": ["C-301", "C-302", "C-303"],
  "Block D (Girls)": ["D-401", "D-402"],
};

export default function RoomAllocationDialog({ open, onClose, onSave }: RoomAllocationDialogProps) {
  const [student, setStudent] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [block, setBlock] = useState(BLOCK_OPTIONS[0]);
  const [room, setRoom] = useState(ROOM_MAP[BLOCK_OPTIONS[0]][0]);
  const [checkInDate, setCheckInDate] = useState("02/10/2026");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableRooms = ROOM_MAP[block] || [];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!student.trim()) newErrors.student = "Student name is required";
    if (!rollNo.trim()) newErrors.rollNo = "Roll number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ student, rollNo, block, room, checkInDate });
    handleClose();
  };

  const handleClose = () => {
    setStudent("");
    setRollNo("");
    setBlock(BLOCK_OPTIONS[0]);
    setRoom(ROOM_MAP[BLOCK_OPTIONS[0]][0]);
    setCheckInDate("02/10/2026");
    setErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Room Allocation" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Student Name</label>
          <Input
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            placeholder="Student Name"
            className={errors.student ? "border-red-300" : ""}
          />
          {errors.student && <p className="mt-1 text-xs text-red-600">{errors.student}</p>}
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
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Block</label>
          <Dropdown
            value={block}
            options={BLOCK_OPTIONS}
            onChange={(v) => {
              setBlock(v);
              setRoom(ROOM_MAP[v]?.[0] || "");
            }}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Room</label>
          <Dropdown value={room} options={availableRooms} onChange={setRoom} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Check-In Date</label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2"
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
