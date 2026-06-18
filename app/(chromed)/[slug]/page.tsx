import ProductPdpLayout from "@/components/product/ProductPdpLayout";
import { Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
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
import Link from "next/link";

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
      <div className="bg-white pb-[160px] lg:pb-12">
        <main className="mx-auto flex max-w-[1368px] flex-col px-3 sm:px-4 lg:px-6">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          />

          <nav
            aria-label="Breadcrumb"
            className="py-4 text-xs text-[#6B7280] sm:text-sm"
          >
            <Link href="/" className="hover:text-[#38461F]">
              Home
            </Link>
            <span className="mx-1.5">&gt;</span>
            <Link
              href={getCategoryPath(primaryCategorySlug)}
              className="hover:text-[#38461F]"
            >
              {primaryCategoryName}
            </Link>
            <span className="mx-1.5">&gt;</span>
            <span className="text-[#1A1A1A]">{product.name}</span>
          </nav>

        <div className="rounded-3xl bg-[#FAFAF8] p-4 sm:p-6 lg:p-8">
            <ProductPdpLayout
              product={product}
              brand={brand}
              happiestCustomersImages={happiestCustomersImages}
            />
          </div>
        </main>

        <UpsellProducts relatedProducts={upsellProducts} />
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
