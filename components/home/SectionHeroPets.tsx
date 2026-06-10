"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import useInterval from "react-use/lib/useInterval";
import type { ProductCardItem } from "@/components/home/ProductCard";

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

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

function hasDealText(content?: string | null): boolean {
  if (!content) return false;
  return stripHtml(content).trim().length > 0;
}

type DealTextPosition = "top-left" | "bottom-left" | "top-right" | "bottom-right";

function normalizeDealTextPosition(value?: string | null): DealTextPosition {
  const normalized = (value ?? "Top Left").toLowerCase().replace(/\s+/g, " ").trim();

  if (normalized.includes("bottom") && normalized.includes("right")) {
    return "bottom-right";
  }
  if (normalized.includes("bottom") && normalized.includes("left")) {
    return "bottom-left";
  }
  if (normalized.includes("top") && normalized.includes("right")) {
    return "top-right";
  }
  // WP ACF occasionally stores "Top Tight" instead of "Top Right".
  if (normalized.includes("tight")) {
    return "top-right";
  }
  return "top-left";
}

function dealTextPositionClasses(position: DealTextPosition): string {
  const base =
    "pointer-events-none absolute z-10 max-w-[90%] p-6 sm:p-8 lg:p-10";

  switch (position) {
    case "bottom-left":
      return `${base} bottom-0 left-0 pb-12 text-left`;
    case "top-right":
      return `${base} right-0 top-0 text-right`;
    case "bottom-right":
      return `${base} bottom-0 right-0 pb-12 text-right`;
    default:
      return `${base} left-0 top-0 text-left`;
  }
}

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

  const deals = useMemo(
    () =>
      (data?.dealBannerSettings?.deals ?? []).filter(
        (d): d is HeroDeal => !!d?.backgroundImage?.node?.sourceUrl
      ),
    [data]
  );

  const [current, setCurrent] = useState(0);
  const [dealCurrent, setDealCurrent] = useState(0);
  const activeIndex = slides.length > 0 ? current % slides.length : 0;
  const activeDealIndex = deals.length > 0 ? dealCurrent % deals.length : 0;

  useInterval(
    () => setCurrent((prev) => (prev + 1) % slides.length),
    slides.length > 1 ? SLIDE_INTERVAL : null
  );

  useInterval(
    () => setDealCurrent((prev) => (prev + 1) % deals.length),
    deals.length > 1 ? SLIDE_INTERVAL : null
  );

  if (slides.length === 0 && deals.length === 0) return null;

  const slide = slides[activeIndex];
  const deal = deals[activeDealIndex];
  const dealHasText = hasDealText(deal?.dealContent);
  const dealTextPosition = normalizeDealTextPosition(deal?.textPosition);

  return (
    <div className={`mx-auto mt-5 w-full max-w-[1368px] px-3 md:mt-10 lg:px-0 pt-[50px] ${className}`}>
      <div className="mt-20 flex flex-col gap-4 lg:flex-row lg:justify-between lg:gap-0">
        {/* Left: promo slider */}
        {slides.length > 0 && (
          <div className="relative h-[280px] min-h-[451px] w-full overflow-hidden rounded-[24px] bg-neutral-200 sm:h-[360px] lg:h-[451px] lg:w-[72.368%]">
            {slides.map((item, index) => {
              const src = item.sliderBackgroundImage!.node!.sourceUrl!;
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={`hero-slide-${index}`}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={CROSSFADE}
                  className="absolute inset-0"
                  aria-hidden={!isActive}
                >
                  <Image
                    src={src}
                    alt={item.sliderTitle ? stripHtml(item.sliderTitle) : "Hero"}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? undefined : "eager"}
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                </motion.div>
              );
            })}

            <div
              className="pointer-events-none absolute inset-0 z-[5] rounded-[24px] bg-black/10"
              aria-hidden
            />

            <div className="pointer-events-none absolute inset-0 z-10 flex max-w-[62%] flex-col justify-center gap-4 p-7 sm:p-10 lg:p-14">
              <div className="relative min-h-[120px] w-full sm:min-h-[140px] lg:min-h-[180px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={TEXT_FADE}
                    className="pointer-events-auto flex flex-col gap-4"
                  >
                  {slide?.sliderTitle && (
                    <h2
                      style={{ color: slide.titleColor ?? undefined }}
                      className="text-2xl font-albra font-bold leading-tight text-white sm:text-3xl lg:text-5xl"
                      dangerouslySetInnerHTML={{ __html: slide.sliderTitle }}
                    />
                  )}
                  {slide?.sliderDiscription && (
                    <p
                      style={{ color: slide.descriptionColor ?? undefined }}
                      className="text-sm text-white/90 sm:text-base"
                    >
                      {slide.sliderDiscription}
                    </p>
                  )}
                  {slide?.buttonText && slide.buttonLink && (
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
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {slides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
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
        {deals.length > 0 && (
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

            <div className="relative h-[220px] w-full overflow-hidden rounded-[24px] bg-neutral-200 lg:h-[451px]">
              {deals.map((item, index) => {
                const src = item.backgroundImage!.node!.sourceUrl!;
                const isActive = index === activeDealIndex;

                return (
                  <motion.div
                    key={`hero-deal-${index}`}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={CROSSFADE}
                    className="absolute inset-0"
                    aria-hidden={!isActive}
                  >
                    <Image
                      src={src}
                      alt={item.dealContent ? stripHtml(item.dealContent) : "Deal"}
                      fill
                      priority={index === 0}
                      loading={index === 0 ? undefined : "eager"}
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </motion.div>
                );
              })}

              <AnimatePresence mode="wait" initial={false}>
                {dealHasText && (
                  <motion.div
                    key={activeDealIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={TEXT_FADE}
                    className={dealTextPositionClasses(dealTextPosition)}
                  >
                    <h3
                      style={{ color: deal?.textColor ?? "#ffffff" }}
                      className="text-xl font-albra font-bold leading-tight sm:text-2xl"
                      dangerouslySetInnerHTML={{ __html: deal!.dealContent! }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {dealHasText && (
                <div
                  className="pointer-events-none absolute inset-0 z-[5] rounded-[24px] bg-black/10"
                  aria-hidden
                />
              )}

              {deals.length > 1 && (
                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
                  {deals.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setDealCurrent(index)}
                      aria-label={`Go to deal ${index + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeDealIndex
                          ? "w-4 bg-header-accent"
                          : "w-2 bg-white/60 hover:bg-white/90"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SectionHeroPets;
