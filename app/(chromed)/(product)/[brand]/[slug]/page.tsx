import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_BRANDS,
  GET_PRODUCT,
} from "@/graphql/defs/products";
import { Brand, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { notFound, redirect } from "next/navigation";
import ProductDetails from "@/components/product/ProductDetails";
import Features from "@/components/product/FeatureCard";
import ProductOverview from "@/components/product/ProductOverview";
import Link from "next/link";
import ProductImage from "@/components/product/ProductImage2";
import FreeGiftPreview from "@/components/product/FreeGiftPreview";
import HappiestCustomersGallery from "@/components/product/HappiestCustomersGallery";
import { Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
import { ImageProvider } from "@/context/ImageChangeGrabber";
import UpsellProducts from "@/components/product/UpsellProducts";
import { getProductSchema } from "@/lib/jsonld/productSchema";
import { productTag } from "@/lib/cache-tags";
import { siteConfig } from "@/site.config";
// import LoadingProduct from "./loading";

type Props = {
  params: Promise<{
    slug: string;
    brand: string;
  }>;
};

export async function generateStaticParams() {
  return [];
}

async function getData(slug: string, brand: string) {
  try {
    const { data, error } = await getClient().query({
      query: GET_PRODUCT,
      variables: {
        productId: slug,
      },
      // PDP rides the SSR default (force-cache). WP fires the revalidate
      // webhook on product / stock edits, busting the PDP path near-real-
      // time. Stock accuracy on a missed webhook is enforced at the client
      // Apollo's un-cached add-to-cart mutation — a user loading a stale
      // "in stock" PDP gets rejected server-side on the mutation.
      //
      // Tag the underlying fetch so /api/revalidate?tag=product:<slug> can
      // bust the GraphQL response itself. revalidatePath alone leaves this
      // fetch-cache entry intact on dynamic routes, so a regen triggered
      // while WP is still committing (variation price/stock) bakes the
      // partial answer into the page cache and it sticks until the next
      // WP edit. Apollo HttpLink shallow-merges context.fetchOptions onto
      // the link's fetchOptions, so cache:'force-cache' must be repeated
      // here or it gets dropped.
      context: {
        fetchOptions: {
          cache: 'force-cache',
          next: { tags: [productTag(slug)] },
        },
      },
    });

    if (error) {
      notFound();
    }

    if (!data.product || data.product == null) {
      notFound();
    }

    const productBrand = data.product?.brands?.nodes?.[0] || {
      name: "Product",
      slug: "product",
    };

    return {
      product: data.product,
      brand: productBrand,
      upsellProducts: [],
    };
  } catch (e) {
    console.error("Error fetching product data:", e);
    return notFound();
  }
}

const DEFAULT_OG_IMAGE = siteConfig.url.defaultOgImage;

function getProductOgImage(product: SimpleProduct & VariableProduct): string {
  // Main product image
  const mainImage = product.image?.sourceUrl;

  if (mainImage) return mainImage;

  // Fallback: first variation image (for variable products without main image)
  const firstVariationImage = (product as VariableProduct).variations?.nodes?.[0]
    ?.image?.sourceUrl;
  if (firstVariationImage) return firstVariationImage;

  return DEFAULT_OG_IMAGE;
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  const { product, brand } = await getData(params.slug, params.brand);

  if (params.brand !== brand.slug) {
    redirect(`/${brand.slug}/${product.slug}`);
  }

  const price = product.price
    ? product.price.replace(/₨|&nbsp;/g, "")
    : "the best price";

  const ogImageUrl = getProductOgImage(product);
  const pageUrl = `${siteConfig.url.base}/${brand.slug}/${product.slug}`;
  const description = `This ${product.name} is at ${siteConfig.brand.name}. The best price in ${siteConfig.locale.countryName} for ${brand.name} priced at ${siteConfig.locale.currencySymbol}.${price}.`;

  return {
    title: product.name,
    description,

    openGraph: {
      title: product.name,
      description,
      url: pageUrl,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: product.name || `${brand.name} - ${siteConfig.brand.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [ogImageUrl],
    },
  };
}

const Page = async (props: Props) => {
  const params = await props.params;
  const {
    product,
    brand,
    upsellProducts: upsellProductsFromData,
  }: {
    product: SimpleProduct & VariableProduct;
    brand: Brand;
    upsellProducts: any[];
  } = await getData(params.slug, params.brand);

  const productSchema = getProductSchema(product, brand);
  const happiestCustomersImages = ((product as any)?.happiestCustomersGallery || []) as string[];

  return (
    <div className="mt-5 md:mt-10">
      <main className="flex flex-col px-3   sm:container sm:max-w-screen-2xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <div className="md:mt-0 text-sm md:px-5 md:text-[0.95rem] md:ml-4">
          <Link href="/">Home</Link> &gt;{" "}
          <Link href={`/${brand.slug}`}>{brand.name}</Link> &gt;{" "}
          <Link href={`/${brand.slug}/${product.slug}`}>{product.name}</Link>
        </div>
        <div></div>
        <div className="flex flex-col md:flex-row p-3 rounded-3xl mt-5 md:mt-3 md:p-6 md:py-6 bg-white ">
          <ImageProvider>
            <div className="w-full md:w-6/12 flex-col gap-6 md:pr-10">
              <Suspense fallback={<>loading...</>}>
                <ProductImage product={product} />
              </Suspense>
              <FreeGiftPreview product={product} />
              {product.price && (
                <div className="hidden lg:block w-full mt-6">
                  <Features />
                </div>
              )}
            </div>
            <div className="md:w-6/12 flex flex-col p-2 gap-y-1 md:gap-y-1.5">
              <ProductDetails brand={brand} product={product} />
            </div>
          </ImageProvider>
        </div>
        <HappiestCustomersGallery images={happiestCustomersImages} />
        {/* Image Gallery */}
        <ProductOverview product={product} />
        {product.price && (
          <div className=" lg:hidden w-full lg:w-1/5 p-3 bg-white rounded-3xl my-5">
            <Features />
          </div>
        )}

        <div className="mt-5 md:mt-10">
          <UpsellProducts newArrivals={upsellProductsFromData} />
        </div>
      </main>
    </div>
  );
};
export default Page;
