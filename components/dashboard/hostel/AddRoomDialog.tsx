"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";
import { getToken } from "@/lib/auth";
import { listHostelBlocks } from "@/lib/services/hostelService";

const STATUS_DISPLAY_OPTIONS = ["Available", "Full", "Maintenance"];

export interface CreateRoomPayload {
  block_id: string;
  room_no: string;
  floor_no: number;
  capacity: number;
  status: "AVAILABLE" | "FULL" | "MAINTENANCE";
}

export interface HostelBlockItem {
  id: string;
  block_name: string;
  block_type?: string;
}

interface AddRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateRoomPayload) => Promise<void> | void;
  blocks?: HostelBlockItem[];
}

export default function AddRoomDialog({
  open,
  onClose,
  onSave,
  blocks: initialBlocks,
}: AddRoomDialogProps) {
  const [blocks, setBlocks] = useState<HostelBlockItem[]>(initialBlocks ?? []);
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState("");
  const [floorNo, setFloorNo] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState(STATUS_DISPLAY_OPTIONS[0]);

  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBlocks && initialBlocks.length > 0) {
      setBlocks(initialBlocks);
      if (!selectedBlockId && initialBlocks[0]?.id) {
        setSelectedBlockId(initialBlocks[0].id);
      }
    }
  }, [initialBlocks, selectedBlockId]);

  useEffect(() => {
    if (!open) return;

    const token = getToken();
    if (!token) return;

    if (!initialBlocks || initialBlocks.length === 0) {
      setIsLoadingBlocks(true);
      listHostelBlocks(token)
        .then((data) => {
          const rows = Array.isArray(data) ? data : [];
          setBlocks(rows);
          if (rows.length > 0 && !selectedBlockId) {
            setSelectedBlockId(rows[0].id);
          }
        })
        .catch(() => {
          setError("Failed to load hostel blocks.");
        })
        .finally(() => {
          setIsLoadingBlocks(false);
        });
    }
  }, [open, initialBlocks, selectedBlockId]);

  const resetForm = () => {
    setRoomNumber("");
    setFloorNo("");
    setCapacity("");
    setStatus(STATUS_DISPLAY_OPTIONS[0]);
    setError(null);
    if (blocks.length > 0) {
      setSelectedBlockId(blocks[0].id);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBlockId) {
      setError("Please select a hostel block.");
      return;
    }

    const trimmedRoomNo = roomNumber.trim();
    const floor = parseInt(floorNo, 10);
    const cap = parseInt(capacity, 10);

    if (!trimmedRoomNo) {
      setError("Please enter a room number.");
      return;
    }

    if (isNaN(floor) || floor < 0) {
      setError("Floor number must be a valid non-negative number.");
      return;
    }

    if (isNaN(cap) || cap <= 0) {
      setError("Capacity must be a valid number greater than 0.");
      return;
    }

    const statusMap: Record<string, "AVAILABLE" | "FULL" | "MAINTENANCE"> = {
      Available: "AVAILABLE",
      Full: "FULL",
      Maintenance: "MAINTENANCE",
    };

    const payload: CreateRoomPayload = {
      block_id: selectedBlockId,
      room_no: trimmedRoomNo,
      floor_no: floor,
      capacity: cap,
      status: statusMap[status] ?? "AVAILABLE",
    };

    try {
      setIsSubmitting(true);
      await onSave(payload);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const blockOptions = blocks.map((b) => b.block_name);
  const selectedBlockName =
    blocks.find((b) => b.id === selectedBlockId)?.block_name ?? "";

  const handleBlockChange = (name: string) => {
    const matched = blocks.find((b) => b.block_name === name);
    if (matched) {
      setSelectedBlockId(matched.id);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Hostel Room" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Hostel Block <span className="text-red-500">*</span>
            </label>
            {isLoadingBlocks ? (
              <div className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 flex items-center text-xs text-slate-400">
                Loading blocks...
              </div>
            ) : blocks.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                No hostel blocks found. Please create a block first.
              </div>
            ) : (
              <Dropdown
                value={selectedBlockName || blockOptions[0]}
                options={blockOptions}
                onChange={handleBlockChange}
                disabled={isSubmitting}
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Room Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 101 or A-101"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Floor Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              value={floorNo}
              onChange={(e) => setFloorNo(e.target.value)}
              placeholder="e.g. 1"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Capacity (Beds) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 3"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={status}
              options={STATUS_DISPLAY_OPTIONS}
              onChange={setStatus}
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
            disabled={isSubmitting || blocks.length === 0}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Save Room"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
