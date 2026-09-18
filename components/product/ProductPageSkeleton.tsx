import ProductCardLoading from "@/components/global/primitives/Loading/ProductCardLoading";
import { pdpRadius } from "@/components/product/pdpStyles";
import { cn } from "@/lib/utils";

const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div
    className={cn("animate-pulse bg-neutral-200", pdpRadius, className)}
    aria-hidden
  />
);

const StarRowSkeleton = () => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonBlock key={index} className="h-4 w-4 rounded-sm" />
      ))}
    </div>
    <SkeletonBlock className="h-4 w-24 rounded" />
  </div>
);

const AddToCartRowSkeleton = () => (
  <div className="flex items-center gap-2">
    <SkeletonBlock className="h-12 w-[136px] shrink-0" />
    <SkeletonBlock className="h-12 min-w-0 flex-1" />
    <SkeletonBlock className="h-12 min-w-0 flex-1" />
    <SkeletonBlock className="h-12 w-12 shrink-0" />
  </div>
);

const ProductPageSkeleton = () => (
  <div className="bg-white pb-[160px] lg:pb-12">
    <main className="mx-auto flex max-w-[1368px] flex-col px-3 sm:px-4 lg:px-6">
      <nav aria-hidden className="flex flex-wrap items-center gap-1.5 py-4">
        <SkeletonBlock className="h-3 w-10 rounded sm:h-3.5" />
        <span className="text-xs text-[#6B7280] sm:text-sm">&gt;</span>
        <SkeletonBlock className="h-3 w-16 rounded sm:h-3.5" />
        <span className="text-xs text-[#6B7280] sm:text-sm">&gt;</span>
        <SkeletonBlock className="h-3 w-40 max-w-[50vw] rounded sm:h-3.5" />
      </nav>

      <div className="rounded-2xl bg-[#FAFAF8] p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-7 lg:gap-10">
          <div className="order-3 flex flex-col gap-3 lg:col-span-4 lg:col-start-4 lg:row-start-1 lg:gap-0">
            <div className="flex flex-col gap-2 pb-2 lg:pb-4">
              <div className="flex items-center justify-between gap-3">
                <SkeletonBlock className="h-10 w-36 max-w-[220px]" />
                <SkeletonBlock className="h-11 w-[132px] shrink-0" />
              </div>
              <SkeletonBlock className="h-[26px] w-full max-w-lg sm:h-8" />
              <SkeletonBlock className="h-[26px] w-[75%] max-w-md sm:h-8" />
              <SkeletonBlock className="mt-1 h-4 w-full max-w-sm rounded" />
              <StarRowSkeleton />
            </div>

            <div className="space-y-3 border-y border-[#E8E8E8] py-4">
              <SkeletonBlock className="mb-3 h-4 w-28 rounded" />
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock className="h-10 w-[4.75rem]" />
                <SkeletonBlock className="h-10 w-16" />
                <SkeletonBlock className="h-10 w-[4.5rem]" />
              </div>
            </div>

            <div className="space-y-2 pb-5 pt-1 lg:py-4 lg:pb-8">
              <SkeletonBlock className="h-8 w-44 sm:h-9" />
              <SkeletonBlock className="h-4 w-20 rounded" />
            </div>

            <div className="mb-4 hidden md:mb-8 lg:block">
              <AddToCartRowSkeleton />
            </div>

            <div className="mb-4 space-y-3">
              <SkeletonBlock className="h-4 w-32 rounded" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:auto-rows-fr">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonBlock key={index} className="min-h-[80px]" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div
                className={`overflow-hidden border border-[#E8E8E8] bg-white ${pdpRadius}`}
              >
                <div className="flex items-center justify-between px-4 py-3.5">
                  <SkeletonBlock className="h-4 w-40 rounded" />
                  <SkeletonBlock className="h-4 w-4 rounded" />
                </div>
                <div className="space-y-2 px-4 pb-5 pt-2">
                  <SkeletonBlock className="h-3.5 w-full rounded" />
                  <SkeletonBlock className="h-3.5 w-[92%] rounded" />
                  <SkeletonBlock className="h-3.5 w-[78%] rounded" />
                </div>
              </div>

              <div
                className={`overflow-hidden border border-[#E8E8E8] bg-white ${pdpRadius}`}
              >
                <div className="flex items-center justify-between px-4 py-3.5">
                  <SkeletonBlock className="h-4 w-36 rounded" />
                  <SkeletonBlock className="h-4 w-4 rounded" />
                </div>
              </div>

              <div
                className={`overflow-hidden border border-[#E8E8E8] bg-white ${pdpRadius}`}
              >
                <div className="border-b border-[#E8E8E8] px-4 py-4 sm:px-5">
                  <SkeletonBlock className="mb-3 h-5 w-32 rounded" />
                  <StarRowSkeleton />
                </div>
                <div className="space-y-4 px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-4">
                    <SkeletonBlock className="h-11 w-36" />
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <SkeletonBlock
                          key={index}
                          className="h-6 w-6 rounded-sm"
                        />
                      ))}
                    </div>
                  </div>
                  <SkeletonBlock className="h-24 w-full" />
                  <SkeletonBlock className="h-11 w-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="contents lg:col-span-3 lg:col-start-1 lg:flex lg:flex-col lg:gap-6">
            <div className="order-1 w-full shrink-0">
              <div
                className={`relative w-full overflow-hidden border border-[#0000001A] bg-white ${pdpRadius}`}
              >
                <div className="relative w-full pt-[100%] animate-pulse bg-neutral-200" />
                <div className="absolute left-3 top-3 z-10 h-9 w-9 animate-pulse rounded-2xl bg-neutral-300" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative w-full overflow-hidden rounded-xl pt-[100%] animate-pulse bg-neutral-200"
                  />
                ))}
              </div>
            </div>

            <div className="order-4 border-t border-[#E8E8E8] pt-4 lg:mt-0 lg:pt-8">
              <SkeletonBlock className="mb-4 h-5 w-36 rounded" />
              <div
                className={`border border-[#E8E8E8] bg-white p-4 ${pdpRadius}`}
              >
                <SkeletonBlock className="h-4 w-full max-w-sm rounded" />
              </div>
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
          <SkeletonBlock className="mx-auto h-9 w-64 max-w-full sm:h-10 md:h-12 lg:h-14" />
          <SkeletonBlock className="mx-auto h-4 w-full rounded" />
          <SkeletonBlock className="mx-auto h-4 w-[85%] rounded" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:mt-10 lg:mt-12 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardLoading key={index} />
          ))}
        </div>
      </div>
    </section>

    <div
      aria-hidden
      className="fixed bottom-[82px] left-0 z-40 w-full border-t border-[#E8E8E8] bg-white p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden"
    >
      <AddToCartRowSkeleton />
    </div>
  </div>
);

export default ProductPageSkeleton;
