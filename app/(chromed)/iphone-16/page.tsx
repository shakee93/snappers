import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Browse Shop",
};

const Page = () => {

    return (
        <Suspense>
            <ArchiveLayout title="Iphone 16" filters tag="iphone-16"/>
        </Suspense>
    );
};

export default Page;
