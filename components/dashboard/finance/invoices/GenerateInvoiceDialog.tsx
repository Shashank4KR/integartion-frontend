"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { getToken } from "@/lib/auth";
import { generateInvoice, listFeeStructures, createFeePayment } from "@/lib/services/financeService";
import { listStudents } from "@/lib/services/studentService";
import { listClasses } from "@/lib/services/classService";
import type { InvoiceRow } from "@/lib/fixtures/invoices-reference-fixture";

const INVOICE_TYPE_OPTIONS = ["Fee Invoice", "Salary Invoice", "Expense Invoice", "Other Invoice"];
const STATUS_OPTIONS = ["Pending", "Partial", "Paid", "Overdue"];
const PAYMENT_MODE_OPTIONS = ["Online", "Cash", "UPI", "Net Banking", "Bank Transfer", "Cheque"];

interface StudentItem {
  id: string;
  name: string;
  admissionNo: string;
  classId?: string;
  classGrade: string;
}

interface ClassItem {
  id: string;
  className: string;
  section: string;
  label: string;
}

interface FeeStructureItem {
  id: string;
  label: string;
  amount: number;
}

interface GenerateInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (invoice: InvoiceRow) => void;
}

export default function GenerateInvoiceDialog({
  open,
  onClose,
  onSave,
}: GenerateInvoiceDialogProps) {
  const [invoiceType, setInvoiceType] = useState<"Fee Invoice" | "Salary Invoice" | "Expense Invoice" | "Other Invoice">("Fee Invoice");
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [customPartyName, setCustomPartyName] = useState<string>("");
  const [selectedFeeStructureId, setSelectedFeeStructureId] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  });
  const [amount, setAmount] = useState<string>("");
  const [paid, setPaid] = useState<string>("0");
  const [paymentMode, setPaymentMode] = useState<string>("Online");
  const [status, setStatus] = useState<"Paid" | "Partial" | "Overdue" | "Pending">("Pending");
  const [notes, setNotes] = useState<string>("");

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 15);

      setInvoiceType("Fee Invoice");
      setSelectedClassId("ALL");
      setSelectedStudentId("");
      setCustomPartyName("");
      setSelectedFeeStructureId("");
      setInvoiceDate(new Date().toISOString().split("T")[0]);
      setDueDate(defaultDue.toISOString().split("T")[0]);
      setAmount("");
      setPaid("0");
      setPaymentMode("Online");
      setStatus("Pending");
      setNotes("");
      setErrors({});
      return;
    }

    const loadBackendData = async () => {
      const token = getToken();
      if (!token) return;

      setLoadingOptions(true);
      try {
        const [studentsRes, classesRes, feeRes] = await Promise.all([
          listStudents(token).catch(() => []),
          listClasses(token).catch(() => []),
          listFeeStructures(token).catch(() => []),
        ]);

        const classMap = new Map<string, string>();
        const mappedClasses: ClassItem[] = (Array.isArray(classesRes) ? classesRes : []).map((c: any) => {
          const lbl = `${c.class_name || "Class"} ${c.section ? `- Section ${c.section}` : ""}`.trim();
          classMap.set(String(c.id), lbl);
          return {
            id: String(c.id),
            className: c.class_name || "",
            section: c.section || "",
            label: lbl,
          };
        });

        const mappedStudents: StudentItem[] = (Array.isArray(studentsRes) ? studentsRes : []).map((s: any) => {
          const cLabel = s.class_id ? classMap.get(String(s.class_id)) : null;
          return {
            id: String(s.id),
            name: [s.first_name, s.last_name].filter(Boolean).join(" ") || s.admission_no || "Student",
            admissionNo: s.admission_no || s.id?.slice(0, 8) || "",
            classId: s.class_id ? String(s.class_id) : undefined,
            classGrade: cLabel || s.class_name || s.grade || "General",
          };
        });

        const mappedFees: FeeStructureItem[] = (Array.isArray(feeRes) ? feeRes : []).map((f: any) => ({
          id: String(f.id),
          label: `${f.fee_type || "Fee"} (₹${Number(f.amount || 0).toLocaleString("en-IN")})`,
          amount: Number(f.amount || 0),
        }));

        setClasses(mappedClasses);
        setStudents(mappedStudents);
        setFeeStructures(mappedFees);

        if (mappedStudents.length > 0) {
          setSelectedStudentId(mappedStudents[0].id);
        }
        if (mappedFees.length > 0) {
          setSelectedFeeStructureId(mappedFees[0].id);
          setAmount(String(mappedFees[0].amount));
        }
      } catch (err: any) {
        setErrors({ general: err?.message || "Failed to load options from backend." });
      } finally {
        setLoadingOptions(false);
      }
    };

    void loadBackendData();
  }, [open]);

  // Filter students based on selected class
  const availableStudents = useMemo(() => {
    if (selectedClassId === "ALL") return students;
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // When class selection changes
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    if (classId === "ALL") {
      if (students.length > 0 && !students.some((s) => s.id === selectedStudentId)) {
        setSelectedStudentId(students[0].id);
      }
    } else {
      const classStudents = students.filter((s) => s.classId === classId);
      if (classStudents.length > 0) {
        setSelectedStudentId(classStudents[0].id);
      } else {
        setSelectedStudentId("");
      }
    }
  };

  // When student selection changes
  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    const targetStudent = students.find((s) => s.id === studentId);
    if (targetStudent && targetStudent.classId && selectedClassId === "ALL") {
      setSelectedClassId(targetStudent.classId);
    }
  };

  // When fee structure selection changes
  const handleFeeStructureChange = (feeId: string) => {
    setSelectedFeeStructureId(feeId);
    const foundFee = feeStructures.find((f) => f.id === feeId);
    if (foundFee && foundFee.amount > 0) {
      setAmount(String(foundFee.amount));
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const numPaid = parseFloat(paid) || 0;
  const balance = Math.max(0, numAmount - numPaid);

  const selectedStudentObj = students.find((s) => s.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const isFeeInvoice = invoiceType === "Fee Invoice";
    if (isFeeInvoice && !selectedStudentId && !customPartyName.trim()) {
      newErrors.student = "Please select a student from the registered classes.";
    } else if (!isFeeInvoice && !customPartyName.trim() && !selectedStudentId) {
      newErrors.student = "Please enter party / recipient name.";
    }

    if (!invoiceDate) newErrors.invoiceDate = "Invoice Date is required";
    if (!dueDate) newErrors.dueDate = "Due Date is required";
    if (numAmount <= 0) newErrors.amount = "Total Amount must be greater than ₹0";
    if (numPaid > numAmount) newErrors.paid = "Paid amount cannot exceed total amount";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      let computedStatus = status;
      if (balance === 0 && numPaid > 0) {
        computedStatus = "Paid";
      } else if (numPaid > 0 && balance > 0) {
        computedStatus = "Partial";
      }

      const token = getToken();
      let generatedId = `FINV-${Date.now().toString().slice(-6)}`;

      if (token && selectedStudentId && selectedFeeStructureId) {
        try {
          const res = await generateInvoice(token, {
            student_id: selectedStudentId,
            fee_type_id: selectedFeeStructureId,
            invoice_date: invoiceDate,
            due_date: dueDate,
            amount: numAmount,
            status: computedStatus.toUpperCase(),
          });
          const createdBackendId = res?.data?.id || res?.id;
          if (res?.data?.invoice_number || res?.invoice_number) {
            generatedId = res.data?.invoice_number || res.invoice_number;
          }

          if (createdBackendId && numPaid > 0) {
            await createFeePayment(token, {
              invoice_id: createdBackendId,
              amount_paid: numPaid,
              payment_method: paymentMode,
              payment_date: invoiceDate,
              remarks: notes || "Initial Invoice Payment",
            }).catch(() => {});
          }

          if (createdBackendId) {
            generatedId = res?.data?.invoice_number || res?.invoice_number || generatedId;
          }
        } catch {
          // Optimistic local creation
        }
      }

      const finalStudentName = selectedStudentObj?.name || customPartyName || "Student";
      const finalStudentId = selectedStudentObj?.admissionNo || "ADM-001";
      const finalClassGrade = selectedStudentObj?.classGrade || (selectedClassId !== "ALL" ? classes.find(c => c.id === selectedClassId)?.label : "-") || "-";

      const newInvoice: InvoiceRow = {
        id: String(selectedStudentId ? generatedId : crypto.randomUUID()),
        invoiceNo: generatedId,
        invoiceDate,
        studentName: finalStudentName,
        studentId: finalStudentId,
        classGrade: finalClassGrade,
        invoiceType,
        dueDate,
        amount: numAmount,
        paid: numPaid,
        balance,
        status: computedStatus,
      };

      onSave(newInvoice);
      onClose();
    } catch (err: any) {
      setErrors({ general: err?.message || "Failed to generate invoice." });
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 disabled:bg-slate-50";

  return (
    <Modal open={open} onClose={onClose} title="Generate Invoice" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {errors.general && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {errors.general}
          </div>
        )}

        {loadingOptions && (
          <div className="flex items-center gap-2 rounded-lg bg-purple-50 p-2.5 text-xs text-purple-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading classes, students, and fee structures from database…
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Invoice Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Invoice Type
            </label>
            <select
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value as any)}
              className={selectClass}
            >
              {INVOICE_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Category / Structure */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Fee Category / Type
            </label>
            <select
              value={selectedFeeStructureId}
              onChange={(e) => handleFeeStructureChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Fee Structure</option>
              {feeStructures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Class / Grade Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Class / Grade (Backend Classes)
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className={selectClass}
            >
              <option value="ALL">All Classes & Grades</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">Select class to filter the student list.</p>
          </div>

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Student / Recipient
            </label>
            {invoiceType === "Fee Invoice" ? (
              availableStudents.length > 0 ? (
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Choose a Student</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionNo}) — {s.classGrade}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-2 text-xs text-slate-500 text-center">
                  No students in this class. Select "All Classes" or choose another class.
                </div>
              )
            ) : (
              <input
                type="text"
                value={customPartyName}
                onChange={(e) => setCustomPartyName(e.target.value)}
                placeholder="Enter party / payee name"
                className={selectClass}
                required
              />
            )}
            {errors.student && <p className="text-xs text-red-500 mt-1">{errors.student}</p>}
          </div>

          {/* Invoice Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className={selectClass}
              required
            />
            {errors.invoiceDate && <p className="text-xs text-red-500 mt-1">{errors.invoiceDate}</p>}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={selectClass}
              required
            />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Total Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={selectClass}
              required
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Paid Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              placeholder="0.00"
              className={selectClass}
            />
            {errors.paid && <p className="text-xs text-red-500 mt-1">{errors.paid}</p>}
          </div>

          {/* Balance (Calculated) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Calculated Balance Due (₹)
            </label>
            <input
              type="text"
              value={`₹ ${balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              readOnly
              className={`${selectClass} bg-slate-50 font-bold ${balance > 0 ? "text-amber-600" : "text-emerald-600"}`}
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className={selectClass}
            >
              {PAYMENT_MODE_OPTIONS.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className={selectClass}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Notes / Remarks
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={selectClass}
              placeholder="Optional notes or remarks..."
              rows={2}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#7c3aed] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6d28d9] transition shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate Invoice"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
