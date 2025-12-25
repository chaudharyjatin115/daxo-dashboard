export default function UndoToast({ onUndo }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2
      bg-black text-white px-4 py-2 rounded-xl shadow-lg"
    >
      Order archived
      <button
        onClick={onUndo}
        className="ml-3 underline font-medium"
      >
        Undo
      </button>
    </div>
  );
}

