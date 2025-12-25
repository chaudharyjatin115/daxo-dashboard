import {
  Package,
  Hourglass,
  CheckCircle,
  IndianRupee,
} from "lucide-react";

export default function SummaryCards({ orders = [] }) {
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (o) => o.status === "pending"
  ).length;

  const paidOrders = orders.filter(
    (o) => Number(o.paid || 0) >= Number(o.total || 0)
  ).length;

  const totalEarnings = orders.reduce(
    (sum, o) => sum + Number(o.paid || 0),
    0
  );

  const cards = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Package,
      bg: "from-purple-500 to-indigo-500",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: Hourglass,
      bg: "from-orange-400 to-amber-500",
    },
    {
      label: "Paid Orders",
      value: paidOrders,
      icon: CheckCircle,
      bg: "from-emerald-400 to-green-500",
    },
    {
      label: "Total Earnings",
      value: `₹${totalEarnings}`,
      icon: IndianRupee,
      bg: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="
            flex items-center gap-4
            p-4 rounded-2xl
            border shadow-sm
            backdrop-blur-xl
          "
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <div
            className={`
              w-12 h-12 rounded-xl
              bg-gradient-to-br ${c.bg}
              flex items-center justify-center
              text-white
            `}
          >
            <c.icon size={22} />
          </div>

          <div>
            <div className="text-sm opacity-70">
              {c.label}
            </div>
            <div className="text-xl font-semibold">
              {c.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
