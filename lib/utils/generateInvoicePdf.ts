import jsPDF from "jspdf";

export type InvoicePdfData = {
  invoiceNumber: string;
  studentName: string;
  className: string;
  admissionNo: string;
  feeType: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
  invoiceDate: string;
  dueDate: string;
};

const money = (value: number) =>
  `INR ${Number.isFinite(value) ? value.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0"}`;

const displayDate = (value: string) => {
  if (!value || value === "-") return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

export function generateInvoicePdf(data: InvoicePdfData): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 56;

  // Top color bar
  doc.setFillColor(13, 110, 120);
  doc.rect(0, 0, pageWidth, 10, "F");

  // Header: title left, school info right
  doc.setFontSize(28);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 20, 20);
  doc.text("Invoice", margin, y + 40);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("EdTech Smart Campus", pageWidth - margin, y, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  const schoolLines = ["School Address", "City", "Country", "Postal Code"];
  schoolLines.forEach((line, idx) => {
    doc.text(line, pageWidth - margin, y + 16 + idx * 14, { align: "right" });
  });

  y += 90;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 30;

  // Bill To (left) + Invoice meta (right)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("BILL TO:", margin, y);

  doc.setFontSize(13);
  doc.text(data.studentName, margin, y + 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(`Class: ${data.className}`, margin, y + 34);
  doc.text(`Admission No: ${data.admissionNo}`, margin, y + 48);

  const metaX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("INVOICE #", metaX, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(data.invoiceNumber, metaX, y + 14, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("DATE", metaX, y + 32, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(displayDate(data.invoiceDate), metaX, y + 46, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("DUE DATE", metaX, y + 64, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(displayDate(data.dueDate), metaX, y + 78, { align: "right" });

  y += 110;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  // Table header
  const col = {
    item: margin,
    desc: margin + 130,
    qty: pageWidth - margin - 210,
    price: pageWidth - margin - 150,
    tax: pageWidth - margin - 80,
    amount: pageWidth - margin,
  };
  const itemColWidth = col.desc - col.item - 12;
  const descColWidth = col.qty - col.desc - 30;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("ITEM", col.item, y);
  doc.text("DESCRIPTION", col.desc, y);
  doc.text("QTY", col.qty, y, { align: "right" });
  doc.text("PRICE", col.price, y, { align: "right" });
  doc.text("TAX", col.tax, y, { align: "right" });
  doc.text("AMOUNT", col.amount, y, { align: "right" });

  y += 10;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Single line item (fee type) — truncate long text to fit its column
  const itemLabel = /^[0-9a-f-]{20,}$/i.test(data.feeType) ? "Fee" : (data.feeType || "Fee");
  const itemText = doc.splitTextToSize(itemLabel, itemColWidth)[0] ?? itemLabel;
  const descText = doc.splitTextToSize(`Invoice for ${data.studentName}`, descColWidth)[0] ?? "";

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  doc.text(itemText, col.item, y);
  doc.text(descText, col.desc, y);
  doc.text("1", col.qty, y, { align: "right" });
  doc.text(money(data.amount), col.price, y, { align: "right" });
  doc.text("0%", col.tax, y, { align: "right" });
  doc.text(money(data.amount), col.amount, y, { align: "right" });

  y += 40;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 30;

  // Payment status block
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("STATUS:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(data.status, margin + 60, y);

  doc.setFont("helvetica", "normal");
  doc.text(`Paid: ${money(data.paid)}`, margin, y + 16);
  doc.text(`Balance: ${money(data.balance)}`, margin, y + 32);

  // Total (right)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("TOTAL", metaX, y, { align: "right" });
  doc.setFontSize(20);
  doc.text(money(data.amount), metaX, y + 26, { align: "right" });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(140, 140, 140);
  doc.text("EdTech Smart Campus ERP - Fee Invoice", pageWidth / 2, footerY, { align: "center" });

  doc.save(`${data.invoiceNumber || "invoice"}.pdf`);
}