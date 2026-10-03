"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";
const REQUEST_TYPE_OPTIONS = ["All Types", "Repair", "Replacement", "Inspection", "Emergency", "Preventive Maintenance"];
const CATEGORY_OPTIONS = ["All Categories", "Electrical", "Plumbing", "Furniture", "Appliance", "Others"];
const PRIORITY_OPTIONS = ["All Priorities", "Low", "Medium", "High", "Emergency"];
const STATUS_OPTIONS = ["All Status", "Open", "In Progress", "Completed", "Overdue"];
const HOSTEL_BLOCK_OPTIONS = ["All Blocks", "Block A", "Block B", "Block C", "Block D"];
const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

interface RaiseMaintenanceRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, string>) => void;
  rooms?: any[];
}

export default function RaiseMaintenanceRequestDialog({
  open,
  onClose,
  onSave,
  rooms = [],
}: RaiseMaintenanceRequestDialogProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultRoomNo = rooms.length > 0 ? (rooms[0].room_no || rooms[0].room_number || "") : "";

  const [formData, setFormData] = useState({
    requestType: "Repair",
    category: "Electrical",
    issueTitle: "",
    description: "",
    hostelBlock: "Block A",
    roomNumber: defaultRoomNo,
    requestedBy: "Hostel Student",
    priority: "Medium",
    requestedDate: todayStr,
    preferredVisitTime: "",
    attachment: "",
    status: "Open",
  });

  useEffect(() => {
    if (!formData.roomNumber && rooms.length > 0) {
      const num = rooms[0].room_no || rooms[0].room_number || "";
      setFormData((prev) => ({ ...prev, roomNumber: num }));
    }
  }, [rooms, formData.roomNumber]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.issueTitle.trim()) newErrors.issueTitle = "Issue title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.roomNumber.trim() && rooms.length === 0) newErrors.roomNumber = "Room number is required";
    if (!formData.requestedDate.trim()) newErrors.requestedDate = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(formData);
    setFormData({
      requestType: "Repair",
      category: "Electrical",
      issueTitle: "",
      description: "",
      hostelBlock: "Block A",
      roomNumber: "",
      requestedBy: "",
      priority: "Medium",
      requestedDate: "",
      preferredVisitTime: "",
      attachment: "",
      status: "Open",
    });
    setErrors({});
    onClose();
  };

  const inputClass = (field: string) =>
    `w-full rounded-lg border ${errors[field] ? "border-red-300" : "border-slate-200"} bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c3aed]`;

  return (
    <Modal open={open} onClose={onClose} title="Raise Maintenance Request" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Request Type</label>
            <Dropdown value={formData.requestType} options={REQUEST_TYPE_OPTIONS} onChange={(v) => handleChange("requestType", v)} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Category</label>
            <Dropdown value={formData.category} options={CATEGORY_OPTIONS} onChange={(v) => handleChange("category", v)} />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Issue Title</label>
          <Input
            value={formData.issueTitle}
            onChange={(e) => handleChange("issueTitle", e.target.value)}
            placeholder="Enter issue title"
            className={inputClass("issueTitle")}
          />
          {errors.issueTitle && <p className="text-xs text-red-500 mt-1">{errors.issueTitle}</p>}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe the issue"
            rows={3}
            className={`w-full rounded-lg border ${errors.description ? "border-red-300" : "border-slate-200"} bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c3aed]`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Hostel Block</label>
            <Dropdown value={formData.hostelBlock} options={HOSTEL_BLOCK_OPTIONS} onChange={(v) => handleChange("hostelBlock", v)} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Room Number</label>
            {rooms && rooms.length > 0 ? (
              <select
                value={formData.roomNumber}
                onChange={(e) => handleChange("roomNumber", e.target.value)}
                className={inputClass("roomNumber")}
              >
                {rooms.map((r) => {
                  const num = r.room_no || r.room_number || r.id;
                  return (
                    <option key={r.id} value={num}>
                      Room {num} {r.floor_no !== undefined ? `(Floor ${r.floor_no})` : ""}
                    </option>
                  );
                })}
              </select>
            ) : (
              <Input
                value={formData.roomNumber}
                onChange={(e) => handleChange("roomNumber", e.target.value)}
                placeholder="e.g. A-101"
                className={inputClass("roomNumber")}
              />
            )}
            {errors.roomNumber && <p className="text-xs text-red-500 mt-1">{errors.roomNumber}</p>}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Requested By</label>
          <Input
            value={formData.requestedBy}
            onChange={(e) => handleChange("requestedBy", e.target.value)}
            placeholder="Enter requester name"
            className={inputClass("requestedBy")}
          />
          {errors.requestedBy && <p className="text-xs text-red-500 mt-1">{errors.requestedBy}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Priority</label>
            <Dropdown value={formData.priority} options={PRIORITY_OPTIONS.filter((p) => p !== "All Priorities")} onChange={(v) => handleChange("priority", v)} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Status</label>
            <Dropdown value={formData.status} options={STATUS_OPTIONS.filter((s) => s !== "All Status")} onChange={(v) => handleChange("status", v)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Requested Date</label>
            <Input
              type="date"
              value={formData.requestedDate}
              onChange={(e) => handleChange("requestedDate", e.target.value)}
              className={inputClass("requestedDate")}
            />
            {errors.requestedDate && <p className="text-xs text-red-500 mt-1">{errors.requestedDate}</p>}
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Preferred Visit Time</label>
            <Input
              type="time"
              value={formData.preferredVisitTime}
              onChange={(e) => handleChange("preferredVisitTime", e.target.value)}
              className={inputClass("preferredVisitTime")}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">Attachment</label>
          <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChange("attachment", file.name);
              }}
              className="text-sm text-slate-600"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 pb-2 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold px-6 shadow-sm"
          >
            Save Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}
