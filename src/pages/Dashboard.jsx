import { useState } from "react";
import Header from "../components/Header";
import SummaryCards from "../components/SummaryCards";
import OrderTabs from "../components/OrderTabs";
import OrderCard from "../components/OrderCard";
import AddEditOrderModal from "../components/AddEditOrderModal";

import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";

import { addDoc, collection, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

import { generateInvoicePDF } from "../utils/generateInvoice";
import { getNextInvoiceNumber } from "../utils/getNextInvoiceNumber";

export default function Dashboard() {
  const { orders = [], loading } = useOrders();
  const { user } = useAuth();
  const { businessName } = useBusiness();

  const [tab, setTab] = useState("pending");
  const [editingOrder, setEditingOrder] = useState(null);

  const filteredOrders = orders.filter(o => o.status === tab);

  async function handleInvoice(order) {
    if (order.invoiceLocked) return;

    const invoiceNumber =
      order.invoiceNumber ||
      (await getNextInvoiceNumber(user.uid));

    const invoice = {
      invoiceNumber,
      status: order.paid >= order.total ? "paid" : "pending",
      createdAt: serverTimestamp(),
    };

    await addDoc(
      collection(db, "users", user.uid, "invoices"),
      { ...invoice, orderId: order.id }
    );

    await updateDoc(
      doc(db, "users", user.uid, "orders", order.id),
      {
        invoiceNumber,
        invoiceLocked: invoice.status === "paid",
      }
    );

    const pdf = generateInvoicePDF({
      business: { name: businessName || "Business" },
      order,
      invoice,
    });

    pdf.save(`${invoiceNumber}.pdf`);
  }

  async function handleWhatsApp(order) {
    const pdf = generateInvoicePDF({
      business: { name: businessName || "Business" },
      order,
      invoice: {
        invoiceNumber: order.invoiceNumber,
        status: order.status,
      },
    });

    const blob = pdf.output("blob");
    const file = new File([blob], `${order.invoiceNumber}.pdf`, {
      type: "application/pdf",
    });

    if (navigator.share) {
      await navigator.share({
        files: [file],
        title: "Invoice",
      });
    }
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Header />
        <SummaryCards orders={orders} />
        <OrderTabs value={tab} onChange={setTab} />

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 opacity-60">
              loading orders…
            </div>
          ) : filteredOrders.length ? (
            filteredOrders.map(o => (
              <OrderCard
                key={o.id}
                order={o}
                onEdit={() => setEditingOrder(o)}
                onInvoice={() => handleInvoice(o)}
                onWhatsApp={() => handleWhatsApp(o)}
              />
            ))
          ) : (
            <div className="text-center py-20 opacity-60">
              no {tab} orders
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setEditingOrder({})}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-500 text-white text-3xl"
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