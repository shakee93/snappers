"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import ProductCard, {
  type ProductCardItem,
} from "@/components/home/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/global/ui/carousel";
import { siteConfig } from "@/site.config";

const dealAccentHex = siteConfig.theme.brandHex.dealAccent;
const AUTO_SLIDE_MS = 4000;
/** Matches the largest desktop page size (`lg` shows 4 cards). */
const DESKTOP_VISIBLE_SLIDES = 4;
/** Embla needs enough slides to engage loop once products overflow one page. */
const MIN_SLIDES_FOR_LOOP = 16;

export interface DealProductCarouselProps {
  products: ProductCardItem[];
}

const slideClassName =
  "pl-3 basis-[calc(50%-0.375rem)] sm:basis-[calc(33.333%-0.5rem)] lg:basis-[calc(25%-0.75rem)]";

const slideKeyFor = (product: ProductCardItem, repeatIndex?: number) => {
  const base =
    product.id ??
    (product.databaseId != null ? `deal-${product.databaseId}` : product.slug);
  return repeatIndex == null ? String(base) : `${base}-r${repeatIndex}`;
};

/** Horizontal deal-product carousel shown beneath the countdown banner. */
const DealProductCarousel = ({ products }: DealProductCarouselProps) => {
  const [mounted, setMounted] = useState(false);
  // Only loop once there are more unique products than one desktop page.
  // Padding a short list with duplicates makes it look like deals are missing.
  const canLoop = products.length > DESKTOP_VISIBLE_SLIDES;
  const autoplay = useRef(
    Autoplay({
      delay: AUTO_SLIDE_MS,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const carouselSlides = useMemo(() => {
    if (!canLoop) {
      return products.map((product) => ({
        key: slideKeyFor(product),
        product,
        ariaHidden: false,
      }));
    }

    const repeatCount = Math.max(
      2,
      Math.ceil(MIN_SLIDES_FOR_LOOP / products.length),
    );

    return Array.from({ length: repeatCount }, (_, repeatIndex) =>
      products.map((product) => ({
        key: slideKeyFor(product, repeatIndex),
        product,
        ariaHidden: repeatIndex > 0,
      })),
    ).flat();
  }, [canLoop, products]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!products.length) return null;

  if (!mounted) {
    return (
      <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 lg:mx-0 lg:px-0">
        {products.map((product) => (
          <div key={product.id} className={`w-[calc(50%-0.375rem)] shrink-0 sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.75rem)]`}>
            <ProductCard
              product={product}
              badgeLabel="Deals"
              accentColor={dealAccentHex}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: canLoop,
          slidesToScroll: 1,
        }}
        plugins={canLoop ? [autoplay.current] : []}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {carouselSlides.map(({ key, product, ariaHidden }) => (
            <CarouselItem
              key={key}
              className={slideClassName}
              aria-hidden={ariaHidden || undefined}
            >
              <ProductCard
                product={product}
                badgeLabel="Deals"
                accentColor={dealAccentHex}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute -left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 border-0 bg-deal-brown text-white hover:bg-deal-brown/90 hover:text-white md:flex lg:-left-12" />
        <CarouselNext className="absolute -right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 border-0 bg-deal-brown text-white hover:bg-deal-brown/90 hover:text-white md:flex lg:-right-12" />
      </Carousel>
    </div>
  );
};

export default DealProductCarousel;
