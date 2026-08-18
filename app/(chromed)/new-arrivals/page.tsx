import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import ArchiveLoading from "@/components/global/primitives/archive/ArchiveLoading";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "New Arrivals",
};

const Page = () => {
  return (
    <Suspense fallback={<ArchiveLoading />}>
      <ArchiveLayout
        title="New Arrivals"
        filters
        sort={true}
        inStockOnly
        defaultNewest />
    </Suspense>
  );
};

export default Page;
