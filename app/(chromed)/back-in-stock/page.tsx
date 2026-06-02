import ArchiveLayout from "@/components/primitives/archive/ArchiveLayout";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Browse Shop",
};

const Page = () => {
  return (
    <Suspense>
      <ArchiveLayout title="Back In Stock" filters tag="back-in-stock"/>
    </Suspense>
  );
};

export default Page;
