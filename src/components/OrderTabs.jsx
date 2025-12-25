export default function OrderTabs({ value, onChange }) {
  const tabs = ["pending", "paid", "delivered", "completed"];

  return (
    <div
      className="
        relative flex gap-2 p-1 rounded-full
        bg-black/5 dark:bg-white/10
        overflow-hidden
      "
    >
      {/* Animated underline */}
      <div
        className="absolute top-1 bottom-1 rounded-full accent-bg transition-all duration-300"
        style={{
          width: `${100 / tabs.length}%`,
          transform: `translateX(${tabs.indexOf(value) * 100}%)`,
        }}
      />

      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`
            relative z-10 flex-1 py-2 text-sm capitalize rounded-full
            transition-colors
            ${value === tab ? "text-white" : "opacity-70"}
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
