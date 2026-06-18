export const filterResetClassName =
  "text-sm font-medium text-header-green hover:underline underline-offset-2";

export const filterLinkClassName =
  "text-sm font-medium text-header-green hover:opacity-80";

export const filterCheckboxInputClassName =
  "rounded border border-[#E8E8E8] bg-white text-header-action focus:ring-2 focus:ring-header-action/30 focus:ring-offset-0 checked:border-header-action hover:border-header-green/50";

export const filterCheckboxLabelClassName =
  "text-sm font-medium text-header-green";

export const filterFieldLabelClassName =
  "shrink-0 text-sm font-medium text-header-green";

export const filterSelectClassName =
  "cursor-pointer rounded-lg border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-header-green transition-colors focus:border-header-action focus:outline-none focus:ring-2 focus:ring-header-action/20";

export const filterSelectOptionsClassName =
  "absolute right-0 z-50 mt-1 max-h-60 w-full min-w-full overflow-auto rounded-lg border border-[#E8E8E8] bg-white py-1 shadow-lg focus:outline-none";

export const filterSelectOptionClassName = (active: boolean, selected: boolean) =>
  [
    "cursor-pointer select-none px-3 py-2 text-sm text-header-green",
    selected ? "bg-header-action font-semibold" : active ? "bg-header-cream/50" : "",
  ]
    .filter(Boolean)
    .join(" ");

export const filterPanelClassName =
  "overflow-hidden relative w-full rounded-xl border border-[#E8E8E8] bg-header-cream/30";

export const filterPanelTitleClassName =
  "text-sm font-semibold text-header-green";

export const filterPanelToggleClassName =
  "flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-header-green transition-opacity hover:opacity-80";

export const filterMobileTriggerActiveClassName =
  "border border-header-action bg-header-cream text-header-green";
