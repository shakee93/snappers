/**
 * Single source of truth for every tenant-specific value in the storefront.
 *
 * Forking this repo for a new tenant means editing THIS file (plus `content/`
 * `app/index.css` (shadcn base tokens only), and this file — not hunting hardcoded
 * strings through components.
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
  /**
   * Paths are under `public/` (e.g. `/global/logo.png` → `public/global/logo.png`).
   * Provide separate `dark` entries for class-based UI; favicons use OS `prefers-color-scheme`.
   */
  /**
   * Brand palette — space-separated RGB channels (e.g. "27 64 175" for #1b40af).
   * Drives Tailwind `primary-*`, `primaryColor`, and `secondary-*` via CSS variables
   * injected in the root layout (`SiteThemeStyles`).
   */
  theme: {
    brandHex: {
      primary: "#1b40af",
    },
    colors: {
      primary: {
        "50": "237 240 249",
        "100": "221 226 243",
        "200": "187 198 231",
        "300": "146 163 217",
        "400": "91 117 197",
        "500": "27 64 175",
        "600": "24 56 154",
        "700": "20 48 131",
        "800": "16 38 105",
        "900": "12 29 79",
      },
      secondary: {
        "50": "240 253 250",
        "100": "204 251 241",
        "200": "153 246 228",
        "300": "94 234 212",
        "400": "45 212 191",
        "500": "20 184 166",
        "600": "13 148 136",
        "700": "15 118 110",
        "800": "17 94 89",
        "900": "19 78 74",
      },
    },
    semantic: {
      success: "#059669",
      danger: "#d71e1e",
    },
  },
  assets: {
    logo: {
      light: "/global/gq-logo.png",
      dark: "/global/gq-logo.png",
      width: 320,
      height: 266,
    },
    favicon: {
      light: "/global/gq-logo.png",
      dark: "/global/gq-logo.png",
    },
    // Optional; defaults to favicon light when omitted.
    // appleTouchIcon: "/global/apple-touch-icon.png",
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
    email: "inquiries@gqmobiles.lk",
    storeAddress:
      "No. 250 | 53–54 Ground Floor, Liberty Plaza, Colombo 03",
  },
  businessHours: {
    heading: "Business Hours",
    schedule: [
      { label: "Monday - Saturday", hours: "10AM - 8PM" },
      { label: "Poya Day", hours: "10AM - 6PM" },
      { label: "Sunday", hours: "Closed" },
    ],
  },
  /** Header + footer navigation (see `NavLinks`, `footer`). */
  navigation: {
    main: [
      { href: "/", name: "Home" },
      { href: "/collections", name: "Collections", menu: "categories" },
      { href: "/brands", name: "Brands" },
      { href: "/collections/all", name: "Shop" },
      { href: "/deals", name: "Deals", special: true },
      { href: "/contact", name: "Location" },
      { href: "/tag/pre-order", name: "Pre-Order" },
    ],
    footerQuickLinks: {
      heading: "Quick Links",
      links: [
        { href: "/collections/all", name: "Shop" },
        { href: "/about", name: "About us" },
        { href: "/contact", name: "Contact Us" },
        { href: "/privacy", name: "Privacy Policy" },
        { href: "/warranty-terms", name: "Warranty Terms" },
        { href: "/terms-and-conditions", name: "Terms & Conditions" },
      ],
    },
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
    // Bank accounts shown for the BACS / bank-transfer gateway. The full list
    // renders on the bank-details view; the one flagged `featuredAtCheckout`
    // is the single account shown inline in the checkout BACS panel.
    bankAccounts: [
      {
        bank: "Sampath Bank",
        accName: "GQ Mobiles Pvt Ltd",
        accNo: "004210015529",
        branch: "Mainstreet Branch",
        featuredAtCheckout: false,
      },
      {
        bank: "Commercial Bank",
        accName: "GQ Mobiles Pvt Ltd",
        accNo: "1000475584",
        branch: "Head office",
        featuredAtCheckout: true,
      },
      {
        bank: "People’s Bank",
        accName: "GQ MOBILES (PVT) LTD",
        accNo: "309100120010779",
        branch: "Liberty Plaza",
        featuredAtCheckout: false,
      },
      {
        bank: "HNB",
        accName: "GQ Mobile Store",
        accNo: "007010313159",
        branch: "Mainstreet Branch",
        featuredAtCheckout: false,
      },
      {
        bank: "NTB",
        accName: "GQ Mobile Store",
        accNo: "100030010564",
        branch: "Bankshall Street Branch",
        featuredAtCheckout: false,
      },
    ],
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
export type SiteNavLink = SiteConfig["navigation"]["main"][number];
export type SiteFooterQuickLink =
  SiteConfig["navigation"]["footerQuickLinks"]["links"][number];
