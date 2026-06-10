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
/** Embla disables loop when slides do not fill the viewport; pad until loop engages. */
const MIN_SLIDES_FOR_LOOP = 20;

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
  const slideCount = products.length;
  const canLoop = slideCount > 1;

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
      loop: canLoop,
      containScroll: false,
      duration: 28,
    },
    canLoop ? [autoplay.current] : [],
  );

  const [selectedSnap, setSelectedSnap] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const baseSlides = useMemo(
    () =>
      products.map((product, index) => ({
        product,
        price: resolveDisplayPrice(product),
        featureImage: featureImages[index],
      })),
    [products, featureImages],
  );

  const carouselSlides = useMemo((): CarouselSlide[] => {
    if (!canLoop) {
      return baseSlides.map((slide, index) => ({
        ...slide,
        key: slide.product.id,
        logicalIndex: index,
      }));
    }

    const repeatCount = Math.max(5, Math.ceil(MIN_SLIDES_FOR_LOOP / slideCount));

    return Array.from({ length: repeatCount }, (_, repeatIndex) =>
      baseSlides.map((slide, index) => ({
        ...slide,
        key: `${slide.product.id}-r${repeatIndex}`,
        logicalIndex: index,
      })),
    ).flat();
  }, [baseSlides, canLoop, slideCount]);

  const syncActiveFromViewport = useCallback(
    (api: EmblaCarouselType) => {
      const centerSnap = getCenterSnap(api);
      setSelectedSnap(centerSnap);
      setSelectedIndex(
        slideCount > 0
          ? ((centerSnap % slideCount) + slideCount) % slideCount
          : 0,
      );
    },
    [slideCount],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onInit = () => {
      syncActiveFromViewport(emblaApi);
      if (canLoop && emblaApi.internalEngine().options.loop) {
        autoplay.current.play();
      }
    };

    const onScroll = () => syncActiveFromViewport(emblaApi);
    const onSelect = () => syncActiveFromViewport(emblaApi);

    emblaApi
      .on("init", onInit)
      .on("reInit", onInit)
      .on("scroll", onScroll)
      .on("select", onSelect);
    if (emblaApi.scrollSnapList().length > 0) onInit();

    return () => {
      emblaApi
        .off("init", onInit)
        .off("reInit", onInit)
        .off("scroll", onScroll)
        .off("select", onSelect);
    };
  }, [emblaApi, syncActiveFromViewport, canLoop]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;

      const current = getCenterSnap(emblaApi);
      const totalSnaps = emblaApi.scrollSnapList().length;
      let nearest = current;
      let nearestDistance = Infinity;

      for (let snap = 0; snap < totalSnaps; snap += 1) {
        const logical =
          slideCount > 0 ? ((snap % slideCount) + slideCount) % slideCount : 0;
        if (logical !== index) continue;

        const distance = Math.min(
          Math.abs(snap - current),
          totalSnaps - Math.abs(snap - current),
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = snap;
        }
      }

      emblaApi.scrollTo(nearest);
    },
    [emblaApi, slideCount],
  );

  return (
    <div className="w-full max-w-[100%] overflow-x-clip py-4 sm:py-0">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y items-center py-8 sm:py-10 lg:py-12">
          {carouselSlides.map(
            ({ key, product, price, featureImage }, physicalIndex) => {
              const isActive = physicalIndex === selectedSnap;
              return (
                <div
                  key={key}
                  className={`min-w-0 shrink-0 grow-0 basis-[94%] px-2 py-2 sm:basis-[82%] sm:px-2 lg:basis-[800px] lg:px-3 ${
                    isActive ? "lg:min-w-[800px]" : ""
                  }`}
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
