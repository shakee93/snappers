"use client";

import { Suspense } from "react";
import { ImageProvider } from "@/context/ImageChangeGrabber";
import ProductDetails from "@/components/product/ProductDetails";
import ProductImage from "@/components/product/ProductImage2";
import ProductVideo from "@/components/product/ProductVideo";
import ProductReviews from "@/components/product/ProductReviews";
import FreeGiftPreview from "@/components/product/FreeGiftPreview";
import HappiestCustomersGallery from "@/components/product/HappiestCustomersGallery";
import { getProductVideoUrl, type ProductVideoSource } from "@/lib/productVideo";
import type { Brand, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";

type ProductPdpLayoutProps = {
  product: SimpleProduct & VariableProduct & ProductVideoSource;
  brand: Brand;
  happiestCustomersImages: string[];
};

const ProductPdpLayout = ({
  product,
  brand,
  happiestCustomersImages,
}: ProductPdpLayoutProps) => {
  const hasVideo = Boolean(getProductVideoUrl(product)?.trim());

  return (
    <ImageProvider>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-7 lg:gap-10">
        <div className="order-3 lg:col-span-4 lg:col-start-4 lg:row-start-1">
          <ProductDetails brand={brand} product={product} />
        </div>

        {/* Mobile: children interleave via flex order. Desktop: one left column stack. */}
        <div className="contents lg:col-span-3 lg:col-start-1 lg:flex lg:flex-col lg:gap-6">
          <div className="order-1">
            <Suspense
              fallback={
                <div className="flex min-h-[280px] items-center justify-center rounded-2xl bg-[#F6F6F6] text-sm text-[#6B7280]">
                  Loading images…
                </div>
              }
            >
              <ProductImage product={product} />
            </Suspense>
          </div>

          {hasVideo && (
            <div className="order-2 border-t border-[#E8E8E8] pt-4 lg:pt-8">
              <ProductVideo product={product} />
            </div>
          )}

          <div className="order-4 lg:mt-0">
            <ProductReviews
              product={product}
              hasVideoAbove={hasVideo}
              className="lg:mt-6"
            />
          </div>

          <div className="order-5 flex flex-col gap-4 lg:gap-6">
            <FreeGiftPreview product={product} />
            <HappiestCustomersGallery images={happiestCustomersImages} />
          </div>
        </div>
      </div>
    </ImageProvider>
  );
};

export default ProductPdpLayout;
