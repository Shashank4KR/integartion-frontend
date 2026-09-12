"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Check } from "lucide-react";
import Modal from "@/components/shared/Modal";

interface AttendanceSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveSuccess?: (msg: string) => void;
}

export interface AttendanceSettings {
  minPercentage: number;
  periodsPerDay: number;
  autoFlagLowAttendance: boolean;
  allowLateEntry: boolean;
  notifyParentsOnAbsence: boolean;
}

const DEFAULT_SETTINGS: AttendanceSettings = {
  minPercentage: 75,
  periodsPerDay: 8,
  autoFlagLowAttendance: true,
  allowLateEntry: true,
  notifyParentsOnAbsence: false,
};

const STORAGE_KEY = "edtech_attendance_settings";

export function getStoredAttendanceSettings(): AttendanceSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function AttendanceSettingsDialog({
  open,
  onClose,
  onSaveSuccess,
}: AttendanceSettingsDialogProps) {
  const [settings, setSettings] = useState<AttendanceSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setSettings(getStoredAttendanceSettings());
      setSaved(false);
    }
  }, [open]);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      onSaveSuccess?.("Attendance settings saved successfully.");
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 600);
    } catch {
      onSaveSuccess?.("Failed to persist settings.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Attendance Settings" maxWidth="max-w-md">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Minimum Attendance Required (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={settings.minPercentage}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                minPercentage: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
              }))
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Students below this percentage will be flagged as low attendance.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Default Periods Per Day
          </label>
          <input
            type="number"
            min="1"
            max="15"
            value={settings.periodsPerDay}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                periodsPerDay: Math.max(1, Math.min(15, Number(e.target.value) || 1)),
              }))
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-3">
          <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
            <span>Auto-flag low attendance students</span>
            <input
              type="checkbox"
              checked={settings.autoFlagLowAttendance}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, autoFlagLowAttendance: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
            <span>Allow marking student status as LATE</span>
            <input
              type="checkbox"
              checked={settings.allowLateEntry}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, allowLateEntry: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
            <span>Notify parents on student absence</span>
            <input
              type="checkbox"
              checked={settings.notifyParentsOnAbsence}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, notifyParentsOnAbsence: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved" : "Save Settings"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
