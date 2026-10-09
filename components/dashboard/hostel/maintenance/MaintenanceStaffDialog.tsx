"use client";

import Modal from "@/components/shared/Modal";

interface MaintenanceStaffDialogProps {
  open: boolean;
  onClose: () => void;
  staff?: Array<{ name: string; role: string; contact: string; block: string }>;
}

export default function MaintenanceStaffDialog({ open, onClose, staff = [] }: MaintenanceStaffDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Maintenance Staff" maxWidth="max-w-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Block</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  No maintenance staff assigned yet.
                </td>
              </tr>
            ) : (
              staff.map((member, idx) => (
                <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">{member.name}</td>
                  <td className="px-4 py-3 text-slate-600">{member.role}</td>
                  <td className="px-4 py-3 text-slate-600">{member.contact}</td>
                  <td className="px-4 py-3 text-slate-600">{member.block}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
