export default function ConfirmDeleteModal({
  title = "Delete order?",
  description = "This action cannot be undone.",
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm p-6 rounded-2xl space-y-4 animate-scale-in"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm opacity-70">{description}</p>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-black/10 dark:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
