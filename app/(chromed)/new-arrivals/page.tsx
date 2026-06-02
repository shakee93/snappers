import ArchiveLayout from "@/components/primitives/archive/ArchiveLayout";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "New Arrivals",
};

const Page = () => {
  return (
    <Suspense>
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
