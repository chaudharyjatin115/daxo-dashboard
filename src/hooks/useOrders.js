import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => {
        const d = doc.data();

        const total = Number(d.total || 0);
        const paid = Number(d.paid || 0);

        // 🔒 SINGLE SOURCE OF TRUTH
        const status =
          total > 0 && paid >= total ? "paid" : "pending";

        return {
          id: doc.id,
          customer: d.customer || "",
          product: d.product || "",
          city: d.city || "",
          total,
          paid,
          status,
          dueDate: d.dueDate || "",
          createdAt:
            d.createdAt?.toDate?.().toLocaleDateString() ||
            "",
        };
      });

      setOrders(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return { orders, loading };
}
