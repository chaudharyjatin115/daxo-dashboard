export default function BrandLogo() {
  return (
    <div className="flex justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 animate-pulse" />
        <div className="absolute inset-1 rounded-2xl bg-white dark:bg-black flex items-center justify-center font-bold text-xl">
          D
        </div>
      </div>
    </div>
  );
}
