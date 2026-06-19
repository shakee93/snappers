"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductFeaturedReview from "@/components/product/ProductFeaturedReview";
import {
  sortReviewsImageFirst,
  type ProductReviewItem,
} from "@/lib/productReviews";
import { pdpRadius, pdpThinScrollClass } from "@/components/product/pdpStyles";

interface ProductReviewExploreProps {
  reviews?: ProductReviewItem[] | null;
  className?: string;
}

const SCROLL_FADE_STOP_MS = 120;

const ProductReviewExplore = ({
  reviews = [],
  className = "",
}: ProductReviewExploreProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const [showTopFade, setShowTopFade] = useState(false);

  const approvedReviews = useMemo(
    () => sortReviewsImageFirst(reviews ?? []),
    [reviews],
  );

  const updateScrollFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const canScroll = el.scrollHeight > el.clientHeight + 1;
    const atBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    const scrolledFromTop = el.scrollTop > 8;

    setShowBottomFade(canScroll && !atBottom);
    setShowTopFade(scrolledFromTop);

    if (scrollStopTimerRef.current) {
      clearTimeout(scrollStopTimerRef.current);
    }

    scrollStopTimerRef.current = setTimeout(() => {
      setShowTopFade(false);
      scrollStopTimerRef.current = null;
    }, SCROLL_FADE_STOP_MS);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollFades();

    el.addEventListener("scroll", updateScrollFades, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollFades);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollFades);
      resizeObserver.disconnect();

      if (scrollStopTimerRef.current) {
        clearTimeout(scrollStopTimerRef.current);
      }
    };
  }, [approvedReviews, updateScrollFades]);

  return (
    <section id="product-reviews" className={className}>
      <h2 className="mb-4 inline-block border-b-[3px] border-[#ACDA5A] pb-1 text-base font-bold text-[#1A1A1A]">
        Explore Reviews
      </h2>

      {approvedReviews.length > 0 ? (
        <div className="relative">
          <div
            ref={scrollRef}
            className={`max-h-[min(480px,65vh)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth ${pdpThinScrollClass}`}
          >
            <ul className="flex flex-col gap-2 pb-2">
              {approvedReviews.map((review) => (
                <li key={review.databaseId} className="shrink-0 snap-start snap-always">
                  <ProductFeaturedReview review={review} />
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#FAFAF8] via-[#FAFAF8]/70 to-transparent transition-opacity duration-300 ${
              showTopFade ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FAFAF8] via-[#FAFAF8]/80 to-transparent transition-opacity duration-300 ${
              showBottomFade ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      ) : (
        <p className={`border border-[#E8E8E8] bg-white p-4 text-sm text-[#6B7280] ${pdpRadius}`}>
          No customer reviews yet. Be the first to share your experience.
        </p>
      )}
    </section>
  );
};

export default ProductReviewExplore;
