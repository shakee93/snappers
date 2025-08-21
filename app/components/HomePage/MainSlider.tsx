"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useInterval from "react-use/lib/useInterval";
import Image from "next/image";

interface SlideType {
  id: string;
  image: string;
  alt: string;
  link: string;
}

interface MainSliderProps {
  slides: SlideType[];
}

const MainSlider = ({ slides }: MainSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMainSliderHovered, setIsMainSliderHovered] = useState(false);

  // Auto-slide functionality for main slider
  useInterval(
    () => {
      if (isAutoPlaying && !isMainSliderHovered && slides.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    },
    isAutoPlaying && !isMainSliderHovered && slides.length > 0 ? 6000 : null
  );

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 1000);
  };

  const handleSlideClick = (link: string) => {
    if (link) {
      window.location.href = link;
    }
  };

  const safeCurrentSlide = slides.length > 0 ? Math.min(currentSlide, Math.max(0, slides.length - 1)) : 0;

  return (
    <div 
      className="w-full rounded-[18px] overflow-hidden relative aspect-[16/9] min-h-[200px] group"
      onMouseEnter={() => setIsMainSliderHovered(true)}
      onMouseLeave={() => setIsMainSliderHovered(false)}
    >
      {slides.length > 0 ? (
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
              className={`w-full h-full absolute inset-0 overflow-hidden ${
                slides[safeCurrentSlide]?.link ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => slides[safeCurrentSlide]?.link && handleSlideClick(slides[safeCurrentSlide].link)}
            >
              <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-110">
                <Image 
                  src={slides[safeCurrentSlide]?.image || ""} 
                  alt={slides[safeCurrentSlide]?.alt || ""} 
                  width={1200} 
                  height={900} 
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:brightness-110" 
                />
              </div>
              {/* Overlay effect on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-700 ease-out"></div>
            </motion.div>
          </AnimatePresence>
          
          {/* Center Dot Navigation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === safeCurrentSlide
                    ? "bg-primaryColor w-4"
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
  );
};

export default MainSlider; 