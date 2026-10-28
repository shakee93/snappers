"use client";

import { useEffect, useMemo, useState } from "react";
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

/** Slides with CMS copy use pattern + HTML overlay; image-only slides show full-bleed art. */
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

  const activeSlide = slides[activeIndex];
  const activeHasCopy = activeSlide ? heroSlideHasCopy(activeSlide) : false;
  const activeBgSrc = activeSlide?.sliderBackgroundImage?.node?.sourceUrl;
  const activeFeatureSrc = activeSlide?.sliderFeatureImage?.node?.sourceUrl;

  const nextSlide = slides.length > 1 ? slides[(activeIndex + 1) % slides.length] : null;
  const nextBgSrc = nextSlide?.sliderBackgroundImage?.node?.sourceUrl;
  const nextFeatureSrc = nextSlide?.sliderFeatureImage?.node?.sourceUrl;

  useEffect(() => {
    if (nextBgSrc) {
      const img = new Image();
      img.src = nextBgSrc;
    }
    if (nextFeatureSrc) {
      const img = new Image();
      img.src = nextFeatureSrc;
    }
  }, [nextBgSrc, nextFeatureSrc]);

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

            <AnimatePresence mode="wait" initial={false}>
              {activeSlide ? (
                <motion.div
                  key={`hero-slide-${activeIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={CROSSFADE}
                  className="absolute inset-0 z-[1]"
                >
                  {activeBgSrc ? (
                    <div
                      className={`absolute inset-0 ${activeHasCopy ? "max-lg:hidden" : ""}`}
                    >
                      <Image
                        src={activeBgSrc}
                        alt={
                          activeSlide.sliderTitle
                            ? stripHtml(activeSlide.sliderTitle)
                            : "Hero offer"
                        }
                        fill
                        priority={activeIndex === 0}
                        sizes="100vw"
                        className={
                          activeHasCopy
                            ? "object-cover object-center"
                            : "object-contain object-center max-lg:object-contain lg:object-cover"
                        }
                      />
                    </div>
                  ) : null}

                  {activeFeatureSrc ? (
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full max-w-[400px] items-center justify-end p-4 sm:p-5 lg:flex lg:p-6">
                      <div className="relative h-full w-full max-w-[300px]">
                        <Image
                          src={activeFeatureSrc}
                          alt=""
                          fill
                          sizes="300px"
                          className="object-contain object-right"
                        />
                      </div>
                    </div>
                  ) : null}

                  {activeHasCopy ? (
                    <div className="absolute inset-0 z-10 flex flex-col justify-center p-6 font-lexend sm:p-8 lg:max-w-[70%] lg:p-10">
                      <div className="flex flex-col gap-3">
                        {activeSlide.sliderTitle ? (
                          <div
                            style={{ color: activeSlide.titleColor ?? undefined }}
                            className="flex flex-col gap-2 leading-[1.05] [&_*]:font-lexend [&_*]:leading-[1.05]"
                            dangerouslySetInnerHTML={{
                              __html: activeSlide.sliderTitle,
                            }}
                          />
                        ) : null}
                        {activeSlide.sliderDiscription ? (
                          <p
                            className="font-[family-name:var(--font-inter)] text-base font-medium text-black sm:text-lg lg:text-xl"
                            style={{
                              color: activeSlide.descriptionColor ?? undefined,
                            }}
                          >
                            {activeSlide.sliderDiscription}
                          </p>
                        ) : null}
                        {activeSlide.buttonText && activeSlide.buttonLink ? (
                          activeSlide.buttonLink.startsWith("http") ? (
                            <a
                              href={activeSlide.buttonLink}
                              className={`${HERO_SLIDE_BUTTON_CLASS} hidden lg:inline-flex`}
                            >
                              {activeSlide.buttonText}
                            </a>
                          ) : (
                            <Link
                              href={activeSlide.buttonLink}
                              className={`${HERO_SLIDE_BUTTON_CLASS} hidden lg:inline-flex`}
                            >
                              {activeSlide.buttonText}
                            </Link>
                          )
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>

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
