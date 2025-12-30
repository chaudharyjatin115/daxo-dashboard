import { useState } from "react";
import Header from "../components/Header";
import SummaryCards from "../components/SummaryCards";
import OrderTabs from "../components/OrderTabs";
import OrderCard from "../components/OrderCard";
import AddEditOrderModal from "../components/AddEditOrderModal";

import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

import { generateInvoicePDF } from "../utils/generateInvoice";
import { getNextInvoiceNumber } from "../utils/getNextInvoiceNumber";

export default function Dashboard() {
  const { orders = [], loading } = useOrders();
  const { user } = useAuth();
  const { businessName } = useBusiness();

  const [tab, setTab] = useState("pending");
  const [editingOrder, setEditingOrder] = useState(null);

  const filteredOrders = orders.filter((o) => o.status === tab);

  /* create invoice + download */
  async function handleInvoice(order) {
    if (!user) return;

    const invoiceNumber = await getNextInvoiceNumber(user.uid);

    const invoice = {
      invoiceNumber,
      orderId: order.id,
      customer: order.customer,
      total: order.total,
      paid: order.paid,
      due: order.total - order.paid,
      status: order.paid >= order.total ? "paid" : "pending",
      createdAt: serverTimestamp(),
    };

    await addDoc(
      collection(db, "users", user.uid, "invoices"),
      invoice
    );

    const pdf = generateInvoicePDF({
      business: { name: businessName || "Business" },
      order,
      invoice,
    });

    pdf.save(`${invoiceNumber}.pdf`);
  }

  /* whatsapp share */
  async function handleWhatsApp(order) {
    const invoiceNumber = await getNextInvoiceNumber(user.uid);

    const message = `
Invoice: ${invoiceNumber}
Customer: ${order.customer}

Total: ₹${order.total}
Paid: ₹${order.paid}
Due: ₹${order.total - order.paid}

Thank you.
`.trim();

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Header />

        <SummaryCards orders={orders} />
        <OrderTabs value={tab} onChange={setTab} />

        <div className="space-y-4 min-h-[240px]">
          {loading ? (
            <div className="text-center opacity-60 py-20">
              loading orders…
            </div>
          ) : filteredOrders.length ? (
            filteredOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onEdit={() => setEditingOrder(o)}
                onInvoice={() => handleInvoice(o)}
                onWhatsApp={() => handleWhatsApp(o)}
              />
            ))
          ) : (
            <div className="text-center opacity-60 py-20">
              no {tab} orders
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setEditingOrder({})}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full accent-bg text-white text-3xl shadow-lg"
      >
        +
      </button>

      {editingOrder && (
        <AddEditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}
    </main>
  );
}