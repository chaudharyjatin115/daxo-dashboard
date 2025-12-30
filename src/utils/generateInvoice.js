import jsPDF from "jspdf";

export function generateInvoicePDF({ business, order, invoice }) {
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text(business.name, 14, 20);

  pdf.setFontSize(12);
  pdf.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
  pdf.text(`Customer: ${order.customer}`, 14, 38);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 14, 46);

  pdf.line(14, 50, 196, 50);

  let y = 60;

  pdf.text("Item", 14, y);
  pdf.text("Amount", 160, y);
  y += 10;

  pdf.text(order.product, 14, y);
  pdf.text(`₹${order.total}`, 160, y);

  y += 15;

  pdf.line(14, y, 196, y);
  y += 10;

  pdf.text(`Paid: ₹${order.paid}`, 14, y);
  y += 8;
  pdf.text(`Due: ₹${order.total - order.paid}`, 14, y);

  return pdf;
}

