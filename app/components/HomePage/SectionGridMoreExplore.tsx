"use client";

import CardCategory1 from "@/app/components/CardCategories/CardCategory1";
import CardCategory4 from "@/app/components/CardCategories/CardCategory4";
import Heading from "@/app/components/Heading/Heading";
import NavItem2 from "@/app/components/HomePage/NavItem2";
import React, { FC, useState, useEffect } from "react";
import Nav from "@/app/components/HomePage/Nav";

import amazfit from "@/public/images/brandLogo/amazfit.png";
import apple from "@/public/images/brandLogo/apple.png";
import beats from "@/public/images/brandLogo/beats.jpg";
import belkin from "@/public/images/brandLogo/belkin.jpg";
import bose from "@/public/images/brandLogo/bose.png";
import fitbit from "@/public/images/brandLogo/fitbit.png";
import google from "@/public/images/brandLogo/google.png";
import greenlion from "@/public/images/brandLogo/greenlion.png";
import huawei from "@/public/images/brandLogo/huawei.jpeg";
import logitech from "@/public/images/brandLogo/logitech.png";
import nokia from "@/public/images/brandLogo/nokia.webp";
import oneplus from "@/public/images/brandLogo/oneplus.png";
import porodo from "@/public/images/brandLogo/porodo.png";
import samsung from "@/public/images/brandLogo/samsung.png";
import skullcandy from "@/public/images/brandLogo/skullcandy.jpg";
import tecno from "@/public/images/brandLogo/tecno.jpg";

import { StaticImageData } from "next/image";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_PRODUCTS, GET_BRANDS } from "@/graphql/defs/products";
import { GET_BRAND_DETAILS } from "@/graphql/defs/products";
import { Brand } from "@/graphql/types/graphql";

interface ExploreType {
  id: number;
  name: string;
  desc?: string;
  image?: string | StaticImageData;
  svgBg?: string;
  color?: string;
  slug?: string;
  img: string;
}

export interface SectionGridMoreExploreProps {
  className?: string;
  gridClassName?: string;
  boxCard?: "box1" | "box4" | "box6";
  data?: ExploreType[];
}

const hardcodedBrands: {
  [key: string]: {
    id: string;
    slug: string;
  }[];
} = {
  Mobiles: [
    { id: "dGVybToyMTk=", slug: "samsung" },
    { id: "dGVybToyMjY=", slug: "apple" },
    { id: "dGVybToyMjk=", slug: "google" },
    { id: "dGVybToyMjA=", slug: "oneplus" },
    { id: "dGVybToyMjU=", slug: "huawei" },
    { id: "dGVybToyMzk=", slug: "nokia" },
  ],
  Watches: [
    { id: "dGVybToyMzI=", slug: "fitbit" },
    { id: "dGVybToyMjQ=", slug: "amazfit" },
    { id: "dGVybToyMjU=", slug: "huawei" },
  ],
  Laptops: [
    { id: "dGVybToyMjY=", slug: "apple" },
    { id: "dGVybToyMTk=", slug: "samsung" },
  ],
  Speakers: [
    { id: "dGVybToyNDE=", slug: "bose" },
    { id: "dGVybToyMzM=", slug: "beats" },
    { id: "dGVybToyNzA=", slug: "marshals" },
  ],
  PowerBanks: [
    { id: "dGVybToyNDA=", slug: "porodo" },
    { id: "dGVybToyMzg=", slug: "belkin" },
  ],
  Gaming: [
    { id: "dGVybToyMzQ=", slug: "logitech" },
    { id: "dGVybToyNTg=", slug: "tecno" },
    { id: "dGVybToyMjE=", slug: "skullcandy" },
    { id: "dGVybToyMzc=", slug: "green-lion" },
  ],
};
const hardcodedBrandsMobile: {
  [key: string]: {
    id: string;
    slug: string;
  }[];
} = {
  Mobiles: [
    { id: "dGVybToyMTk=", slug: "samsung" },
    { id: "dGVybToyMjY=", slug: "apple" },
    { id: "dGVybToyMjk=", slug: "google" },
    { id: "dGVybToyMjA=", slug: "oneplus" },
    { id: "dGVybToyMjU=", slug: "huawei" },
    { id: "dGVybToyMzk=", slug: "nokia" },
  ],
  Watches: [
    { id: "dGVybToyMzI=", slug: "fitbit" },
    { id: "dGVybToyMjQ=", slug: "amazfit" },
    { id: "dGVybToyMjU=", slug: "huawei" },
  ],
  Laptops: [
    { id: "dGVybToyMjY=", slug: "apple" },
    { id: "dGVybToyMTk=", slug: "samsung" },
  ],
  Speakers: [
    { id: "dGVybToyNDE=", slug: "bose" },
    { id: "dGVybToyMzM=", slug: "beats" },
    { id: "dGVybToyNzA=", slug: "marshals" },
  ],
};

const SectionGridMoreExplore: FC<SectionGridMoreExploreProps> = ({
  className = "",
  boxCard = "box4",
  gridClassName = "grid-cols-2 md:grid-cols-2 xl:grid-cols-3",
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tabActive, setTabActive] =
    useState<keyof typeof hardcodedBrands>("Mobiles");

  const { loading, error, data, refetch } = useQuery(GET_BRANDS);

  const fetchBrandsForCategory = async (category: keyof typeof hardcodedBrands) => {

    try {

      const allSlugs = [];

      for (const category in hardcodedBrands) {
        const brandsInCategory = hardcodedBrands[category];
        for (const brand of brandsInCategory) {
          allSlugs.push(brand.slug);
        }
      }

      console.log('all slugs', allSlugs);

      const { data: fetchedData } = await refetch({
        slug: allSlugs,
      });

      console.log('data', fetchedData);

      if (fetchedData?.brands) {
        setBrands(fetchedData.brands.nodes as Brand[]);
      } else {
        console.log("No brands found for the given slug.");
      }
    } catch (error) {
      console.error('cannot fetch data',error);
    }

  };

  useEffect(() => {
    fetchBrandsForCategory(tabActive);
  }, []);

  const renderHeading = () => {
    return (
      <div>
        <Heading
          className="mb-5 text-neutral-900 lg:mb-10 dark:text-neutral-50"
          fontClass="text-2xl md:text-4xl 2xl:text-5xl font-semibold"
          isCenter
          desc=""
        >
          Start exploring.
        </Heading>
        <Nav
          className="hiddenScrollbar hidden overflow-x-auto rounded-full bg-white p-1 shadow-lg lg:flex dark:bg-neutral-800"
          containerClassName="relative flex justify-center w-full text-sm md:text-base"
        >
          {Object.keys(hardcodedBrands).map((item, index) => (
            <NavItem2
              key={index}
              isActive={tabActive === item}
              onClick={() => {
                setTabActive(item as keyof typeof hardcodedBrands);
              }}
            >
              <div className="flex items-center justify-center space-x-1.5 text-xs sm:space-x-2.5 sm:text-sm ">
                <span>{item}</span>
              </div>
            </NavItem2>
          ))}
        </Nav>
        <Nav
          className="hiddenScrollbar overflow-x-auto rounded-full bg-white p-1 shadow-lg lg:hidden dark:bg-neutral-800"
          containerClassName="mb-5 lg:mb-14 relative flex justify-center w-full text-sm md:text-base"
        >
          {Object.keys(hardcodedBrandsMobile).map((item, index) => (
            <NavItem2
              key={index}
              isActive={tabActive === item}
              onClick={() => {
                setTabActive(item as keyof typeof hardcodedBrands);
              }}
            >
              <div className="flex items-center justify-center space-x-1.5 text-xs sm:space-x-2.5 sm:text-sm ">
                <span>{item}</span>
              </div>
            </NavItem2>
          ))}
        </Nav>
      </div>
    );
  };

  const modifySlugForLaptops = (brandSlug: string): string => {
    if (brandSlug === "apple" && tabActive === "Laptops") {
      return "collections/macbooks";
    }
    return brandSlug;
  };

  return (
    <>
      <div
        className={`nc-SectionGridMoreExplore relative hidden rounded-3xl bg-slate-100 p-10 lg:block ${className}`}
        data-nc-id="SectionGridMoreExplore"
      >
        {renderHeading()}
        <div className={`grid gap-4 md:gap-7 ${gridClassName}`}>
          {hardcodedBrands[tabActive]
            ?.map((brand) => brands.find((b) => b.id === brand.id) as Brand)
            ?.filter((n) => n !== undefined)
            .map((brand, index) => (
              <div key={brand.id + index}>
                <CardCategory4
                  name={brand.name || ""}
                  desc={brand.description || ""}
                  key={brand.id}
                  slug={modifySlugForLaptops(brand.slug || "")}
                  featuredImage={brand?.brandImage || ""}
                />
              </div>
            ))}
        </div>
      </div>
      <div
        className={`nc-SectionGridMoreExplore relative rounded-3xl bg-slate-100 p-3 md:p-5 lg:hidden ${className}`}
        data-nc-id="SectionGridMoreExplore"
      >
        {renderHeading()}
        <div className={`grid gap-4 md:gap-7 ${gridClassName}`}>
          {hardcodedBrandsMobile[tabActive]
            ?.map((brand) => brands.find((b) => b.id === brand.id) as Brand)
            ?.filter((n) => n !== undefined)
            .map((brand, index) => (
              <div key={brand.id + index}>
                <CardCategory4
                  name={brand.name || ""}
                  desc={brand.description || ""}
                  key={brand.id}
                  slug={modifySlugForLaptops(brand.slug || "")}
                  featuredImage={brand?.brandImage || ""}
                />
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default SectionGridMoreExplore;
