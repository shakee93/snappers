import { getClient } from "@/graphql/apollo-ssr";
import { GET_BRAND } from "@/graphql/defs/products";
import { notFound } from "next/navigation";

import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { brand: string };
};

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

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Read route params
  const id = params.brand;

  // Fetch data
  const { brand } = await getData(id);

  // Dynamic Metadata
  const pageTitle = `${brand.name} - Top Products  | GQ Mobiles`;
  const pageDescription =
    brand.description ||
    `Discover premium products from ${brand.name}. Explore exclusive collections at unbeatable prices. Shop with GQ Mobiles for quality and style.`;
  const pageUrl = `https://gqmobiles.lk/brands/${id}`;
  const imageUrl =
    brand.image?.sourceUrl || "https://gqmobiles.lk/default-og-image.jpg";

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
          alt: `${brand.name} Collection - GQ Mobiles`,
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

const Page = async ({ params }: { params: { brand: string } }) => {
  const { brand } = await getData(params.brand);
  return (
    <ArchiveLayout
      title={brand.name}
      description={brand.description}
      brand={brand}
      filters
    />
  );
};

export default Page;
