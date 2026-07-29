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
    name: "Catlitter",
    legalName: "Catlitter (Pvt) Ltd",
    shortName: "",
    tagline: "Best pet care in the market",
    description:
      "Shop the best pet care products in the market. Find the latest products from top brands.",
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
      dealBrown: "#3E251B",
      dealAccent: "#B8D962",
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
    /**
     * Header palette — space-separated RGB channels (e.g. "62 75 35" for #3e4b23).
     * Drives the cream top bar and dark-green utility bar via `--c-header-*`
     * (injected in `SiteThemeStyles`) and the Tailwind `header-*` tokens.
     */
    header: {
      cream: "254 244 234",
      green: "56 70 31",
      // Soft-peach action icons + Basket pill on the cream bar.
      peach: "253 230 214",
      accent: "243 168 130",
      /** Primary CTA fill — Add to cart, checkout, confirm order (#ACDA5A). */
      action: "172 218 90",
    },
    /** Deal section — countdown, carousel controls, product-card accent. */
    deal: {
      brown: "62 37 27",
      accent: "184 217 98",
    },
  },
  assets: {
    logo: {
      light: "https://catlitter-api.freshpixl.com/wp-content/uploads/2026/06/logo.png",
      dark: "https://catlitter-api.freshpixl.com/wp-content/uploads/2026/06/logo.png",
      width: 211,
      height: 31,
    },
    favicon: {
      light: "/favicon-black.ico",
      dark: "/favicon-white.ico",
    },
    // Optional; defaults to favicon light when omitted.
    // appleTouchIcon: "/global/apple-touch-icon.png",
  },
  url: {
    base: "https://catlitter-xi.vercel.app",
    api: "https://catlitter-api.freshpixl.com",
    cdn: "https://cdn.gqmobiles.lk",
    defaultOgImage: "/global/catlitter-og.jpg",
  },
  locale: {
    countryCode: "LK",
    countryName: "Sri Lanka",
    currencyCode: "LKR",
    currencySymbol: "LKR",
    phoneCountryCode: "+94",
    ogLocale: "en_US",
  },
  contact: {
    primaryPhone: "0716060123",
    primaryPhoneDisplay: "071 6060 123",
    whatsapp: "94716060123",
    email: "catlitter.lk@gmail.com",
    storeAddress:
      "No. 107, Kirula Road, Narahenpita, Colombo 05, Sri Lanka",
    /** Formspree form ID — set `NEXT_PUBLIC_FORMSPREE_CONTACT_ID` in env. */
    formspreeContactFormId:
      process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID ?? "",
  },
  businessHours: {
    heading: "Business Hours",
    schedule: [
      { label: "Monday - Saturday", hours: "5AM - 8PM" },
      { label: "Poya Day", hours: "10AM - 6PM" },
      { label: "Sunday", hours: "Closed" },
    ],
  },
  /** Header + footer navigation (see `NavLinks`, `footer`). */
  navigation: {
    main: [
      { href: "/cat", name: "Cat" },
      { href: "/dog", name: "Dog" },
      { href: "/bird", name: "Birds" },
      { href: "/aquarium", name: "Aquarium" },
      { href: "/rabbit-hamsters", name: "Rabbit & Hamsters" },
    ],
    /** Quick links on the dark-green utility bar (see `HeaderUtilityBar`). */
    utility: {
      links: [
        { href: "/new-arrivals", name: "New Arrivals" },
        { href: "/deals", name: "Flash deals" },
        { href: "/shop", name: "Most Selling" },
      ],
      // Each entry renders on its own line in the utility bar.
      message: ["Cash on Delivery Available Island-wide |", "Shop with Confidence"],
    },
    footerQuickLinks: {
      heading: "Quick Links",
      links: [
        { href: "/shop", name: "Shop" },
        { href: "/about", name: "About us" },
        { href: "/contact", name: "Contact Us" },
        { href: "/privacy", name: "Privacy Policy" },
        { href: "/warranty-terms", name: "Warranty Terms" },
        { href: "/terms-and-conditions", name: "Terms & Conditions" },
      ],
    },
  },
  /** Footer layout content (see `components/footer/Footer.tsx`). */
  footer: {
    newsletter: {
      heading: "Sign up for our email newsletter",
      placeholder: "yourname@mail.com",
      buttonLabel: "Subscribe",
    },
    openTime: {
      heading: "Open Time",
      schedule: [
        { label: "Monday - Saturday", hours: "09:00 AM - 09.00 PM" },
        { label: "Sunday & Poya", hours: "09:30 AM - 6.00 PM" },
      ],
    },
    visitUsHeading: "Visit Us",
    shopHeading: "Shop",
    customerServices: {
      heading: "Customer Services",
      links: [
        { href: "/about", name: "About Us" },
        { href: "/privacy", name: "Privacy Policy" },
        { href: "/terms-and-conditions", name: "Terms & Conditions" },
        { href: "/delivery-details", name: "Delivery Details" },
        { href: "/return-policy", name: "Return Policy" },
      ],
    },
    support: {
      heading: "Our experts are available 24/7",
      phones: [{ display: "071 6060 123", tel: "0716060123" }],
    },
  },
  social: {
    facebook: "catlitter.lk",
    instagram: "catlittersrilanka",
    tiktok: "@catlitter.lk",
    googleReviewUrl:
      "https://www.google.com/search?q=catlitter.lk&newwindow=1&sca_esv=47fdd52eba661d26&rlz=1C5CHFA_enLK1163LK1163&biw=1710&bih=985&sxsrf=APpeQnt9vKUXvlC8bmdZEbb-YhBaKGCIKw%3A1782983829933&ei=lSxGasnAOM6wwcsPpsKluQI&ved=0ahUKEwiJ38qu1LOVAxVOWHADHSZhKScQ4dUDCBI&uact=5&oq=catlitter.lk&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGNhdGxpdHRlci5sazIEECMYJzILEC4YrwEYxwEYgAQyBRAAGIAEMgUQABiABDIEEAAYHjIEEAAYHjICECZI4AdQyARY0AVwAXgBkAEAmAGRAaAB6wGqAQMxLjG4AQPIAQD4AQGYAgKgAmnCAgoQABhHGNYEGLADmAMAiAYBkAYIkgcDMS4xoAffE7IHAzAuMbgHZcIHBzAuMS4wLjHIBwuACAE&sclient=gws-wiz-serp#",
  },
  payment: {
    gatewayOrder: ["payhere", "ndb-pay", "cod", "darazbnpl", "bacs"],
    kokoGatewayId: "darazbnpl",
    // Gateways that quote the shared Visa/Mastercard tier in woo-price-tiers.
    cardGatewayIds: ["payhere", "webxpay", "ndb-pay", "geniebiz"] as const,
    // Gateways that genuinely cannot be combined with coupon discounts.
    // Keep this separate from `cardGatewayIds`: not every card processor has
    // the same coupon rule.
    couponRestrictedGatewayIds: ["payhere"] as const,
    payhere: {
      hideAboveAmount: 100000,
    },
    // Bank accounts shown for the BACS / bank-transfer gateway. The full list
    // renders on the bank-details view; the one flagged `featuredAtCheckout`
    // is the single account shown inline in the checkout BACS panel.
    bankAccounts: [
      {
        bank: "Sampath Bank",
        accName: "CAT LITTER LK",
        accNo: "xxx",
        branch: "Mainstreet Branch",
        featuredAtCheckout: false,
      },
      {
        bank: "Commercial Bank",
        accName: "CAT LITTER LK",
        accNo: "1000293645",
        branch: "Narahenpita",
        featuredAtCheckout: true,
      },
      {
        bank: "People’s Bank",
        accName: "CAT LITTER LK",
        accNo: "xxx",
        branch: "Liberty Plaza",
        featuredAtCheckout: false,
      },
      {
        bank: "HNB",
        accName: "CAT LITTER LK",
        accNo: "xxx",
        branch: "Mainstreet Branch",
        featuredAtCheckout: false,
      },
      {
        bank: "NTB",
        accName: "CAT LITTER LK",
        accNo: "xxx",
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
  /** Set `indexable: true` when the site goes live. */
  seo: {
    indexable: false,
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
export type SiteUtilityLink =
  SiteConfig["navigation"]["utility"]["links"][number];
export type SiteFooterQuickLink =
  SiteConfig["navigation"]["footerQuickLinks"]["links"][number];
