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
import ArchiveLayout from "@/components/global/primitives/archive/ArchiveLayout";
import { getProductSchema } from "@/lib/jsonld/productSchema";
import {
  getCategoryPath,
  getProductPath,
} from "@/lib/productUrl";
import { resolveSlug } from "@/lib/slugResolver";
import { siteConfig } from "@/site.config";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 1800;

export async function generateStaticParams() {
  return [];
}

const DEFAULT_OG_IMAGE = siteConfig.url.defaultOgImage;

function getProductOgImage(product: SimpleProduct & VariableProduct): string {
  const mainImage = product.image?.sourceUrl;
  if (mainImage) return mainImage;

  const firstVariationImage = (product as VariableProduct).variations?.nodes?.[0]
    ?.image?.sourceUrl;
  if (firstVariationImage) return firstVariationImage;

  return DEFAULT_OG_IMAGE;
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
  // Metadata only needs name/price/brand — skip the related-products fetch.
  const resolved = await resolveSlug(params.slug, { withRelated: false });

  if (!resolved) {
    return {};
  }

  if (resolved.type === "product") {
    const { product, brand } = resolved.data;
    const canonicalPath = getProductPath(product);
    const price = product.price
      ? product.price.replace(/₨|Rs\.?|&nbsp;|\s/gi, "")
      : "the best price";
    const ogImageUrl = getProductOgImage(product);
    const pageUrl = `${siteConfig.url.base}${canonicalPath}`;
    const description = `This ${product.name} is at ${siteConfig.brand.name}. The best price in ${siteConfig.locale.countryName} for ${brand.name} priced at ${siteConfig.locale.currencySymbol}.${price}.`;

    return {
      title: product.name ?? undefined,
      description,
      openGraph: {
        title: product.name ?? undefined,
        description,
        url: pageUrl,
        type: "website",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 600,
            alt: product.name || `${brand.name} - ${siteConfig.brand.name}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name ?? undefined,
        description,
        images: [ogImageUrl],
      },
    };
  }

  if (resolved.type === "category") {
    const { productCategory } = resolved.data;
    const pageTitle = `Shop ${productCategory.name}`;
    const pageDescription =
      productCategory.description ||
      `Discover our exclusive ${productCategory.name} category. Shop now for top-quality products at unbeatable prices.`;
    const pageUrl = `${siteConfig.url.base}${getCategoryPath(params.slug)}`;
    const imageUrl =
      productCategory.image?.sourceUrl || siteConfig.url.defaultOgImage;

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
            alt: `${productCategory.name} - ${siteConfig.brand.name}`,
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

  const { brand } = resolved.data;
  const pageTitle = `Shop by Brand – ${brand.name}`;
  const pageDescription =
    brand.description ||
    `Discover premium products from ${brand.name}. Explore exclusive collections at unbeatable prices. Shop with ${siteConfig.brand.name} for quality and style.`;
  const pageUrl = `${siteConfig.url.base}/${params.slug}`;
  const imageUrl = siteConfig.url.defaultOgImage;

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

const Page = async (props: Props) => {
  const params = await props.params;
  const resolved = await resolveSlug(params.slug);

  if (!resolved) {
    notFound();
  }

  if (resolved.type === "product") {
    const {
      product,
      brand,
      upsellProducts,
      primaryCategorySlug,
      primaryCategoryName,
    } = resolved.data;

    const canonicalPath = getProductPath(product);
    const productSchema = getProductSchema(product, brand);
    const happiestCustomersImages = (
      (product as SimpleProduct & { happiestCustomersGallery?: string[] })
        .happiestCustomersGallery ?? []
    ) as string[];

    return (
      <div className="mt-5 md:mt-10">
        <main className="flex flex-col px-3   sm:container sm:max-w-screen-2xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          />
          <div className="md:mt-0 text-sm md:px-5 md:text-[0.95rem] md:ml-4">
            <Link href="/">Home</Link> &gt;{" "}
            <Link href={getCategoryPath(primaryCategorySlug)}>
              {primaryCategoryName}
            </Link>{" "}
            &gt;{" "}
            <Link href={canonicalPath}>{product.name}</Link>
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
          <ProductOverview product={product} />
          {product.price && (
            <div className=" lg:hidden w-full lg:w-1/5 p-3 bg-white rounded-3xl my-5">
              <Features />
            </div>
          )}

          <div className="mt-5 md:mt-10">
            <UpsellProducts newArrivals={upsellProducts} />
          </div>
        </main>
      </div>
    );
  }

  if (resolved.type === "category") {
    const { productCategory } = resolved.data;
    return (
      <Suspense>
        <ArchiveLayout
          title={productCategory.name ?? ""}
          description={productCategory.description ?? undefined}
          category={productCategory}
          filters
        />
      </Suspense>
    );
  }

  const { brand } = resolved.data;
  return (
    <Suspense>
      <ArchiveLayout
        title={brand.name ?? ""}
        description={brand.description ?? undefined}
        brand={brand}
        filters
      />
    </Suspense>
  );
};

export default Page;
