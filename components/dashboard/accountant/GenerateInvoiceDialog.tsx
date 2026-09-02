"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { getToken } from "@/lib/auth";
import { generateInvoice, listFeeStructures, createFeePayment, createSalaryRecord, addExpense } from "@/lib/services/financeService";
import { listStudents } from "@/lib/services/studentService";
import { listClasses } from "@/lib/services/classService";

const INVOICE_TYPE_OPTIONS = ["Fee Invoice", "Salary Invoice", "Expense Invoice", "Other Invoice"];
const STATUS_OPTIONS = ["Pending", "Partial", "Paid", "Overdue"];
const PAYMENT_MODE_OPTIONS = ["Online", "Cash", "UPI", "Card", "Net Banking", "Bank Transfer", "Cheque", "Scholarship", "Other"];
const EXPENSE_CATEGORIES = [
  "Maintenance",
  "Utilities & Electricity",
  "Office & Supplies",
  "Lab & Equipment",
  "Software & IT",
  "Transport & Fuel",
  "Hospitality & Events",
  "Other Operational",
];
const DEPARTMENTS = [
  "Teaching Staff",
  "Administration",
  "IT & Laboratory",
  "Library Staff",
  "Maintenance & Facilities",
  "Accounts & Finance",
  "Security & Support",
];

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
  onGenerated?: (invoice?: any) => void;
  onSave?: (invoice: any) => void;
}

export default function GenerateInvoiceDialog({
  open,
  onClose,
  onGenerated,
  onSave,
}: GenerateInvoiceDialogProps) {
  const [invoiceType, setInvoiceType] = useState<"Fee Invoice" | "Salary Invoice" | "Expense Invoice" | "Other Invoice">("Fee Invoice");
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [customPartyName, setCustomPartyName] = useState<string>("");
  const [customExpenseCategory, setCustomExpenseCategory] = useState<string>("Maintenance");
  const [departmentName, setDepartmentName] = useState<string>("Teaching Staff");
  const [selectedFeeStructureId, setSelectedFeeStructureId] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  });
  const [amount, setAmount] = useState<string>("");
  const [paid, setPaid] = useState<string>("0");
  const [paymentMode, setPaymentMode] = useState<string>("UPI");
  const [paymentRemarks, setPaymentRemarks] = useState<string>("");
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
      setPaymentMode("UPI");
      setPaymentRemarks("");
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

      if (token && isFeeInvoice && selectedStudentId && selectedFeeStructureId) {
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

          if (numPaid > 0 && createdBackendId) {
            await createFeePayment(token, {
              invoice_id: createdBackendId,
              amount: numPaid,
              payment_method: paymentMode.toUpperCase(),
              payment_mode: paymentMode.toUpperCase(),
              payment_date: invoiceDate,
              receipt_number: `RCP-${Date.now().toString().slice(-6)}`,
              remarks: paymentRemarks || `Initial payment of ₹${numPaid} via ${paymentMode}`,
            });
          }
        } catch (apiErr: any) {
          console.warn("Backend generate invoice call had issue:", apiErr);
        }
      } else if (token && invoiceType === "Salary Invoice") {
        try {
          const res = await createSalaryRecord(token, {
            employee_name: customPartyName.trim() || "Staff Member",
            amount: numAmount,
            month: new Date(invoiceDate).getMonth() + 1,
            year: new Date(invoiceDate).getFullYear(),
            payment_method: paymentMode.toUpperCase().replace(/\s+/g, "_"),
            status: computedStatus === "Paid" ? "PAID" : "PENDING",
            payment_date: invoiceDate,
          });
          generatedId = res?.data?.voucher_no || res?.voucher_no || `SAL-${Date.now().toString().slice(-6)}`;
        } catch {
          generatedId = `SAL-${Date.now().toString().slice(-6)}`;
        }
      } else if (token && (invoiceType === "Expense Invoice" || invoiceType === "Other Invoice")) {
        try {
          const res = await addExpense(token, {
            category: customExpenseCategory || "Maintenance",
            amount: numAmount,
            expense_date: invoiceDate,
            description: paymentRemarks || `${invoiceType} for ${customPartyName || "Vendor"}`,
            payment_method: paymentMode.toUpperCase().replace(/\s+/g, "_"),
            status: computedStatus === "Paid" ? "PAID" : "PENDING",
            reference_no: `EXP-${Date.now().toString().slice(-6)}`,
          });
          generatedId = res?.data?.reference_no || res?.reference_no || `EXP-${Date.now().toString().slice(-6)}`;
        } catch {
          generatedId = `EXP-${Date.now().toString().slice(-6)}`;
        }
      }

      const finalStudentName = isFeeInvoice
        ? (selectedStudentObj?.name || "Student")
        : customPartyName || (invoiceType === "Salary Invoice" ? "Staff Member" : "Vendor");
      const finalStudentId = isFeeInvoice
        ? (selectedStudentObj?.admissionNo || "ADM-001")
        : (invoiceType === "Salary Invoice" ? "STAFF" : "EXPENSE");
      const finalClassGrade = isFeeInvoice
        ? (selectedStudentObj?.classGrade || "General")
        : (invoiceType === "Salary Invoice" ? departmentName : customExpenseCategory);

      const newInvoice = {
        id: generatedId,
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

      if (onSave) onSave(newInvoice);
      if (onGenerated) onGenerated(newInvoice);
      onClose();
    } catch (err: any) {
      setErrors({ general: err?.message || "Failed to generate invoice. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate Official Invoice"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
            {errors.general}
          </div>
        )}

        {/* Invoice Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Invoice Type <span className="text-red-500">*</span>
          </label>
          <select
            value={invoiceType}
            onChange={(e) => setInvoiceType(e.target.value as any)}
            className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {INVOICE_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Category or Department */}
        {invoiceType === "Salary Invoice" && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        )}

        {(invoiceType === "Expense Invoice" || invoiceType === "Other Invoice") && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Expense Category <span className="text-red-500">*</span>
            </label>
            <select
              value={customExpenseCategory}
              onChange={(e) => setCustomExpenseCategory(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Class and Student Selection */}
        {invoiceType === "Fee Invoice" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {/* Filter by Class */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Filter by Class / Section
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                disabled={loadingOptions}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="ALL">All Classes & Sections</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Student */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Registered Student <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                disabled={loadingOptions || availableStudents.length === 0}
                className={`w-full h-10 px-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.student ? "border-red-500" : "border-slate-300"
                }`}
              >
                {availableStudents.length === 0 ? (
                  <option value="">No students in selected class</option>
                ) : (
                  availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionNo}) - {s.classGrade}
                    </option>
                  ))
                )}
              </select>
              {errors.student && <p className="text-xs text-red-500 mt-1">{errors.student}</p>}
            </div>

            {/* Student metadata preview */}
            {selectedStudentObj && (
              <div className="col-span-1 md:col-span-2 text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200 flex flex-wrap justify-between items-center">
                <span>
                  <strong className="text-slate-800">Student:</strong> {selectedStudentObj.name}
                </span>
                <span>
                  <strong className="text-slate-800">Admission No:</strong> {selectedStudentObj.admissionNo}
                </span>
                <span>
                  <strong className="text-slate-800">Class & Grade:</strong> {selectedStudentObj.classGrade}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {invoiceType === "Salary Invoice" ? "Employee / Staff Name" : "Recipient / Vendor Name"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customPartyName}
              onChange={(e) => setCustomPartyName(e.target.value)}
              placeholder={invoiceType === "Salary Invoice" ? "e.g., Dr. Rajesh Sharma" : "e.g., John Doe / Vendor Name"}
              className={`w-full h-10 px-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.student ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.student && <p className="text-xs text-red-500 mt-1">{errors.student}</p>}
          </div>
        )}

        {/* Fee Structure */}
        {invoiceType === "Fee Invoice" && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Fee Structure <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedFeeStructureId}
              onChange={(e) => handleFeeStructureChange(e.target.value)}
              disabled={loadingOptions || feeStructures.length === 0}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {feeStructures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Invoice Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full h-10 px-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.dueDate ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
          </div>
        </div>

        {/* Amounts & Payment Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Total Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 15000"
              className={`w-full h-10 px-3 border rounded-lg text-sm bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.amount ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Paid Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              max={numAmount || undefined}
              step="1"
              value={paid}
              onChange={(e) => {
                const val = e.target.value;
                setPaid(val);
                const p = parseFloat(val) || 0;
                if (p >= numAmount && numAmount > 0) {
                  setStatus("Paid");
                } else if (p > 0 && p < numAmount) {
                  setStatus("Partial");
                } else {
                  setStatus("Pending");
                }
              }}
              className={`w-full h-10 px-3 border rounded-lg text-sm bg-white font-semibold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.paid ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.paid && <p className="text-xs text-red-500 mt-1">{errors.paid}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Remaining Balance
            </label>
            <div className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-100 flex items-center font-bold text-amber-600">
              ₹ {balance.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Payment Details when Paid > 0 */}
        {numPaid > 0 && (
          <div className="bg-purple-50/70 p-3 rounded-lg border border-purple-200 space-y-3">
            <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              Initial Payment Transaction Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type of Payment <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {PAYMENT_MODE_OPTIONS.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Details & Remarks (Text)
                </label>
                <input
                  type="text"
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  placeholder="e.g., UPI Ref #987654321 / Bank Transfer / Cash receipt"
                  className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Invoice Status Override */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Invoice Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#7c3aed] hover:bg-[#6d28d9] rounded-lg transition flex items-center gap-2 shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate & Save Invoice"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}