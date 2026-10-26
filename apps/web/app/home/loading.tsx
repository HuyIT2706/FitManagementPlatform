export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background pb-32 text-on-surface animate-pulse">
      {/* Skeleton Header */}
      <div className="h-16 border-b border-white/5 bg-surface-container/30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10" />
          <div className="h-5 w-28 rounded bg-white/10" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10" />
          <div className="w-9 h-9 rounded-full bg-white/10" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-container-padding md:mt-8 space-y-6 pt-4">
        {/* Calendar Strip Skeleton */}
        <div className="h-20 rounded-2xl bg-surface-container/40 border border-white/5 p-4 flex items-center justify-between gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 h-12 rounded-xl bg-white/5" />
          ))}
        </div>

        {/* Bento Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Hero Fuel Card Skeleton */}
          <div className="md:col-span-8 h-80 rounded-3xl bg-surface-container/50 border border-white/5 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="h-10 w-48 rounded bg-white/15" />
            </div>
            <div className="flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border-8 border-white/5 bg-white/5" />
            </div>
            <div className="h-4 w-40 rounded bg-white/10" />
          </div>

          {/* Macro Cards Skeleton */}
          <div className="md:col-span-4 flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-surface-container/40 border border-white/5 p-4 flex items-center justify-between"
              >
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded bg-white/10" />
                  <div className="h-5 w-16 rounded bg-white/15" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10" />
              </div>
            ))}
          </div>

          {/* Daily Meal Grid Skeleton */}
          <div className="col-span-1 md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-surface-container/30 border border-white/5 p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 rounded bg-white/10" />
                  <div className="w-8 h-8 rounded-lg bg-white/5" />
                </div>
                <div className="h-6 w-20 rounded bg-white/15" />
                <div className="h-3 w-32 rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
