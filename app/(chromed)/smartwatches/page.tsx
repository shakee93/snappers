import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import ArchiveLoading from "@/components/global/primitives/archive/ArchiveLoading";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "smart watches",
};

const Page = () => {

    const smartwatchescategory = {
        id: 2,
        description: null,
        name: 'Smartwatches',
        slug: 'smartwatches',
        databaseId: 302,
        __typename: 'ProductCategory'
    };

    return (
        <Suspense fallback={<ArchiveLoading />}>
            <ArchiveLayout title="Smart Watches" filters category={smartwatchescategory}/>
        </Suspense>
    );
};

export default Page;
