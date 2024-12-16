import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Browse Shop",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: { product: string },
  searchParams: { title?: string }
}) {
  const product = params.product;
  const title = searchParams.title || 'Default Title';

  return (
    <Suspense>
      <ArchiveLayout 
        title={title} 
        filters 
        tag={product ? product.toString() : 'default-tag'} 
      />
    </Suspense>
  );
}
