import jsPDF from "jspdf";

export function generateInvoicePDF({ business, order, invoice }) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  const left = 20;
  let y = 20;

  /* header */
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(business.name, left, y);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Invoice No: ${invoice.invoiceNumber}`, 150, y);
  y += 8;

  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 150, y);
  y += 20;

  /* bill to */
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("Bill To", left, y);

  y += 6;
  pdf.setFont("helvetica", "normal");
  pdf.text(order.customer, left, y);

  if (order.city) {
    y += 5;
    pdf.text(order.city, left, y);
  }

  y += 20;

  /* table header */
  pdf.setFont("helvetica", "bold");
  pdf.text("Description", left, y);
  pdf.text("Amount", 170, y, { align: "right" });

  y += 3;
  pdf.line(left, y, 190, y);
  y += 8;

  /* item */
  pdf.setFont("helvetica", "normal");
  pdf.text(order.product || "Order", left, y);
  pdf.text(`₹${order.total}`, 170, y, { align: "right" });

  y += 15;

  /* totals */
  pdf.line(left, y, 190, y);
  y += 8;

  pdf.text("Total", left, y);
  pdf.text(`₹${order.total}`, 170, y, { align: "right" });

  y += 6;
  pdf.text("Paid", left, y);
  pdf.text(`₹${order.paid}`, 170, y, { align: "right" });

  y += 6;
  pdf.text("Due", left, y);
  pdf.text(`₹${order.total - order.paid}`, 170, y, { align: "right" });

  /* paid watermark */
  if (invoice.status === "paid") {
    pdf.setTextColor(220);
    pdf.setFontSize(48);
    pdf.text("PAID", 105, 160, {
      align: "center",
      angle: 30,
    });
    pdf.setTextColor(0);
  }

  /* footer */
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    "This is a system generated invoice.",
    left,
    285
  );

  pdf.setTextColor(0);
  return pdf;
}