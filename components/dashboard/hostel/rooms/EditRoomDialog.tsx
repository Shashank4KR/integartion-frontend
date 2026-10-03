"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";
const ADD_ROOM_BLOCK_OPTIONS = ["Block A", "Block B", "Block C"];

const ADD_ROOM_FLOOR_OPTIONS = ["1st Floor", "2nd Floor", "3rd Floor"];

const ADD_ROOM_TYPE_OPTIONS = ["1 Seater", "2 Seater", "3 Seater", "4 Seater"];

const ADD_ROOM_STATUS_LIST = ["Occupied", "Partially Vacant", "Vacant", "Maintenance"];

const ADD_ROOM_GENDER_OPTIONS = ["Boys", "Girls"];
import type { RoomRow } from "@/lib/fixtures/rooms-management-reference-fixture";

interface EditRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    id: string;
    roomNumber: string;
    block: string;
    floor: string;
    roomType: string;
    capacity: string;
    gender: string;
    occupiedBeds: string;
    supervisor: string;
    status: string;
    notes: string;
  }) => void;
  row: RoomRow | null;
}

export default function EditRoomDialog({ open, onClose, onSave, row }: EditRoomDialogProps) {
  const [roomNumber, setRoomNumber] = useState("");
  const [block, setBlock] = useState(ADD_ROOM_BLOCK_OPTIONS[0]);
  const [floor, setFloor] = useState(ADD_ROOM_FLOOR_OPTIONS[0]);
  const [roomType, setRoomType] = useState(ADD_ROOM_TYPE_OPTIONS[2]);
  const [capacity, setCapacity] = useState("");
  const [gender, setGender] = useState(ADD_ROOM_GENDER_OPTIONS[0]);
  const [occupiedBeds, setOccupiedBeds] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [status, setStatus] = useState(ADD_ROOM_STATUS_LIST[0]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open && row) {
      setRoomNumber(row.roomNumber);
      setBlock(row.block.replace(/ \(.*\)/, ""));
      setFloor(row.floor);
      setRoomType(row.roomType);
      setCapacity(String(row.capacity));
      setGender(row.block.includes("Girls") ? "Girls" : "Boys");
      setOccupiedBeds(String(row.occupiedBeds));
      setSupervisor("");
      setStatus(row.status);
      setNotes("");
      setErrors([]);
    } else if (!open) {
      setRoomNumber("");
      setBlock(ADD_ROOM_BLOCK_OPTIONS[0]);
      setFloor(ADD_ROOM_FLOOR_OPTIONS[0]);
      setRoomType(ADD_ROOM_TYPE_OPTIONS[2]);
      setCapacity("");
      setGender(ADD_ROOM_GENDER_OPTIONS[0]);
      setOccupiedBeds("");
      setSupervisor("");
      setStatus(ADD_ROOM_STATUS_LIST[0]);
      setNotes("");
      setErrors([]);
    }
  }, [open, row]);

  const validate = (): boolean => {
    const newErrors: string[] = [];
    if (!roomNumber.trim()) newErrors.push("Room Number is required");
    if (!block) newErrors.push("Block is required");
    if (!floor) newErrors.push("Floor is required");
    if (!roomType) newErrors.push("Room Type is required");
    if (!capacity || Number(capacity) <= 0) newErrors.push("Capacity must be a positive number");
    if (!gender) newErrors.push("Gender is required");
    if (occupiedBeds === "" || Number(occupiedBeds) < 0) newErrors.push("Occupied Beds must be a non-negative number");
    if (Number(occupiedBeds) > Number(capacity)) newErrors.push("Occupied Beds cannot exceed Capacity");
    if (!status) newErrors.push("Status is required");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (!validate() || !row) return;
    onSave({
      id: row.id,
      roomNumber,
      block,
      floor,
      roomType,
      capacity,
      gender,
      occupiedBeds,
      supervisor,
      status,
      notes,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Room" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {errors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-red-600">{err}</p>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Room Number</label>
            <Input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. A-101" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Hostel Block</label>
            <Dropdown value={block} options={ADD_ROOM_BLOCK_OPTIONS} onChange={setBlock} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Floor</label>
            <Dropdown value={floor} options={ADD_ROOM_FLOOR_OPTIONS} onChange={setFloor} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Room Type</label>
            <Dropdown value={roomType} options={ADD_ROOM_TYPE_OPTIONS} onChange={setRoomType} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Capacity (Beds)</label>
            <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 4" type="number" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Gender</label>
            <Dropdown value={gender} options={ADD_ROOM_GENDER_OPTIONS} onChange={setGender} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Current Occupied Beds</label>
            <Input value={occupiedBeds} onChange={(e) => setOccupiedBeds(e.target.value)} placeholder="e.g. 2" type="number" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Block Supervisor</label>
            <Input value={supervisor} onChange={(e) => setSupervisor(e.target.value)} placeholder="Supervisor name" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
            <Dropdown value={status} options={ADD_ROOM_STATUS_LIST} onChange={setStatus} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed]"
            rows={3}
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <Button
            onClick={handleSave}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
