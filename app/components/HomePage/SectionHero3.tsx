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
  mainHeading: string;
  subHeading: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  backgroundImage: string;
  contentPosition: string;
}

export interface SectionHero3Props {
  className?: string;
  slides: SlideType[];
}

const SLIDE_DURATION = 5500; // Slider duration in milliseconds

let TIME_OUT: NodeJS.Timeout | null = null;

const SectionHero3 = ({ className = "", slides }: SectionHero3Props) => {
  const [indexActive, setIndexActive] = useState(0);
  const [isRunning, toggleIsRunning] = useBoolean(true);
  const [progress, setProgress] = useState(0);

  useInterval(
    () => {
      handleAutoNext();
    },
    isRunning ? SLIDE_DURATION : null
  );

  // Manage progress background fill
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 1 : 100));
      }, SLIDE_DURATION / 100); // Increment the progress bar with respect to the duration
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRunning]);

  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= slides.length - 1) {
        return 0;
      }
      return state + 1;
    });
    resetProgress();
  };

  const handleClickNext = () => {
    setIndexActive((state) => {
      if (!slides) {
        return state;
      }

      if (state >= slides.length - 1) {
        return 0;
      }
      return state + 1;
    });
    handleAfterClick();
  };

  const handleClickPrev = () => {
    setIndexActive((state) => {
      if (!slides) {
        return state;
      }

      if (state === 0) {
        return slides.length - 1;
      }
      return state - 1;
    });
    handleAfterClick();
  };

  const handleAfterClick = () => {
    toggleIsRunning(false);
    resetProgress();
    if (TIME_OUT) {
      clearTimeout(TIME_OUT);
    }
    TIME_OUT = setTimeout(() => {
      toggleIsRunning(true);
    }, 1000);
  };

  const resetProgress = () => {
    setProgress(0); // Reset progress when slide changes
  };

  const renderItem = (index: number) => {
    const item = slides[index];
    const isActive = indexActive === index;

    return (
      <motion.div
        key={index}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${item.backgroundImage})`,
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

  return (
    <div className="relative  w-full h-[550px] md:h-[400px] xl:h-[600px]">
      {/* Backgrounds with fade-out/fade-in effect */}
      <AnimatePresence>
        {slides.map((_, index) => {
          return index === indexActive && renderItem(index);
        })}
      </AnimatePresence>

      {/* Text Content */}
      <div className={`absolute container inset-0 flex ${slides[indexActive]?.contentPosition === "right" ? "justify-end" : slides[indexActive]?.contentPosition === "left" ? "justify-start" : "justify-center"} items-center z-[1]`}>
        <motion.div
          className={`relative z-10 space-y-3 text-${slides[indexActive]?.contentPosition || 'center'} sm:space-y-4 text-white px-6`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          key={slides[indexActive].id}
        >
          <span className={`nc-SectionHero2Item__subheading text-${slides[indexActive]?.contentPosition || 'center'} block text-base md:text-xl font-medium`}>
            {slides[indexActive]?.subHeading}
          </span>

          <h2 className={`nc-SectionHero2Item__heading font-semibold text-${slides[indexActive]?.contentPosition || 'center'} text-3xl sm:text-4xl md:text-4xl xl:text-5xl 2xl:text-5xl !leading-[114%]`}>
            {slides[indexActive]?.mainHeading}
          </h2>

          {/* Button Animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.6 }}
          >
            <ButtonPrimary
              className="nc-SectionHero2Item__button items-center dark:bg-slate-900"
              sizeClass="py-3 px-6 sm:py-5 sm:px-9"
              href={slides[indexActive]?.buttonLink as any}
            >
              <span>{slides[indexActive]?.buttonText}</span>
            </ButtonPrimary>
          </motion.div>
        </motion.div>

        {/* Previous & Next Buttons with animated background progress */}
        <div
          className="absolute shadow-2xl bottom-10 select-none right-5 z-50 rounded-[48px] w-[125px] flex bg-white items-center space-x-4"
          style={{
            background: `linear-gradient(to right, #00bfff ${progress}%, #fff 0%)`, // Background fill based on progress
            transition: "background 0.8s ease", // Smooth transition
          }}
        >
          <Prev
            className="z-10 !text-black"
            btnClassName="w-8 h-8 hover:shadow-xl dark:hover:border-gray-400"
            svgSize="w-4 h-4"
            onClickPrev={handleClickPrev}
          />

          {/* Current slide index out of total slides */}
          <div className="mx-4 text-black text-xs font-medium">
            {indexActive + 1} / {slides.length}
          </div>

          <Next
            className="z-10 !text-black"
            btnClassName="w-8 h-8 hover:shadow-xl dark:hover:border-gray-400"
            svgSize="w-4 h-4"
            onClickNext={handleClickNext}
          />
        </div>
      </div>
    </div>
  );
};

export default SectionHero3;
