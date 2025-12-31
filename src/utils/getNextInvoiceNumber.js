import { doc, getDoc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

/*
  keeps invoice numbers sequential per user
  INV-0001, INV-0002 ...
*/

export async function getNextInvoiceNumber(uid) {
  const ref = doc(db, "users", uid, "meta", "invoiceCounter");
  const snap = await getDoc(ref);

  let next = 1;

  if (snap.exists()) {
    next = (snap.data().current || 0) + 1;
  }

  await setDoc(
    ref,
    { current: next },
    { merge: true }
  );

  return `INV-${String(next).padStart(4, "0")}`;
}