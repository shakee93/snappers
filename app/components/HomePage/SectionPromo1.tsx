"use client";
import React, { FC } from "react";
import Slider from "react-slick";
import NcImage from "shared/NcImage/NcImage";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import SiteLogo from "@/public/global/logo.webp";
import Image from "next/image";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import StoreImg1 from "public/store/GqMobiles-Buy-geniune-branded-eletronics-from-GQMobiles-for-best-price-1-1.webp";
import StoreImg2 from "public/store/GqMobiles-Buy-geniune-branded-eletronics-from-GQMobiles-for-best-price-2-1.webp";
import StoreImg3 from "public/store/GqMobiles-Buy-geniune-branded-eletronics-from-GQMobiles-for-best-price-3.webp";
import StoreImg4 from "public/store/GqMobiles-Buy-geniune-branded-eletronics-from-GQMobiles-for-best-price-4-1.webp";
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import StoreImageSlider from "./StoreImageSlide"
import { EmblaOptionsType } from 'embla-carousel-react'


export interface SectionPromo1Props {
  className?: string;
}
const OPTIONS: EmblaOptionsType = {}
const SLIDE_COUNT = 4
const SLIDES = Array.from(Array(SLIDE_COUNT).keys())
const SectionPromo1: FC<SectionPromo1Props> = ({ className = "" }) => {
  const sliderImages = [StoreImg1, StoreImg2, StoreImg3, StoreImg4];

  // const settings = {
  //   dots: false,
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   autoplay: true, // Enable autoplay
  //   autoplaySpeed: 3000, // Set autoplay speed in milliseconds (e.g., 3000ms = 3 seconds)
  // };
    const [emblaRef] = useEmblaCarousel({ loop: false }, [Autoplay()])

    
  return (
    <div className="  bg-blue-100 flex flex-col justify-between p-12 lg:flex-row gap-5 lg:gap-3 rounded-3xl">
      <div className="lg:w-1/2 w-full gap-4 justify-center flex flex-col">
        {/* <div>
          <Image
            width={320}
            height={266}
            src={SiteLogo}
            alt="logo"
            className="h-20 lg:h-20 w-auto"
          />
        </div> */}

        <h2 className="font-semibold text-2xl sm:text-4xl leading-[1.2] tracking-tight">
          This is Our Store! <br />
          Together We Shine.
        </h2>
        <span className="block text-slate-500 dark:text-slate-400 ">
          Located in the heart of Colombo, you can visit out GQ The Mobile Store
          Unlimited stores and experience the greatest purchase experience in
          Sri Lanka for an affordable price
        </span>
        <div className="flex space-x-2 sm:space-x-5 ">
          <ButtonPrimary href="/page-collection" className="">
            Shop Now
          </ButtonPrimary>
          <ButtonSecondary
            href="/page-search"
            className="border border-slate-100 dark:border-slate-700"
          >
            Discover more
          </ButtonSecondary>
        </div>
      </div>
      <div className="w-full lg:w-1/2 m-auto">
        <StoreImageSlider slides={SLIDES} options={OPTIONS}/>
      </div>
      {/* <div
      className={`nc-SectionPromo1 lg:max-h-[400px]  flex flex-col  lg:flex-row items-center w-full ${className}`}
      data-nc-id="SectionPromo1"
    >
      <div className="relative flex-shrink-0 mb-16 lg:mb-0 lg:mr-10 p-2 md:w-10/12 lg:w-2/5">
      <Image
        width={320}
        height={266}
        src={SiteLogo}
        alt="logo"
        className="h-20 lg:h-28 w-auto"
      ></Image>
        <h2 className="font-semibold text-2xl sm:text-3xl xl:text-4xl 2xl:text-4xl mt-6 sm:mt-10 !leading-[1.2] tracking-tight">
          This is Our Store! <br />
          Together We Shine.
        </h2>
        <span className="block mt-6 text-slate-500 dark:text-slate-400 ">
          Located in the heart of Colombo, you can visit out GQ The Mobile Store
          Unlimited stores and experience the greatest purchase experience in
          Sri Lanka for an affordable price
        </span>
        <div className="flex space-x-2 sm:space-x-5 mt-4 sm:mt-8">
          <ButtonPrimary href="/page-collection" className="">
            Shop Now
          </ButtonPrimary>
          <ButtonSecondary
            href="/page-search"
            className="border border-slate-100 dark:border-slate-700"
          >
            Discover more
          </ButtonSecondary>
        </div>
      </div>
      <div className="relative flex-1 w-full md:w-10/12 lg:3/5 ">
        <Slider {...settings}>
          {sliderImages.map((image, index) => (
            <NcImage
              key={index}
              containerClassName="block object-cover rounded-3xl"
              src={image}
              className="rounded-3xl"
            />
          ))}
        </Slider>
      </div>
    </div> */}
    </div>
  );
};

export default SectionPromo1;
