"use client";
import React, { FC, useEffect, useState, useRef } from "react";
import Heading from "@/components/primitives/Heading/Heading";
import { Brand } from "@/graphql/types/graphql";
import BrandCard from "@/components/ui/BrandCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export interface SectionSliderBrandCardProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  headingFontClassName?: string;
  headingClassName?: string;
  subHeading?: string;
  brands: Brand[]; // Only an array of image URLs
  link?: string;
}

const SectionSliderBrandCard: FC<SectionSliderBrandCardProps> = ({
  className = "",
  itemClassName = "",
  headingFontClassName,
  headingClassName,
  heading,
  subHeading = " ",
  brands = [],
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
      }, 1000);
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

  const limitedBrands = brands.slice(0, 15);

  if (!limitedBrands.length) {
    return null;
  }

  return (
    <div className={`nc-SectionSliderBrandCard ${className}`}>
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
              {Array.from({ length: Math.min(limitedBrands.length || 6, 6) }).map((_, index) => (
                <div key={index} className="flex-shrink-0 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                  <div className="w-full h-32">
                    <div className="animate-pulse bg-white rounded-2xl shadow-sm border border-gray-200 h-full px-8 flex items-center justify-center">
                      {/* Brand Logo centered in the middle */}
                      <div className="bg-gray-200 h-16 w-16 rounded-lg"></div>
                    </div>
                  </div>
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
                {limitedBrands.map((brand, index) => (
                  <CarouselItem 
                    key={index} 
                    className={`pl-2 md:pl-4 ${itemClassName} basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6`}
                  >
                    <div className="w-full h-32">
                      <BrandCard
                        imageUrl={
                          brand.brandImage
                            ? brand.brandImage
                            : "https://via.placeholder.com/300"
                        }
                        brandLink={brand.slug || "#"}
                        className="transition-opacity duration-300 h-full"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Navigation arrows positioned in the middle */}
              <CarouselPrevious className="absolute xl:-left-14 lg:-left-2 lg:right-auto right-10 lg:top-1/2 -top-14 -translate-y-1/2 z-10 border-0 bg-neutral-300 text-white hover:bg-neutral-400 hover:text-white transition-colors duration-200 p-1 md:p-2 w-8 h-8 md:w-10 md:h-10 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6" />
              <CarouselNext className="absolute xl:-right-14 -right-2 lg:top-1/2 -top-14 -translate-y-1/2 z-10 border-0 bg-neutral-300 text-white hover:bg-neutral-400 hover:text-white transition-colors duration-200 p-1 md:p-2 w-8 h-8 md:w-10 md:h-10 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6" />
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

export default SectionSliderBrandCard;
