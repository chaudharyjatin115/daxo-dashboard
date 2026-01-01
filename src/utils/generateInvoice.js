import jsPDF from "jspdf";

export function generateInvoicePDF({ business, order, invoice }) {
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  // header
  pdf.setFontSize(18);
  pdf.text(business.name, 20, 20);

  pdf.setFontSize(11);
  pdf.text(`Invoice No: ${invoice.invoiceNumber}`, 20, 32);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);

  // customer
  pdf.setFontSize(12);
  pdf.text("Bill To:", 20, 55);
  pdf.setFontSize(11);
  pdf.text(order.customer, 20, 63);
  if (order.city) pdf.text(order.city, 20, 70);

  // order details
  let y = 90;
  pdf.setFontSize(11);
  pdf.text(`Product: ${order.product}`, 20, y);
  y += 10;
  pdf.text(`Total: ₹${order.total}`, 20, y);
  y += 8;
  pdf.text(`Paid: ₹${order.paid}`, 20, y);
  y += 8;
  pdf.text(`Due: ₹${order.total - order.paid}`, 20, y);

  // paid watermark (safe + production style)
  if (invoice.status === "paid") {
  pdf.setTextColor(220, 220, 220);
  pdf.setFontSize(48);
  pdf.text("PAID", 35, 150, {
    angle: 35,
  });
  pdf.setTextColor(0, 0, 0);
}
    pdf.setFontSize(60);
    pdf.text("PAID", 35, 190, {
      rotate: 45,
    });
    pdf.restoreGraphicsState();
  }

  // footer
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    "This is a system generated invoice.",
    20,
    280
  );

  pdf.setTextColor(0);
  return pdf;
}
