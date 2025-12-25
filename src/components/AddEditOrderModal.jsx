import {
  User,
  ShoppingBag,
  MapPin,
  IndianRupee,
  Calendar,
  StickyNote,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function AddEditOrderModal({ order = {}, onClose }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    customer: order.customer || "",
    product: order.product || "",
    city: order.city || "",
    total: order.total ?? "",
    paid: order.paid ?? "",
    dueDate: order.dueDate || "",
    note: order.note || "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit() {
    if (!form.customer || !form.product || !form.total) return;

    setSaving(true);

    const total = Number(form.total);
    const paid = Number(form.paid || 0);

    // 🔒 AUTO-MOVE LOGIC (SOURCE OF TRUTH)
    const status = paid >= total ? "paid" : "pending";

    const payload = {
      customer: form.customer,
      product: form.product,
      city: form.city,
      total,
      paid,
      status,
      dueDate: form.dueDate,
      note: form.note,
      updatedAt: serverTimestamp(),
    };

    try {
      if (order.id) {
        await updateDoc(
          doc(db, "users", user.uid, "orders", order.id),
          payload
        );
      } else {
        await addDoc(
          collection(db, "users", user.uid, "orders"),
          {
            ...payload,
            createdAt: serverTimestamp(),
          }
        );
      }
      onClose();
    } catch (e) {
      alert(e.message);
    }

    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      {/* MODAL */}
      <div
        className="
          relative w-[360px] sm:w-[400px]
          rounded-2xl p-6 space-y-4
          backdrop-blur-xl shadow-2xl border
          animate-scale-in
        "
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">
            {order.id ? "Edit Order" : "New Order"}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <Field
          icon={User}
          placeholder="Customer name"
          value={form.customer}
          onChange={(v) => update("customer", v)}
        />

        <Field
          icon={ShoppingBag}
          placeholder="Ordered items"
          value={form.product}
          onChange={(v) => update("product", v)}
        />

        <Field
          icon={MapPin}
          placeholder="Delivery location"
          value={form.city}
          onChange={(v) => update("city", v)}
        />

        <Field
          icon={IndianRupee}
          type="number"
          placeholder="Total amount"
          value={form.total}
          onChange={(v) => update("total", v)}
        />

        <Field
          icon={IndianRupee}
          type="number"
          placeholder="Paid amount"
          value={form.paid}
          onChange={(v) => update("paid", v)}
        />

        <Field
          icon={Calendar}
          type="date"
          value={form.dueDate}
          onChange={(v) => update("dueDate", v)}
        />

        <Field
          icon={StickyNote}
          placeholder="Add a note (optional)"
          value={form.note}
          onChange={(v) => update("note", v)}
          textarea
        />

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/10"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-2 rounded-xl accent-bg"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- FIELD ---------------- */

function Field({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
  textarea = false,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2 bg-black/5 dark:bg-white/10">
      <Icon size={16} className="icon-muted" />
      {textarea ? (
        <textarea
          rows={2}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none resize-none text-sm"
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-sm"
        />
      )}
    </div>
  );
}
