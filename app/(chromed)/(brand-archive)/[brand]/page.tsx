import { getClient } from "@/graphql/apollo-ssr";
import { GET_BRAND } from "@/graphql/defs/products";
import { notFound } from "next/navigation";

import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/site.config";

type Props = {
  params: Promise<{ brand: string }>;
};

export const revalidate = 1800;

async function getData(slug: string | null = null) {
  const { data } = await getClient().query({
    query: GET_BRAND,
    variables: {
      brandId: slug,
    },
  });

  if (!data.brand) {
    return notFound();
  }

  return {
    brand: data.brand,
  };
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  // Read route params
  const id = params.brand;

  // Fetch data
  const { brand } = await getData(id);

  // Dynamic Metadata
  const pageTitle = `Shop by Brand – ${brand.name}`;
  const pageDescription =
    brand.description ||
    `Discover premium products from ${brand.name}. Explore exclusive collections at unbeatable prices. Shop with ${siteConfig.brand.name} for quality and style.`;
  const pageUrl = `${siteConfig.url.base}/brands/${id}`;
  const imageUrl =
    brand.image?.sourceUrl || siteConfig.url.defaultOgImage;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: `${brand.name} Collection - ${siteConfig.brand.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [imageUrl],
    },
  };
}

const Page = async (props: { params: Promise<{ brand: string }> }) => {
  const params = await props.params;
  const { brand } = await getData(params.brand);
  return (
    <Suspense>
      <ArchiveLayout
        title={brand.name}
        description={brand.description}
        brand={brand}
        filters
      />
    </Suspense>
  );
};

export default Page;
