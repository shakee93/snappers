import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import ArchiveLoading from "@/components/global/primitives/archive/ArchiveLoading";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Browse Shop",
};

const Page = () => {

    return (
        <Suspense fallback={<ArchiveLoading />}>
            <ArchiveLayout title="Iphone 16" filters tag="iphone-16"/>
        </Suspense>
    );
};

export default Page;
