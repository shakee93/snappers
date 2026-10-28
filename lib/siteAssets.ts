import type { Metadata } from "next";
import { siteConfig } from "@/site.config";

/** Public URL for a logo or favicon path from `site.config` (`/global/...`). */
export function getPublicAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Origin that actually serves this Next deployment (static files under `public/`).
 * Prefer Vercel's production host over `NEXT_PUBLIC_DOMAIN` when the apex/www
 * domain still points at WordPress.
 */
export function getSiteDeploymentBaseUrl(): string {
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return `https://${vercelProduction.replace(/^https?:\/\//, "")}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "")}`;
  }

  const fromEnv = process.env.NEXT_PUBLIC_DOMAIN?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  return siteConfig.url.base.replace(/\/$/, "");
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

/** Default share/preview image — absolute URL on the live Next host (~1.9:1 JPG). */
export function getSiteOgImage(): string {
  const explicit = process.env.NEXT_PUBLIC_OG_IMAGE?.trim();
  if (explicit) return explicit;

  const configured = siteConfig.url.defaultOgImage;
  if (/^https?:\/\//.test(configured)) return configured;

  const path = configured.startsWith("/") ? configured : `/${configured}`;
  return `${getSiteDeploymentBaseUrl()}${path}`;
}

export function getSiteTwitterImage(): string {
  return getSiteOgImage();
}

export function getSiteOgImageDimensions(): { width: number; height: number } {
  return {
    width: siteConfig.url.defaultOgImageWidth,
    height: siteConfig.url.defaultOgImageHeight,
  };
}
