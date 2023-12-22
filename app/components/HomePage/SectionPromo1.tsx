import React, { FC } from "react";
import Slider from "react-slick";
import NcImage from "shared/NcImage/NcImage";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import SiteLogo from "@/public/global/logo.webp";
import Image from "next/image"

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import rightImgDemo from "@/public/images/rightLargeImg.png";
import rightLargeImgDark from "@/public/images/rightLargeImgDark.png";
import StoreImg1 from "public/store/GqMobiles-Buy-geniune-branded-eletronics-from-GQMobiles-for-best-price-1-1.webp";
import StoreImg2 from "public/store/GqMobiles-Buy-geniune-branded-eletronics-from-GQMobiles-for-best-price-2-1.webp";
import StoreImg3 from "public/store/GqMobiles-Buy-geniune-branded-eletronics-from-GQMobiles-for-best-price-3.webp";
import StoreImg4 from "public/store/GqMobiles-Buy-geniune-branded-eletronics-from-GQMobiles-for-best-price-4-1.webp";
import Prev from "@/shared/NextPrev/Prev";
import Next from "@/shared/NextPrev/Next";

export interface SectionPromo1Props {
  className?: string;
}

const SectionPromo1: FC<SectionPromo1Props> = ({ className = "" }) => {
  const sliderImages = [StoreImg1, StoreImg2, StoreImg3, StoreImg4];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Enable autoplay
    autoplaySpeed: 3000, // Set autoplay speed in milliseconds (e.g., 3000ms = 3 seconds)
  };

  return (
    <div
      className={`nc-SectionPromo1 relative flex flex-col  lg:flex-row items-center w-full ${className}`}
      data-nc-id="SectionPromo1"
    >
      <div className="relative flex-shrink-0 mb-16 lg:mb-0 lg:mr-10 lg:w-2/5">
      <Image
        width={320}
        height={266}
        src={SiteLogo}
        alt="logo"
        className="h-20 lg:h-32 w-auto"
      ></Image>
        <h2 className="font-semibold text-3xl sm:text-4xl xl:text-5xl 2xl:text-5xl mt-6 sm:mt-10 !leading-[1.2] tracking-tight">
          This is Our Store! <br />
          Together We Shine.
        </h2>
        <span className="block mt-6 text-slate-500 dark:text-slate-400 ">
          Located in the heart of Colombo, you can visit out GQ The Mobile Store
          Unlimited stores and experience the greatest purchase experience in
          Sri Lanka for an affordable price
        </span>
        <div className="flex space-x-2 sm:space-x-5 mt-6 sm:mt-12">
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
      <div className="relative flex-1 w-1/2 h-full">
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
    </div>
  );
};

export default SectionPromo1;
