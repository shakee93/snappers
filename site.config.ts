/**
 * Single source of truth for every tenant-specific value in the storefront.
 *
 * Forking this repo for a new tenant means editing THIS file (plus `content/`
 * and `app/globals.css`) — not hunting hardcoded strings through components.
 * Anything brand-, locale-, contact-, payment-, or analytics-specific lives
 * here. See docs/FORK-FOUNDATION-PLAN.md §2.
 */
export const siteConfig = {
  brand: {
    name: "GQ Mobiles",
    legalName: "GQ Mobiles (Pvt) Ltd",
    shortName: "GQ",
    tagline: "Best mobile phones in the market",
    description:
      "Shop the best mobile phones, smartwatches, and accessories at GQ Mobiles. Find the latest tech from top brands.",
  },
  url: {
    base: "https://gqmobiles.lk",
    api: "https://api.gqmobiles.lk",
    cdn: "https://cdn.gqmobiles.lk",
    defaultOgImage:
      "https://cdn.gqmobiles.lk/wp-content/uploads/2025/10/gq.png",
  },
  locale: {
    countryCode: "LK",
    countryName: "Sri Lanka",
    currencyCode: "LKR",
    currencySymbol: "Rs",
    phoneCountryCode: "+94",
    ogLocale: "en_US",
  },
  contact: {
    primaryPhone: "0777555665",
    secondaryPhone: "0777988665",
    whatsapp: "94722299944",
    email: "Inquires@gqmobiles.lk",
    storeAddress:
      "No. 250 | 53–54 Ground Floor, Liberty Plaza, Colombo 03",
  },
  social: {
    facebook: "gqmobilestore",
    instagram: "gqthemobilestoreunlimited",
    tiktok: "@gqmobiles",
    googleReviewUrl:
      "https://www.google.com/search?hl=en-LK&gl=lk&q=ground+floor,+GQ+-The+Mobile+Store,+250,+54+R.+A.+De+Mel+Mawatha,+Colombo+00300&ludocid=1458190955880003094&lsig=AB86z5VvNAV33q2slj2rSzJqGGyh#lrd=0x3ae25975d215fa97:0x143c88f2d3ea3616,3",
  },
  payment: {
    gatewayOrder: ["payhere", "ndb-pay", "cod", "darazbnpl", "bacs"],
    kokoGatewayId: "darazbnpl",
    payhere: {
      hideAboveAmount: 100000,
      cardSurchargeRate: 0.03,
    },
  },
  shipping: {
    freeShippingMethodId: "wbs:5c9bd062_free_shipping",
    weightBasedShippingMethodId: "wbs:0dd3bc79_weight_based_shipping",
  },
  analytics: {
    googleAnalyticsId: "G-LS3EVR93ZH",
  },
  product: {
    // Default warranty used in product JSON-LD when a product has none set.
    defaultWarranty: {
      duration: 6,
      unit: "MON",
      description:
        "Covers manufacturing defects in materials and workmanship for 6 months from date of purchase",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
