"use client";

import { X } from "lucide-react";
import Modal from "@/components/shared/Modal";
import type { StudentFeeRow } from "@/lib/fixtures/fees-management-reference-fixture";

interface StudentFeeDetailsDialogProps {
  student: StudentFeeRow;
  onClose: () => void;
}

export default function StudentFeeDetailsDialog({ student, onClose }: StudentFeeDetailsDialogProps) {
  return (
    <Modal open={!!student} onClose={onClose} title="Student Fee Details" maxWidth="max-w-lg">
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Roll No.</p>
            <p className="text-sm font-semibold text-slate-800">{student.rollNo}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Student Name</p>
            <p className="text-sm font-semibold text-slate-800">{student.studentName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Class / Grade</p>
            <p className="text-sm text-slate-700">{student.classGrade}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
            <div>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                student.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                student.status === "Partial" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-red-50 text-red-700 border-red-200"
              }`}>
                {student.status}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Total Fee</p>
            <p className="text-sm text-slate-700">₹ {student.totalFee.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Paid</p>
            <p className="text-sm font-semibold text-emerald-600">₹ {student.paid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Outstanding</p>
            <p className="text-sm font-semibold text-pink-600">₹ {student.outstanding.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Due Date</p>
            <p className="text-sm text-slate-700">{student.dueDate}</p>
          </div>
        </div>

        <div className="pt-2">
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-[#7c3aed] h-2 rounded-full transition-all duration-300"
              style={{ width: `${student.totalFee > 0 ? (student.paid / student.totalFee) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5 font-medium">
            <span>Payment Progress</span>
            <span className="text-slate-700 font-semibold">
              {student.totalFee > 0 ? Math.round((student.paid / student.totalFee) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

