import jsPDF from "jspdf";
import "jspdf-autotable";

/*
  simple invoice pdf generator
  no magic, no clever tricks
  predictable output every time
*/

export function generateInvoicePDF({ business, order, invoice }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const isPaid = invoice.status === "paid";
  const createdDate = new Date().toLocaleDateString();

  /* ---------------- watermark ---------------- */
  if (isPaid) {
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(52);
    doc.text("PAID", pageWidth / 2, 150, {
      align: "center",
      angle: 45,
    });
    doc.setTextColor(0, 0, 0);
  }

  /* ---------------- header ---------------- */
  doc.setFontSize(18);
  doc.text(business.name || "Invoice", 14, 20);

  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 28);
  doc.text(`Date: ${createdDate}`, 14, 34);

  if (isPaid) {
    doc.setTextColor(34, 197, 94);
    doc.text("PAID", pageWidth - 20, 28, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  /* ---------------- customer ---------------- */
  doc.setFontSize(11);
  doc.text(`Customer: ${order.customer}`, 14, 46);
  doc.text(`City: ${order.city || "-"}`, 14, 52);

  /* ---------------- items table ---------------- */
  doc.autoTable({
    startY: 62,
    head: [["Description", "Amount"]],
    body: [
      [
        order.product || "Item",
        `₹${Number(order.total).toFixed(2)}`,
      ],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: 20,
    },
    theme: "grid",
  });

  const tableEndY = doc.lastAutoTable.finalY + 10;

  /* ---------------- totals ---------------- */
  doc.setFontSize(11);
  doc.text(`Total: ₹${order.total}`, 14, tableEndY);
  doc.text(`Paid: ₹${order.paid}`, 14, tableEndY + 6);
  doc.text(
    `Due: ₹${order.total - order.paid}`,
    14,
    tableEndY + 12
  );

  /* ---------------- footer ---------------- */
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "This is a system generated invoice.",
    14,
    282
  );
  doc.text(
    "Thank you for your business.",
    pageWidth - 14,
    282,
    { align: "right" }
  );

  doc.setTextColor(0);

  return doc;
}