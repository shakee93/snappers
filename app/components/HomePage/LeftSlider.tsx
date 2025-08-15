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

interface LeftSliderProps {
  slides: SlideType[];
}

const LeftSlider = ({ slides }: LeftSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLeftSliderHovered, setIsLeftSliderHovered] = useState(false);

  // Auto-slide functionality for left slider
  useInterval(
    () => {
      if (isAutoPlaying && !isLeftSliderHovered && slides.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    },
    isAutoPlaying && !isLeftSliderHovered && slides.length > 0 ? 7000 : null
  );

  const goToLeftSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleSlideClick = (link: string) => {
    if (link) {
      window.location.href = link;
    }
  };

  const safeCurrentSlide = slides.length > 0 ? Math.min(currentSlide, Math.max(0, slides.length - 1)) : 0;

  if (slides.length === 0) return null;

  return (
    <div 
      className="w-1/5 hidden lg:block flex-shrink-0 h-full rounded-[18px] overflow-hidden relative"
      onMouseEnter={() => setIsLeftSliderHovered(true)}
      onMouseLeave={() => setIsLeftSliderHovered(false)}
    >
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
          onClick={() => handleSlideClick(slides[safeCurrentSlide]?.link)}
        >
          <Image
            src={slides[safeCurrentSlide]?.image || ""}
            alt={slides[safeCurrentSlide]?.alt || ""}
            width={1000}
            height={1000}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Left Column Dot Navigation */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToLeftSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === safeCurrentSlide
                ? "bg-primaryColor w-4"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to left slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LeftSlider; 