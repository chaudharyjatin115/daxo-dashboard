export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="
          w-full max-w-md p-8 rounded-3xl
          border shadow-xl space-y-6
          animate-pulse
        "
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
      >
        {/* logo placeholder */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-black/10 dark:bg-white/10" />
        </div>

        {/* title */}
        <div className="space-y-3">
          <div className="h-5 w-2/3 mx-auto rounded bg-black/10 dark:bg-white/10" />
          <div className="h-4 w-1/2 mx-auto rounded bg-black/10 dark:bg-white/10" />
        </div>

        {/* inputs */}
        <div className="space-y-4">
          <div className="h-12 rounded-xl bg-black/10 dark:bg-white/10" />
          <div className="h-12 rounded-xl bg-black/10 dark:bg-white/10" />
        </div>

        {/* button */}
        <div className="h-12 rounded-xl bg-black/20 dark:bg-white/20" />
      </div>
    </div>
  );
}