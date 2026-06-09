import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/site.config";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'All Collections',
  description: `Explore our complete collection of premium mobile phones, accessories and gadgets at ${siteConfig.brand.name}. Find the latest smartphones, cases, chargers and more - all in one place with easy filtering and search options.`
}


const Page = () => {

  return (
    <Suspense>
      <ArchiveLayout title="All Collections" filters />
    </Suspense>
  );
};

export default Page;
