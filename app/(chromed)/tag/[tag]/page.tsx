import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_TAG_DETAILS_BY_SLUG } from "@/graphql/defs/products";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/site.config";


export const revalidate = 1800;

export async function generateMetadata(props: { params: Promise<{ tag: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;

  const { tag } = params;

  const { data: tagData, error: tagError } = await getClient().query({
    query: GET_TAG_DETAILS_BY_SLUG,
    variables: { slug: [tag] },
  });

  return {
    title: tagData?.productTags?.nodes[0]?.name || 'Custom Collection',
    description: tagData?.productTags?.nodes[0]?.description || `Discover our handpicked selection of premium products at ${siteConfig.brand.name}. Browse through our curated collection featuring the latest smartphones, accessories and more. Find exactly what you're looking for with our custom product filters.`,
  };
}

// ArchiveLayout fetches the real tag name and renders that as the H1; this
// fallback only surfaces when the WP tag lookup returns nothing. Humanizing
// the slug keeps the visible text and og:title sane in that case rather
// than the literal "Default Title".
function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function Page(
  props: {
    params: Promise<{ tag: string }>,
  }
) {
  const params = await props.params;
  const tag = params.tag;
  const fallbackTitle = tag ? humanizeSlug(tag) : 'Custom Collection';

  return (
    <Suspense>
      <ArchiveLayout
        title={fallbackTitle}
        filters
        tag={tag ? tag.toString() : 'default-tag'}
      />
    </Suspense>
  );
}
