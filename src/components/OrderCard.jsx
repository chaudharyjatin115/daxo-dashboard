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

// export default function OrderCard({ order, onEdit, onInvoice }) {
//   const { user } = useAuth();
//   const [confirming, setConfirming] = useState(false);

//   const due = order.total - order.paid;

//   async function remove() {
//     try {
//       await deleteDoc(doc(db, "users", user.uid, "orders", order.id));
//       setConfirming(false);
//     } catch (e) {
//       alert(e.message);
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
//         {/* header */}
//         <div className="flex justify-between">
//           <div className="font-semibold">
//             📦 Order #{order.id.slice(0, 6)}
//           </div>
//           <div className="text-sm opacity-60">
//             {order.createdAt?.toDate?.().toLocaleDateString?.() || ""}
//           </div>
//         </div>

//         {/* details*/}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//           <Row icon={User} text={order.customer} />
//           <Row icon={MapPin} text={order.city} />
//           <Row icon={ShoppingBag} text={order.product} />
//           <Row icon={Calendar} text={order.dueDate} danger />
//         </div>

//         {/* money */}
//         <div className="flex gap-4 text-sm">
//           <span>₹{order.total}</span>
//           <span className="text-green-500">Paid ₹{order.paid}</span>
//           <span className="text-red-500">Due ₹{due}</span>
//         </div>

//         {/* actions */}
//         <div className="flex flex-wrap gap-3 pt-2">
//           <Action
//             icon={Pencil}
//             label="Edit"
//             onClick={onEdit}
//             color="bg-indigo-500"
//           />

//           <Action
//             icon={FileText}
//             label="Invoice"
//             onClick={onInvoice}
//             color="bg-blue-500"
//           />

//           <Action
//             icon={Trash2}
//             label="Delete"
//             onClick={() => setConfirming(true)}
//             color="bg-red-500"
//           />

//           {order.status === "paid" && (
//             <Action
//               icon={CheckCircle}
//               label="Paid"
//               color="bg-emerald-500"
//             />
//           )}
//         </div>
//       </div>

//       {/* confirm delete modal */}
//       {confirming && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div
//             onClick={() => setConfirming(false)}
//             className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//           />

//           <div
//             className="relative w-[320px] p-6 rounded-2xl space-y-4 border shadow-xl animate-scale-in"
//             style={{
//               background: "var(--card-bg)",
//               borderColor: "var(--card-border)",
//             }}
//           >
//             <h3 className="font-semibold text-lg">Delete order?</h3>
//             <p className="text-sm opacity-70">
//               This action cannot be undone.
//             </p>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setConfirming(false)}
//                 className="flex-1 py-2 rounded-xl bg-black/10 dark:bg-white/10"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={remove}
//                 className="flex-1 py-2 rounded-xl bg-red-500 text-white"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// /* sub component */

// function Row({ icon, text, danger }) {
//   const Icon = icon;
//   return (
//     <div className={`flex items-center gap-2 ${danger ? "text-red-500" : ""}`}>
//       <Icon size={16} className="icon-muted" />
//       {text}
//     </div>
//   );
// }

// function Action({ icon, label, color, onClick }) {
//   const Icon = icon;
//   return (
//     <button
//       onClick={onClick}
//       className={`
//         ${color} text-white px-4 py-2 rounded-lg
//         flex items-center gap-2 text-sm
//         hover:opacity-90 transition
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
  Share2,
} from "lucide-react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

/* helper: stable invoice number */
function getInvoiceNumber(order) {
  return (
    order.invoiceNumber ||
    `INV-${order.id.slice(0, 6).toUpperCase()}`
  );
}

export default function OrderCard({ order, onEdit, onInvoice }) {
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);

  const due = order.total - order.paid;
  const isPaid = order.status === "paid";
  const invoiceNumber = getInvoiceNumber(order);

  /* lock invoice number once paid */
  async function ensureInvoiceLocked() {
    if (!isPaid || order.invoiceNumber) return;

    await updateDoc(
      doc(db, "users", user.uid, "orders", order.id),
      { invoiceNumber }
    );
  }

  async function remove() {
    try {
      await deleteDoc(
        doc(db, "users", user.uid, "orders", order.id)
      );
      setConfirming(false);
    } catch (e) {
      alert(e.message);
    }
  }

  function shareOnWhatsApp() {
    const text = `
Invoice ${invoiceNumber}
Customer: ${order.customer}
Total: ₹${order.total}
Paid: ₹${order.paid}
Due: ₹${due}
    `.trim();

    const url = `https://wa.me/?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank");
  }

  async function handleInvoice() {
    await ensureInvoiceLocked();
    onInvoice?.(order);
  }

  return (
    <>
      <div
        className="
          rounded-2xl p-6 space-y-4
          backdrop-blur-xl border shadow-sm
          card
        "
      >
        {/* header */}
        <div className="flex justify-between">
          <div className="font-semibold">
            📦 Order #{order.id.slice(0, 6)}
          </div>
          <div className="text-sm opacity-60">
            {order.createdAt?.toDate?.().toLocaleDateString?.() ||
              ""}
          </div>
        </div>

        {/* invoice number */}
        <div className="text-xs opacity-70">
          Invoice: {invoiceNumber}
        </div>

        {/* details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Row icon={User} text={order.customer} />
          <Row icon={MapPin} text={order.city} />
          <Row icon={ShoppingBag} text={order.product} />
          <Row icon={Calendar} text={order.dueDate} danger />
        </div>

        {/* money */}
        <div className="flex gap-4 text-sm">
          <span>₹{order.total}</span>
          <span className="text-green-500">
            Paid ₹{order.paid}
          </span>
          <span className="text-red-500">
            Due ₹{due}
          </span>
        </div>

        {/* actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          {!isPaid && (
            <Action
              icon={Pencil}
              label="Edit"
              onClick={onEdit}
              color="bg-indigo-500"
            />
          )}

          <Action
            icon={FileText}
            label="Invoice"
            onClick={handleInvoice}
            color="bg-blue-500"
          />

          <Action
            icon={Share2}
            label="WhatsApp"
            onClick={shareOnWhatsApp}
            color="bg-green-500"
          />

          <Action
            icon={Trash2}
            label="Delete"
            onClick={() => setConfirming(true)}
            color="bg-red-500"
          />

          {isPaid && (
            <Action
              icon={CheckCircle}
              label="Paid"
              color="bg-emerald-500"
            />
          )}
        </div>
      </div>

      {/* confirm delete */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={() => setConfirming(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div
            className="relative w-[320px] p-6 rounded-2xl space-y-4 border shadow-xl"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}
          >
            <h3 className="font-semibold text-lg">
              Delete order?
            </h3>
            <p className="text-sm opacity-70">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2 rounded-xl bg-black/10 dark:bg-white/10"
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

/* sub components */

function Row({ icon, text, danger }) {
  const Icon = icon;
  return (
    <div
      className={`flex items-center gap-2 ${
        danger ? "text-red-500" : ""
      }`}
    >
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
      className={`
        ${color} text-white px-4 py-2 rounded-lg
        flex items-center gap-2 text-sm
        hover:opacity-90 transition
      `}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
