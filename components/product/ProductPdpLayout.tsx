"use client";

import { Suspense } from "react";
import { ImageProvider } from "@/context/ImageChangeGrabber";
import ProductDetails from "@/components/product/ProductDetails";
import ProductImage from "@/components/product/ProductImage2";
import ProductVideo from "@/components/product/ProductVideo";
import ProductPdpSidebar from "@/components/product/ProductPdpSidebar";
import ProductShareControls from "@/components/product/ProductShareControls";
import { getProductVideoUrl, type ProductVideoSource } from "@/lib/productVideo";
import type {
  Brand,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";

type PdpProductTagNode = {
  slug?: string | null;
  name?: string | null;
} | null;

type ProductPdpLayoutProps = {
  product: SimpleProduct & VariableProduct & ProductVideoSource;
  brand: Brand;
  happiestCustomersImages: string[];
};

const ProductPdpLayout = ({
  product,
  brand,
}: ProductPdpLayoutProps) => {
  const hasVideo = Boolean(getProductVideoUrl(product)?.trim());
  const productTagNodes = (product.productTags?.nodes ??
    []) as PdpProductTagNode[];
  const hasSidebarTags = productTagNodes.some((t) => !!t?.slug && !!t?.name);

  return (
    <ImageProvider>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-stretch xl:gap-x-8 xl:gap-y-5">
        <div className="flex min-h-0 flex-col xl:col-span-5 xl:row-start-1 xl:self-stretch">
          <Suspense
            fallback={
              <div className="flex min-h-[280px] flex-1 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-500">
                Loading images…
              </div>
            }
          >
            <ProductImage product={product} />
          </Suspense>
        </div>

        <div className="xl:col-span-7 xl:row-start-1 xl:self-stretch">
          <div className="relative flex h-full min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
            <div className="pointer-events-none absolute top-3 right-3 z-10 sm:top-4 sm:right-4">
              <div className="pointer-events-auto">
                <ProductShareControls product={product} variant="floating" />
              </div>
            </div>
            <ProductDetails brand={brand} product={product} />
          </div>
        </div>

        {hasVideo ? (
          <div className="xl:col-span-5 xl:row-start-2">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2">
              <ProductVideo product={product} />
            </div>
          </div>
        ) : null}

        {hasSidebarTags ? (
          <div className="xl:col-span-7 xl:row-start-2">
            <ProductPdpSidebar productTags={productTagNodes} />
          </div>
        ) : null}
      </div>
    </ImageProvider>
  );
};

export default ProductPdpLayout;
