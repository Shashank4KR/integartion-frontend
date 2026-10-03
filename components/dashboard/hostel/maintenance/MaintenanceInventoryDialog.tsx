"use client";

import Modal from "@/components/shared/Modal";

interface MaintenanceInventoryDialogProps {
  open: boolean;
  onClose: () => void;
  items?: Array<{ item: string; stock: number; category: string }>;
}

export default function MaintenanceInventoryDialog({ open, onClose, items = [] }: MaintenanceInventoryDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Inventory" maxWidth="max-w-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Item</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                  No inventory items registered.
                </td>
              </tr>
            ) : (
              items.map((inv, idx) => (
                <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">{inv.item}</td>
                  <td className="px-4 py-3 text-slate-600">{inv.category}</td>
                  <td className="px-4 py-3 text-slate-600">{inv.stock}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
