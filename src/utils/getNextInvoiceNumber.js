import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase";

/*
  generates next invoice number safely
  format: INV-000001, INV-000002 ...
*/
export async function getNextInvoiceNumber(userId) {
  if (!userId) throw new Error("user id missing");

  const counterRef = doc(db, "users", userId, "meta", "invoiceCounter");

  const nextNumber = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);

    let current = 0;

    if (snap.exists()) {
      current = snap.data().current || 0;
    }

    const updated = current + 1;

    tx.set(counterRef, { current: updated }, { merge: true });

    return updated;
  });

  return `INV-${String(nextNumber).padStart(6, "0")}`;
}