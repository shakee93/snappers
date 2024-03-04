"use client";
import React, {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {usePathname} from "next/navigation";
import {twMerge} from "tailwind-merge";
import CategoryDropdown from "./CategoryDropdown";
import {Brand, ProductCategory} from "@/graphql/types/graphql";

interface BrandBarProps {
  brands: Brand[];
  categories: ProductCategory[];
}

const BrandBar: React.FC<BrandBarProps> = ({ brands, categories }) => {
  const brandBarRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrollPosition] = useState(0);
  const path = usePathname();

  const handleScroll = () => {
    if (brandBarRef.current) {
      setScrollPosition(brandBarRef.current.scrollLeft);
    }
  };

  useEffect(() => {
    if (brandBarRef.current) {
      brandBarRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (brandBarRef.current) {
        brandBarRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const smoothScroll = (reverse = false) => {
    if (!brandBarRef.current) {
      return;
    }

    const scroll = 0.05 * brandBarRef.current.scrollWidth;
    brandBarRef.current.scrollBy({
      left: reverse ? scroll * -1 : scroll,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex border-t z-50 max-w-[calc(100vw-158px)]">
      <div className="relative w-full flex justify-between items-center">
        <div className="items-center text-primaryColor font-semibold flex h-full">
          <CategoryDropdown categories={categories} />
        </div>
        {scrolled > 0 && (
          <button
            onClick={() => smoothScroll(true)}
            className="absolute z-10 left-[181px] py-3.5 border-l px-3.5 pr-8 bg-gradient-to-r from-white via-white to-transparent"
          >
            <ChevronLeft />
          </button>
        )}
        <div
          ref={brandBarRef}
          className="relative w-full flex justify-between overflow-x-scroll hidden-scrollbar pr-10"
        >
          {brands?.map((brand: Brand, index: number) => (
            <Link
              key={index}
              href={`/${brand.slug}`}
              className={twMerge(
                "flex-1 hover:text-white hover:bg-primaryColor px-4 whitespace-nowrap py-4 uppercase text-center font-medium text-gray-700 tracking-wide text-sm border-l",
                path.includes(`/${brand.slug}`) && "bg-primaryColor text-white"
              )}
            >
              {brand.name} 
            </Link>
          ))}
        </div>
        <button
          onClick={() => smoothScroll()}
          className="absolute z-10 right-0 py-3.5 px-3.5 pl-8 bg-gradient-to-l from-white via-white to-transparent"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default BrandBar;
