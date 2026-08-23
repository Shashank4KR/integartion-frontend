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
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = 0;

  // ===== Color palette (matches dashboard purple theme) =====
  const purple = { r: 124, g: 58, b: 237 };       // primary accent (#7C3AED)
  const darkPurple = { r: 42, g: 31, b: 77 };      // sidebar-like dark purple
  const lightPurple = { r: 245, g: 243, b: 255 };  // soft background tint
  const textDark = { r: 30, g: 30, b: 40 };
  const textMuted = { r: 100, g: 100, b: 120 };
  const border = { r: 230, g: 230, b: 240 };

  // ===== Top gradient-style bar =====
  doc.setFillColor(darkPurple.r, darkPurple.g, darkPurple.b);
  doc.rect(0, 0, pageWidth, 8, "F");
  doc.setFillColor(purple.r, purple.g, purple.b);
  doc.rect(0, 8, pageWidth, 4, "F");

  y = 48;

  // ===== Header =====
  // Left: Invoice title
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark.r, textDark.g, textDark.b);
  doc.text("Invoice", margin, y + 28);

  // Right: School name + address
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(purple.r, purple.g, purple.b);
  doc.text("EdTech Smart Campus", pageWidth - margin, y, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
  const schoolLines = ["School Address", "City", "Country", "Postal Code"];
  schoolLines.forEach((line, idx) => {
    doc.text(line, pageWidth - margin, y + 14 + idx * 12, { align: "right" });
  });

  y += 78;

  // Subtle separator
  doc.setDrawColor(border.r, border.g, border.b);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  // ===== Bill To (left) + Invoice meta (right) =====
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(purple.r, purple.g, purple.b);
  doc.text("BILL TO", margin, y);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark.r, textDark.g, textDark.b);
  doc.text(data.studentName, margin, y + 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
  doc.text(`Class: ${data.className}`, margin, y + 34);
  doc.text(`Admission No: ${data.admissionNo || "-"}`, margin, y + 48);

  // Right meta
  const metaX = pageWidth - margin;
  const label = (txt: string, yy: number) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(purple.r, purple.g, purple.b);
    doc.setFontSize(9);
    doc.text(txt, metaX, yy, { align: "right" });
  };
  const value = (txt: string, yy: number) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
    doc.setFontSize(10);
    doc.text(txt, metaX, yy, { align: "right" });
  };

  label("INVOICE #", y);
  value(data.invoiceNumber, y + 14);
  label("DATE", y + 34);
  value(displayDate(data.invoiceDate), y + 48);
  label("DUE DATE", y + 68);
  value(displayDate(data.dueDate), y + 82);

  y += 110;

  // ===== Table header with purple background =====
  const tableTop = y;
  const rowHeight = 28;
  const headerHeight = 26;

  // Header background
  doc.setFillColor(purple.r, purple.g, purple.b);
  doc.roundedRect(margin, y, pageWidth - margin * 2, headerHeight, 4, 4, "F");

  const col = {
    item: margin + 12,
    desc: margin + 100,
    qty: pageWidth - margin - 200,
    price: pageWidth - margin - 140,
    tax: pageWidth - margin - 80,
    amount: pageWidth - margin - 12,
  };

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("ITEM", col.item, y + 17);
  doc.text("DESCRIPTION", col.desc, y + 17);
  doc.text("QTY", col.qty, y + 17, { align: "right" });
  doc.text("PRICE", col.price, y + 17, { align: "right" });
  doc.text("TAX", col.tax, y + 17, { align: "right" });
  doc.text("AMOUNT", col.amount, y + 17, { align: "right" });

  y += headerHeight + 6;

  // ===== Line item row =====
  const itemLabel = /^[0-9a-f-]{20,}$/i.test(data.feeType) ? "Fee" : (data.feeType || "Fee");
  const itemColWidth = col.desc - col.item - 8;
  const descColWidth = col.qty - col.desc - 20;

  const itemText = doc.splitTextToSize(itemLabel, itemColWidth)[0] ?? itemLabel;
  const descText = doc.splitTextToSize(`Invoice for ${data.studentName}`, descColWidth)[0] ?? "";

  // Light alternating row background
  doc.setFillColor(lightPurple.r, lightPurple.g, lightPurple.b);
  doc.rect(margin, y - 4, pageWidth - margin * 2, rowHeight, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textDark.r, textDark.g, textDark.b);
  doc.text(itemText, col.item, y + 12);
  doc.text(descText, col.desc, y + 12);
  doc.text("1", col.qty, y + 12, { align: "right" });
  doc.text(money(data.amount), col.price, y + 12, { align: "right" });
  doc.text("0%", col.tax, y + 12, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(money(data.amount), col.amount, y + 12, { align: "right" });

  y += rowHeight + 16;

  // Separator
  doc.setDrawColor(border.r, border.g, border.b);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  // ===== Status + Total section =====
  // Left: Status card
  doc.setFillColor(lightPurple.r, lightPurple.g, lightPurple.b);
  doc.roundedRect(margin, y - 8, 200, 70, 6, 6, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(purple.r, purple.g, purple.b);
  doc.text("STATUS", margin + 14, y + 8);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark.r, textDark.g, textDark.b);
  doc.text(data.status || "—", margin + 14, y + 26);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
  doc.text(`Paid: ${money(data.paid)}`, margin + 14, y + 44);
  doc.text(`Balance: ${money(data.balance)}`, margin + 14, y + 58);

  // Right: Total
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
  doc.text("TOTAL", metaX, y + 10, { align: "right" });

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(purple.r, purple.g, purple.b);
  doc.text(money(data.amount), metaX, y + 38, { align: "right" });

  // ===== Footer =====
  const footerY = pageHeight - 36;
  doc.setFillColor(darkPurple.r, darkPurple.g, darkPurple.b);
  doc.rect(0, pageHeight - 28, pageWidth, 28, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 220);
  doc.text("EdTech Smart Campus ERP  •  Fee Invoice", pageWidth / 2, pageHeight - 12, {
    align: "center",
  });

  doc.save(`${data.invoiceNumber || "invoice"}.pdf`);
}