"use client";

import { X, Download } from "lucide-react";
import Modal from "@/components/shared/Modal";
import type { StudentFeeRow } from "@/lib/fixtures/fees-management-reference-fixture";
import { generateInvoicePdf } from "@/lib/utils/generateInvoicePdf";

interface FeeInvoiceDialogProps {
  student: StudentFeeRow;
  onClose: () => void;
}

export default function FeeInvoiceDialog({ student, onClose }: FeeInvoiceDialogProps) {
  const handleDownload = () => {
    generateInvoicePdf({
      invoiceNumber: `FINV-${student.rollNo || "001"}`,
      studentName: student.studentName,
      className: student.classGrade,
      admissionNo: student.rollNo,
      feeType: "Academic Fee",
      amount: student.totalFee,
      paid: student.paid,
      balance: student.outstanding,
      status: student.outstanding === 0 ? "Paid" : student.paid > 0 ? "Partial" : "Unpaid",
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <Modal open={!!student} onClose={onClose} title="Fee Invoice" maxWidth="max-w-md">
      <div className="space-y-4 pt-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
            <div>
              <p className="text-sm font-bold text-slate-800">EdTech Smart Campus</p>
              <p className="text-xs text-slate-500">Official Invoice Receipt</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500">Date</p>
              <p className="text-sm font-medium text-slate-800">18 May 2025</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Student</span>
              <span className="font-semibold text-slate-800">{student.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Roll No.</span>
              <span className="font-semibold text-slate-800">{student.rollNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Class</span>
              <span className="text-slate-700">{student.classGrade}</span>
            </div>
            <div className="border-t border-slate-200 my-2 pt-2" />
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Total Fee</span>
              <span className="font-semibold text-slate-800">₹ {student.totalFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Paid</span>
              <span className="font-semibold text-emerald-600">₹ {student.paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Outstanding</span>
              <span className="font-semibold text-pink-600">₹ {student.outstanding.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold transition shadow-sm"
          >
            <Download className="h-4 w-4" />
            Download PDF Invoice
          </button>
        </div>
      </div>
    </Modal>
  );
}

