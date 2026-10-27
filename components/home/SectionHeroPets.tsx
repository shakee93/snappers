"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import useInterval from "react-use/lib/useInterval";
import type { ProductCardItem } from "@/components/home/ProductCard";
import { HERO_SLIDER_TITLE_CLASS } from "@/lib/heroSlides";
import { BRAND_CTA_BUTTON_CLASS } from "@/shared/Button/ButtonBrand";

interface MediaNode {
  node?: { sourceUrl?: string | null } | null;
}

export interface HeroSlide {
  sliderTitle?: string | null;
  sliderDiscription?: string | null;
  titleColor?: string | null;
  descriptionColor?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  buttonTextColor?: string | null;
  buttonBachgroundColor?: string | null;
  buttonBorderColor?: string | null;
  sliderBackgroundImage?: MediaNode | null;
  /** Optional art layered above the slide background (e.g. signup copy + feature on right). */
  sliderFeatureImage?: MediaNode | null;
}

interface HeroDeal {
  dealContent?: string | null;
  textPosition?: string | null;
  textColor?: string | null;
  backgroundImage?: MediaNode | null;
}

/** One curated medicine-section entry: a feature image plus a linked product. */
interface HealthSectionEntry {
  featureImage?: MediaNode | null;
  healthProduct?: {
    edges?: ({ node?: ProductCardItem | null } | null)[] | null;
  } | null;
}

export interface HeroSettingsFields {
  /** ACF “Deals Date” - countdown target on the homepage deal banner. */
  dealsDate?: string | null;
  sliderSettings?: { slides?: (HeroSlide | null)[] | null } | null;
  dealBannerSettings?: { deals?: (HeroDeal | null)[] | null } | null;
  healthSectionSettings?: {
    healthProduct?: (HealthSectionEntry | null)[] | null;
  } | null;
}

export interface SectionHeroPetsProps {
  className?: string;
  data?: HeroSettingsFields | null;
}

const SLIDE_INTERVAL = 6000;
const CROSSFADE = { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const };
const TEXT_FADE = { duration: 0.45, ease: "easeInOut" as const };

/** Cream doodle + tint when a slide has no photo (fallback under CMS slides). */
const HERO_SLIDER_BG = "/homepage/hero/pattern-bg.webp";
const HERO_SLIDER_SIGNUP_BG = "/homepage/hero/pattern-bg.webp";
const HERO_SLIDER_FEATURE_IMAGE =
  "/homepage/hero/hero-slide-snappers-coins.png";

const HERO_SLIDE_BUTTON_CLASS = `mt-1 inline-flex w-fit items-center rounded-md px-5 py-2.5 text-base font-bold shadow-sm sm:px-6 sm:py-3 sm:text-lg ${BRAND_CTA_BUTTON_CLASS}`;

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    sliderTitle: `<span class="${HERO_SLIDER_TITLE_CLASS}">Join Now, Receive Rs.200 Cashback.</span>`,
    sliderDiscription: "Limited Time Offer",
    titleColor: "#092412",
    descriptionColor: "#000000",
    buttonText: "Sign Up",
    buttonLink: "/signup",
    buttonTextColor: "#ffffff",
    buttonBachgroundColor: "#6d7f94",
    buttonBorderColor: "#000000",
    sliderBackgroundImage: {
      node: { sourceUrl: HERO_SLIDER_SIGNUP_BG },
    },
    sliderFeatureImage: {
      node: { sourceUrl: HERO_SLIDER_FEATURE_IMAGE },
    },
  },
  {
    sliderBackgroundImage: {
      node: { sourceUrl: HERO_SLIDER_FEATURE_IMAGE },
    },
  },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

/** Slides with overlay copy hide full-bleed art on mobile; image-only slides need the artwork visible. */
function heroSlideHasCopy(item: HeroSlide): boolean {
  const title = item.sliderTitle?.trim();
  const desc = item.sliderDiscription?.trim();
  if (desc) return true;
  if (!title) return false;
  return stripHtml(title).trim().length > 0;
}

/** Homepage hero carousel - Hero Settings ACF slides, then slide CPT, then defaults. */
const SectionHeroPets = ({ className = "", data }: SectionHeroPetsProps) => {
  const slidesFromCms = useMemo(
    () =>
      (data?.sliderSettings?.slides ?? []).filter(
        (s): s is HeroSlide =>
          !!s &&
          (!!s.sliderBackgroundImage?.node?.sourceUrl ||
            !!s.sliderFeatureImage?.node?.sourceUrl ||
            !!s.sliderTitle ||
            !!s.sliderDiscription),
      ),
    [data],
  );

  const slides = useMemo(
    () => (slidesFromCms.length > 0 ? slidesFromCms : DEFAULT_SLIDES),
    [slidesFromCms],
  );

  const [current, setCurrent] = useState(0);
  const activeIndex = slides.length > 0 ? current % slides.length : 0;

  useInterval(
    () => setCurrent((prev) => (prev + 1) % slides.length),
    slides.length > 1 ? SLIDE_INTERVAL : null,
  );

  const slide = slides[activeIndex];

  return (
    <section
      className={`relative w-full bg-white ${className}`}
      aria-label="Promotions"
    >
      <div className="relative mx-auto w-full max-w-[1368px] px-3 pt-6 pb-1 sm:px-4 lg:pt-8 lg:pb-2 xl:px-0">
        <div className="w-full">
          <div className="relative w-full rounded-2xl bg-white p-2 shadow-[0_4px_24px_rgba(15,23,42,0.12)] ring-1 ring-neutral-200/80 sm:p-2.5">
            <div className="relative aspect-[1368/452] w-full overflow-hidden rounded-xl bg-[#faf9f7]">
              <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${HERO_SLIDER_BG}')` }}
                aria-hidden
              />

            {slides.map((item, index) => {
              const src = item.sliderBackgroundImage?.node?.sourceUrl;
              const isActive = index === activeIndex;
              const hasCopy = heroSlideHasCopy(item);

              if (!src) {
                return null;
              }

              return (
                <motion.div
                  key={`hero-slide-${index}`}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={CROSSFADE}
                  className={`absolute inset-0 z-0 ${hasCopy ? "max-lg:hidden" : ""}`}
                  aria-hidden={!isActive}
                >
                  <Image
                    src={src}
                    alt={item.sliderTitle ? stripHtml(item.sliderTitle) : "Hero offer"}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className={
                      hasCopy
                        ? "object-cover object-center"
                        : "object-contain object-center max-lg:object-contain lg:object-cover"
                    }
                  />
                </motion.div>
              );
            })}

            {slides.map((item, index) => {
              const featureSrc = item.sliderFeatureImage?.node?.sourceUrl;
              const isActive = index === activeIndex;

              if (!featureSrc) {
                return null;
              }

              return (
                <motion.div
                  key={`hero-slide-feature-${index}`}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={CROSSFADE}
                  className="pointer-events-none absolute inset-y-0 right-0 z-[2] hidden w-full max-w-[400px] items-center justify-end p-4 sm:p-5 lg:flex lg:p-6"
                  aria-hidden={!isActive}
                >
                  <div className="relative h-full w-full max-w-[300px]">
                    <Image
                      src={featureSrc}
                      alt=""
                      fill
                      sizes="300px"
                      className="object-contain object-right"
                    />
                  </div>
                </motion.div>
              );
            })}

            <div className="absolute inset-0 z-10 flex flex-col justify-center p-6 font-albra sm:p-8 lg:max-w-[70%] lg:p-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={TEXT_FADE}
                  className="flex flex-col gap-3"
                >
                  {slide?.sliderTitle ? (
                    <div
                      style={{ color: slide.titleColor ?? undefined }}
                      className="leading-[1.05] [&_*]:font-albra [&_*]:leading-[1.05]"
                      dangerouslySetInnerHTML={{ __html: slide.sliderTitle }}
                    />
                  ) : null}
                  {slide?.sliderDiscription ? (
                    <p className="font-[family-name:var(--font-inter)] text-base font-medium text-black sm:text-lg lg:text-xl">
                      {slide.sliderDiscription}
                    </p>
                  ) : null}
                  {slide?.buttonText && slide.buttonLink ? (
                    slide.buttonLink.startsWith("http") ? (
                      <a
                        href={slide.buttonLink}
                        className={`${HERO_SLIDE_BUTTON_CLASS} hidden lg:inline-flex`}
                      >
                        {slide.buttonText}
                      </a>
                    ) : (
                      <Link
                        href={slide.buttonLink}
                        className={`${HERO_SLIDE_BUTTON_CLASS} hidden lg:inline-flex`}
                      >
                        {slide.buttonText}
                      </Link>
                    )
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {slides.length > 1 ? (
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrent(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      index === activeIndex
                        ? "w-5 bg-emerald-600"
                        : "w-2 bg-neutral-400/80"
                    }`}
                  />
                ))}
              </div>
            ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionHeroPets;
