"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND_CTA_BUTTON_CLASS } from "@/shared/Button/ButtonBrand";
import { useEffect } from "react";
import notFoundContent from "@/content/not-found.json";
import { useChromeVisibility } from "@/context/ChromeVisibilityProvider";
import { titleFontClass } from "@/lib/sectionTypography";
import { cn } from "@/lib/utils";

const NotFoundPageContent = () => {
  const { hero } = notFoundContent;
  const { setHideChrome } = useChromeVisibility();

  useEffect(() => {
    setHideChrome(true);
    return () => setHideChrome(false);
  }, [setHideChrome]);

  return (
    <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-[#F9F7F2] py-10 sm:py-12">
      <Image
        src="/404bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600 sm:text-sm">
          {hero.eyebrow}
        </p>
        <p
          className={cn(
            titleFontClass,
            "mt-3 text-[5.5rem] font-bold leading-none text-header-green sm:text-[7rem] md:text-[8.5rem]",
          )}
          aria-hidden
        >
          {hero.code}
        </p>
        <h1
          className={cn(
            titleFontClass,
            "mt-4 text-3xl font-bold tracking-tight text-header-green sm:text-4xl md:text-[2.75rem] md:leading-tight",
          )}
        >
          {hero.title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-neutral-600 md:text-lg">
          {hero.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10 sm:gap-4">
          <Link
            href={hero.cta.primary.href}
            className={cn(
              "inline-flex items-center rounded-full px-8 py-3.5 text-sm font-bold transition-opacity hover:opacity-90",
              BRAND_CTA_BUTTON_CLASS,
            )}
          >
            {hero.cta.primary.label}
          </Link>
          <Link
            href={hero.cta.secondary.href}
            className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-8 py-3.5 text-sm font-bold text-header-green transition-colors hover:bg-neutral-50"
          >
            {hero.cta.secondary.label}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPageContent;
