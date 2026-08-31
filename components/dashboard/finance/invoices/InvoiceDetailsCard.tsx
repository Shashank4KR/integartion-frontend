"use client";

import { useState } from "react";
import { Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Card from "@/components/shared/Card";
import Badge from "@/components/shared/Badge";
import Modal from "@/components/shared/Modal";
import type { InvoiceRow } from "@/lib/fixtures/invoices-reference-fixture";
import { generateInvoicePdf } from "@/lib/utils/generateInvoicePdf";

interface InvoiceDetailsCardProps {
  invoice: InvoiceRow | null;
  onEdit?: (invoice: InvoiceRow) => void;
  onRecordPayment?: (invoice: InvoiceRow) => void;
}

export default function InvoiceDetailsCard({
  invoice,
  onEdit,
  onRecordPayment,
}: InvoiceDetailsCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!invoice) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-base font-semibold text-slate-900 mb-2">Invoice Details</h3>
        <p className="text-sm text-slate-500">Select an invoice to view details</p>
      </Card>
    );
  }

  const handleDownload = () => {
    generateInvoicePdf({
      invoiceNumber: invoice.invoiceNo,
      studentName: invoice.studentName,
      className: invoice.classGrade,
      admissionNo: invoice.studentId,
      feeType: invoice.invoiceType,
      amount: invoice.amount,
      paid: invoice.paid,
      balance: invoice.balance,
      status: invoice.status,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
    });
  };

  const badgeVariant = invoice.status === "Paid" ? "success" : invoice.status === "Partial" ? "warning" : "error";

  return (
    <Card className="p-6 flex flex-col space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Invoice Details</h3>
        <Badge variant={badgeVariant}>{invoice.status}</Badge>
      </div>
      <div className="flex flex-col space-y-1">
        <h4 className="text-xl font-bold text-slate-900">{invoice.invoiceNo}</h4>
        <p className="text-xs font-semibold text-[#7c3aed]">{invoice.invoiceType}</p>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Student Name</span>
          <span className="font-medium text-slate-800">{invoice.studentName}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Class / Grade</span>
          <span className="font-medium text-slate-800">{invoice.classGrade}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Invoice Date</span>
          <span className="font-medium text-slate-800">{invoice.invoiceDate}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Due Date</span>
          <span className="font-medium text-slate-800">{invoice.dueDate}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Payment Mode</span>
          <span className="font-medium text-slate-800">Online</span>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Amount Details</h4>
        <div className="rounded-xl bg-slate-50 p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Total Amount</span>
            <span className="font-semibold text-slate-800">₹ {invoice.amount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Paid Amount</span>
            <span className="font-semibold text-green-600">₹ {invoice.paid.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
            <span className="font-medium text-slate-700">Balance (Balance Fees)</span>
            <span className={`font-bold ${invoice.balance > 0 ? "text-red-600" : "text-slate-900"}`}>
              ₹ {invoice.balance.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        {onRecordPayment && invoice.balance > 0 && (
          <button
            type="button"
            onClick={() => onRecordPayment(invoice)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition"
          >
            💳 Record Payment (Collect ₹{invoice.balance.toLocaleString("en-IN")})
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(invoice)}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition"
          >
            ✏️ Edit Invoice / Extend Due Date
          </button>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1 gap-1.5 h-9 text-xs text-slate-700 border-slate-200 hover:border-[#7c3aed] hover:text-[#7c3aed] transition"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View</span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-1.5 h-9 text-xs text-slate-700 border-slate-200 hover:border-[#7c3aed] hover:text-[#7c3aed] transition"
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>
      {previewOpen && (
        <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Invoice Preview" maxWidth="max-w-xl">
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-xl font-bold text-slate-900">{invoice.invoiceNo}</h4>
                <p className="text-xs font-semibold text-[#7c3aed] mt-1">{invoice.invoiceType}</p>
              </div>
              <Badge variant={invoice.status === "Paid" ? "success" : invoice.status === "Partial" ? "warning" : "error"}>
                {invoice.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 rounded-xl p-4">
              <div>
                <p className="text-slate-500 font-medium">Student Name</p>
                <p className="text-slate-900 font-semibold mt-1">{invoice.studentName}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Class / Grade</p>
                <p className="text-slate-900 font-semibold mt-1">{invoice.classGrade}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Invoice Date</p>
                <p className="text-slate-900 font-semibold mt-1">{invoice.invoiceDate}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Due Date</p>
                <p className="text-slate-900 font-semibold mt-1">{invoice.dueDate}</p>
              </div>
            </div>
            
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Total Amount</span>
                <span className="text-slate-900 font-bold">₹ {invoice.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Paid Amount</span>
                <span className="text-slate-900 font-semibold text-green-600">₹ {invoice.paid.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                <span className="text-slate-600 font-semibold">Balance</span>
                <span className={`text-base font-bold ${invoice.balance > 0 ? "text-red-600" : "text-slate-900"}`}>
                  ₹ {invoice.balance.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}

