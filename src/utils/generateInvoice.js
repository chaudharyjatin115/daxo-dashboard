import jsPDF from "jspdf";

export function generateInvoicePDF({ business, order, invoice }) {
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text(business.name, 20, 20);

  pdf.setFontSize(12);
  pdf.text(`Invoice: ${invoice.invoiceNumber}`, 20, 35);
  pdf.text(`Customer: ${order.customer}`, 20, 45);
  pdf.text(`Product: ${order.product}`, 20, 55);

  pdf.text(`Total: ₹${order.total}`, 20, 75);
  pdf.text(`Paid: ₹${order.paid}`, 20, 85);
  pdf.text(`Due: ₹${order.total - order.paid}`, 20, 95);

  // paid watermark
  if (invoice.status === "paid") {
    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(50);
    pdf.text("PAID", 40, 160, { angle: 45 });
    pdf.setTextColor(0, 0, 0);
  }

  return pdf;
}