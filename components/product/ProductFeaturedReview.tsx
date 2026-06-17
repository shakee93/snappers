"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  getReviewDisplayImages,
  stripReviewHtml,
  type ProductReviewItem,
} from "@/lib/productReviews";

const ProductLightbox = dynamic(() => import("@/components/product/ProductLightbox"), {
  ssr: false,
});

interface ProductFeaturedReviewProps {
  review: ProductReviewItem;
  className?: string;
}

const ProductFeaturedReview = ({ review, className = "" }: ProductFeaturedReviewProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const body = review.content ? stripReviewHtml(review.content) : "";
  const authorName = review.author?.node?.name?.trim() || "Customer";
  const images = useMemo(
    () => getReviewDisplayImages(review, authorName),
    [review, authorName],
  );
  const starCount = Math.min(5, Math.max(0, Math.round(review.rating ?? 5)));

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  if (!body && images.length === 0) return null;

  return (
    <>
      <figure
        className={`rounded-2xl border border-[#E8E8E8] bg-white p-4 ${className}`}
      >
        <figcaption className="flex items-center justify-between gap-3 border-b border-[#E8E8E8] pb-3">
          <span className="text-sm font-semibold text-[#1A1A1A]">{authorName}</span>
          <span
            className="flex shrink-0 items-center gap-0"
            aria-label={`${starCount} out of 5 stars`}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index < starCount
                    ? "fill-[#F5A623] text-[#F5A623]"
                    : "fill-transparent text-[#D1D5DB]"
                }`}
                strokeWidth={1.5}
              />
            ))}
          </span>
        </figcaption>

        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2 pt-3">
            {images.map((image, index) => (
              <div
                key={`${review.databaseId}-${image.sourceUrl}-${index}`}
                className="relative aspect-square min-h-24 min-w-0 w-full"
              >
                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="absolute inset-0 block h-full w-full overflow-hidden rounded-lg border border-[#E8E8E8] bg-[#FAFAFA]"
                  aria-label={`Preview photo ${index + 1} of ${images.length}`}
                >
                  <Image
                    src={image.thumbnailUrl}
                    alt={image.altText}
                    width={160}
                    height={160}
                    unoptimized
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {body && (
          <blockquote className="pt-3 text-sm leading-relaxed text-[#4B5563]">
            {body}
          </blockquote>
        )}
      </figure>

      {lightboxOpen && (
        <ProductLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};

export default ProductFeaturedReview;
