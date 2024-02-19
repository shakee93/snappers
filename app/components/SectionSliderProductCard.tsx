'use client'
import React, { FC, useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import Heading from "@/app/components/Heading/Heading";
import Glide from "@glidejs/glide";
import ProductCard from "@/app/components/ProductCard3";
import { Product, PRODUCTS } from "@/data/data";

import { GET_PRODUCTS, GET_CATEGORY } from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";

export interface SectionSliderProductCardProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  headingFontClassName?: string;
  headingClassName?: string;
  subHeading?: string;
  products?: (SimpleProduct & VariableProduct)[];
}

const SectionSliderProductCard: FC<SectionSliderProductCardProps> = ({
  className = "",
  itemClassName = "",
  headingFontClassName,
  headingClassName,
  heading,
  subHeading = " ",
  products = []
}) => {

  const [_products, setProducts] = useState<(SimpleProduct & VariableProduct)[]>(products);
  const [mounted, setMounted] = useState(false)

  const sliderRef = useRef(null);
  const id = useId();
  const UNIQUE_CLASS = "glidejs" + id.replace(/:/g, "_");

  useEffect(() => {
    if (!sliderRef.current) {
      console.error('Slider reference is not assigned properly.');
      return;
    }

    // @ts-ignore
    const OPTIONS: Glide.Options = {
      perView: 4,
      gap: 20,
      bound: true,
      // autoplay: 5000,
      // hoverpause: false,
      breakpoints: {
        1280: {
          perView: 4,
        },
        1024: {
          gap: 20,
          perView: 4,
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

    setMounted(true)

    return () => {
      slider.destroy();
      setMounted(false)
    };
  }, []);


  return (
    <div className={`nc-SectionSliderProductCard ${className}`}>
      {_products.some(p => p.price) && ( // Checking if at least one product has a price
        <div className={`glide ${UNIQUE_CLASS} flow-root`} ref={sliderRef}>
          <Heading
            className={headingClassName}
            fontClass={headingFontClassName}
            rightDescText={subHeading}
            hasNextPrev
          >
            {heading}
          </Heading>

          <div className="glide__track" data-glide-el="track">
            <ul className="glide__slides">
              {_products.filter(p => p.price).map((item, index) => (
                <li key={index} className={`w-[300px] ${itemClassName}`}>
                  <ProductCard className={!mounted ? 'opacity-0' : ''} key={item.slug} data={item} />
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
