import { siteConfig } from "@/site.config";

type ColorScale = Record<
  "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900",
  string
>;

function scaleToCssVars(prefix: "primary" | "secondary", scale: ColorScale): string {
  return Object.entries(scale)
    .map(([shade, channels]) => `  --c-${prefix}-${shade}: ${channels};`)
    .join("\n");
}

/** CSS custom properties for :root — injected once in the root layout. */
export function getSiteThemeCss(): string {
  const { primary, secondary } = siteConfig.theme.colors;
  const { cream, green, peach, accent, action } = siteConfig.theme.header;
  const { brown: dealBrown, accent: dealAccent } = siteConfig.theme.deal;

  return `:root {
${scaleToCssVars("primary", primary)}
${scaleToCssVars("secondary", secondary)}
  --c-header-cream: ${cream};
  --c-header-green: ${green};
  --c-header-peach: ${peach};
  --c-header-accent: ${accent};
  --c-header-action: ${action};
  --c-deal-brown: ${dealBrown};
  --c-deal-accent: ${dealAccent};
}`;
}

/** Brand blue channels (primary-500) for inline styles when needed. */
export function getBrandPrimaryRgb(): string {
  return siteConfig.theme.colors.primary["500"];
}

export function getBrandPrimaryHex(): string {
  return siteConfig.theme.brandHex.primary;
}
