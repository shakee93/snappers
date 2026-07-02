import type { Metadata } from "next";
import { siteConfig } from "@/site.config";

/** Public URL for a logo or favicon path from `site.config` (`/global/...`). */
export function getPublicAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

export function getLogoSources(): { light: string; dark: string } {
  const { light, dark } = siteConfig.assets.logo;
  const lightUrl = getPublicAssetUrl(light);
  return {
    light: lightUrl,
    dark: getPublicAssetUrl(dark ?? light),
  };
}

export function getFaviconSources(): { light: string; dark: string } {
  const { light, dark } = siteConfig.assets.favicon;
  const lightUrl = getPublicAssetUrl(light);
  return {
    light: lightUrl,
    dark: getPublicAssetUrl(dark ?? light),
  };
}

/** Next.js metadata icons with OS light/dark preference. */
export function getSiteMetadataIcons(): NonNullable<Metadata["icons"]> {
  const { light, dark } = getFaviconSources();
  const appleTouchIcon =
    "appleTouchIcon" in siteConfig.assets
      ? (siteConfig.assets as { appleTouchIcon?: string }).appleTouchIcon
      : undefined;
  const apple = appleTouchIcon ? getPublicAssetUrl(appleTouchIcon) : light;

  return {
    icon: [
      { url: light, media: "(prefers-color-scheme: light)" },
      { url: dark, media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: light,
    apple,
  };
}

export function getSiteOgImage(): string {
  return getPublicAssetUrl(siteConfig.url.defaultOgImage);
}

export function getSiteTwitterImage(): string {
  return getSiteOgImage();
}
