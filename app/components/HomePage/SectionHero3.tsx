"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const desktopSlidesData = [
  {
    id: "1",
    backgroundColor: "#ffffff",
    featureImage:
      "http://api.gqmobiles.lk/wp-content/uploads/2024/03/Desktop.jpg",
  },
];

const tabletSlidesData = [
  {
    id: "1",
    backgroundColor: "#ffffff",
    featureImage:
      "http://api.gqmobiles.lk/wp-content/uploads/2024/03/Tab.jpg",
  },
];

const mobileSlidesData = [
  {
    id: "1",
    backgroundColor: "#ffffff",
    featureImage:
      "http://api.gqmobiles.lk/wp-content/uploads/2024/03/Moble.jpg",
  },
 
];

const SectionHero3 = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 600);
      setIsTablet(width >= 601 && width <= 768); // Assuming tablet width range
    };

    handleResize(); // Initialize isMobile and isTablet on mount

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const slidesData = isMobile
    ? mobileSlidesData
    : isTablet
    ? tabletSlidesData
    : desktopSlidesData;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isHovering) {
      interval = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slidesData.length);
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [currentSlide, isHovering, slidesData]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slidesData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? slidesData.length - 1 : prevSlide - 1
    );
  };

  return (
    <div
      className="relative max-h-[550px] min-h-[450px] md:min-h-[500px] lg:min-h-[550px]  overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {slidesData.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentSlide
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          style={{ backgroundColor: slide.backgroundColor }}
        >
          <Image
            src={slide.featureImage}
            alt={`Slide ${index + 1}`}
            className="mx-auto"
            layout="fill"
            objectFit="contain"
          />
        </div>
      ))}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-[#1d4ed8] text-white px-1 py-1 rounded-full focus:outline-none z-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-10 w-auto " />
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-[#1d4ed8] text-white px-1 py-1 rounded-full focus:outline-none z-10"
        onClick={nextSlide}
      >
        <ChevronRight className="h-10 w-auto " />
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slidesData.map((_, index) => (
          <button
            key={index}
            className={`w-4 h-4 rounded-full ${
              index === currentSlide ? "bg-gray-800" : "bg-gray-400"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default SectionHero3;
