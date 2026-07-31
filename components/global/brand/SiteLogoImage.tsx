"use client";

import Image, { type ImageProps } from "next/image";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "@/site.config";
import { getLogoSources } from "@/lib/siteAssets";

type SiteLogoImageProps = Omit<ImageProps, "src" | "alt"> & {
  /** When true, only the light logo is shown (e.g. checkout on white). */
  lightOnly?: boolean;
};

/**
 * Brand logo from `site.config` — swaps light/dark assets with the `dark` class on `<html>`.
 */
export default function SiteLogoImage({
  className,
  lightOnly = false,
  width: widthProp,
  height: heightProp,
  draggable = false,
  ...imageProps
}: SiteLogoImageProps) {
  const { light, dark } = getLogoSources();
  const defaultWidth = siteConfig.assets.logo.width;
  const defaultHeight = siteConfig.assets.logo.height;
  const alt = siteConfig.brand.name;
  const showDarkVariant = !lightOnly && dark !== light;
  const width = widthProp ?? defaultWidth;
  const height = heightProp ?? defaultHeight;

  if (!showDarkVariant) {
    return (
      <Image
        src={light}
        alt={alt}
        width={width}
        height={height}
        draggable={draggable}
        className={twMerge("select-none", className)}
        {...imageProps}
      />
    );
  }

  return (
    <span className="inline-block select-none">
      <Image
        src={light}
        alt={alt}
        width={width}
        height={height}
        draggable={draggable}
        className={twMerge(className, "dark:hidden")}
        {...imageProps}
      />
      <Image
        src={dark}
        alt={alt}
        width={width}
        height={height}
        draggable={draggable}
        className={twMerge(className, "hidden dark:block")}
        {...imageProps}
      />
    </span>
  );
}
