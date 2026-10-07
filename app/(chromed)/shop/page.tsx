import ShopCategoriesPromoBanner from "@/components/global/ShopCategoriesPromoBanner";
import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import ArchiveLoading from "@/components/global/primitives/archive/ArchiveLoading";
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
    <>
      <ShopCategoriesPromoBanner />
      <Suspense fallback={<ArchiveLoading compactTop />}>
        <ArchiveLayout title="All Products" filters hideHeading />
      </Suspense>
    </>
  );
};

export default Page;
