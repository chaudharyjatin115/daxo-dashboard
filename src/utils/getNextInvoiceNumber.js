import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase";

// returns: INV-000001
export async function getNextInvoiceNumber(uid) {
  const ref = doc(db, "users", uid, "meta", "invoiceCounter");

  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() ? snap.data().value : 0;
    const value = current + 1;
    tx.set(ref, { value });
    return value;
  });

  return `INV-${String(next).padStart(6, "0")}`;
}