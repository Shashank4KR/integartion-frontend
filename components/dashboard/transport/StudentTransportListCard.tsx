"use client";

import { UserCheck, Trash2, MapPin, Bus } from "lucide-react";
import Card from "@/components/shared/Card";

interface StudentTransportItem {
  id: string;
  student_id: string;
  student_name: string;
  bus_number: string;
  route_name: string;
  stop_point: string;
  created_at?: string;
}

interface StudentTransportListCardProps {
  students: StudentTransportItem[];
  onAssignStudent: () => void;
  onRemoveStudent: (id: string) => void;
}

export default function StudentTransportListCard({
  students,
  onAssignStudent,
  onRemoveStudent,
}: StudentTransportListCardProps) {
  return (
    <Card className="flex flex-col h-full bg-white rounded-lg border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Students on Transport</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {students.length} {students.length === 1 ? "student" : "students"} allocated to school fleet
          </p>
        </div>
        <button
          type="button"
          onClick={onAssignStudent}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7c3aed] hover:text-[#6d28d9] transition"
        >
          <UserCheck className="w-3.5 h-3.5" />
          Assign Student
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Student
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Assigned Route
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Bus / Vehicle
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Stop Point
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                  No students assigned to transport yet. Click &quot;Assign Student&quot; or &quot;Transport Fee&quot; to allocate a student.
                </td>
              </tr>
            ) : (
              students.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-50 text-[#7c3aed] flex items-center justify-center font-bold text-xs">
                        {item.student_name ? item.student_name.charAt(0).toUpperCase() : "S"}
                      </div>
                      <span className="font-semibold text-slate-900">{item.student_name || "Unknown Student"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-[#7c3aed]">{item.route_name || "-"}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      <Bus className="w-3.5 h-3.5" />
                      {item.bus_number || "Unassigned"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-600 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.stop_point || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveStudent(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                      title="Remove from transport"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
