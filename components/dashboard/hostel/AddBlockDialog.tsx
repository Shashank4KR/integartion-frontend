"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";

const BLOCK_TYPE_OPTIONS = ["Boys", "Girls", "Co-ed", "Faculty / Staff"];
const STATUS_OPTIONS = ["Active", "Inactive"];

export interface CreateBlockPayload {
  block_name: string;
  block_type: string;
  total_floors: number;
  total_rooms: number;
  status: "ACTIVE" | "INACTIVE";
}

interface AddBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateBlockPayload) => Promise<void> | void;
}

export default function AddBlockDialog({ open, onClose, onSave }: AddBlockDialogProps) {
  const [blockName, setBlockName] = useState("");
  const [blockType, setBlockType] = useState(BLOCK_TYPE_OPTIONS[0]);
  const [totalFloors, setTotalFloors] = useState("");
  const [totalRooms, setTotalRooms] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setBlockName("");
    setBlockType(BLOCK_TYPE_OPTIONS[0]);
    setTotalFloors("");
    setTotalRooms("");
    setStatus(STATUS_OPTIONS[0]);
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = blockName.trim();
    const floors = parseInt(totalFloors, 10);
    const rooms = parseInt(totalRooms, 10);

    if (!trimmedName) {
      setError("Please enter a block name.");
      return;
    }

    if (isNaN(floors) || floors <= 0) {
      setError("Total floors must be a valid number greater than 0.");
      return;
    }

    if (isNaN(rooms) || rooms <= 0) {
      setError("Total rooms must be a valid number greater than 0.");
      return;
    }

    const payload: CreateBlockPayload = {
      block_name: trimmedName,
      block_type: blockType,
      total_floors: floors,
      total_rooms: rooms,
      status: status === "Active" ? "ACTIVE" : "INACTIVE",
    };

    try {
      setIsSubmitting(true);
      await onSave(payload);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create hostel block.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Hostel Block" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Block Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              placeholder="e.g. Ganga Hostel Block A"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Block Type <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={blockType}
              options={BLOCK_TYPE_OPTIONS}
              onChange={setBlockType}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={status}
              options={STATUS_OPTIONS}
              onChange={setStatus}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Total Floors <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
              placeholder="e.g. 4"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Total Rooms <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={totalRooms}
              onChange={(e) => setTotalRooms(e.target.value)}
              placeholder="e.g. 32"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-60"
          >
            Cancel
          </button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Save Block"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
