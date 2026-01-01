import { useState } from "react";
import Header from "../components/Header";
import SummaryCards from "../components/SummaryCards";
import OrderTabs from "../components/OrderTabs";
import OrderCard from "../components/OrderCard";
import AddEditOrderModal from "../components/AddEditOrderModal";
import { useOrders } from "../hooks/useOrders";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";

import { generateInvoicePDF } from "../utils/generateInvoice";
import { getNextInvoiceNumber } from "../utils/getNextInvoiceNumber";

export default function Dashboard() {
  const { orders = [], loading } = useOrders();
  const { user } = useAuth();
  const { businessName } = useBusiness();

  const [tab, setTab] = useState("pending");
  const [editingOrder, setEditingOrder] = useState(null);
  const [generating, setGenerating] = useState(false);

  const filteredOrders = orders.filter((o) => o.status === tab);

  // invoice generate / download (free plan safe)
  async function handleInvoice(order) {
    if (!user || generating) return;

    setGenerating(true);

    try {
      let invoiceNumber = order.invoiceNumber;
      const invoiceStatus =
        order.paid >= order.total ? "paid" : "unpaid";

      // generate only once
      if (!invoiceNumber) {
        invoiceNumber = await getNextInvoiceNumber(user.uid);

        await addDoc(
          collection(db, "users", user.uid, "invoices"),
          {
            invoiceNumber,
            orderId: order.id,
            status: invoiceStatus,
            createdAt: serverTimestamp(),
          }
        );

        // lock invoice to order
        await updateDoc(
          doc(db, "users", user.uid, "orders", order.id),
          {
            invoiceNumber,
            invoiceStatus,
            locked: true,
          }
        );
      }

      // generate pdf locally every time (same invoice)
      const pdf = generateInvoicePDF({
        business: { name: businessName || "Business" },
        order: {
          ...order,
          invoiceNumber,
        },
        invoice: {
          invoiceNumber,
          status: invoiceStatus,
        },
      });

      pdf.save(`${invoiceNumber}.pdf`);
    } catch (err) {
      console.error("invoice error:", err);
      alert("Failed to generate invoice");
    } finally {
      setGenerating(false);
    }
  }

  // whatsapp share (no file upload, free plan friendly)
  function handleWhatsApp(order) {
    if (!order.invoiceNumber) {
      alert("Generate invoice first");
      return;
    }

    const message = `Invoice ${order.invoiceNumber}
Customer: ${order.customer}
Total: ₹${order.total}
Paid: ₹${order.paid}
Due: ₹${order.total - order.paid}

Invoice generated from ${businessName || "Business"}`;

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
                onInvoice={handleInvoice}
                onWhatsApp={handleWhatsApp}
              />
            ))
          ) : (
            <div className="text-center opacity-60 py-20">
              📦 no {tab} orders
              <div className="text-sm mt-1">
                tap + to add your first order
              </div>
            </div>
          )}
        </div>
      </div>

      {/* add order */}
      <button
        onClick={() => setEditingOrder({})}
        className="
          fixed bottom-6 right-6
          w-14 h-14 rounded-full
          accent-bg text-white text-3xl
          shadow-lg
        "
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