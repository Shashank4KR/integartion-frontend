"use client";

import { useState } from "react";
import { X, Download, Printer } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/shared/Dropdown";
interface TransportReportDialogProps {
  open: boolean;
  onClose: () => void;
  routeOptions?: string[];
}

export default function TransportReportDialog({
  open,
  onClose,
  routeOptions = [],
}: TransportReportDialogProps) {
  const [reportType, setReportType] = useState("");
  const [route, setRoute] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const availableRoutes = ["All Routes", ...routeOptions];
  const availableStatuses = ["All Status", "Active", "Inactive", "Running", "Completed"];

  const handleGenerate = () => {
    if (!reportType) return;
    onClose();
  };

  const handleExport = () => {
    onClose();
  };

  const handlePrint = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Transport Report" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Report Type</label>
          <Dropdown
            value={reportType}
            options={["Daily", "Weekly", "Monthly", "Custom"]}
            onChange={setReportType}
            placeholder="Select report type"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Route</label>
          <Dropdown
            value={route}
            options={availableRoutes}
            onChange={setRoute}
            placeholder="Select route"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
          <Dropdown
            value={status}
            options={availableStatuses}
            onChange={setStatus}
            placeholder="Select status"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">From Date</label>
            <input
              type="text"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">To Date</label>
            <input
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>
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
            onClick={handlePrint}
            variant="outline"
            className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={handleGenerate}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Generate Report
          </Button>
        </div>
      </div>
    </Modal>
  );
}
