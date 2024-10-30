"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBoolean } from "react-use";
import useInterval from "react-use/lib/useInterval";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Next from "shared/NextPrev/Next";
import Prev from "shared/NextPrev/Prev";

interface SlideType {
  id: string;
  slidePriority: number; // From GraphQL
  mainHeading?: string;
  subHeading?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor: string;
  backgroundImage: string;
  tabletBackgroundImage?: string;
  mobileBackgroundImage?: string;
  contentPosition: string;
}

export interface SectionHero3Props {
  className?: string;
  slides: SlideType[];
}

const SLIDE_DURATION = 5500; // Slider duration in milliseconds

let TIME_OUT: NodeJS.Timeout | null = null;

const SectionHero3 = ({ className = "", slides }: SectionHero3Props) => {
  // Sort slides according to priority
  const sortedSlides = [...slides].sort((a, b) => {
    const aPriority = Number(a.slidePriority);
    const bPriority = Number(b.slidePriority);

    if (aPriority === 1) return -1;
    if (bPriority === 1) return 1;
    if (aPriority === 0 && bPriority !== 0) return 1;
    if (bPriority === 0 && aPriority !== 0) return -1;

    return aPriority - bPriority;
  });

  const [indexActive, setIndexActive] = useState(0);
  const [isRunning, toggleIsRunning] = useBoolean(true);
  const [progress, setProgress] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(sortedSlides[0].backgroundImage);

  // Log the sorted slides data
  useEffect(() => {
    console.log("Sorted Slides Data:", sortedSlides);
  }, [sortedSlides]);

  useEffect(() => {
    const updateBackgroundImage = () => {
      const slide = sortedSlides[indexActive];
      const screenWidth = window.innerWidth;
      if (screenWidth <= 768) {
        setBackgroundImage(slide.mobileBackgroundImage || slide.backgroundImage);
      } else if (screenWidth <= 1024) {
        setBackgroundImage(slide.tabletBackgroundImage || slide.backgroundImage);
      } else {
        setBackgroundImage(slide.backgroundImage);
      }
    };

    updateBackgroundImage();
    window.addEventListener("resize", updateBackgroundImage);
    return () => window.removeEventListener("resize", updateBackgroundImage);
  }, [indexActive, sortedSlides]);

  useInterval(
    () => {
      handleAutoNext();
    },
    isRunning ? SLIDE_DURATION : null
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 1 : 100));
      }, SLIDE_DURATION / 100);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= sortedSlides.length - 1) return 0;
      return state + 1;
    });
    resetProgress();
  };

  const handleClickNext = () => {
    setIndexActive((state) => (state >= sortedSlides.length - 1 ? 0 : state + 1));
    handleAfterClick();
  };

  const handleClickPrev = () => {
    setIndexActive((state) => (state === 0 ? sortedSlides.length - 1 : state - 1));
    handleAfterClick();
  };

  const handleAfterClick = () => {
    toggleIsRunning(false);
    resetProgress();
    if (TIME_OUT) clearTimeout(TIME_OUT);
    TIME_OUT = setTimeout(() => toggleIsRunning(true), 1000);
  };

  const resetProgress = () => {
    setProgress(0);
  };

  const renderItem = (index: number) => {
    const isActive = indexActive === index;
    return (
      <motion.div
        key={index}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    );
  };

  const currentSlide = sortedSlides[indexActive];
  const showOverlay = currentSlide?.mainHeading || currentSlide?.subHeading;

  return (
    <div 
      className="relative w-full h-[550px] md:h-[400px] xl:h-[600px]"
      onMouseEnter={() => toggleIsRunning(false)}
      onMouseLeave={() => toggleIsRunning(true)}
    >
      <AnimatePresence>
        {sortedSlides.map((_, index) => index === indexActive && renderItem(index))}
      </AnimatePresence>

      {(currentSlide?.mainHeading || currentSlide?.subHeading || currentSlide?.buttonText) && (
        <>
          {showOverlay && <div className="absolute inset-0 bg-black/40 z-[1]" />}

          <div className={`absolute container inset-0 flex ${
            currentSlide?.contentPosition === "right" 
              ? "justify-end" 
              : currentSlide?.contentPosition === "left" 
              ? "justify-start" 
              : "justify-center"
          } items-center z-[2]`}>
            <motion.div
              className={`relative space-y-3 text-${currentSlide?.contentPosition || 'center'} sm:space-y-4 text-white px-6`}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              key={currentSlide.id}
            >
              {currentSlide?.subHeading && (
                <span className={`nc-SectionHero2Item__subheading text-${currentSlide?.contentPosition || 'center'} block text-base md:text-xl font-medium`}>
                  {currentSlide.subHeading}
                </span>
              )}

              {currentSlide?.mainHeading && (
                <h2 className={`nc-SectionHero2Item__heading font-semibold text-${currentSlide?.contentPosition || 'center'} text-3xl sm:text-4xl md:text-4xl xl:text-5xl 2xl:text-5xl !leading-[114%]`}>
                  {currentSlide.mainHeading}
                </h2>
              )}

              {currentSlide?.buttonText && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.6 }}
                >
                  <ButtonPrimary
                    className="nc-SectionHero2Item__button items-center dark:bg-slate-900"
                    sizeClass="py-3 px-6 sm:py-5 sm:px-9"
                    href={currentSlide.buttonLink as any}
                  >
                    <span>{currentSlide.buttonText}</span>
                  </ButtonPrimary>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}

      <div
        className="absolute shadow-2xl bottom-10 select-none right-5 z-50 rounded-[48px] w-[125px] flex bg-white items-center space-x-4"
        style={{
          background: `linear-gradient(to right, #00bfff ${progress}%, #fff 0%)`,
          transition: "background 0.8s ease",
        }}
      >
        <Prev
          className="z-10 !text-black"
          btnClassName="w-8 h-8 hover:shadow-xl dark:hover:border-gray-400"
          svgSize="w-4 h-4"
          onClickPrev={handleClickPrev}
        />
        <div className="mx-4 text-black text-xs font-medium">
          {indexActive + 1} / {sortedSlides.length}
        </div>
        <Next
          className="z-10 !text-black"
          btnClassName="w-8 h-8 hover:shadow-xl dark:hover:border-gray-400"
          svgSize="w-4 h-4"
          onClickNext={handleClickNext}
        />
      </div>
    </div>
  );
};

export default SectionHero3;
