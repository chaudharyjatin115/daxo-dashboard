import { useState } from "react";
import Header from "../components/Header";
import SummaryCards from "../components/SummaryCards";
import OrderTabs from "../components/OrderTabs";
import OrderCard from "../components/OrderCard";
import AddEditOrderModal from "../components/AddEditOrderModal";
import { useOrders } from "../hooks/useOrders";

export default function Dashboard() {
  const { orders = [], loading } = useOrders();
  const [tab, setTab] = useState("pending");
  const [editingOrder, setEditingOrder] = useState(null);

  const filteredOrders = orders.filter(
    (o) => o.status === tab
  );

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Header />

        <SummaryCards orders={orders} />

        <OrderTabs value={tab} onChange={setTab} />

        <div className="space-y-4 min-h-[240px]">
          {loading ? (
            <div className="text-center opacity-60 py-20">
              Loading orders…
            </div>
          ) : filteredOrders.length ? (
            filteredOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onEdit={() => setEditingOrder(o)}
              />
            ))
          ) : (
            <div className="text-center opacity-60 py-20">
              📦 No {tab} orders  
              <div className="text-sm mt-1">
                Tap + to add your first order
              </div>
            </div>
          )}
        </div>
      </div>

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
