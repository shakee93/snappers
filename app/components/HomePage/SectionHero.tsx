import { GET_SLIDES } from "@/graphql/defs/slides";
import backgroundLineSvg from "@/public/images/Moon.svg";
import imageRightPng2 from "@/public/images/hero-right-2.png";
import imageRightPng3 from "@/public/images/hero-right-3.png";
import imageRightPng from "@/public/images/hero-right.png";
import { useQuery } from "@apollo/client";
import Image, { StaticImageData } from "next/image";
import { FC, useEffect, useState } from "react";
import useBoolean from "react-use/lib/useBoolean";
import useInterval from "react-use/lib/useInterval";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Next from "shared/NextPrev/Next";
import Prev from "shared/NextPrev/Prev";

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

const DATA: Hero2DataType[] = [
  {
    image: imageRightPng2,
    heading: "Exclusive collection for everyone",
    subHeading: "In this season, find the best 🔥",
    btnText: "Explore now",
    btnLink: "/collections/all",
  },
  {
    image: imageRightPng3,
    heading: "Exclusive collection for everyone",
    subHeading: "In this season, find the best 🔥",
    btnText: "Explore now",
    btnLink: "/collections/all",
  },
  {
    image: imageRightPng,
    heading: "Exclusive collection for everyone",
    subHeading: "In this season, find the best 🔥",
    btnText: "Explore now",
    btnLink: "/collections/all",
  },
];
let TIME_OUT: NodeJS.Timeout | null = null;

const SectionHero: FC<SectionHero2Props> = ({ className = "" }) => {
  const [slide, setSlide] = useState<SlideType[]>([]);
  let { loading, error, data, refetch } = useQuery(GET_SLIDES);

  useEffect(() => {
    if (!loading && data?.slides?.nodes?.length > 0) {
      setSlide(data.slides.nodes);
    }
  }, [loading]);

  // console.log( data?.slides );
  // console.log(slide?.map((i) => i.slideFields.mainHeading));

  // =================
  const [indexActive, setIndexActive] = useState(0);
  const [isRunning, toggleIsRunning] = useBoolean(true);

  useInterval(
    () => {
      handleAutoNext();
    },
    isRunning ? 5500 : null,
  );
  //

  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= DATA.length - 1) {
        return 0;
      }
      return state + 1;
    });
  };

  const handleClickNext = () => {
    setIndexActive((state) => {
      if (state >= DATA.length - 1) {
        return 0;
      }
      return state + 1;
    });
    handleAfterClick();
  };

  const handleClickPrev = () => {
    setIndexActive((state) => {
      if (state === 0) {
        return DATA.length - 1;
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
  // =================

  const renderItem = (index: number) => {
    const isActive = indexActive === index;
    const item = slide[index];
    if (!isActive) {
      return null;
    }
    return (
      <div
        className={`nc-SectionHero2Item nc-SectionHero2Item--animation relative flex flex-col-reverse overflow-hidden lg:flex-col  ${className}`}
        key={index}
      >
        {/* navigation dots */}

        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 justify-center">
          {DATA.map((_, index) => {
            const isActive = indexActive === index;
            return (
              <div
                key={index}
                onClick={() => {
                  setIndexActive(index);
                  handleAfterClick();
                }}
                className={`relative cursor-pointer px-1 py-1.5`}
              >
                <div
                  className={`relative h-1 w-20 rounded-md bg-white shadow-sm`}
                >
                  {isActive && (
                    <div
                      className={`nc-SectionHero2Item__dot absolute inset-0 rounded-md bg-slate-900 ${
                        isActive ? " " : " "
                      }`}
                    ></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Prev
          className="absolute left-1 top-3/4 z-10 !text-slate-700 sm:left-5 sm:top-1/2 sm:-translate-y-1/2"
          btnClassName="w-12 h-12 hover:border-slate-400 dark:hover:border-slate-400"
          svgSize="w-6 h-6"
          onClickPrev={handleClickPrev}
        />
        <Next
          className="absolute right-1 top-3/4 z-10 !text-slate-700 sm:right-5 sm:top-1/2 sm:-translate-y-1/2"
          btnClassName="w-12 h-12 hover:border-slate-400 dark:hover:border-slate-400"
          svgSize="w-6 h-6"
          onClickNext={handleClickNext}
        />

        {/* BG */}
        <div className="absolute inset-0 bg-[#CCE0EF]">
          <Image
            fill
            style={{ objectFit: "cover" }}
            className="absolute h-full w-full object-contain"
            src={backgroundLineSvg}
            alt="hero"
          />
        </div>

        <div className=" container pb-0 pt-14 sm:pt-20 lg:py-44">
          <div
            className={`nc-SectionHero2Item__left relative z-[1] w-full max-w-3xl space-y-8 sm:space-y-14`}
          >
            <div className="space-y-5 sm:space-y-6">
              <span className="nc-SectionHero2Item__subheading block text-base font-medium text-slate-700 md:text-xl">
                {item.slideFields.subHeading}
              </span>
              <h2 className="nc-SectionHero2Item__heading text-3xl font-semibold !leading-[114%] text-slate-900 sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
                {item.slideFields.mainHeading}
              </h2>
            </div>

            <ButtonPrimary
              className="nc-SectionHero2Item__button dark:bg-slate-900"
              sizeClass="py-3 px-6 sm:py-5 sm:px-9"
              href={item.slideFields.buttonLink as any}
            >
              <span>{item.slideFields.buttonText}</span>
              <span>
                <svg className="ml-2.5 h-5 w-5" viewBox="0 0 24 24" fill="none">
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
          <div className="bottom-0 right-0 top-0 mt-10 w-full max-w-2xl lg:absolute lg:mt-0 xl:max-w-3xl 2xl:max-w-4xl ">
            <Image
              className="h-[500px] w-auto object-contain object-right-bottom "
              width={300}
              height={300}
              src={item.slideFields.featureImage.sourceUrl}
              alt={item.slideFields.mainHeading}
            />
          </div>
        </div>
      </div>
    );
  };

  return <>{slide.map((_, index) => renderItem(index))}</>;
};

export default SectionHero;
