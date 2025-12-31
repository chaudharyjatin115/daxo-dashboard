import jsPDF from "jspdf";

export function generateInvoicePDF({ business, order, invoice }) {
  const doc = new jsPDF();

  // header
  doc.setFontSize(18);
  doc.text(business.name, 14, 20);

  doc.setFontSize(12);
  doc.text(`Invoice: ${invoice.invoiceNumber}`, 14, 30);
  doc.text(`Customer: ${order.customer}`, 14, 38);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 46);

  // body
  doc.text(`Product: ${order.product}`, 14, 60);
  doc.text(`Total: ₹${order.total}`, 14, 70);
  doc.text(`Paid: ₹${order.paid}`, 14, 80);
  doc.text(`Due: ₹${order.total - order.paid}`, 14, 90);

  // paid watermark
  if (invoice.status === "paid") {
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(60);
    doc.text("PAID", 105, 150, {
      align: "center",
      angle: 45,
    });
    doc.setTextColor(0, 0, 0);
  }

  return doc;
}