/** Snappers titles — Lexend across section, page, hero, and card headings. */

export const titleFontClass = "font-lexend";

export const sectionEyebrowClass =
  "text-left text-xs font-semibold uppercase tracking-[0.16em] text-primary-600 sm:text-sm";

/** Primary section headings — 40px from tablet up. */
export const sectionTitleClass =
  `${titleFontClass} text-left text-[1.75rem] font-bold leading-[1.08] tracking-tight text-black min-[768px]:text-[40px] min-[768px]:leading-[1.1] min-[768px]:whitespace-nowrap`;

/** Optional inline span inside a section title (same black as parent). */
export const sectionTitleAccentClass = "text-black";

/** Subtitle under section headings (shop by category, deals strip, etc.). */
export const sectionDescriptionClass =
  "mt-2 max-w-2xl text-sm font-medium leading-snug text-black/60 md:mt-3 md:text-lg md:leading-normal";

/** @deprecated Use `sectionTitleClass` — kept for imports. */
export const dealSectionTitleClass = sectionTitleClass;

/** CMS hero carousel headlines. */
export const heroSlideTitleClass =
  `${titleFontClass} block text-[1.75rem] font-bold leading-[1.1] tracking-tight text-header-green sm:text-4xl lg:text-[2.75rem]`;

/** Static page H1 (about, contact, checkout). */
export const pageTitleClass =
  `${titleFontClass} text-left text-3xl font-bold tracking-tight text-header-green sm:text-4xl md:text-5xl`;

/** Subsection H2 on content pages. */
export const pageSectionTitleClass =
  `${titleFontClass} text-left text-2xl font-bold tracking-tight text-header-green md:text-4xl`;

/** Product / feature card titles. */
export const cardTitleClass =
  `${titleFontClass} text-xl font-bold leading-tight text-header-green sm:text-[1.65rem] sm:leading-[1.25] lg:text-[1.85rem]`;
