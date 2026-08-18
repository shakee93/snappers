import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import ArchiveLoading from "@/components/global/primitives/archive/ArchiveLoading";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Browse Shop",
};

const Page = () => {

    const speakercategory = {
        id: 1,
        description: null,
        name: 'Portable Speakers',
        slug: 'portable-speakers',
        databaseId: 1013,
        __typename: 'ProductCategory'
    };

    return (
        <Suspense fallback={<ArchiveLoading />}>
            <ArchiveLayout title="Explore Speakers" filters category={speakercategory}/>
        </Suspense>
    );
};

export default Page;
