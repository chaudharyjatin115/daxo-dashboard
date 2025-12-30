import jsPDF from "jspdf";
import "jspdf-autotable";

export function generateInvoicePDF({ business, order, invoice }) {
  const doc = new jsPDF();

  const isPaid = invoice.status === "paid";

  // light paid watermark, nothing flashy
  if (isPaid) {
    doc.setTextColor(210, 210, 210);
    doc.setFontSize(56);
    doc.text("PAID", 105, 150, {
      align: "center",
      angle: 45,
    });
    doc.setTextColor(0, 0, 0);
  }

  // header
  doc.setFontSize(18);
  doc.text(business.name || "Invoice", 14, 18);

  doc.setFontSize(11);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 26);
  doc.text(
    `Date: ${new Date().toLocaleDateString()}`,
    14,
    32
  );

  // small paid label near top right
  if (isPaid) {
    doc.setTextColor(34, 197, 94);
    doc.text("PAID", 170, 26);
    doc.setTextColor(0, 0, 0);
  }

  // customer info
  doc.text(`Customer: ${order.customer}`, 14, 44);
  doc.text(`City: ${order.city || "-"}`, 14, 50);

  // order table
  doc.autoTable({
    startY: 60,
    head: [["Item", "Amount"]],
    body: [[order.product, `₹${order.total}`]],
  });

  const y = doc.lastAutoTable.finalY + 10;

  // totals
  doc.text(`Total: ₹${order.total}`, 14, y);
  doc.text(`Paid: ₹${order.paid}`, 14, y + 6);
  doc.text(
    `Due: ₹${order.total - order.paid}`,
    14,
    y + 12
  );

  // footer
  doc.setFontSize(10);
  doc.text(
    "Thanks for your business",
    14,
    285
  );

  return doc;
}