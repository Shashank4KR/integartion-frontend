"use client";

interface DiscountConcessionRow {
  id: string;
  studentName: string;
  classGrade: string;
  discountType: string;
  originalFee: number;
  discountAmount: number;
  finalFee: number;
  approvalStatus: string;
}

interface DiscountsConcessionsTabProps {
  discounts?: DiscountConcessionRow[];
}

export default function DiscountsConcessionsTab({ discounts = [] }: DiscountsConcessionsTabProps) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Approved: "bg-emerald-50 text-emerald-700",
      Pending: "bg-amber-50 text-amber-700",
      Rejected: "bg-red-50 text-red-700",
    };
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.Pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class / Grade</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount Type</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Original Fee (₹)</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Discount (₹)</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Final Fee (₹)</th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Approval Status</th>
          </tr>
        </thead>
        <tbody>
          {discounts.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                No discounts or concessions recorded.
              </td>
            </tr>
          ) : (
            discounts.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                <td className="py-3 pr-4 text-sm font-medium text-slate-900">{row.studentName}</td>
                <td className="py-3 pr-4 text-sm text-slate-600">{row.classGrade}</td>
                <td className="py-3 pr-4 text-sm text-slate-600">{row.discountType}</td>
                <td className="py-3 pr-4 text-sm text-slate-900 text-right font-medium">₹ {row.originalFee.toLocaleString()}</td>
                <td className="py-3 pr-4 text-sm text-emerald-700 text-right font-medium">-₹ {row.discountAmount.toLocaleString()}</td>
                <td className="py-3 pr-4 text-sm text-slate-900 text-right font-medium">₹ {row.finalFee.toLocaleString()}</td>
                <td className="py-3 text-center">{getStatusBadge(row.approvalStatus)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
