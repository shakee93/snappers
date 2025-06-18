"use client";
import React, { FC, useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import Heading from "@/app/components/Heading/Heading";
import Glide from "@glidejs/glide";
import ProductCard from "@/app/components/ProductCard3";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import CardSkeleton from "./Skeletons/CardSkeleton"; // Import skeleton

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
  const [showSkeleton, setShowSkeleton] = useState(true); // Add loading state

  const sliderRef = useRef(null);
  const id = useId();
  const UNIQUE_CLASS = "glidejs" + id.replace(/:/g, "_");

  useEffect(() => {
    if (!sliderRef.current) {
      // console.log("Slider reference is not assigned properly.");
      return;
    }

    // @ts-ignore
    const OPTIONS: Glide.Options = {
      perView: 5,
      autoplay: 2000,
      gap: 20,
      bound: true,
      breakpoints: {
        1280: {
          perView: 5,
        },
        1024: {
          gap: 20,
          perView: 5,
        },
        768: {
          gap: 20,
          perView: 3,
        },
        640: {
          gap: 20,
          perView: 2,
        },
        500: {
          gap: 20,
          perView: 2,
        },
      },
    };

    let slider = new Glide(`.${UNIQUE_CLASS}`, OPTIONS);
    slider.mount();

    setShowSkeleton(false); // Once mounted, hide the skeleton
    setMounted(true);

    return () => {
      slider.destroy();
      setMounted(false);
    };
  }, []);

  // console.log('products', products);

  return (
    <div className={`nc-SectionSliderProductCard ${className}`}>
      {products.some((p) => p.price) && (
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

          {/* Show Skeleton while loading */}
          {showSkeleton && <CardSkeleton className="w-1/3" />}

          <div className="glide__track" data-glide-el="track">
            <ul className="glide__slides py-4">
              {products
                .filter((p) => p.price)
                .map((item, index) => (
                  <li key={index} className={`w-[300px] pt-2 ${itemClassName}`}>
                    <ProductCard
                      className={!mounted ? "opacity-0" : ""}
                      key={item.slug}
                      data={item}
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

export default SectionSliderProductCard;
