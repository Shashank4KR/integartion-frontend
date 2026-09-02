"use client";

import { UserCheck, Plus, Trash2, Phone, Award, Bus } from "lucide-react";
import Card from "@/components/shared/Card";
import Badge from "@/components/shared/Badge";

export interface DriverRecord {
  id: string;
  driver_name: string;
  license_number: string;
  phone?: string | null;
  experience?: number | null;
  bus_id?: string | null;
  status: string;
  bus?: { bus_number: string; model: string } | null;
}

interface DriversListCardProps {
  drivers: DriverRecord[];
  onAddDriver: () => void;
  onDeleteDriver?: (id: string) => void;
}

export default function DriversListCard({
  drivers,
  onAddDriver,
  onDeleteDriver,
}: DriversListCardProps) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Drivers & Crew</h3>
            <p className="text-xs text-slate-500">
              {drivers.length} registered {drivers.length === 1 ? "driver" : "drivers"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddDriver}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Driver
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-4">
        {drivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-slate-500 mb-2">No drivers registered yet.</p>
            <button
              type="button"
              onClick={onAddDriver}
              className="text-xs font-semibold text-[#7c3aed] hover:underline"
            >
              + Add First Driver
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {drivers.map((driver) => {
              const statusVariant =
                driver.status?.toUpperCase() === "ACTIVE"
                  ? "success"
                  : driver.status?.toUpperCase() === "ON_LEAVE"
                  ? "warning"
                  : "default";

              return (
                <div
                  key={driver.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-[#7c3aed] flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {driver.driver_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {driver.driver_name}
                        </span>
                        <Badge variant={statusVariant}>
                          {driver.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>Lic: <strong className="text-slate-700">{driver.license_number}</strong></span>
                        {driver.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {driver.phone}
                          </span>
                        )}
                        {typeof driver.experience === "number" && (
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-slate-400" />
                            {driver.experience} yrs exp
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Assigned Bus
                      </span>
                      <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                        <Bus className="w-3 h-3 text-purple-600" />
                        {driver.bus?.bus_number || driver.bus_id || "Unassigned"}
                      </span>
                    </div>

                    {onDeleteDriver && (
                      <button
                        type="button"
                        onClick={() => onDeleteDriver(driver.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Driver"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
