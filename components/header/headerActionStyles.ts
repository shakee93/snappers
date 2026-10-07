/** Shared desktop header action row (Wishlist · Account · Cart). */

export const HEADER_ACTION_ICON_BOX =
  "relative flex h-7 w-7 shrink-0 items-center justify-center";

export const HEADER_ACTION_ICON =
  "h-6 w-6 shrink-0 stroke-[1.75] text-neutral-800";

export const HEADER_ACTION_BADGE =
  "absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-header-green px-0.5 text-[10px] font-semibold leading-none text-white tabular-nums";

export const HEADER_ACTION_ITEM =
  "group inline-flex min-h-7 items-center gap-2 border-0 bg-transparent p-0 font-sans text-left no-underline transition-colors hover:text-neutral-900";

export const HEADER_ACTION_LABEL =
  "hidden text-[13px] font-normal leading-none text-neutral-500 group-hover:text-neutral-800 min-[1100px]:inline xl:text-[15px]";

/** Account popover — Snappers navy + cream hover. */
export const ACCOUNT_MENU_PANEL_CLASS =
  "overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg ring-0";

export const ACCOUNT_MENU_INNER_CLASS = "flex flex-col gap-1 px-3 py-3";

export const ACCOUNT_MENU_ITEM_CLASS =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-header-green transition-colors hover:bg-header-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-header-green/25";

export const ACCOUNT_MENU_ICON_CLASS =
  "flex h-6 w-6 shrink-0 items-center justify-center text-header-green";
