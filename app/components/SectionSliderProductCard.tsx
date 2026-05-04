"use client";
import React, { FC, useEffect, useState, useCallback, useRef } from "react";
import Heading from "@/app/components/Heading/Heading";
import ProductCard from "@/app/components/ProductCard3";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import CardSkeleton from "./Skeletons/CardSkeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { filterHiddenProducts } from "@/lib/hidden-products";

export interface SectionSliderProductCardProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  headingFontClassName?: string;
  headingClassName?: string;
  subHeading?: string;
  products?: (SimpleProduct & VariableProduct)[];
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
  const [mounted, setMounted] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading time and then show the carousel
    const timer = setTimeout(() => {
      setShowSkeleton(false);
      setMounted(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-slide functionality with pause on hover
  useEffect(() => {
    if (!api || !mounted) return;

    let interval: NodeJS.Timeout;

    const startAutoSlide = () => {
      interval = setInterval(() => {
        api.scrollNext();
      }, 3000);
    };

    const stopAutoSlide = () => {
      if (interval) {
        clearInterval(interval);
      }
    };

    // Start auto-slide initially
    startAutoSlide();

    // Add event listeners for pause on hover using ref
    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('mouseenter', stopAutoSlide);
      carouselElement.addEventListener('mouseleave', startAutoSlide);
    }

    return () => {
      stopAutoSlide();
      if (carouselElement) {
        carouselElement.removeEventListener('mouseenter', stopAutoSlide);
        carouselElement.removeEventListener('mouseleave', startAutoSlide);
      }
    };
  }, [api, mounted]);

  const filteredProducts = filterHiddenProducts(products)
    .filter((product) => {
      if (product?.price || product?.regularPrice || product?.salePrice) {
        return true;
      }

      const variationNodes = (product?.variations as {
        nodes?: Array<{
          price?: string | null;
          regularPrice?: string | null;
          salePrice?: string | null;
        }>;
      } | null)?.nodes;

      return (
        variationNodes?.some(
          (variation) => variation?.price || variation?.regularPrice || variation?.salePrice
        ) ?? false
      );
    });

  if (!filteredProducts.length) {
    return null;
  }

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

        {/* Show Skeleton while loading */}
        {showSkeleton && (
          <div className="py-4">
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: Math.min(filteredProducts.length || 5, 5) }).map((_, index) => (
                <div key={index} className="flex-shrink-0 basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/5">
                  <CardSkeleton cardCount={1} className="w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show Carousel when loaded */}
        {!showSkeleton && mounted && (
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
                {filteredProducts.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className={`pl-2 md:pl-4 ${itemClassName} basis-1/2 sm:basis-1/3 lg:basis-1/5`}
                  >
                    <div className="w-full">
                      <ProductCard
                        className="transition-opacity duration-300"
                        key={item.slug}
                        data={item}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Side navigation arrows for product rows */}
              <CarouselPrevious className="hidden md:flex absolute xl:-left-14 -left-2 top-1/2 -translate-y-1/2 z-10 border-0 bg-[#cecfd0] text-white hover:bg-[#9e9fa0] hover:text-white transition-colors duration-200 p-1 md:p-2 w-8 h-8 md:w-10 md:h-10 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6" />
              <CarouselNext className="hidden md:flex absolute xl:-right-14 -right-2 top-1/2 -translate-y-1/2 z-10 border-0 bg-[#cecfd0] text-white hover:bg-[#9e9fa0] hover:text-white transition-colors duration-200 p-1 md:p-2 w-8 h-8 md:w-10 md:h-10 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6" />
            </Carousel>
            
            {/* See More button at the bottom */}
            {link && (
              <div className="flex justify-center mt-6">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white rounded-full shadow-lg hover:shadow-md transition-all duration-200"
                >
                  See More
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionSliderProductCard;
