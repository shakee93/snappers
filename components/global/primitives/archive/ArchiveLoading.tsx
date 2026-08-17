import {
  ARCHIVE_PRODUCT_GRID_CLASS_NAME,
  INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME,
  ProductCardsSkeleton,
} from "@/components/global/primitives/Loading/ProductCardLoading";
import { isGraphqlArchive } from "@/lib/archiveSource";
import { cn } from "@/lib/utils";

const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div
    className={cn("animate-pulse rounded-md bg-neutral-200", className)}
    aria-hidden
  />
);

export const ArchiveFilterBarSkeleton = () => (
  <div className="rounded-2xl border border-[#E8E8E8] bg-white p-3 sm:p-4">
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-center lg:gap-4">
      <div className="flex w-full items-center gap-2 border-b border-[#E8E8E8] pb-4 sm:gap-3 lg:gap-4 lg:border-0 lg:pb-0">
        <SkeletonBlock className="h-5 w-20" />
        <span className="h-6 w-px shrink-0 bg-[#E8E8E8] lg:hidden" aria-hidden />
        <SkeletonBlock className="h-5 w-20" />
        <span className="h-6 w-px shrink-0 bg-[#E8E8E8] lg:hidden" aria-hidden />
        <div className="flex min-w-0 flex-1 items-center gap-1.5 lg:hidden">
          <SkeletonBlock className="h-4 w-10 shrink-0" />
          <SkeletonBlock className="h-9 min-w-0 flex-1 rounded-lg" />
        </div>
      </div>

      <div className="flex w-full items-center gap-3">
        <SkeletonBlock className="h-4 w-10 shrink-0" />
        <SkeletonBlock className="h-9 min-w-0 flex-1 rounded-lg" />
        <span className="text-sm text-neutral-400">–</span>
        <SkeletonBlock className="h-9 min-w-0 flex-1 rounded-lg" />
      </div>

      <div className="hidden items-center justify-end gap-3 lg:flex">
        <SkeletonBlock className="h-4 w-10" />
        <SkeletonBlock className="h-9 w-36 rounded-lg" />
      </div>
    </div>
  </div>
);

const FilterPanelSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-[#E8E8E8] bg-white">
    <div className="space-y-3 px-4 py-3">
      <SkeletonBlock className="h-4 w-24" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-4 rounded" />
          <SkeletonBlock className="h-4 w-28" />
        </div>
      ))}
    </div>
  </div>
);

const SidebarSkeleton = () => (
  <div className="hidden flex-col gap-3 lg:flex">
    <div className="flex w-full items-center justify-between border-b border-neutral-200 pb-2">
      <SkeletonBlock className="h-4 w-14" />
      <SkeletonBlock className="h-4 w-12" />
    </div>
    <FilterPanelSkeleton />
    <FilterPanelSkeleton />
  </div>
);

const TypesenseGridSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="flex flex-col lg:gap-6">
    <div className="mb-4 flex overflow-x-auto lg:hidden">
      <SkeletonBlock className="h-10 w-44 shrink-0 rounded-full" />
    </div>
    <div className="grid grid-cols-12 gap-4">
      <div className="hidden lg:col-span-3 lg:block">
        <SidebarSkeleton />
      </div>
      <div className="col-span-12 lg:col-span-9">
        <ProductCardsSkeleton
          count={count}
          className={INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME}
        />
      </div>
    </div>
  </div>
);

interface ArchiveLoadingProps {
  search?: boolean;
}

const ArchiveLoading = ({ search = false }: ArchiveLoadingProps) => {
  const graphqlArchive = !search && isGraphqlArchive();

  return (
    <div
      className={
        search
          ? "container py-16"
          : "container py-8 lg:py-12 space-y-16 sm:space-y-20 lg:space-y-28"
      }
    >
      <div className={search ? undefined : "space-y-4 lg:space-y-6"}>
        <div className={`max-w-screen-sm ${search ? "mb-10" : ""}`}>
          <SkeletonBlock className="h-8 w-48 sm:h-9 lg:h-10" />
          <div className={`space-y-2 ${search ? "mt-4" : "mt-2 lg:mt-4"}`}>
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-3/4 md:w-2/3" />
          </div>
        </div>

        {search ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-12 w-full rounded-2xl" />
            <TypesenseGridSkeleton />
          </div>
        ) : (
          <>
            <ArchiveFilterBarSkeleton />
            <hr className="border-slate-200 dark:border-slate-700" />
            <main>
              {graphqlArchive ? (
                <ProductCardsSkeleton
                  count={9}
                  className={ARCHIVE_PRODUCT_GRID_CLASS_NAME}
                />
              ) : (
                <TypesenseGridSkeleton />
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default ArchiveLoading;
