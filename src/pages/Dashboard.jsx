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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db, storage } from "../firebase";
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

  /* generate invoice once and lock it */
  async function handleInvoice(order) {
    if (!user || generating) return;

    // already generated → reuse
    if (order.invoicePdfUrl) {
      window.open(order.invoicePdfUrl, "_blank");
      return;
    }

    setGenerating(true);

    try {
      const invoiceNumber = await getNextInvoiceNumber(user.uid);

      const invoiceData = {
        invoiceNumber,
        orderId: order.id,
        total: order.total,
        paid: order.paid,
        due: order.total - order.paid,
        status: order.paid >= order.total ? "paid" : "unpaid",
        createdAt: serverTimestamp(),
      };

      // save invoice
      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData
      );

      // generate pdf
      const pdf = generateInvoicePDF({
        business: { name: businessName || "Business" },
        order,
        invoice: invoiceData,
      });

      const blob = pdf.output("blob");

      // upload pdf
      const fileRef = ref(
        storage,
        `invoices/${user.uid}/${invoiceNumber}.pdf`
      );

      await uploadBytes(fileRef, blob);
      const pdfUrl = await getDownloadURL(fileRef);

      // update invoice
      await updateDoc(invoiceRef, { pdfUrl });

      // lock order
      await updateDoc(
        doc(db, "users", user.uid, "orders", order.id),
        {
          invoiceNumber,
          invoicePdfUrl: pdfUrl,
          invoiceId: invoiceRef.id,
        }
      );

      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("invoice generation failed:", err);
      alert("Failed to generate invoice");
    } finally {
      setGenerating(false);
    }
  }

  /* whatsapp share actual pdf */
  function handleWhatsApp(order) {
    if (!order.invoicePdfUrl) {
      alert("Generate invoice first");
      return;
    }

    const text = `Invoice for ${order.customer}\n\n${order.invoicePdfUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
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