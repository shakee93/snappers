import { siteConfig } from "@/site.config";
import type { HeroSlide } from "@/components/home/SectionHeroPets";

/** Shared Tailwind classes for hero slide headlines (Playfair). */
export const HERO_SLIDER_TITLE_CLASS =
  "block font-playfair text-[2rem] font-bold leading-tight text-[#0C2016] sm:text-4xl lg:text-[60px] lg:leading-[1.1]";

export type GraphqlHeroSlideNode = {
  heroSlideFields?: {
    mainTitle?: string | null;
    subContent?: string | null;
    buttonText?: string | null;
    buttonUrl?: string | null;
    backgroundImage?: { node?: { sourceUrl?: string | null } | null } | null;
    featureImage?: { node?: { sourceUrl?: string | null } | null } | null;
  } | null;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Same-site WP URLs → app-router paths; leave other origins as absolute URLs. */
export function normalizeHeroButtonUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    const siteHosts = new Set(
      [
        siteConfig.url.api,
        siteConfig.url.cdn,
        process.env.NEXT_PUBLIC_DOMAIN,
      ]
        .filter(Boolean)
        .map((origin) => {
          try {
            return new URL(origin as string).hostname;
          } catch {
            return null;
          }
        })
        .filter((h): h is string => !!h),
    );
    siteHosts.add("snappers.lk");
    siteHosts.add("snappers-api.freshpixl.com");

    if (siteHosts.has(parsed.hostname)) {
      const path = parsed.pathname.replace(/\/{2,}/g, "/") || "/";
      return `${path}${parsed.search}${parsed.hash}`;
    }
    return trimmed;
  } catch {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
}

export function mapGraphqlHeroSlides(
  nodes: GraphqlHeroSlideNode[],
): HeroSlide[] {
  return nodes.flatMap((node): HeroSlide[] => {
    const fields = node.heroSlideFields;
    if (!fields) return [];

    const hasSlide =
      fields.mainTitle?.trim() ||
      fields.subContent?.trim() ||
      fields.backgroundImage?.node?.sourceUrl ||
      fields.featureImage?.node?.sourceUrl;

    if (!hasSlide) return [];

    const title = fields.mainTitle?.trim();
    const buttonLink = normalizeHeroButtonUrl(fields.buttonUrl);

    return [
      {
        sliderTitle: title
          ? `<span class="${HERO_SLIDER_TITLE_CLASS}">${escapeHtml(title)}</span>`
          : null,
        sliderDiscription: fields.subContent?.trim() || null,
        titleColor: "#0C2016",
        descriptionColor: "#7DA068",
        buttonText: fields.buttonText?.trim() || null,
        buttonLink,
        buttonTextColor: "#ffffff",
        buttonBachgroundColor: "#6d7f94",
        buttonBorderColor: "#000000",
        sliderBackgroundImage: fields.backgroundImage ?? null,
        sliderFeatureImage: fields.featureImage ?? null,
      },
    ];
  });
}
