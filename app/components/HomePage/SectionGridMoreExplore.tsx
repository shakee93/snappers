'use client'

import CardCategory1 from "@/app/components/CardCategories/CardCategory1";
import CardCategory4 from "@/app/components/CardCategories/CardCategory4";
import Heading from "@/app/components/Heading/Heading";
import NavItem2 from "@/app/components/HomePage/NavItem2";
import React, { FC, useState, useEffect } from "react";
import Nav from "@/app/components/HomePage/Nav";
import explore1Svg from "@/public/images/collections/explore1.svg";
import explore2Svg from "@/public/images/collections/explore2.svg";
import explore3Svg from "@/public/images/collections/explore3.svg";
import explore4Svg from "@/public/images/collections/explore4.svg";
import explore5Svg from "@/public/images/collections/explore5.svg";
import explore6Svg from "@/public/images/collections/explore6.svg";
import explore7Svg from "@/public/images/collections/explore7.svg";
import explore8Svg from "@/public/images/collections/explore8.svg";
import explore9Svg from "@/public/images/collections/explore9.svg";
//
import explore1Png from "@/public/images/collections/explore1.png";
import explore2Png from "@/public/images/collections/explore2.png";
import explore3Png from "@/public/images/collections/explore3.png";
import explore4Png from "@/public/images/collections/explore4.png";
import explore5Png from "@/public/images/collections/explore5.png";
import explore6Png from "@/public/images/collections/explore6.png";
import explore7Png from "@/public/images/collections/explore7.png";
import explore8Png from "@/public/images/collections/explore8.png";
import explore9Png from "@/public/images/collections/explore9.png";
import CardCategory6 from "components/CardCategories/CardCategory6";

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
import {useLazyQuery, useQuery} from "@apollo/client";
import { GET_PRODUCTS, GET_BRANDS } from "@/graphql/defs/products";
import { GET_BRAND_DETAILS } from "@/graphql/defs/products";
import {Brand} from "@/graphql/types/graphql";


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

export const DEMO_MORE_EXPLORE_DATA = [
  {
    id: 1,
    name: "Backpack",
    desc: "Manufacturar",
    image: explore1Png,
    svgBg: explore1Svg,
    color: "bg-indigo-50",
  },
  {
    id: 2,
    name: "Shoes",
    desc: "Manufacturar",
    image: explore2Png,
    svgBg: explore2Svg,
    color: "bg-slate-100/80",
  },
  {
    id: 3,
    name: "Recycled Blanket",
    desc: "Manufacturar",
    image: explore3Png,
    svgBg: explore3Svg,
    color: "bg-violet-50",
  },
  {
    id: 4,
    name: "Cycling Shorts",
    desc: "Manufacturar",
    image: explore9Png,
    svgBg: explore9Svg,
    color: "bg-orange-50",
  },
  {
    id: 5,
    name: "Cycling Jersey",
    desc: "Manufacturar",
    image: explore5Png,
    svgBg: explore5Svg,
    color: "bg-blue-50",
  },
  {
    id: 6,
    name: "Car Coat",
    desc: "Manufacturar",
    image: explore6Png,
    svgBg: explore6Svg,
    color: "bg-orange-50",
  },
  {
    id: 7,
    name: "Sunglasses",
    desc: "Manufacturar",
    image: explore7Png,
    svgBg: explore7Svg,
    color: "bg-stone-100",
  },
  {
    id: 8,
    name: "kid hats",
    desc: "Manufacturar",
    image: explore8Png,
    svgBg: explore8Svg,
    color: "bg-blue-50",
  },
  {
    id: 9,
    name: "Wool Jacket",
    desc: "Manufacturar",
    image: explore4Png,
    svgBg: explore4Svg,
    color: "bg-slate-100/80",
  },
];

// const hardcodedBrands = {
//   Mobiles: [
//     { name: "Samsung", id: 'dGVybToyMTk=', slug: "samsung", img: samsung },
//     { name: "Apple", id: 'dGVybToyMjY=', slug: "apple", img: apple },
//     { name: "Google", id: 'dGVybToyMjk=', slug: "google", img: google },
//     { name: "OnePlus", id: 'dGVybToyMjA=', slug: "oneplus", img: oneplus },
//     { name: "Huawei", id: 'dGVybToyMjU=', slug: "huawei", img: huawei },
//     { name: "Nokia", id: 'dGVybToyMzk=', slug: "nokia", img: nokia },
//   ],
//   Watches: [
//     { name: "Fitbit", id: 'dGVybToyMzI=', slug: "fitbit", img: fitbit },
//     { name: "Amazfit", id: 'dGVybToyMjQ=', slug: "amazfit", img: amazfit },
//     { name: "Huawei", id: 'dGVybToyMjU=', slug: "huawei", img: huawei },
//   ],
//   Laptops: [
//     { name: "Apple", id: 'dGVybToyMjY=', slug: "apple", img: apple },
//     { name: "Samsung", id: 'dGVybToyMTk=', slug: "samsung", img: samsung },
//   ],
//   Speakers: [
//     { name: "Bose", id: 'dGVybToyNDE=', slug: "bose", img: bose },
//     { name: "Beats", id: 'dGVybToyMzM=', slug: "beats", img: beats },
//     { name: "Meimi", id: 'dGVybToyNzA=', slug: "meimi", img: '' },
//   ],
//   PowerBanks: [
//     { name: "Porodo", id: 'dGVybToyNDA=', slug: "porodo", img: porodo },
//     { name: "Belkin", id: 'dGVybToyMzg=', slug: "belkin", img: belkin },
//   ],
//   Gaming: [
//     { name: "Logitech", id: 'dGVybToyMzQ=', slug: "logitech", img: logitech },
//     { name: "Tec", id: 'dGVybToyNTg=', slug: "tecno", img: tecno },
//     { name: "Skull", id: 'dGVybToyMjE=', slug: "skullcandy", img: skullcandy },
//     { name: "Green Lion", id: 'dGVybToyMzc=', slug: "green-lion", img: greenlion },
//   ],

// };


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
    { name: "Mimi", id: 'dGVybToyNzA=', slug: "meimi", img: '' },
  ],
  PowerBanks: [
    { name: "orodo", id: 'dGVybToyNDA=', slug: "porodo", img: porodo },
    { name: "Blkin", id: 'dGVybToyMzg=', slug: "belkin", img: belkin },
  ],
  Gaming: [
    { name: "Loitech", id: 'dGVybToyMzQ=', slug: "logitech", img: logitech },
    { name: "Tec", id: 'dGVybToyNTg=', slug: "tecno", img: tecno },
    { name: "Skull", id: 'dGVybToyMjE=', slug: "skullcandy", img: skullcandy },
    { name: "Green Lion", id: 'dGVybToyMzc=', slug: "green-lion", img: greenlion },
  ],

};

const SectionGridMoreExplore: FC<SectionGridMoreExploreProps> = ({
  className = "",
  boxCard = "box4",
  gridClassName = "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  // data = DEMO_MORE_EXPLORE_DATA.filter((_, i) => i < 6),
}) => {

  const [getBrands, { loading, error, data, refetch }] = useLazyQuery(GET_BRANDS);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [tabActive, setTabActive] = useState<keyof typeof hardcodedBrands>("Mobiles");

  const fetchBrandsForCategory = async (category: keyof typeof hardcodedBrands) => {
    try {
      const hardcodedBrandList = hardcodedBrands[category] || [];
      const slugs = hardcodedBrandList.map((brand) => brand.slug);
      console.log('Brand Slugs:', slugs);
  
      const { data: fetchedData } = await getBrands({
        variables: {
          slug: hardcodedBrandList.map(h => h.slug)
        }
      });
  
      const fetchedBrandsFromServer: Brand[] = fetchedData?.brands.nodes || [];

      // console.log('Fetched Brands:', fetchedBrands);
      setBrands(fetchedBrandsFromServer);
    } catch (error) {
      console.error(`Error fetching brands for ${category}`, error);
    }
  };
  
  useEffect(() => {
    fetchBrandsForCategory(tabActive);
  }, [tabActive]);

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
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionGridMoreExplore;
