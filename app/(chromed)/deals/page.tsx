import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Deals",
  description: "Browse clearance deals and BOGO free offers at GQ Mobiles.",
};

// SSR default = clearance. The `?filter=` URL override is applied
// client-side by InstantSearchWrapper (reads it via the search-params
// bridge and rebuilds the Typesense filter) and by DealsTypeFilter for
// the tab UI. Reading searchParams here would force the page dynamic
// and uncacheable.
const DEFAULT_DEALS_TYPE: ("clearance" | "offers")[] = ["clearance"];
const DEFAULT_DEAL_TAGS = ["clearance"];

export default function DealsPage() {
  return (
    <Suspense>
      <ArchiveLayout
        title="Deals"
        headingOverride="Deals"
        descriptionOverride="Explore clearance products and free offers in one place."
        filters
        dealsType={DEFAULT_DEALS_TYPE}
        dealTags={DEFAULT_DEAL_TAGS}
      />
    </Suspense>
  );
}
