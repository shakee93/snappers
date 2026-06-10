"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  resolveDisplayPrice,
  type ProductCardItem,
} from "@/components/home/ProductCard";
import HealthFeatureCard from "@/components/home/HealthFeatureCard";

const SLIDE_INTERVAL = 6000;

/** Pick the slide whose centre is closest to the carousel viewport centre. */
const getCenterSnap = (api: EmblaCarouselType): number => {
  const rootRect = api.rootNode().getBoundingClientRect();
  const viewportCenterX = rootRect.left + rootRect.width / 2;

  let closestSnap = api.selectedScrollSnap();
  let closestDistance = Infinity;

  api.slideNodes().forEach((node, index) => {
    const rect = node.getBoundingClientRect();
    const slideCenterX = rect.left + rect.width / 2;
    const distance = Math.abs(slideCenterX - viewportCenterX);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSnap = index;
    }
  });

  return closestSnap;
};

export interface HealthProductCarouselProps {
  products: ProductCardItem[];
  /** Big left-hand feature artwork per slide, mapped to `products` by order. */
  featureImages?: string[];
}

type CarouselSlide = {
  key: string;
  logicalIndex: number;
  product: ProductCardItem;
  price: string | null;
  featureImage?: string;
};

/** Centre-aligned infinite carousel: active card scales up, neighbours scale down. */
const HealthProductCarousel = ({
  products,
  featureImages = [],
}: HealthProductCarouselProps) => {
  const canLoop = products.length > 1;
  const slideCount = products.length;

  const autoplay = useRef(
    Autoplay({
      delay: SLIDE_INTERVAL,
      stopOnInteraction: false,
      playOnInit: false,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      loop: false,
      containScroll: "trimSnaps",
      startIndex: canLoop ? slideCount : 0,
    },
    canLoop ? [autoplay.current] : [],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSnap, setSelectedSnap] = useState(0);

  const syncActiveFromViewport = useCallback(
    (api: EmblaCarouselType) => {
      const centerSnap = getCenterSnap(api);
      setSelectedSnap(centerSnap);
      setSelectedIndex(centerSnap % slideCount);
    },
    [slideCount],
  );

  const baseSlides = useMemo(
    () =>
      products.map((product, index) => ({
        product,
        price: resolveDisplayPrice(product),
        featureImage: featureImages[index],
      })),
    [products, featureImages],
  );

  // Triple-clone slides so Embla can scroll infinitely without hitting an end.
  const carouselSlides = useMemo((): CarouselSlide[] => {
    if (!canLoop) {
      return baseSlides.map((slide, index) => ({
        ...slide,
        key: slide.product.id,
        logicalIndex: index,
      }));
    }

    const clones = (suffix: string) =>
      baseSlides.map((slide, index) => ({
        ...slide,
        key: `${slide.product.id}-${suffix}`,
        logicalIndex: index,
      }));

    return [...clones("a"), ...clones("b"), ...clones("c")];
  }, [baseSlides, canLoop]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    const snap = emblaApi.selectedScrollSnap();

    if (canLoop) {
      if (snap < slideCount) {
        emblaApi.scrollTo(snap + slideCount, false);
        return;
      }
      if (snap >= slideCount * 2) {
        emblaApi.scrollTo(snap - slideCount, false);
        return;
      }
    }

    syncActiveFromViewport(emblaApi);
  }, [emblaApi, slideCount, canLoop, syncActiveFromViewport]);

  useEffect(() => {
    if (!emblaApi) return;

    const onInit = () => {
      if (canLoop) {
        emblaApi.scrollTo(slideCount, false);
      }
      const centerSnap = getCenterSnap(emblaApi);
      if (centerSnap !== emblaApi.selectedScrollSnap()) {
        emblaApi.scrollTo(centerSnap, false);
      }
      syncActiveFromViewport(emblaApi);
      if (canLoop) autoplay.current.play();
    };

    const onScroll = () => syncActiveFromViewport(emblaApi);

    emblaApi
      .on("init", onInit)
      .on("reInit", onInit)
      .on("select", onSelect)
      .on("scroll", onScroll);
    if (emblaApi.scrollSnapList().length > 0) onInit();

    return () => {
      emblaApi
        .off("init", onInit)
        .off("reInit", onInit)
        .off("select", onSelect)
        .off("scroll", onScroll);
    };
  }, [emblaApi, onSelect, syncActiveFromViewport, canLoop, slideCount]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(canLoop ? slideCount + index : index);
    },
    [emblaApi, canLoop, slideCount],
  );

  return (
    <div className="w-full max-w-[100%] overflow-x-clip py-4 sm:py-6">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y items-center py-8 sm:py-10 lg:py-12">
          {carouselSlides.map(
            ({ key, product, price, featureImage }, physicalIndex) => {
              const isActive = physicalIndex === selectedSnap;
              return (
                <div
                  key={key}
                  className="min-w-0 shrink-0 grow-0 basis-[94%] px-2 py-2 sm:basis-[82%] sm:px-2 lg:basis-[34%] lg:px-3 xl:basis-[32%]"
                >
                  <div
                    className={`origin-center transition-all duration-500 ease-out ${
                      isActive
                        ? "z-10 scale-100 opacity-100"
                        : "scale-[0.88] opacity-70"
                    }`}
                  >
                    <HealthFeatureCard
                      product={product}
                      price={price}
                      featureImage={featureImage}
                      isActive={isActive}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {canLoop && (
        <div className="mt-2 flex items-center justify-center gap-2 sm:mt-4">
          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to product ${index + 1}`}
              aria-current={index === selectedIndex ? "true" : undefined}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? "bg-neutral-500"
                  : "bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthProductCarousel;
