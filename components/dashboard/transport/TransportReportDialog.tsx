"use client";

import { useState } from "react";
import { Download, Printer, FileText } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/shared/Dropdown";
import DatePicker from "@/components/shared/DatePicker";

interface TransportReportDialogProps {
  open: boolean;
  onClose: () => void;
  routeOptions?: string[];
  routesData?: Array<{
    id?: string;
    routeId?: string;
    routeName: string;
    startPoint?: string;
    endPoint?: string;
    stops?: number;
    stopsList?: Array<{ stop_name: string; pickup_time?: string }>;
    vehicle?: string;
    driver?: string;
    students?: number;
    status?: string;
  }>;
}

export default function TransportReportDialog({
  open,
  onClose,
  routeOptions = [],
  routesData = [],
}: TransportReportDialogProps) {
  const [reportType, setReportType] = useState("Route & Passenger Summary");
  const [selectedRoute, setSelectedRoute] = useState("All Routes");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const availableRoutes = ["All Routes", ...routeOptions];
  const availableStatuses = ["All Status", "Active", "Inactive"];

  const getFilteredReportRows = () => {
    let list = [...routesData];
    if (selectedRoute !== "All Routes") {
      list = list.filter((r) => r.routeName === selectedRoute);
    }
    if (selectedStatus !== "All Status") {
      list = list.filter((r) => r.status === selectedStatus);
    }
    return list;
  };

  const handleExportCSV = () => {
    const rows = getFilteredReportRows();
    const headers = [
      "Route ID",
      "Route Name",
      "Start Point",
      "Destination",
      "Intermediate Stops Count",
      "Stops List",
      "Assigned Vehicle",
      "Assigned Driver",
      "Enrolled Students",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => {
        const stopsSummary = (r.stopsList || [])
          .map((s) => `${s.stop_name}${s.pickup_time ? ` (${s.pickup_time})` : ""}`)
          .join(" | ");
        return [
          `"${r.routeId || r.id || ""}"`,
          `"${r.routeName || ""}"`,
          `"${r.startPoint || ""}"`,
          `"${r.endPoint || ""}"`,
          r.stops ?? (r.stopsList ? r.stopsList.length : 0),
          `"${stopsSummary.replace(/"/g, '""')}"`,
          `"${r.vehicle || "Unassigned"}"`,
          `"${r.driver || "Unassigned"}"`,
          r.students ?? 0,
          `"${r.status || "Active"}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `transport_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    const rows = getFilteredReportRows();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const dateStr = new Date().toLocaleDateString();
    const tableRows = rows
      .map(
        (r) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${r.routeId || r.id || "-"}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${r.routeName}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${r.startPoint || "Campus"} &rarr; ${r.endPoint || "City"}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${r.stops ?? (r.stopsList ? r.stopsList.length : 0)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${r.vehicle || "-"}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${r.driver || "-"}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${r.students ?? 0}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${r.status || "Active"}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Transport Fleet & Route Report - ${dateStr}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
            h1 { font-size: 20px; margin-bottom: 4px; color: #0f172a; }
            p { font-size: 12px; color: #64748b; margin-top: 0; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background-color: #f8fafc; color: #475569; font-weight: 600; text-align: left; padding: 8px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>Transport Fleet & Route Performance Report</h1>
          <p>Generated on ${dateStr} &bull; Scope: ${selectedRoute} &bull; Status: ${selectedStatus}</p>
          <table>
            <thead>
              <tr>
                <th>Route ID</th>
                <th>Route Name</th>
                <th>Path</th>
                <th>Stops</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Students</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="8" style="text-align: center; padding: 16px;">No routes found</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Transport Report" maxWidth="max-w-lg">
      <div className="space-y-4">
        {downloadSuccess && (
          <div className="rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
            Report exported successfully as CSV!
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Report Type</label>
          <Dropdown
            value={reportType}
            options={["Route & Passenger Summary", "Fleet Utilization", "Trip Log"]}
            onChange={setReportType}
            placeholder="Select report type"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Route</label>
            <Dropdown
              value={selectedRoute}
              options={availableRoutes}
              onChange={setSelectedRoute}
              placeholder="Select route"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
            <Dropdown
              value={selectedStatus}
              options={availableStatuses}
              onChange={setSelectedStatus}
              placeholder="Select status"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">From Date</label>
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              align="left"
              direction="down"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">To Date</label>
            <DatePicker
              value={toDate}
              onChange={setToDate}
              align="right"
              direction="down"
            />
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 flex items-center gap-2 border border-slate-100">
          <FileText className="w-4 h-4 text-[#7c3aed] flex-shrink-0" />
          <span>
            Generates live report for <strong>{getFilteredReportRows().length}</strong> route(s) with stops, assigned vehicles, drivers, and student passenger allocations.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>
          <Button
            type="button"
            onClick={handlePrint}
            variant="outline"
            className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            type="button"
            onClick={handleExportCSV}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </Modal>
  );
}
