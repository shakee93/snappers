import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_TAG_DETAILS_BY_SLUG } from "@/graphql/defs/products";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";


export async function generateMetadata(
  { params }: any,
  parent: ResolvingMetadata): Promise<Metadata> {

  const { tag } = params;

  const { data: tagData, error: tagError } = await getClient().query({
    query: GET_TAG_DETAILS_BY_SLUG,
    variables: { slug: [tag] },
  });

  return {
    title: tagData?.productTags?.nodes[0]?.name || 'Custom Collection',
    description: tagData?.productTags?.nodes[0]?.description || 'Discover our handpicked selection of premium products at GQ Mobiles. Browse through our curated collection featuring the latest smartphones, accessories and more. Find exactly what you\'re looking for with our custom product filters.',
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { tag: string },
  searchParams: { title?: string }
}) {
  const tag = params.tag;
  const title = searchParams.title || 'Default Title';

  return (
    <ArchiveLayout
      title={title}
      filters
      tag={tag ? tag.toString() : 'default-tag'}
    />
  );
}
