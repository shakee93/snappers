import React, { FC } from "react"
import ButtonPrimary from "shared/Button/ButtonPrimary";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import SiteLogoImage from "@/components/global/brand/SiteLogoImage";
import StoreImageSlider from "./StoreImageSlide"
import { EmblaOptionsType } from "embla-carousel";
import Link from "next/link";
import storePromo from "@/content/store-promo.json";
import { siteConfig } from "@/site.config";

import "styles/embla.css";

export interface SectionPromo1Props {
  className?: string;
}
const OPTIONS: EmblaOptionsType = {}
const SLIDE_COUNT = 4
const SLIDES = Array.from(Array(SLIDE_COUNT).keys())
const SectionPromo1: FC<SectionPromo1Props> = ({ className = "" }) => {

  return (
    <div className="bg-blue-100 flex flex-col justify-between p-5 md:p-12 lg:flex-row gap-5 lg:gap-3 rounded-3xl">
      <div className="lg:w-1/2 w-full gap-4 justify-center flex flex-col">
        <div>
          <SiteLogoImage className="h-20 w-auto lg:h-20" />
        </div>
        <h2 className="font-semibold text-2xl sm:text-4xl leading-[1.2] tracking-tight">
          This is Our Store! <br />
          Together We Shine.
        </h2>
        <span className="block text-slate-500 dark:text-slate-400 ">
          {storePromo.description.replaceAll("{brand}", siteConfig.brand.name)}
        </span>
        <div className="flex space-x-2 sm:space-x-5 ">
          <Link href="/collections/all">
            <ButtonPrimary className="">
              Shop Now 
            </ButtonPrimary>
          </Link>
          <Link href="/collections/all">
            <ButtonSecondary
              className="border border-slate-100 dark:border-slate-700"
            >
              Discover more
            </ButtonSecondary>
          </Link>
        </div>
      </div>
      <div className="w-full lg:w-1/2 m-auto">
        <StoreImageSlider slides={SLIDES} options={OPTIONS} />
      </div>
    </div>
  );
};

export default SectionPromo1;
