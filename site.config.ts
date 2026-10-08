/**
 * Single source of truth for every tenant-specific value in the storefront.
 *
 * Forking this repo for a new tenant means editing THIS file (plus `content/`
 * `app/index.css` (shadcn base tokens only), and this file - not hunting hardcoded
 * strings through components.
 * Anything brand-, locale-, contact-, payment-, or analytics-specific lives
 * here. See docs/FORK-FOUNDATION-PLAN.md §2.
 */
export const siteConfig = {
  brand: {
    name: "Snappers",
    legalName: "Catlitter (Pvt) Ltd",
    shortName: "",
    tagline: "Everyday essentials, delivered.",
    description:
      "Shop groceries, bakery, household essentials, and deals online. Delivery in Colombo and suburbs from Snappers.lk.",
  },
  /**
   * Paths are under `public/` (e.g. `/global/logo.png` → `public/global/logo.png`).
   * Provide separate `dark` entries for class-based UI; favicons use OS `prefers-color-scheme`.
   */
  /**
   * Brand palette - space-separated RGB channels (e.g. "27 64 175" for #1b40af).
   * Drives Tailwind `primary-*`, `primaryColor`, and `secondary-*` via CSS variables
   * injected in the root layout (`SiteThemeStyles`).
   */
  theme: {
    brandHex: {
      primary: "#1b40af",
      /** Brand navy - top bar, search border, badges, footer, accents. */
      headerGreen: "#071C43",
      topBar: "#071C43",
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
     * Header palette - space-separated RGB channels (e.g. "62 75 35" for #3e4b23).
     * Drives the cream top bar and dark-green utility bar via `--c-header-*`
     * (injected in `SiteThemeStyles`) and the Tailwind `header-*` tokens.
     */
    header: {
      /** Thin top announcement bar (#071C43). */
      topbar: "7 28 67",
      /** Category nav strip under main header (#253D4E). */
      category: "37 61 78",
      /** Main header bar behind logo + nav (#F2F3F4). */
      cream: "242 243 244",
      green: "7 28 67",
      // Soft-peach action icons + Basket pill on the cream bar.
      peach: "253 230 214",
      accent: "243 168 130",
      /** Primary CTA fill - Add to cart, checkout, confirm order (#ACDA5A). */
      action: "172 218 90",
    },
    /** Deal section - countdown, carousel controls, product-card accent. */
    deal: {
      brown: "62 37 27",
      accent: "184 217 98",
    },
  },
  assets: {
    logo: {
      light: "/global/snappers-logo.webp",
      dark: "/global/snappers-logo.webp",
      width: 204,
      height: 64,
    },
    favicon: {
      light: "/global/favicon.png",
      dark: "/global/favicon.png",
    },
    appleTouchIcon: "/global/apple-touch-icon.png",
  },
  url: {
    base: "https://www.catlitter.lk",
    api: "https://snappers-api.freshpixl.com",
    cdn: "https://snappers-api.freshpixl.com",
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
    primaryPhone: "0766676332",
    primaryPhoneDisplay: "076 667 6332",
    whatsapp: "94766676332",
    email: "catlitter.lk@gmail.com",
    storeAddress:
      "No. 107, Kirula Road, Narahenpita, Colombo 05, Sri Lanka",
    /** Formspree form ID - set `NEXT_PUBLIC_FORMSPREE_CONTACT_ID` in env. */
    formspreeContactFormId:
      process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID ?? "",
  },
  /** Header + footer navigation (see `NavLinks`, `footer`). */
  navigation: {
    /** Thin top bar above the header (see `HeaderAnnouncementBar`). */
    topBar: {
      links: [
        { href: "/account", name: "My Account" },
        { href: "/account/save-lists", name: "Wishlist" },
      ],
      /** Center column uses `footerQuickLinks` (see `HeaderAnnouncementBar`). */
      message: "100% Secure delivery without contacting the courier",
      helpLabel: "Need help? Call Us:",
    },
    main: [
      { href: "/deals", name: "Deals" },
      { href: "/groceries", name: "Groceries" },
      { href: "/bakery", name: "Bakery" },
      { href: "/household", name: "Household" },
      { href: "/beverages", name: "Beverages" },
      { href: "/chilled", name: "Chilled" },
      { href: "/fresh", name: "Fresh" },
      { href: "/frozen", name: "Frozen" },
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
      heading: "Quick links",
      links: [
        { href: "/", name: "Home" },
        { href: "/shop", name: "Shop" },
        { href: "/deals", name: "Deals" },
        { href: "/about", name: "About us" },
        { href: "/contact", name: "Contact us" },
      ],
    },
  },
  /** Footer layout content (see `components/footer/Footer.tsx`). */
  footer: {
    tagline: "Everyday essentials, delivered across Sri Lanka.",
    newsletter: {
      heading: "Deals & updates in your inbox",
      placeholder: "yourname@mail.com",
      buttonLabel: "Subscribe",
    },
    openTime: {
      heading: "Delivery & support",
      groups: [
        {
          lines: [
            {
              label: "Where we deliver",
              hours: "Colombo and suburbs only - not island-wide.",
            },
            {
              label: "Same-day delivery",
              hours: "Place your order before 2:00 PM.",
            },
            {
              label: "Next-day delivery",
              hours: "Orders after 2:00 PM arrive the following day.",
            },
          ],
        },
      ],
    },
    shopHeading: "Shop categories",
    customerServices: {
      heading: "Customer service",
      links: [
        { href: "/privacy", name: "Privacy policy" },
        { href: "/terms-and-conditions", name: "Terms & conditions" },
      ],
    },
    support: {
      heading: "Need help?",
      phones: [{ display: "076 667 6332", tel: "0766676332" }],
      email: { display: "info@snappers.lk", mailto: "info@snappers.lk" },
    },
    socialHeading: "Follow us",
  },
  social: {
    facebook: "https://www.facebook.com/Snapperslanka",
    instagram: "https://www.instagram.com/snapperslk/",
    x: "https://x.com/snapperslk",
    tiktok: "https://www.tiktok.com/@snapperslk",
    googleReviewUrl:
      "https://www.google.com/search?q=catlitter.lk&newwindow=1&sca_esv=47fdd52eba661d26&rlz=1C5CHFA_enLK1163LK1163&biw=1710&bih=985&sxsrf=APpeQnt9vKUXvlC8bmdZEbb-YhBaKGCIKw%3A1782983829933&ei=lSxGasnAOM6wwcsPpsKluQI&ved=0ahUKEwiJ38qu1LOVAxVOWHADHSZhKScQ4dUDCBI&uact=5&oq=catlitter.lk&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGNhdGxpdHRlci5sazIEECMYJzILEC4YrwEYxwEYgAQyBRAAGIAEMgUQABiABDIEEAAYHjIEEAAYHjICECZI4AdQyARY0AVwAXgBkAEAmAGRAaAB6wGqAQMxLjG4AQPIAQD4AQGYAgKgAmnCAgoQABhHGNYEGLADmAMAiAYBkAYIkgcDMS4xoAffE7IHAzAuMbgHZcIHBzAuMS4wLjHIBwuACAE&sclient=gws-wiz-serp#",
  },
  payment: {
    gatewayOrder: ["payhere", "ndb-pay", "cod", "cheque", "darazbnpl", "bacs"],
    kokoGatewayId: "darazbnpl",
    // Gateways the customer settles on delivery rather than online. They take
    // no payment step during checkout, so the order is confirmed in-app and
    // the customer goes straight to the thank-you page - and they all need a
    // delivery leg to collect at, so Store Pickup / Flash Delivery disable them.
    // "cheque" is WooCommerce's built-in cheque gateway, retitled "Card on
    // Delivery" in wp-admin; the id stays `cheque`.
    payOnDeliveryGatewayIds: ["cod", "cheque"] as const,
    // Pay-on-delivery gateways that additionally need one of our own riders at
    // the door: they carry the card terminal, third-party couriers don't. Only
    // CatLitter Delivery puts our own rider on the doorstep.
    ownFleetOnlyGatewayIds: ["cheque"] as const,
    // Gateways that quote the shared Visa/Mastercard tier in woo-price-tiers.
    cardGatewayIds: ["payhere", "webxpay", "ndb-pay", "geniebiz"] as const,
    // Gateways whose checkout mutation returns a pay URL we should follow.
    offsiteRedirectGatewayIds: ["geniebiz", "webxpay"] as const,
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
    /**
     * CatLitter Delivery - our own fleet, priced by distance server-side.
     *
     * The dwbs instance in WooCommerce > Settings > Shipping > Sri Lanka
     * quotes BOTH of its sub-modes at once inside the delivery radius:
     * `dwbs:2:distance` "Local Delivery" is our fleet, `dwbs:2:weight`
     * "Standard Shipping" is the island-wide courier. Outside the radius only
     * the weight rate is quoted, and the checkout offers Courier delivery in
     * place of CatLitter Delivery.
     *
     * So this must name the sub-mode, not just the instance - a bare `dwbs:2`
     * prefix would claim both rates and leave the courier option with none.
     * A single-rate method such as `flat_rate:5` is matched exactly.
     *
     * Empty string keeps the delivery option hidden. Keep it empty until the
     * WooCommerce rate exists - offering a rate the store cannot quote makes
     * `updateShippingMethod` fail and leaves the cart on a stale rate.
     */
    catlitterDeliveryMethodId: "dwbs:2:distance",
    /**
     * Flash Delivery - the customer books an Uber / PickMe to collect. A
     * zero-cost flat rate in WooCommerce > Settings > Shipping titled
     * "Flash Delivery (Uber/PickMe)". Checkout refuses a Flash order when the
     * store doesn't quote this rate: WooCommerce silently swaps an unknown
     * method for the first rate it has, which bills a delivery charge.
     */
    flashDeliveryMethodId: "flat_rate:4",
  },
  analytics: {
    googleAnalyticsId: "G-LS3EVR93ZH",
  },
  /** Set `indexable: true` when the site goes live. */
  seo: {
    indexable: true,
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
