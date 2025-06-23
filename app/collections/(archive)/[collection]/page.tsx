import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_ALL_PRODUCTS,
  GET_BRAND,
  GET_BRAND_ARCHIVE,
  GET_CATEGORY,
  GET_CATEGORY_ARCHIVE,
  GET_VARIATIONS_PRODUCT,
} from "@/graphql/defs/products";
import { notFound, redirect } from "next/navigation";
import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import { Metadata, ResolvingMetadata } from "next";

type Props = { params: { collection: string } };

async function getData(slug: string | null = null) {
  const { data } = await getClient().query({
    query: GET_CATEGORY,
    variables: {
      categoryId: slug,
    },
  });

  if (!data.productCategory) {
    return redirect("/");
  }

  return {
    productCategory: data.productCategory,
  };
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Read route params
  const id = params.collection;

  // Fetch data
  const { productCategory } = await getData(id);

  // Dynamic Metadata
  const pageTitle = `Shop by Collection - ${productCategory.name}`;
  const pageDescription =
    productCategory.description ||
    `Discover our exclusive collection in the ${productCategory.name} category. Shop now for top-quality products at unbeatable prices.`;
  const pageUrl = `https://gqmobiles.lk/collections/${id}`;
  const imageUrl =
    productCategory.image?.sourceUrl ||
    "https://gqmobiles.lk/default-og-image.jpg";

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
          alt: `${productCategory.name} Collection - GQ Mobiles`,
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

const Page = async ({ params }: Props) => {
  const { productCategory } = await getData(params.collection);
  console.log('PRODUCT CATEOGYRYYYYY', productCategory);

  return (
    <ArchiveLayout
      title={productCategory.name}
      description={productCategory.description}
      category={productCategory}
      filters
    />
  );
};

export default Page;
