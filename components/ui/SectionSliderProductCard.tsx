"use client";
import React, { FC, useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import Heading from "@/components/primitives/Heading/Heading";
import ProductCard from "@/components/ui/ProductCard3";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { filterHiddenProducts } from "@/lib/hidden-products";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export interface SectionSliderProductCardProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  headingFontClassName?: string;
  headingClassName?: string;
  subHeading?: string;
  products?: (SimpleProduct | VariableProduct)[];
  link?: string;
}

const SectionSliderProductCard: FC<SectionSliderProductCardProps> = ({
  className = "",
  itemClassName = "",
  headingFontClassName,
  headingClassName,
  heading,
  subHeading = " ",
  products = [],
  link,
}) => {
  const isExternalLink = Boolean(link && /^https?:\/\//.test(link));
  const [mounted, setMounted] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-slide with pause on hover — only active after carousel mounts
  useEffect(() => {
    if (!api || !mounted) return;

    let interval: NodeJS.Timeout;

    const startAutoSlide = () => {
      interval = setInterval(() => {
        api.scrollNext();
      }, 3000);
    };

    const stopAutoSlide = () => {
      if (interval) clearInterval(interval);
    };

    startAutoSlide();

    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener("mouseenter", stopAutoSlide);
      carouselElement.addEventListener("mouseleave", startAutoSlide);
    }

    return () => {
      stopAutoSlide();
      if (carouselElement) {
        carouselElement.removeEventListener("mouseenter", stopAutoSlide);
        carouselElement.removeEventListener("mouseleave", startAutoSlide);
      }
    };
  }, [api, mounted]);

  const visibleProducts = useMemo(
    () => filterHiddenProducts(products),
    [products]
  );

  const filteredProducts = visibleProducts.filter((product) => {
    if (product?.price || product?.regularPrice || product?.salePrice) {
      return true;
    }

    const variationNodes = ('variations' in product && product.variations)
      ? (product.variations as { nodes?: Array<{ price?: string | null; regularPrice?: string | null; salePrice?: string | null }> } | null)?.nodes
      : undefined;

    return (
      variationNodes?.some(
        (variation) =>
          variation?.price || variation?.regularPrice || variation?.salePrice
      ) ?? false
    );
  });

  if (!filteredProducts.length) {
    return null;
  }

  const seeMoreButton = link && (
    <div className="flex justify-center mt-6">
      {isExternalLink ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white rounded-full shadow-lg hover:shadow-md transition-all duration-200"
        >
          See More
        </a>
      ) : (
        <Link
          href={link}
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white rounded-full shadow-lg hover:shadow-md transition-all duration-200"
        >
          See More
        </Link>
      )}
    </div>
  );

  return (
    <div className={`nc-SectionSliderProductCard ${className}`}>
      <div className="flow-root">
        <Heading
          className={headingClassName}
          fontClass={headingFontClassName}
          rightDescText={subHeading}
          hasNextPrev={false}
          link={link}
        >
          {heading}
        </Heading>

        {mounted ? (
          // Post-hydration: full interactive carousel
          <div ref={carouselRef} className="py-4 relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
                slidesToScroll: 1,
              }}
              setApi={setApi}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {filteredProducts.map((item) => (
                  <CarouselItem
                    key={item.slug}
                    className={`pl-2 md:pl-4 ${itemClassName} basis-1/2 sm:basis-1/3 lg:basis-1/5`}
                  >
                    <div className="w-full">
                      <ProductCard
                        className="transition-opacity duration-300"
                        data={item}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="hidden md:flex absolute xl:-left-14 -left-2 top-1/2 -translate-y-1/2 z-10 border-0 bg-neutral-300 text-white hover:bg-neutral-400 hover:text-white transition-colors duration-200 p-1 md:p-2 w-8 h-8 md:w-10 md:h-10 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6" />
              <CarouselNext className="hidden md:flex absolute xl:-right-14 -right-2 top-1/2 -translate-y-1/2 z-10 border-0 bg-neutral-300 text-white hover:bg-neutral-400 hover:text-white transition-colors duration-200 p-1 md:p-2 w-8 h-8 md:w-10 md:h-10 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6" />
            </Carousel>

            {seeMoreButton}
          </div>
        ) : (
          // Pre-hydration: static flex-scroll so product names/links are in the server HTML
          <div className="py-4 -ml-2 md:-ml-4 flex overflow-x-auto">
            {filteredProducts.map((item) => (
              <div
                key={item.slug}
                className={`pl-2 md:pl-4 flex-shrink-0 basis-1/2 sm:basis-1/3 lg:basis-1/5`}
              >
                <ProductCard data={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionSliderProductCard;
