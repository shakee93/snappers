"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import notFoundContent from "@/content/not-found.json";
import { useChromeVisibility } from "@/context/ChromeVisibilityProvider";

const NotFoundPageContent = () => {
  const { hero } = notFoundContent;
  const { setHideChrome } = useChromeVisibility();

  useEffect(() => {
    setHideChrome(true);
    return () => setHideChrome(false);
  }, [setHideChrome]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-12">
      <Image
        src="/404bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-header-green/80">
          {hero.eyebrow}
        </p>
        <p
          className="mt-2 font-albra text-8xl font-semibold leading-none text-header-green md:text-9xl"
          aria-hidden
        >
          {hero.code}
        </p>
        <h1 className="mt-3 font-albra text-3xl font-semibold leading-tight text-header-green md:text-4xl">
          {hero.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-neutral-700 md:text-lg">
          {hero.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={hero.cta.primary.href}
            className="inline-flex items-center rounded-full bg-header-action px-8 py-3.5 text-sm font-bold text-header-green transition-opacity hover:opacity-90"
          >
            {hero.cta.primary.label}
          </Link>
          <Link
            href={hero.cta.secondary.href}
            className="inline-flex items-center rounded-xl border border-header-green/25 bg-white/80 px-8 py-3.5 text-sm font-bold text-header-green backdrop-blur-sm transition-colors hover:bg-white"
          >
            {hero.cta.secondary.label}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPageContent;
