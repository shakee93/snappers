import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'All Collections',
  description: 'Explore our complete collection of premium mobile phones, accessories and gadgets at GQ Mobiles. Find the latest smartphones, cases, chargers and more - all in one place with easy filtering and search options.'
}


const Page = () => {

  return (
    <Suspense>
      <ArchiveLayout title="All Collections" filters />
    </Suspense>
  );
};

export default Page;
