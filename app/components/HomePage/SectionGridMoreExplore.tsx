'use client'

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


const hardcodedBrands = {
  Mobiles: [
    { name: "Sam", id: 'dGVybToyMTk=', slug: "samsung", img: samsung },
    { name: "Ape", id: 'dGVybToyMjY=', slug: "apple", img: apple },
    { name: "Ggle", id: 'dGVybToyMjk=', slug: "google", img: google },
    { name: "OePlus", id: 'dGVybToyMjA=', slug: "oneplus", img: oneplus },
    { name: "Hawei", id: 'dGVybToyMjU=', slug: "huawei", img: huawei },
    { name: "Nia", id: 'dGVybToyMzk=', slug: "nokia", img: nokia },
  ],
  Watches: [
    { name: "Fbit", id: 'dGVybToyMzI=', slug: "fitbit", img: fitbit },
    { name: "azfit", id: 'dGVybToyMjQ=', slug: "amazfit", img: amazfit },
    { name: "Hei", id: 'dGVybToyMjU=', slug: "huawei", img: huawei },
  ],
  Laptops: [
    { name: "pple", id: 'dGVybToyMjY=', slug: "apple", img: apple },
    { name: "Smsung", id: 'dGVybToyMTk=', slug: "samsung", img: samsung },
  ],
  Speakers: [
    { name: "ose", id: 'dGVybToyNDE=', slug: "bose", img: bose },
    { name: "ats", id: 'dGVybToyMzM=', slug: "beats", img: beats },
    { name: "Mimi", id: 'dGVybToyNzA=', slug: "marshals", img: '' },
  ],
  PowerBanks: [
    { name: "orodo", id: 'dGVybToyNDA=', slug: "porodo", img: porodo },
    { name: "Blkin", id: 'dGVybToyMzg=', slug: "belkin", img: belkin },
    { name: "Blkin", id: 'dGVybToyMzg=', slug: "anker", img: '' },
  ],
  Gaming: [
    { name: "Loitech", id: 'dGVybToyMzQ=', slug: "logitech", img: logitech },
    { name: "Tec", id: 'dGVybToyNTg=', slug: "tecno", img: tecno },
    { name: "Skull", id: 'dGVybToyMjE=', slug: "skullcandy", img: skullcandy },
    { name: "Green Lion", id: 'dGVybToyMzc=', slug: "green-lion", img: greenlion },
    { name: "Green Lion", id: 'dGVybToyMzc=', slug: "nintendo", img: '' },
  ],

};

const SectionGridMoreExplore: FC<SectionGridMoreExploreProps> = ({
  className = "",
  boxCard = "box4",
  gridClassName = "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
}) => {

  const [brands, setBrands] = useState<any[]>([]);
  const [tabActive, setTabActive] = useState<keyof typeof hardcodedBrands>("Mobiles");

  const { loading, error, data, refetch } = useQuery(GET_BRANDS);

  const fetchBrandsForCategory = async (category: keyof typeof hardcodedBrands) => {
    try {
      const hardcodedBrandList = hardcodedBrands[category] || [];
      const slugs = hardcodedBrandList.map((brand) => brand.slug);

      const { data: fetchedData } = await refetch({
        
          slug: slugs
        
      });

      const fetchedBrandsFromServer: Brand[] = fetchedData?.brands.nodes || [];

      console.log({ fetchedBrandsFromServer });

      const updatedBrands = fetchedBrandsFromServer.map((serverBrand) => {
        return {
          ...serverBrand,
          img: serverBrand.brandImage || '',
        };
      });

      setBrands(updatedBrands);
    } catch (error) {
      console.error(`Error fetching brands for ${category}`, error);
    }

    console.log({ brands })
  };

  useEffect(() => {
    fetchBrandsForCategory(tabActive);
  }, [tabActive]);

  useEffect(() => {
    console.log({ brands });
  }, [brands]);

  const renderHeading = () => {
    return (
      <div>
        <Heading
          className="mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50"
          fontClass="text-3xl md:text-4xl 2xl:text-5xl font-semibold"
          isCenter
          desc=""
        >
          Start exploring.
        </Heading>
        <Nav
          className="p-1 bg-white dark:bg-neutral-800 rounded-full shadow-lg overflow-x-auto hiddenScrollbar"
          containerClassName="mb-12 lg:mb-14 relative flex justify-center w-full text-sm md:text-base"
        >
          {Object.keys(hardcodedBrands).map((item, index) => (
            <NavItem2
              key={index}
              isActive={tabActive === item}
              onClick={() => {
                setTabActive(item as keyof typeof hardcodedBrands);
              }}
            >
              <div className="flex items-center justify-center space-x-1.5 sm:space-x-2.5 text-xs sm:text-sm ">
                {/* <span
                  className="inline-block"
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                ></span> */}
                <span>{item}</span>
              </div>
            </NavItem2>
          ))}
        </Nav>
      </div>
    );
  };

  return (
    <div
      className={`nc-SectionGridMoreExplore relative ${className}`}
      data-nc-id="SectionGridMoreExplore"
    >
      {renderHeading()}
      <div className={`grid gap-4 md:gap-7 ${gridClassName}`}>
        {brands?.map((brand) => (
          <div key={brand.id}>
            <CardCategory4
              name={brand.name || ''}
              desc={brand.description || ''}
              key={brand.id}
              slug={brand.slug || ''}
              featuredImage={brand?.brandImage}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionGridMoreExplore;
