// import {
//   User,
//   MapPin,
//   ShoppingBag,
//   Calendar,
//   Pencil,
//   FileText,
//   Trash2,
//   CheckCircle,
// } from "lucide-react";
// import { deleteDoc, doc } from "firebase/firestore";
// import { db } from "../firebase";
// import { useAuth } from "../context/AuthContext";
// import { useState } from "react";

// export default function OrderCard({ order, onEdit }) {
//   const { user } = useAuth();
//   const [confirming, setConfirming] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   // ⛑️ Guard against auth race
//   if (!user) return null;

//   const total = Number(order.total || 0);
//   const paid = Number(order.paid || 0);

//   // 🔒 Clamp due
//   const due = Math.max(total - paid, 0);

//   // 🕒 Format timestamp safely
//   const createdAt =
//     order.createdAt?.toDate?.().toLocaleDateString() ||
//     "—";

//   async function remove() {
//     if (deleting) return;

//     setDeleting(true);
//     try {
//       await deleteDoc(
//         doc(db, "users", user.uid, "orders", order.id)
//       );
//       setConfirming(false);
//     } catch (e) {
//       console.error(e);
//       alert("Failed to delete order. Try again.");
//     } finally {
//       setDeleting(false);
//     }
//   }

//   return (
//     <>
//       <div
//         className="
//           rounded-2xl p-6 space-y-4
//           backdrop-blur-xl border shadow-sm
//           card
//         "
//       >
//         {/* HEADER */}
//         <div className="flex justify-between items-center">
//           <div className="font-semibold">
//             📦 Order #{order.id.slice(0, 6)}
//           </div>
//           <div className="text-xs opacity-60">
//             {createdAt}
//           </div>
//         </div>

//         {/* DETAILS */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//           <Row Icon={User} text={order.customer} />
//           <Row Icon={MapPin} text={order.city} />
//           <Row Icon={ShoppingBag} text={order.product} />
//           <Row
//             Icon={Calendar}
//             text={order.dueDate || "—"}
//             danger
//           />
//         </div>

//         {/* MONEY */}
//         <div className="flex gap-4 text-sm font-medium">
//           <span>₹{total}</span>
//           <span className="text-green-500">
//             Paid ₹{paid}
//           </span>
//           <span
//             className={
//               due > 0 ? "text-red-500" : "text-emerald-500"
//             }
//           >
//             Due ₹{due}
//           </span>
//         </div>

//         {/* ACTIONS */}
//         <div className="flex flex-wrap gap-3 pt-2">
//           <Action
//             Icon={Pencil}
//             label="Edit"
//             onClick={onEdit}
//             color="bg-indigo-500"
//           />

//           <Action
//             Icon={FileText}
//             label="Invoice"
//             color="bg-blue-500 opacity-60"
//             disabled
//           />

//           <Action
//             Icon={Trash2}
//             label="Delete"
//             onClick={() => setConfirming(true)}
//             color="bg-red-500"
//           />

//           {order.status === "paid" && (
//             <Action
//               Icon={CheckCircle}
//               label="Paid"
//               color="bg-emerald-500"
//               disabled
//             />
//           )}
//         </div>
//       </div>

//       {/* CONFIRM DELETE */}
//       {confirming && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div
//             onClick={() => !deleting && setConfirming(false)}
//             className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//           />

//           <div
//             className="relative w-[320px] p-6 rounded-2xl space-y-4 border shadow-xl animate-scale-in"
//             style={{
//               background: "var(--card-bg)",
//               borderColor: "var(--card-border)",
//             }}
//           >
//             <h3 className="font-semibold text-lg">
//               Delete order?
//             </h3>
//             <p className="text-sm opacity-70">
//               This action cannot be undone.
//             </p>

//             <div className="flex gap-3">
//               <button
//                 onClick={() =>
//                   !deleting && setConfirming(false)
//                 }
//                 className="flex-1 py-2 rounded-xl bg-black/10 dark:bg-white/10"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={remove}
//                 disabled={deleting}
//                 className="flex-1 py-2 rounded-xl bg-red-500 text-white disabled:opacity-60"
//               >
//                 {deleting ? "Deleting…" : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// /* ---------------- SUB COMPONENTS ---------------- */

// function Row({ Icon, text, danger }) {
//   return (
//     <div
//       className={`flex items-center gap-2 ${
//         danger ? "text-red-500" : ""
//       }`}
//     >
//       <Icon size={16} className="icon-muted" />
//       <span className="truncate">{text || "—"}</span>
//     </div>
//   );
// }

// function Action({ Icon, label, color, onClick, disabled }) {
//   return (
//     <button
//       onClick={!disabled ? onClick : undefined}
//       disabled={disabled}
//       className={`
//         ${color} text-white px-4 py-2 rounded-lg
//         flex items-center gap-2 text-sm
//         transition
//         ${disabled ? "cursor-not-allowed" : "hover:opacity-90"}
//       `}
//     >
//       <Icon size={16} />
//       {label}
//     </button>
//   );
// }

import {
  User,
  MapPin,
  ShoppingBag,
  Calendar,
  Pencil,
  FileText,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function OrderCard({ order, onEdit }) {
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);

  const due = order.total - order.paid;

  async function remove() {
    try {
      await deleteDoc(doc(db, "users", user.uid, "orders", order.id));
      setConfirming(false);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <>
      <div className="rounded-2xl p-6 space-y-4 backdrop-blur-xl border shadow-sm card">
        <div className="flex justify-between">
          <div className="font-semibold">📦 Order #{order.id.slice(0, 6)}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Row icon={User} text={order.customer} />
          <Row icon={MapPin} text={order.city} />
          <Row icon={ShoppingBag} text={order.product} />
          <Row icon={Calendar} text={order.dueDate} danger />
        </div>

        <div className="flex gap-4 text-sm">
          <span>₹{order.total}</span>
          <span className="text-green-500">Paid ₹{order.paid}</span>
          <span className="text-red-500">Due ₹{due}</span>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Action icon={Pencil} label="Edit" onClick={onEdit} color="bg-indigo-500" />
          <Action icon={FileText} label="Invoice" color="bg-blue-500" />
          <Action icon={Trash2} label="Delete" onClick={() => setConfirming(true)} color="bg-red-500" />
          {order.status === "paid" && (
            <Action icon={CheckCircle} label="Paid" color="bg-emerald-500" />
          )}
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div onClick={() => setConfirming(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            className="relative w-[320px] p-6 rounded-2xl space-y-4 border shadow-xl animate-scale-in"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}
          >
            <h3 className="font-semibold text-lg">Delete order?</h3>
            <p className="text-sm opacity-70">This action cannot be undone.</p>

            <div className="flex gap-3">
              <button onClick={() => setConfirming(false)} className="flex-1 py-2 rounded-xl bg-black/10 dark:bg-white/10">
                Cancel
              </button>
              <button onClick={remove} className="flex-1 py-2 rounded-xl bg-red-500 text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- SUB COMPONENTS ---------------- */

function Row({ icon, text, danger }) {
  const Icon = icon;
  return (
    <div className={`flex items-center gap-2 ${danger ? "text-red-500" : ""}`}>
      <Icon size={16} className="icon-muted" />
      {text}
    </div>
  );
}

function Action({ icon, label, color, onClick }) {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className={`${color} text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:opacity-90 transition`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
