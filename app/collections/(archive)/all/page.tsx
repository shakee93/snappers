import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import {Metadata, ResolvingMetadata} from "next";


export const metadata: Metadata = {
  title: 'Browse Shop'
}


const Page = () => {

  return (
      <ArchiveLayout title="All Collections" filters />
  );
};

export default Page;
