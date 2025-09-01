"use client";
import React from "react";
import LeftSlider from "./LeftSlider";
import MainSlider from "./MainSlider";
import FeatureProductCard from "./FeatureProductCard";
import SaleProductCard from "./SaleProductCard";
import VideoSection from "./VideoSection";

// GraphQL Data Interfaces
interface SlideType {
  image: string;
  url: string;
}

interface SideSliderType {
  image: string;
  url: string;
}

interface FeaturesSlideType {
  name: string;
  price: string;
  imageUrl: string;
  currency: string;
  slug: string;
  regularPrice: string;
  salePrice: string;
}

interface SaleProductType {
  name: string;
  price: string;
  imageUrl: string;
  currency: string;
  slug: string;
  regularPrice: string;
  salePrice: string;
}

interface TiktokVideoType {
  tiktokLink: string;
  videoUrl: string;
  productLink: string;
}

interface BentoSliderData {
  mainSlidesMiddleRows: {
    slides: SlideType[];
  }[];
  sideSlider: SideSliderType[];
  featuresSlide: FeaturesSlideType;
  saleProduct: SaleProductType;
  tiktokVideo: TiktokVideoType;
}

export interface SectionHero4Props {
  className?: string;
  data?: BentoSliderData;
}

const SectionHero4 = ({ className = "", data }: SectionHero4Props) => {
  console.log("data", data);
  // console.log("mainSlidesMiddleRows", data?.mainSlidesMiddleRows);
  // console.log("slides", data?.mainSlidesMiddleRows?.[0]?.slides);

  // Map GraphQL data to slider data
  const sliderData =
    data?.mainSlidesMiddleRows?.[0]?.slides?.map((slide, index) => ({
      id: `slide-${index}`,
      image: slide.image,
      alt: `Hero Main ${index + 1}`,
      link: slide.url,
    })) || [];

  // console.log("sliderData", sliderData);
  // console.log("sliderData.length", sliderData.length);

  // Map GraphQL data to left slider data
  const leftSliderData =
    data?.sideSlider?.map((slide, index) => ({
      id: `left-${index}`,
      image: slide.image,
      alt: `Left Hero ${index + 1}`,
      link: slide.url,
    })) || [];

  // Get feature slide data
  const featureSlideData = data?.featuresSlide || {
    name: "",
    price: "0",
    imageUrl: "",
    currency: "LKR",
    slug: "",
    regularPrice: "",
    salePrice: "",
  };

  // Get sale product data
  const saleProductData = data?.saleProduct || {
    name: "",
    price: "0",
    imageUrl: "",
    currency: "LKR",
    slug: "",
    regularPrice: "",
    salePrice: "",
  };

  // Get video URL
  const videoUrl = data?.tiktokVideo?.videoUrl || "";
  const tiktokLink = data?.tiktokVideo?.tiktokLink || "";
  const productLink = data?.tiktokVideo?.productLink || "";

  console.log("safeCurrentSlide", 0);

  return (
    <div>
      <div className="flex container w-full mx-auto mt-5 md:mt-10 gap-4 xl:gap-6 lg:h-[400px] xl:h-[500px]">
        {/* Left Column Slider */}
        <LeftSlider slides={leftSliderData} />

        {/* Center Column Slider */}
        <div className="w-full lg:w-3/5 h-full gap-4 xl:gap-6 flex flex-col">
          <MainSlider slides={sliderData} />
          
          <div className="flex w-full h-[150px] gap-4 md:gap-6 rounded-[18px]">
            {/* Feature Product Card */}
            <FeatureProductCard product={featureSlideData} />

            {/* Sale Product Card */}
            <SaleProductCard product={saleProductData} tiktokLink={tiktokLink} />
          </div>
        </div>

        {/* Video Section */}
        <VideoSection videoUrl={videoUrl} tiktokLink={tiktokLink} productLink={productLink} />
      </div>
    </div>
  );
};

export default SectionHero4;
