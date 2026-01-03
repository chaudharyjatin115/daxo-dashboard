import jsPDF from "jspdf";

const PAGE_WIDTH = 210;   // A4 in mm
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const LINE_HEIGHT = 8;

export function generateInvoicePDF({ business, order, invoice }) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  let y = MARGIN;

  /* ---------- HEADER ---------- */

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(business.name || "Business Name", MARGIN, y);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Invoice No: ${invoice.invoiceNumber}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });

  y += 10;

  pdf.text(
    `Date: ${new Date().toLocaleDateString()}`,
    PAGE_WIDTH - MARGIN,
    y,
    { align: "right" }
  );

  y += 15;

  /* ---------- BILL TO ---------- */

  pdf.setFont("helvetica", "bold");
  pdf.text("Bill To", MARGIN, y);

  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.text(order.customer || "-", MARGIN, y);

  y += 6;
  if (order.city) {
    pdf.text(order.city, MARGIN, y);
    y += 6;
  }

  y += 10;

  /* ---------- TABLE HEADER ---------- */

  drawLine(pdf, y);
  y += 6;

  pdf.setFont("helvetica", "bold");
  pdf.text("Item", MARGIN, y);
  pdf.text("Qty", 120, y, { align: "right" });
  pdf.text("Price", 150, y, { align: "right" });
  pdf.text("Amount", PAGE_WIDTH - MARGIN, y, { align: "right" });

  y += 4;
  drawLine(pdf, y);
  y += 6;

  pdf.setFont("helvetica", "normal");

  /* ---------- ITEMS ---------- */

  const items = order.items || [
    {
      name: order.product,
      qty: 1,
      price: order.total,
    },
  ];

  let subtotal = 0;

  for (const item of items) {
    const amount = item.qty * item.price;
    subtotal += amount;

    // page break
    if (y > PAGE_HEIGHT - 60) {
      addFooter(pdf);
      pdf.addPage();
      y = MARGIN;
    }

    pdf.text(item.name, MARGIN, y);
    pdf.text(String(item.qty), 120, y, { align: "right" });
    pdf.text(`₹${item.price}`, 150, y, { align: "right" });
    pdf.text(`₹${amount}`, PAGE_WIDTH - MARGIN, y, {
      align: "right",
    });

    y += LINE_HEIGHT;
  }

  y += 6;
  drawLine(pdf, y);
  y += 8;

  /* ---------- TOTALS ---------- */

  pdf.setFont("helvetica", "bold");

  pdf.text("Subtotal", 150, y, { align: "right" });
  pdf.text(`₹${subtotal}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });

  y += 8;

  pdf.text("Paid", 150, y, { align: "right" });
  pdf.text(`₹${order.paid}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });

  y += 8;

  pdf.text("Amount Due", 150, y, { align: "right" });
  pdf.text(
    `₹${Math.max(0, subtotal - order.paid)}`,
    PAGE_WIDTH - MARGIN,
    y,
    { align: "right" }
  );

  /* ---------- PAID WATERMARK ---------- */

  if (invoice.status === "paid") {
    pdf.setTextColor(230);
    pdf.setFontSize(48);
    pdf.text("PAID", PAGE_WIDTH / 2, PAGE_HEIGHT / 2, {
      align: "center",
      angle: 30,
    });
    pdf.setTextColor(0);
  }

  /* ---------- FOOTER ---------- */

  addFooter(pdf);

  return pdf;
}

/* ---------- helpers ---------- */

function drawLine(pdf, y) {
  pdf.setDrawColor(200);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
}

function addFooter(pdf) {
  const pageCount = pdf.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    pdf.setFontSize(9);
    pdf.setTextColor(120);

    pdf.text(
      "This is a system generated invoice.",
      MARGIN,
      PAGE_HEIGHT - 15
    );

    pdf.text(
      `Page ${i} of ${pageCount}`,
      PAGE_WIDTH - MARGIN,
      PAGE_HEIGHT - 15,
      { align: "right" }
    );

    pdf.setTextColor(0);
  }
}