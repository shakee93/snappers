import ArchiveFilters from "@/components/global/primitives/archive/ArchiveFilters";
import { ArchiveFilterBarSkeleton } from "@/components/global/primitives/archive/ArchiveLoading";
import DealsProductGrid from "@/components/global/primitives/archive/DealsProductGrid";
import { getDealProductsCached } from "@/lib/dealProducts.server";
import { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "Deals",
  description: `Up to 75% off, Buy One Get One, and Free Gift deals at ${siteConfig.brand.name}.`,
};

export const revalidate = 300;

async function DealsContent() {
  const products = await getDealProductsCached();

  return (
    <>
      <div className="lg:hidden">
        <Suspense fallback={<ArchiveFilterBarSkeleton />}>
          <ArchiveFilters dealsOnly />
        </Suspense>
      </div>

      <hr className="border-slate-200 dark:border-slate-700 lg:hidden" />

      <div className="grid grid-cols-12 gap-4">
        <aside className="hidden lg:col-span-3 lg:block">
          <Suspense fallback={<ArchiveFilterBarSkeleton />}>
            <ArchiveFilters dealsOnly variant="sidebar" />
          </Suspense>
        </aside>

        <div className="col-span-12 lg:col-span-9">
          <Suspense fallback={null}>
            <DealsProductGrid
              products={products}
              productCardProps={{
                badgeLabel: "Deals",
                accentColor: siteConfig.theme.brandHex.dealAccent,
              }}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}

export default function DealsPage() {
  return (
    <main>
      <div className="container space-y-16 py-8 sm:space-y-20 lg:space-y-28 lg:py-12">
        <div className="space-y-4 lg:space-y-6">
          <div className="max-w-screen-sm">
            <h1 className="block text-2xl font-semibold capitalize sm:text-3xl lg:text-4xl">
              Deals
            </h1>
            <span className="mt-2 block text-sm text-neutral-500 dark:text-neutral-400 sm:text-base lg:mt-4">
              Explore the best savings, BOGO offers, and free gift promotions in
              one place.
            </span>
          </div>

          <Suspense
            fallback={
              <div className="space-y-4">
                <ArchiveFilterBarSkeleton />
                <div className="animate-pulse rounded-xl bg-neutral-200 py-32" />
              </div>
            }
          >
            <DealsContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
