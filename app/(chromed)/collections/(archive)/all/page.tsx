import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/site.config";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "All Collections",
  description: `Explore our complete range of pet food, health products, and accessories at ${siteConfig.brand.name}. Shop cat, dog, bird, and aquarium essentials in one place.`,
};


const Page = () => {

  return (
    <Suspense>
      <ArchiveLayout title="All Collections" filters />
    </Suspense>
  );
};

export default Page;
