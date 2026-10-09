"use client";

import Modal from "@/components/shared/Modal";
import { X, MapPin, CalendarDays, FileText } from "lucide-react";

interface TransportOverviewDialogsProps {
  trackingOpen: boolean;
  scheduleOpen: boolean;
  reportOpen: boolean;
  onCloseTracking: () => void;
  onCloseSchedule: () => void;
  onCloseReport: () => void;
  metrics?: {
    scheduleAdherence?: string;
    onTimeDelivery?: string;
    activeVehicles?: number;
    activeRoutes?: number;
  };
}

export default function TransportOverviewDialogs({
  trackingOpen,
  scheduleOpen,
  reportOpen,
  onCloseTracking,
  onCloseSchedule,
  onCloseReport,
  metrics,
}: TransportOverviewDialogsProps) {
  return (
    <>
      {/* Tracking Preview */}
      <Modal open={trackingOpen} onClose={onCloseTracking} title="Live Tracking Preview" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Live Vehicle Tracking</p>
              <p className="text-xs text-slate-500">A compact tracking preview is shown below.</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
              </span>
              3 vehicles currently live
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Open Transport Management for the full tracking experience.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCloseTracking}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Schedule Dialog */}
      <Modal open={scheduleOpen} onClose={onCloseSchedule} title="Route Schedule" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <CalendarDays className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Schedule Overview</p>
              <p className="text-xs text-slate-500">Review pickup and drop schedules.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-3">
              <span className="text-sm text-slate-600">Route 1 (Green)</span>
              <span className="text-xs font-medium text-slate-500">07:15 AM - 03:15 PM</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-3">
              <span className="text-sm text-slate-600">Route 2 (Blue)</span>
              <span className="text-xs font-medium text-slate-500">07:30 AM - 03:30 PM</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-3">
              <span className="text-sm text-slate-600">Route 3 (Yellow)</span>
              <span className="text-xs font-medium text-slate-500">07:20 AM - 03:20 PM</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCloseSchedule}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Report Preview */}
      <Modal open={reportOpen} onClose={onCloseReport} title="Transport Report" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <FileText className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Performance Summary</p>
              <p className="text-xs text-slate-500">Transport performance metrics and trends.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{metrics?.scheduleAdherence ?? "100%"}</p>
              <p className="text-xs text-slate-500 mt-1">Schedule Adherence</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{metrics?.onTimeDelivery ?? "100%"}</p>
              <p className="text-xs text-slate-500 mt-1">On-Time Delivery</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{metrics?.activeVehicles ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">Active Vehicles</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{metrics?.activeRoutes ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">Active Routes</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCloseReport}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
