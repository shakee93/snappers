"use client";
import React, { FC, useEffect, useId, useRef, useState } from "react";
import Heading from "@/app/components/Heading/Heading";
import Glide from "@glidejs/glide";
import { Brand } from "@/graphql/types/graphql";
import BrandCard from "@/components/BrandCard";
import CardSkeleton from "./Skeletons/CardSkeleton";

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
  const [showSkeleton, setShowSkeleton] = useState(true)
  const sliderRef = useRef(null);
  const id = useId();
  const UNIQUE_CLASS = "glidejs" + id.replace(/:/g, "_");

  useEffect(() => {
    if (!sliderRef.current) {
      console.log("Slider reference is not assigned properly.");
      return;
    }

    // @ts-ignore
    const OPTIONS: Glide.Options = {
      perView: 6,
      gap: 10,
      bound: true,
      // autoplay: 5000,
      // hoverpause: false,
      breakpoints: {
        1280: {
          perView: 5,
        },
        1024: {
          gap: 10,
          perView: 4,
        },
        768: {
          gap: 10,
          perView: 3,
        },
        640: {
          gap: 10,
          perView: 2,
        },
        500: {
          gap: 10,
          perView: 2,
        },
      },
    };

    let slider = new Glide(`.${UNIQUE_CLASS}`, OPTIONS);
    slider.mount();

    setShowSkeleton(false);
    setMounted(true);

    return () => {
      slider.destroy();
      setMounted(false);
    };
  }, []);

  const limitedBrands = brands.slice(0, 15);

  return (
    <div className={`nc-SectionSliderBrandCard ${className}`}>
      {limitedBrands.length > 0 && (
        <div className={`glide ${UNIQUE_CLASS} flow-root`} ref={sliderRef}>
          <Heading
            className={headingClassName}
            fontClass={headingFontClassName}
            rightDescText={subHeading}
            hasNextPrev
            link={link}
          >
            {heading}
          </Heading>

          {showSkeleton && <CardSkeleton className="w-1/3" />}

          <div className="glide__track" data-glide-el="track">
            <ul className="glide__slides py-4 gap-6">
              {limitedBrands.map((brand, index) => (
                <li key={index} className={`w-[300px] pt-2 ${itemClassName}`}>
                  <BrandCard
                    imageUrl={
                      brand.brandImage
                        ? brand.brandImage
                        : "https://via.placeholder.com/300"
                    }
                    brandLink={brand.slug || "#"}
                    className={!mounted ? "opacity-0" : ""}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionSliderBrandCard;
