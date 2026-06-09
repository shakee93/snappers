import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/site.config";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "All Products",
  description: `Explore our complete range of pet food, health products, and accessories at ${siteConfig.brand.name}. Shop cat, dog, bird, and aquarium essentials in one place.`,
};

const Page = () => {
  return (
    <Suspense>
      <ArchiveLayout title="All Products" filters />
    </Suspense>
  );
};

export default Page;
