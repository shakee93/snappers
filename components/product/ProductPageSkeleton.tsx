const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-lg bg-neutral-200/80 ${className}`}
    aria-hidden
  />
);

const ProductPageSkeleton = () => (
  <div className="bg-white pb-[160px] lg:pb-12">
    <main className="mx-auto flex max-w-[1368px] flex-col px-3 sm:px-4 lg:px-6">
      <nav aria-hidden className="flex flex-wrap items-center gap-2 py-4">
        <SkeletonBlock className="h-4 w-12 rounded" />
        <SkeletonBlock className="h-3 w-3 rounded" />
        <SkeletonBlock className="h-4 w-20 rounded" />
        <SkeletonBlock className="h-3 w-3 rounded" />
        <SkeletonBlock className="h-4 w-40 max-w-[50vw] rounded" />
      </nav>

      <div className="rounded-3xl bg-[#FAFAF8] p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-7 lg:gap-10">
          {/* Product details — mobile order 3, desktop right column */}
          <div className="order-3 flex flex-col gap-3 lg:col-span-4 lg:col-start-4 lg:row-start-1 lg:gap-0">
            <div className="flex flex-col gap-2 pb-2 lg:pb-4">
              <SkeletonBlock className="h-10 w-36 rounded" />
              <SkeletonBlock className="h-8 w-full max-w-lg rounded" />
              <SkeletonBlock className="h-8 w-[80%] max-w-md rounded" />
              <SkeletonBlock className="mt-1 h-4 w-full max-w-sm rounded" />
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <SkeletonBlock className="h-4 w-28 rounded" />
                <SkeletonBlock className="h-7 w-24 rounded-full" />
              </div>
            </div>

            <div className="space-y-4 border-y border-[#E8E8E8] py-4">
              <SkeletonBlock className="h-4 w-28 rounded" />
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock className="h-9 w-16 rounded-[10px]" />
                <SkeletonBlock className="h-9 w-16 rounded-[10px]" />
                <SkeletonBlock className="h-9 w-16 rounded-[10px]" />
              </div>
            </div>

            <div className="space-y-2 pt-1 lg:py-4">
              <SkeletonBlock className="h-9 w-32 rounded" />
              <SkeletonBlock className="h-4 w-20 rounded" />
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <SkeletonBlock className="h-11 w-[108px] shrink-0 rounded-lg" />
              <SkeletonBlock className="h-11 min-w-0 flex-1 rounded-lg" />
              <SkeletonBlock className="h-11 w-11 shrink-0 rounded-lg" />
              <SkeletonBlock className="h-11 w-36 shrink-0 rounded-lg" />
            </div>

            <SkeletonBlock className="h-11 w-full rounded-lg lg:hidden" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-[76px] rounded-lg" />
              ))}
            </div>

            <SkeletonBlock className="h-20 w-full rounded-xl" />

            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>

          {/* Gallery + reviews — mobile order 1/4, desktop left column */}
          <div className="contents lg:col-span-3 lg:col-start-1 lg:flex lg:flex-col lg:gap-6">
            <div className="order-1">
              <SkeletonBlock className="min-h-[280px] w-full rounded-2xl sm:min-h-[360px] lg:min-h-[420px]" />
              <div className="mt-3 flex gap-2 overflow-hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    className="h-16 w-16 shrink-0 rounded-lg"
                  />
                ))}
              </div>
            </div>

            <div className="order-4 space-y-3 lg:mt-6">
              <SkeletonBlock className="h-11 w-full rounded-xl" />
              <SkeletonBlock className="h-28 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </main>

    <section
      aria-hidden
      className="w-full bg-white px-3 py-12 md:py-16 lg:px-6"
    >
      <div className="mx-auto w-full max-w-[1368px]">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <SkeletonBlock className="mx-auto h-10 w-64 max-w-full rounded" />
          <SkeletonBlock className="mx-auto h-4 w-full rounded" />
          <SkeletonBlock className="mx-auto h-4 w-[85%] rounded" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:mt-10 lg:mt-12 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <SkeletonBlock className="aspect-square w-full rounded-none" />
              <div className="space-y-2 p-3">
                <SkeletonBlock className="h-4 w-full rounded" />
                <SkeletonBlock className="h-5 w-24 rounded" />
                <SkeletonBlock className="mt-3 h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <div
      aria-hidden
      className="fixed bottom-[82px] left-0 z-40 w-full border-t border-[#E8E8E8] bg-white p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden"
    >
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-11 w-[108px] shrink-0 rounded-lg" />
        <SkeletonBlock className="h-11 min-w-0 flex-1 rounded-lg" />
        <SkeletonBlock className="h-11 w-11 shrink-0 rounded-lg" />
      </div>
    </div>
  </div>
);

export default ProductPageSkeleton;
