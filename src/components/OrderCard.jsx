import {
  User,
  MapPin,
  ShoppingBag,
  Calendar,
  Pencil,
  FileText,
  Trash2,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function OrderCard({
  order,
  onEdit,
  onInvoice,
  onWhatsApp,
}) {
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);

  const due = order.total - order.paid;

  async function remove() {
    await deleteDoc(
      doc(db, "users", user.uid, "orders", order.id)
    );
    setConfirming(false);
  }

  return (
    <>
      <div className="rounded-2xl p-6 space-y-4 card">
        <div className="flex justify-between">
          <div className="font-semibold">
            📦 Order #{order.id.slice(0, 6)}
          </div>
          <div className="text-sm opacity-60">
            {order.createdAt?.toDate?.().toLocaleDateString?.()}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Row icon={User} text={order.customer} />
          <Row icon={MapPin} text={order.city} />
          <Row icon={ShoppingBag} text={order.product} />
          <Row icon={Calendar} text={order.dueDate} />
        </div>

        <div className="flex gap-4 text-sm">
          <span>₹{order.total}</span>
          <span className="text-green-500">
            Paid ₹{order.paid}
          </span>
          <span className="text-red-500">
            Due ₹{due}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Action icon={Pencil} label="Edit" onClick={onEdit} color="bg-indigo-500" />

          <Action
            icon={FileText}
            label="Invoice"
            onClick={onInvoice}
            color="bg-blue-500"
          />

          <Action
            icon={MessageCircle}
            label="WhatsApp"
            onClick={onWhatsApp}
            color="bg-green-500"
          />

          <Action
            icon={Trash2}
            label="Delete"
            onClick={() => setConfirming(true)}
            color="bg-red-500"
          />

          {order.status === "paid" && (
            <Action
              icon={CheckCircle}
              label="Paid"
              color="bg-emerald-500"
            />
          )}
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={() => setConfirming(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative p-6 rounded-2xl space-y-4 card">
            <h3 className="font-semibold text-lg">
              Delete order?
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2 rounded-xl bg-black/10"
              >
                Cancel
              </button>
              <button
                onClick={remove}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ icon, text }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} />
      {text}
    </div>
  );
}

function Action({ icon, label, color, onClick }) {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className={`${color} text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}