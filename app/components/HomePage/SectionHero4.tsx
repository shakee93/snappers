"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useInterval from "react-use/lib/useInterval";
import Image from "next/image";
import Link from "next/link";
import { GET_BENTO_SLIDER, GET_PRODUCTS_NODES } from "@/graphql/defs/products";

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
}

interface SaleProductType {
  name: string;
}

interface TiktokVideoType {
  tiktokLink: string;
  videoUrl: string;
}

interface BentoSliderData {
  mainSlidesMiddleRows: {
    slides: SlideType[];
  }[];
  sideSlider: SideSliderType[];
  featuresSlide: FeaturesSlideType[];
  saleProduct: SaleProductType[];
  tiktokVideo: TiktokVideoType;
}

export interface SectionHero4Props {
  className?: string;
  data?: BentoSliderData;
}

const SectionHero4 =  ({ className = "", data }: SectionHero4Props) => {

  console.log("data", data);
  console.log("mainSlidesMiddleRows", data?.mainSlidesMiddleRows);
  console.log("slides", data?.mainSlidesMiddleRows?.slides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentLeftSlide, setCurrentLeftSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Slider hover state
  const [isMainSliderHovered, setIsMainSliderHovered] = useState(false);
  const [isLeftSliderHovered, setIsLeftSliderHovered] = useState(false);

  // Map GraphQL data to slider data
  const sliderData = data?.mainSlidesMiddleRows?.[0]?.slides?.map((slide, index) => ({
    id: `slide-${index}`,
    image: slide.image,
    alt: `Hero Main ${index + 1}`,
    link: slide.url,
  })) || [];

  console.log("sliderData", sliderData);
  console.log("sliderData.length", sliderData.length);

  // Map GraphQL data to left slider data
  const leftSliderData = data?.sideSlider?.map((slide, index) => ({
    id: `left-${index}`,
    image: slide.image,
    alt: `Left Hero ${index + 1}`,
    link: slide.url,
  })) || [];

  // Get feature slide name
  const featureSlideName = data?.featuresSlide?.[0]?.name || "";
  
  // Get sale product name
  const saleProductName = data?.saleProduct?.[0]?.name || "";
  
  // Get video URL
  const videoUrl = data?.tiktokVideo?.videoUrl || "";

  // Ensure current indices are within bounds
  const safeCurrentSlide = sliderData.length > 0 ? Math.min(currentSlide, Math.max(0, sliderData.length - 1)) : 0;
  const safeCurrentLeftSlide = leftSliderData.length > 0 ? Math.min(currentLeftSlide, Math.max(0, leftSliderData.length - 1)) : 0;

  console.log("safeCurrentSlide", safeCurrentSlide);

  // Auto-slide functionality for main slider
  useInterval(
    () => {
      if (isAutoPlaying && !isMainSliderHovered && sliderData.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % sliderData.length);
      }
    },
    isAutoPlaying && !isMainSliderHovered && sliderData.length > 0 ? 5000 : null
  );

  // Auto-slide functionality for left slider
  useInterval(
    () => {
      if (isAutoPlaying && !isLeftSliderHovered && leftSliderData.length > 0) {
        setCurrentLeftSlide((prev) => (prev + 1) % leftSliderData.length);
      }
    },
    isAutoPlaying && !isLeftSliderHovered && leftSliderData.length > 0 ? 7000 : null
  );

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 1000);
  };

  const goToLeftSlide = (index: number) => {
    setCurrentLeftSlide(index);
  };

  const handleSlideClick = (link: string) => {
    if (link) {
      window.location.href = link;
    }
  };

  // Video state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Video control handlers
  const handleVideoMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const handleVideoMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const openVideoLink = () => {
    const tiktokLink = data?.tiktokVideo?.tiktokLink;
    if (tiktokLink) {
      window.open(tiktokLink, "_blank");
    }
  };

  return (
    <div>
      <div className="flex container w-full mx-auto mt-10 gap-6 h-[440px]">
        {/* Left Column Slider */}
        {leftSliderData.length > 0 && (
          <div 
            className="w-1/5 flex-shrink-0 h-full rounded-[18px] overflow-hidden relative"
            onMouseEnter={() => setIsLeftSliderHovered(true)}
            onMouseLeave={() => setIsLeftSliderHovered(false)}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={safeCurrentLeftSlide}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ 
                  duration: 0.5,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
                className="w-full h-full absolute inset-0 cursor-pointer"
                onClick={() => handleSlideClick(leftSliderData[safeCurrentLeftSlide]?.link)}
              >
                <Image
                  src={leftSliderData[safeCurrentLeftSlide]?.image || ""}
                  alt={leftSliderData[safeCurrentLeftSlide]?.alt || ""}
                  width={1000}
                  height={1000}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          
          {/* Left Column Dot Navigation */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {leftSliderData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToLeftSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === safeCurrentLeftSlide
                    ? "bg-white scale-110"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to left slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        )}

        {/* Center Column Slider */}
        <div className="w-3/5 h-full gap-6 flex flex-col">
          <div 
            className="w-full rounded-[18px] overflow-hidden relative min-h-[285px]"
            onMouseEnter={() => setIsMainSliderHovered(true)}
            onMouseLeave={() => setIsMainSliderHovered(false)}
          >
            {sliderData.length > 0 ? (
              <>
                <AnimatePresence initial={false}>
                  <motion.div
                    key={safeCurrentSlide}
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ 
                      duration: 0.5,
                      ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="w-full h-full absolute inset-0 cursor-pointer"
                    onClick={() => handleSlideClick(sliderData[safeCurrentSlide]?.link)}
                  >
                    <Image 
                      src={sliderData[safeCurrentSlide]?.image || ""} 
                      alt={sliderData[safeCurrentSlide]?.alt || ""} 
                      width={1200} 
                      height={900} 
                      className="w-full h-full object-cover" 
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Center Dot Navigation */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {sliderData.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === safeCurrentSlide
                          ? "bg-white scale-110"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No slider data available</p>
              </div>
            )}
          </div>
          <div className="w-full h-[130px] flex gap-6 rounded-[18px]">
            {/* Feature Product Card */}
            <Link
              href="/products/feature-product"
              className="w-2/5 h-full rounded-[18px] overflow-hidden relative bg-cover bg-center bg-no-repeat block hover:scale-105 transition-transform duration-200"
              style={{
                backgroundImage: `url('/26a4364176f55a26a4e202d074deba8b294a1b89.jpg')`
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <div className="w-full h-full items-end flex p-2 relative z-10">
                <div className="flex items-center w-full ">
                  <div className="text-white flex flex-col w-full justify-center items-center">
                    <div className="text-xs font-semibold leading-normal">
                      {featureSlideName}
                    </div>
                    <div className="text-[10px] font-[400] leading-[12px]">
                      305,900 LKR
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    20% OFF
                  </div>
                </div>
              </div>
            </Link>

            {/* Sale Product Card */}
            <div className="w-3/5 h-full bg-white rounded-[18px] overflow-hidden relative border border-gray-200">
              <div className="w-full h-full flex items-center justify-between p-2">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg overflow-hidden">
                    <Image
                      src="/32d001bb62499c4283e0ea3ea0c92d55ece10b5b.png"
                      alt={saleProductName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col w-full gap-2">
                    <div className="text-sm font-semibold">
                      {saleProductName}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#D71E1E] font-medium leading-none line-through text-[9px]">
                        50,000 LKR
                      </span>
                      <span className="text-[#1B40AF] font-bold text-[10px] leading-none">
                        42,900 LKR
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <Link href="/tag/clearance">
                    <button className="bg-white border border-[#1B40AF] text-[#1B40AF] text-xs px-4 py-1 rounded-full hover:bg-blue-50 transition-colors">
                      Explore Clearance
                    </button>
                  </Link>
                  <button className="bg-[#1B40AF] text-white text-xs px-4 py-1 rounded-full hover:bg-blue-600 transition-colors">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Section */}
        {videoUrl && (
          <div className="w-1/5 flex-shrink-0 h-full rounded-[18px] overflow-hidden relative bg-black">
            <div className="w-full h-full relative">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover cursor-pointer"
                onMouseEnter={handleVideoMouseEnter}
                onMouseLeave={handleVideoMouseLeave}
                muted
                loop
              >
                Your browser does not support the video tag.
              </video>
            
            {/* Video Controls */}
            <div className="absolute bottom-3 left-3 flex space-x-2">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200"
                aria-label={isVideoPlaying ? "Pause video" : "Play video"}
              >
                {isVideoPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* Mute/Unmute Button */}
              <button
                onClick={toggleMute}
                className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200"
                aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
              >
                {isVideoMuted ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>

              {/* Link Button */}
              <button
                onClick={openVideoLink}
                className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200"
                aria-label="Open video in new tab"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default SectionHero4;
