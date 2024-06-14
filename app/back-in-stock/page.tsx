import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Browse Shop",
};

const Page = () => {
  return (
    <Suspense>
      <ArchiveLayout title="New Arrivals" filters tag="back-in-stock"/>
    </Suspense>
  );
};

export default Page;
