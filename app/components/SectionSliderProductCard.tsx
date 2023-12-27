'use client'
import React, { FC, useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import Heading from "@/app/components/Heading/Heading";
import Glide from "@glidejs/glide";
import ProductCard from "@/app/components/ProductCard3";
import { Product, PRODUCTS } from "@/data/data";

import { GET_PRODUCTS, GET_CATEGORY } from "@/graphql/defs/products";
import {SimpleProduct, VariableProduct} from "@/graphql/types/graphql";

export interface SectionSliderProductCardProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  headingFontClassName?: string;
  headingClassName?: string;
  subHeading?: string;
  data?: Product[];
}


const SectionSliderProductCard: FC<SectionSliderProductCardProps> = ({
  className = "",
  itemClassName = "",
  headingFontClassName,
  headingClassName,
  heading,
  subHeading = " ",
  // data = PRODUCTS.filter((_, i) => i < 8 && i > 2),
}) => {

  const [_products, setProducts] = useState<{
    node: SimpleProduct & VariableProduct
  }[]>([]);
  let { loading, error, data, refetch } = useQuery(GET_PRODUCTS);

  useEffect(() => {
    if (data?.products.edges.length > 0) {
      setProducts(data.products.edges);
    }
  }, [data]);

  const sliderRef = useRef(null);
  const id = useId();
  const UNIQUE_CLASS = "glidejs" + id.replace(/:/g, "_");

  useEffect(() => {
    if (!sliderRef.current) {
      return () => { };
    }

    // @ts-ignore
    const OPTIONS: Glide.Options = {
      perView: 4,
      gap: 32,
      bound: true,
      breakpoints: {
        1280: {
          perView: 4 - 1,
        },
        1024: {
          gap: 20,
          perView: 4 - 1,
        },
        768: {
          gap: 20,
          perView: 4 - 2,
        },
        640: {
          gap: 20,
          perView: 1.5,
        },
        500: {
          gap: 20,
          perView: 1.3,
        },
      },
    };

    let slider = new Glide(`.${UNIQUE_CLASS}`, OPTIONS);
    slider.mount();
    return () => {
      slider.destroy();
    };
  }, [sliderRef, UNIQUE_CLASS, _products]);

  return (
    <div className={`nc-SectionSliderProductCard ${className}`}>
      <div className={`${UNIQUE_CLASS} flow-root`} ref={sliderRef}>
        <Heading
          className={headingClassName}
          fontClass={headingFontClassName}
          rightDescText={subHeading}
          hasNextPrev
        >
          {heading}
        </Heading>

        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides py-3">
            {_products?.map((item, index) => (
              <li key={index} className={`glide__slide ${itemClassName}`}>
                <ProductCard key={item.node.slug} data={item.node} />
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default SectionSliderProductCard;
