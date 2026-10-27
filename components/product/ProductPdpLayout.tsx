"use client";

import { Suspense } from "react";
import { ImageProvider } from "@/context/ImageChangeGrabber";
import ProductDetails from "@/components/product/ProductDetails";
import ProductImage from "@/components/product/ProductImage2";
import ProductVideo from "@/components/product/ProductVideo";
import ProductPdpSidebar, {
  type PdpSidebarCategory,
} from "@/components/product/ProductPdpSidebar";
import { getProductVideoUrl, type ProductVideoSource } from "@/lib/productVideo";
import type { Brand, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";

type ProductPdpLayoutProps = {
  product: SimpleProduct & VariableProduct & ProductVideoSource;
  brand: Brand;
  happiestCustomersImages: string[];
  sidebarCategories?: PdpSidebarCategory[] | null;
};

const ProductPdpLayout = ({
  product,
  brand,
  sidebarCategories,
}: ProductPdpLayoutProps) => {
  const hasVideo = Boolean(getProductVideoUrl(product)?.trim());

  return (
    <ImageProvider>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
        <div className="flex flex-col gap-4 xl:col-span-5 xl:gap-5">
          <Suspense
            fallback={
              <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-500">
                Loading images…
              </div>
            }
          >
            <ProductImage product={product} />
          </Suspense>
          {hasVideo && (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2">
              <ProductVideo product={product} />
            </div>
          )}
        </div>

        <div className="xl:col-span-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
            <ProductDetails brand={brand} product={product} />
          </div>
        </div>

        <div className="xl:col-span-3">
          <ProductPdpSidebar
            categories={sidebarCategories}
            productTags={product.productTags?.nodes}
          />
        </div>
      </div>
    </ImageProvider>
  );
};

export default ProductPdpLayout;
