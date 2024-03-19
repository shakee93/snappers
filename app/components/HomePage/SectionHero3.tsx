"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const desktopSlidesData = [
  {
    id: "2",
    backgroundColor: "#CCE0EF",
    featureImage:
      "http://api.gqmobiles.lk/wp-content/uploads/2024/03/Untitled-design-2024-03-13T155550.163-removebg-preview.png",
  },
  {
    id: "3",
    backgroundColor: "#F4E7E7",
    featureImage:
      "https://api.gqmobiles.lk/wp-content/uploads/2023/12/dlcdnwebimgs.asus_-300x300.png",
  },
  {
    id: "4",
    backgroundColor: "#E2F1F0",
    featureImage:
      "https://api.gqmobiles.lk/wp-content/uploads/2023/12/Layer-1-1-278x300.png",
  },
];

const mobileSlidesData = [
  {
    id: "2",
    backgroundColor: "#CCE0EF",
    featureImage:
      "http://api.gqmobiles.lk/wp-content/uploads/2024/03/Untitled-design-2024-03-13T155550.163-removebg-preview-mobile.png",
  },
  {
    id: "3",
    backgroundColor: "#F4E7E7",
    featureImage:
      "https://api.gqmobiles.lk/wp-content/uploads/2023/12/dlcdnwebimgs.asus_-300x300-mobile.png",
  },
  {
    id: "4",
    backgroundColor: "#E2F1F0",
    featureImage:
      "https://api.gqmobiles.lk/wp-content/uploads/2023/12/Layer-1-1-278x300-mobile.png",
  },
];

const SectionHero3 = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust the width threshold according to your mobile breakpoint
    };

    handleResize(); // Initialize isMobile on mount

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const slidesData = isMobile ? mobileSlidesData : desktopSlidesData;

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
      className="relative max-h-[500px] min-h-[450px] overflow-hidden"
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



