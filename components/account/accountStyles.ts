export {
  authInputClassName as accountInputClassName,
  authLabelClassName as accountLabelClassName,
  authLinkClassName as accountLinkClassName,
} from "@/components/auth/authStyles";

export const accountLayoutTitleClassName =
  "text-3xl font-bold text-header-green xl:text-4xl dark:text-neutral-100";

export const accountPageTitleClassName =
  "text-2xl font-bold text-header-green sm:text-3xl dark:text-neutral-100";

export const accountSubheadingClassName =
  "text-xl font-semibold text-header-green sm:text-2xl";

export const accountFormClassName = "max-w-lg space-y-5";

export const accountCompactLabelClassName = "text-xs";

export const accountCompactInputClassName = "mt-1 h-9 px-3 py-1.5";

export const accountFormInputClassName =
  "mt-1.5 block h-11 w-full rounded-lg border border-[#E8E8E8] bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-header-action focus:outline-none focus:ring-2 focus:ring-header-action/20 disabled:cursor-not-allowed disabled:border-neutral-100 disabled:bg-neutral-50 disabled:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:disabled:bg-neutral-800";

export const accountSelectClassName =
  "mt-1.5 block h-11 w-full rounded-lg border border-[#E8E8E8] bg-white px-4 text-sm text-neutral-900 transition-colors focus:border-header-action focus:outline-none focus:ring-2 focus:ring-header-action/20 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

export const accountSubmitButtonClassName =
  "bg-header-action font-bold text-header-green shadow-md hover:opacity-90 disabled:opacity-60";

export const accountTabListClassName =
  "hiddenScrollbar flex gap-6 overflow-x-auto border-b border-[#E8E8E8] dark:border-neutral-700";

export const accountTabClassName = (isActive: boolean) =>
  [
    "flex-shrink-0 border-b-2 pb-3 pt-6 text-sm transition-colors sm:text-base md:pb-4 md:pt-8",
    isActive
      ? "border-header-action font-bold text-neutral-900 dark:text-neutral-100"
      : "border-transparent font-medium text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300",
  ].join(" ");

export const accountCardClassName =
  "w-full rounded-2xl border border-header-cream bg-header-cream/40 p-6";

export const accountOrderCardClassName =
  "overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-sm";

export const accountOrderHeaderClassName =
  "bg-header-cream/60 p-4 dark:bg-neutral-800/40 sm:p-8";
