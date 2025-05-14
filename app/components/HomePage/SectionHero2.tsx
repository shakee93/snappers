"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBoolean } from 'react-use';
import useInterval from 'react-use/lib/useInterval';
import ButtonPrimary from 'shared/Button/ButtonPrimary';
import Next from 'shared/NextPrev/Next';
import Prev from 'shared/NextPrev/Prev';
import NcImage from '@/shared/NcImage/NcImage';

interface Hero2DataType {
  image: string;
  heading: string;
  subHeading: string;
  btnText: string;
  btnLink: string;
}

interface SlideType {
  id: string;

  mainHeading: string;
  subHeading: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  backgroundImage: string;
  featureImage: {
    id: string;
    sourceUrl: string;
  };
}

export interface SectionHero2Props {
  className?: string;
  slides: SlideType[];
}

let TIME_OUT: NodeJS.Timeout | null = null;

const SectionHero2 = ({ className = '', slides }: SectionHero2Props) => {
  const [indexActive, setIndexActive] = useState(0);
  const [isRunning, toggleIsRunning] = useBoolean(true);

  useInterval(
    () => {
      handleAutoNext();
    },
    isRunning ? 5500 : null
  );

  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= slides.length - 1) {
        return 0;
      }
      return state + 1;
    });
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
    if (TIME_OUT) {
      clearTimeout(TIME_OUT);
    }
    TIME_OUT = setTimeout(() => {
      toggleIsRunning(true);
    }, 1000);
  };

  const renderItem = (index: number) => {
    const isActive = indexActive === index;
    const item = slides[index];

    if (!isActive) {
      return null;
    }

    return (
      <div
        key={index}
        className={`relative w-full h-[550px] md:h-[400px] xl:h-[600px] justify-center nc-SectionHero2Item--animation flex items-center transition-transform ease-in-out transform ${isActive ? 'translate-y-0' : 'translate-y-10'
          }`}
        style={{
          // backgroundColor: item.slideFields.backgroundColor, 
          backgroundImage: `url(${item?.backgroundImage})`, // Use the background image
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50  flex justify-center">
          {slides.map((_, dotIndex) => (
            <div
              key={dotIndex}
              onClick={() => {
                setIndexActive(dotIndex);
                handleAfterClick();
              }}
              className={`relative px-1 py-1.5 cursor-pointer `}
            >
              <div className={`relative w-5 md:w-20 h-1 shadow-sm rounded-md bg-white`}>
                <div
                  className={`absolute inset-0 bg-gray-700 rounded-md ${dotIndex === indexActive ? 'opacity-100 nc-SectionHero2Item__dot rounded-md' : 'opacity-0'
                    }`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Previous & Next Buttons */}
        <Prev
          className="absolute left-1 sm:left-5 top-2/4 sm:top-1/2 sm:-translate-y-1/2 z-10 !text-gray-200"
          btnClassName="w-12 h-12 hover:border-gray-400 dark:hover:border-gray-400"
          svgSize="w-6 h-6"
          onClickPrev={handleClickPrev}
        />
        <Next
          className="absolute right-1 sm:right-5 top-2/4 sm:top-1/2 sm:-translate-y-1/2 z-10 !text-gray-200"
          btnClassName="w-12 h-12 hover:border-gray-400 dark:hover:border-gray-400"
          svgSize="w-6 h-6"
          onClickNext={handleClickNext}
        />

        {/* Overlay Behind Text */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Text & Image Content */}
        <div className="flex-col md:flex-row container flex justify-between items-center z-[1] w-full">
          <div className="relative z-10 space-y-3 sm:space-y-4 text-white px-6">
            <span className="nc-SectionHero2Item__subheading block text-base md:text-xl font-medium">
              {item?.subHeading}
            </span>
            <h2 className="nc-SectionHero2Item__heading font-semibold text-3xl sm:text-4xl md:text-4xl xl:text-5xl 2xl:text-5xl  !leading-[114%]">
              {item?.mainHeading}
            </h2>
            <ButtonPrimary
              className="nc-SectionHero2Item__button dark:bg-slate-900"
              sizeClass="py-3 px-6 sm:py-5 sm:px-9"
              href={item.buttonLink as any}
            >
              <span>{item.buttonText}</span>
              <span>
                <svg className="w-5 h-5 ml-2.5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 22L20 20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </ButtonPrimary>
          </div>

          {/* Feature Image */}
          <motion.div
            initial={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.8 }}
            className="feature-image relative z-10"
          >
            <NcImage
              priority={true}
              src={item.featureImage}
              className="max-h-[250px] md:max-h-[300px] xl:max-h-[500px] w-auto py-6 px-4"
            />
          </motion.div>
        </div>
      </div>
    );
  };

  return <>{slides.map((_, index) => renderItem(index))}</>;
};

export default SectionHero2;