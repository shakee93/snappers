"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import useInterval from "react-use/lib/useInterval";

interface MediaNode {
  node?: { sourceUrl?: string | null } | null;
}

interface HeroSlide {
  sliderTitle?: string | null;
  sliderDiscription?: string | null;
  titleColor?: string | null;
  descriptionColor?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  buttonTextColor?: string | null;
  buttonBachgroundColor?: string | null;
  sliderBackgroundImage?: MediaNode | null;
}

interface HeroDeal {
  dealContent?: string | null;
  backgroundImage?: MediaNode | null;
}

export interface HeroSettingsFields {
  sliderSettings?: { slides?: (HeroSlide | null)[] | null } | null;
  dealBannerSettings?: { deals?: (HeroDeal | null)[] | null } | null;
}

export interface SectionHeroPetsProps {
  className?: string;
  data?: HeroSettingsFields | null;
}

const SLIDE_INTERVAL = 6000;

/**
 * Homepage hero: a large promo slider (left) beside a deal banner (right),
 * driven by the `heroSettings` ACF options (see `GET_HERO_SETTINGS`).
 */
const SectionHeroPets = ({ className = "", data }: SectionHeroPetsProps) => {
  const slides = useMemo(
    () =>
      (data?.sliderSettings?.slides ?? []).filter(
        (s): s is HeroSlide => !!s?.sliderBackgroundImage?.node?.sourceUrl
      ),
    [data]
  );

  const deal = useMemo(
    () =>
      (data?.dealBannerSettings?.deals ?? []).find(
        (d): d is HeroDeal => !!d?.backgroundImage?.node?.sourceUrl
      ) ?? null,
    [data]
  );

  const [current, setCurrent] = useState(0);
  const activeIndex = slides.length > 0 ? current % slides.length : 0;

  useInterval(
    () => setCurrent((prev) => (prev + 1) % slides.length),
    slides.length > 1 ? SLIDE_INTERVAL : null
  );

  if (slides.length === 0 && !deal) return null;

  const slide = slides[activeIndex];

  return (
    <div className={`mx-auto mt-5 w-full max-w-[1368px] px-3 md:mt-10 lg:px-0 pt-[50px] ${className}`}>
      <div className="flex flex-col gap-4 lg:flex-row mt-20S lg:justify-between lg:gap-0">
        {/* Left: promo slider */}
        {slide && (
          <div className="relative h-[280px] min-h-[451px] w-full overflow-hidden rounded-[24px] sm:h-[360px] lg:h-[451px] lg:w-[72.368%]">
            <AnimatePresence initial={false}>
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.sliderBackgroundImage!.node!.sourceUrl!}
                  alt={slide.sliderTitle?.replace(/<[^>]+>/g, " ") ?? "Hero"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex max-w-[62%] flex-col justify-center gap-4 p-7 sm:p-10 lg:p-14">
              {slide.sliderTitle && (
                <h2
                  style={{ color: slide.titleColor ?? undefined }}
                  className="text-2xl font-bold leading-tight sm:text-3xl lg:text-5xl"
                  dangerouslySetInnerHTML={{ __html: slide.sliderTitle }}
                />
              )}
              {slide.sliderDiscription && (
                <p
                  style={{ color: slide.descriptionColor ?? undefined }}
                  className="text-sm sm:text-base"
                >
                  {slide.sliderDiscription}
                </p>
              )}
              {slide.buttonText && slide.buttonLink && (
                <Link
                  href={slide.buttonLink}
                  style={{
                    backgroundColor: slide.buttonBachgroundColor ?? undefined,
                    color: slide.buttonTextColor ?? undefined,
                  }}
                  className="mt-1 inline-flex w-fit items-center rounded-full px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
                >
                  {slide.buttonText}
                </Link>
              )}
            </div>

            {slides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-4 bg-header-accent"
                        : "w-2 bg-white/60 hover:bg-white/90"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right: deal banner — hangs and gently sways from the strap top */}
        {deal && (
          <motion.div
            className="relative w-full lg:w-[25.512%]"
            style={{ transformOrigin: "50% -135px" }}
            animate={{ rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Hanging tag decoration */}
            <Image
              src="/homepage/slider/tag.png"
              alt=""
              width={34}
              height={167}
              aria-hidden
              className="pointer-events-none absolute -top-[135px] left-1/2 z-10 -translate-x-1/2"
            />

            <div className="relative h-[220px] w-full overflow-hidden rounded-[24px] lg:h-[451px]">
              <Image
                src={deal.backgroundImage!.node!.sourceUrl!}
                alt={deal.dealContent?.replace(/<[^>]+>/g, " ") ?? "Deal"}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              {deal.dealContent && (
                <h3
                  className="absolute inset-x-0 top-0 p-8 text-xl font-bold leading-tight text-neutral-800 sm:text-2xl lg:p-12"
                  dangerouslySetInnerHTML={{ __html: deal.dealContent }}
                />
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SectionHeroPets;
