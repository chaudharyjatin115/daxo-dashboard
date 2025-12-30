

import jsPDF from "jspdf";
import "jspdf-autotable";

export function generateInvoicePDF({ business, order, invoice }) {
  const doc = new jsPDF();

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

  // customer
  doc.text(`Customer: ${order.customer}`, 14, 44);
  doc.text(`City: ${order.city || "-"}`, 14, 50);

  // table
  doc.autoTable({
    startY: 60,
    head: [["Item", "Amount"]],
    body: [[order.product, `₹${order.total}`]],
  });

  const y = doc.lastAutoTable.finalY + 10;

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
    "Thank you for your business",
    14,
    285
  );

  return doc;
}