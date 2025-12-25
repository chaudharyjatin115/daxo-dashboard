export default function SearchBar({ value, onChange }) {
  return (
    <div
      className="
        w-full
        mt-6 mb-4
        flex items-center gap-3
        px-4 py-3
        rounded-2xl
        bg-white border border-black/10 shadow-sm
        dark:bg-[var(--card-bg)] dark:border-[var(--card-border)]
      "
    >
      <span className="text-black/50 dark:text-white/40">🔍</span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search orders, customer, item…"
        className="
          w-full bg-transparent outline-none
          text-black placeholder:text-black/50
          dark:text-white dark:placeholder:text-white/40
        "
      />
    </div>
  );
}


