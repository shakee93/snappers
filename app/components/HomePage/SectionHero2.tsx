// Import React and other required modules
import React, { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import useBoolean from "react-use/lib/useBoolean";
import useInterval from "react-use/lib/useInterval";
import Image, { StaticImageData } from "next/image";
import { GET_SLIDES } from "@/graphql/defs/slides";
import { useStore } from "@/store/store";
import backgroundLineSvg from "@/public/images/Moon.svg";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Next from "shared/NextPrev/Next";
import Prev from "shared/NextPrev/Prev";
import NcImage from "@/shared/NcImage/NcImage";
import { log } from "console";

// Define interfaces
interface Hero2DataType {
  image: StaticImageData;
  heading: string;
  subHeading: string;
  btnText: string;
  btnLink: string;
}

interface SlideType {
  id: string;
  slideFields: {
    mainHeading: string;
    subHeading: string;
    buttonText: string;
    buttonLink: string;
    featureImage: {
      id: string;
      sourceUrl: string;
    };
  };
}

export interface SectionHero2Props {
  className?: string;
}

// Define constants
let TIME_OUT: NodeJS.Timeout | null = null;

// Define the SectionHero2 component
const SectionHero2: FC<SectionHero2Props> = ({ className = "" }) => {
  const [slide, setSlide] = useState<SlideType[]>([]);
  const { loading, error, data, refetch } = useQuery(GET_SLIDES);

  useEffect(() => {
    if (!loading && data?.slides?.nodes?.length > 0) {
      setSlide(data.slides.nodes);
    }
  }, [loading]);

  const [indexActive, setIndexActive] = useState(0);
  const [isRunning, toggleIsRunning] = useBoolean(true);

  // Define the useInterval function
  useInterval(
    () => {
      handleAutoNext();
    },
    isRunning ? 5500 : null
  );

  // Define handleAutoNext function
  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= slide.length - 1) {
        return 0;
      }
      return state + 1;
    });
  };

  // Define handleClickNext function
  const handleClickNext = () => {
    setIndexActive((state) => {
      if (state >= slide.length - 1) {
        return 0;
      }
      return state + 1;
    });
    handleAfterClick();
  };

  // Define handleClickPrev function
  const handleClickPrev = () => {
    setIndexActive((state) => {
      if (state === 0) {
        return slide.length - 1;
      }
      return state - 1;
    });
    handleAfterClick();
  };

  // Define handleAfterClick function
  const handleAfterClick = () => {
    toggleIsRunning(false);
    if (TIME_OUT) {
      clearTimeout(TIME_OUT);
    }
    TIME_OUT = setTimeout(() => {
      toggleIsRunning(true);
    }, 1000);
  };

  // Define renderItem function
  const renderItem = (index: number) => {
    const isActive = indexActive === index;
    const item = slide[index];
    if (!isActive) {
      return null;
    }

    // console.log(item)
    return (
      <div
        key={index}
        className={`relative w-full h-[650px] md:h-[400px] xl:h-[500px] justify-center  nc-SectionHero2Item--animation flex items-center bg-red-300 transition-transform ease-in-out transform ${
          isActive ? "translate-y-0" : "translate-y-10"
        }`}
      >
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex justify-center">
        {slide.map((_, dotIndex) => (
            <div
              key={dotIndex}
              onClick={() => {
                setIndexActive(dotIndex);
                handleAfterClick();
              }}
              className={`relative px-1 py-1.5 cursor-pointer`}
            >
              <div
                className={`relative w-20 h-1 shadow-sm rounded-md bg-white`}
              >
                <div
                  className={` absolute inset-0 bg-black rounded-md ${
                    dotIndex === indexActive ? "opacity-100 nc-SectionHero2Item__dot" : "opacity-0"
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <Prev
          className="absolute left-1 sm:left-5 top-3/4 sm:top-1/2 sm:-translate-y-1/2 z-10 !text-slate-700"
          btnClassName="w-12 h-12 hover:border-slate-400 dark:hover:border-slate-400"
          svgSize="w-6 h-6"
          onClickPrev={handleClickPrev}
        />
        <Next
          className="absolute right-1 sm:right-5 top-3/4 sm:top-1/2 sm:-translate-y-1/2 z-10 !text-slate-700"
          btnClassName="w-12 h-12 hover:border-slate-400 dark:hover:border-slate-400"
          svgSize="w-6 h-6"
          onClickNext={handleClickNext}
        />
        <div className="absolute inset-0 bg-[#CCE0EF]">
          <NcImage
            className="absolute w-full h-full object-contain"
            src={backgroundLineSvg}
            alt="hero"
          />
        </div>
        <div className="flex-col md:flex-row container flex justify-between items-center z-[1] w-full ">
          <div className="space-y-3 sm:space-y-4">
            <span className="nc-SectionHero2Item__subheading block text-base md:text-xl text-slate-700 font-medium">
              {item.slideFields.subHeading}
            </span>
            <h2 className="nc-SectionHero2Item__heading font-semibold text-3xl sm:text-4xl md:text-4xl xl:text-5xl 2xl:text-5xl !leading-[114%] text-slate-900">
              {item.slideFields.mainHeading}
            </h2>
            <ButtonPrimary
              className="nc-SectionHero2Item__button dark:bg-slate-900"
              sizeClass="py-3 px-6 sm:py-5 sm:px-9"
              href={item.slideFields.buttonLink as any}
            >
              <span>{item.slideFields.buttonText}</span>
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

          <motion.div
            initial={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.8 }}
            className="feature-image"
          >
            <NcImage
              src={item.slideFields.featureImage.sourceUrl}
              className="min-h-[400px] max-h-[500px] w-auto py-6 px-4"
            />
          </motion.div>
        </div>
      </div>
    );
  };

  return <>{slide.map((_, index) => renderItem(index))}</>;
};

export default SectionHero2;
