"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";
import { getToken } from "@/lib/auth";
import { listAvailableBeds } from "@/lib/services/hostelService";
import { listStudents } from "@/lib/services/studentService";

export interface CreateAllocationPayload {
  student_id: string;
  bed_id: string;
  check_in_date: string;
}

interface StudentOption {
  id: string;
  label: string;
}

interface BedOption {
  id: string;
  label: string;
  bed_no: string;
}

interface AssignStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateAllocationPayload) => Promise<void> | void;
}

export default function AssignStudentDialog({
  open,
  onClose,
  onSave,
}: AssignStudentDialogProps) {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [beds, setBeds] = useState<BedOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedBedId, setSelectedBedId] = useState<string>("");
  const [checkInDate, setCheckInDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasFetchedRef.current = false;
      return;
    }

    if (hasFetchedRef.current) return;

    const token = getToken();
    if (!token) return;

    hasFetchedRef.current = true;
    setIsLoading(true);
    setError(null);

    Promise.all([listStudents(token), listAvailableBeds(token)])
      .then(([studentData, bedData]) => {
        const studentRows: StudentOption[] = (Array.isArray(studentData) ? studentData : []).map(
          (s: any) => {
            const name = s.user
              ? `${s.user.first_name ?? ""} ${s.user.last_name ?? ""}`.trim()
              : `Student (${s.id.slice(0, 8)})`;
            const roll = s.roll_number ? ` - Roll: ${s.roll_number}` : "";
            return {
              id: s.id,
              label: `${name}${roll}`,
            };
          },
        );

        const bedRows: BedOption[] = (Array.isArray(bedData) ? bedData : []).map(
          (b: any) => ({
            id: b.id,
            bed_no: b.bed_no ?? "Bed",
            label: `Bed ${b.bed_no ?? ""}${b.room?.room_no ? ` (Room ${b.room.room_no})` : ""}`,
          }),
        );

        setStudents(studentRows);
        setBeds(bedRows);

        if (studentRows.length > 0) {
          setSelectedStudentId(studentRows[0].id);
        }
        if (bedRows.length > 0) {
          setSelectedBedId(bedRows[0].id);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load students or beds.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [open]);

  const resetForm = () => {
    setError(null);
    setCheckInDate(new Date().toISOString().split("T")[0]);
    if (students.length > 0) setSelectedStudentId(students[0].id);
    if (beds.length > 0) setSelectedBedId(beds[0].id);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudentId) {
      setError("Please select a student.");
      return;
    }

    if (!selectedBedId) {
      setError("Please select an available bed.");
      return;
    }

    if (!checkInDate) {
      setError("Please select a check-in date.");
      return;
    }

    const payload: CreateAllocationPayload = {
      student_id: selectedStudentId,
      bed_id: selectedBedId,
      check_in_date: checkInDate,
    };

    try {
      setIsSubmitting(true);
      await onSave(payload);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to allocate student to hostel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentOptions = students.map((s) => s.label);
  const selectedStudentLabel =
    students.find((s) => s.id === selectedStudentId)?.label ?? "";

  const handleStudentChange = (label: string) => {
    const matched = students.find((s) => s.label === label);
    if (matched) setSelectedStudentId(matched.id);
  };

  const bedOptions = beds.map((b) => b.label);
  const selectedBedLabel =
    beds.find((b) => b.id === selectedBedId)?.label ?? "";

  const handleBedChange = (label: string) => {
    const matched = beds.find((b) => b.label === label);
    if (matched) setSelectedBedId(matched.id);
  };

  return (
    <Modal open={open} onClose={handleClose} title="Assign Student to Hostel" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            Loading students and available beds...
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Select Student <span className="text-red-500">*</span>
              </label>
              {students.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                  No students found in the database.
                </div>
              ) : (
                <Dropdown
                  value={selectedStudentLabel || studentOptions[0]}
                  options={studentOptions}
                  onChange={handleStudentChange}
                  disabled={isSubmitting}
                />
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Select Available Bed <span className="text-red-500">*</span>
              </label>
              {beds.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                  No vacant beds available. Please add beds or rooms first.
                </div>
              ) : (
                <Dropdown
                  value={selectedBedLabel || bedOptions[0]}
                  options={bedOptions}
                  onChange={handleBedChange}
                  disabled={isSubmitting}
                />
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Check-In Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

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
            disabled={isSubmitting || isLoading || students.length === 0 || beds.length === 0}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Allocating..." : "Assign Student"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
