"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard, {
  type ProductCardItem,
} from "@/components/home/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/global/ui/carousel";
import { siteConfig } from "@/site.config";

const dealAccentHex = siteConfig.theme.brandHex.dealAccent;
const AUTO_SLIDE_MS = 4000;
/** Embla needs enough slides to engage loop when only a few products are on sale. */
const MIN_SLIDES_FOR_LOOP = 16;

export interface DealProductCarouselProps {
  products: ProductCardItem[];
}

const slideClassName =
  "pl-3 basis-[calc(50%-0.375rem)] sm:basis-[calc(33.333%-0.5rem)] lg:basis-[calc(25%-0.75rem)]";

/** Horizontal deal-product carousel shown beneath the countdown banner. */
const DealProductCarousel = ({ products }: DealProductCarouselProps) => {
  const [mounted, setMounted] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);
  const canLoop = products.length > 1;

  const carouselSlides = useMemo(() => {
    if (!canLoop) {
      return products.map((product) => ({
        key: product.id,
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
        key: `${product.id}-r${repeatIndex}`,
        product,
        ariaHidden: repeatIndex > 0,
      })),
    ).flat();
  }, [canLoop, products]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!api || !mounted || isPaused) return;

    const interval = setInterval(() => api.scrollNext(), AUTO_SLIDE_MS);
    return () => clearInterval(interval);
  }, [api, mounted, isPaused]);

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
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <Carousel
        opts={{
          align: "start",
          loop: canLoop,
          slidesToScroll: 1,
        }}
        setApi={setApi}
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
