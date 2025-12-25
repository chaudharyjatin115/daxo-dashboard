import { useAuth } from "../context/AuthContext";

export default function InvoiceModal({
  order,
  businessName = "Invoice",
  onClose,
}) {
  const { user } = useAuth();

  async function downloadPDF() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const marginX = 14;
    let y = 20;

    // ===== Header =====
    doc.setFillColor(124, 108, 246);
    doc.rect(0, 0, 210, 22, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(businessName, marginX, 15);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    y = 35;

    // ===== Order Info =====
    doc.text(`Invoice ID: ${order.id}`, marginX, y);
    y += 7;

    doc.text(
      `Date: ${formatDate(order.createdAt)}`,
      marginX,
      y
    );
    y += 12;

    // ===== Customer =====
    doc.setFontSize(13);
    doc.text("Bill To", marginX, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(`Name: ${order.customer || "-"}`, marginX, y);
    y += 6;

    doc.text(`City: ${order.city || "-"}`, marginX, y);
    y += 6;

    doc.text(`Product: ${order.product || "-"}`, marginX, y);
    y += 12;

    doc.line(marginX, y, 196, y);
    y += 10;

    // ===== Amounts =====
    const due = (order.total || 0) - (order.paid || 0);

    doc.text(`Total Amount: ₹${order.total || 0}`, marginX, y);
    y += 7;

    doc.text(`Paid: ₹${order.paid || 0}`, marginX, y);
    y += 7;

    doc.text(`Due: ₹${due}`, marginX, y);
    y += 12;

    // ===== Notes =====
    if (order.note) {
      doc.line(marginX, y, 196, y);
      y += 8;

      doc.setFontSize(12);
      doc.text("Notes", marginX, y);
      y += 7;

      doc.setFontSize(11);
      doc.text(order.note, marginX, y);
      y += 10;
    }

    // ===== Footer =====
    doc.line(marginX, 265, 196, 265);
    doc.setFontSize(10);

    doc.text(
      `Issued by ${businessName}`,
      marginX,
      273
    );
    doc.text(
      `Email: ${user?.email || "-"}`,
      marginX,
      279
    );

    doc.save(`invoice-${order.id}.pdf`);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg p-6 rounded-3xl border shadow-lg space-y-4 animate-scale-in"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <h2 className="text-lg font-semibold">🧾 Invoice</h2>

          <div className="text-sm space-y-1 opacity-90">
            <p className="font-semibold">{businessName}</p>
            <p>Order #{order.id}</p>
            <p>👤 {order.customer}</p>
            <p>🧶 {order.product}</p>
            <p>📍 {order.city}</p>
            <p>⏰ {order.dueDate}</p>
          </div>

          <div className="border-t pt-3 text-sm space-y-1">
            <p>💰 Total: ₹{order.total}</p>
            <p className="text-green-500">
              Paid: ₹{order.paid}
            </p>
            <p className="text-red-500">
              Due: ₹{(order.total || 0) - (order.paid || 0)}
            </p>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-black/10 dark:bg-white/10"
            >
              Close
            </button>
            <button
              onClick={downloadPDF}
              className="flex-1 py-3 rounded-xl accent-bg"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   HELPERS
----------------------------- */

function formatDate(value) {
  if (!value) return "-";
  if (value?.toDate) {
    return value.toDate().toLocaleDateString();
  }
  return new Date(value).toLocaleDateString();
}
