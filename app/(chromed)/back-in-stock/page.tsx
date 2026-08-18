import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import ArchiveLoading from "@/components/global/primitives/archive/ArchiveLoading";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Browse Shop",
};

const Page = () => {
  return (
    <Suspense fallback={<ArchiveLoading />}>
      <ArchiveLayout title="Back In Stock" filters tag="back-in-stock"/>
    </Suspense>
  );
};

export default Page;
