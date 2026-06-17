export const ACCOUNT_TABS = [
  { id: "info", label: "Account info" },
  { id: "orders", label: "My orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "address", label: "Address" },
] as const;

export type AccountTabId = (typeof ACCOUNT_TABS)[number]["id"];

export const DEFAULT_ACCOUNT_TAB: AccountTabId = "info";

const ACCOUNT_TAB_SET = new Set<string>(ACCOUNT_TABS.map((tab) => tab.id));

export function parseAccountTab(value: string | null | undefined): AccountTabId {
  if (value && ACCOUNT_TAB_SET.has(value)) {
    return value as AccountTabId;
  }
  return DEFAULT_ACCOUNT_TAB;
}

export function accountTabHref(tab: AccountTabId): string {
  return tab === DEFAULT_ACCOUNT_TAB ? "/account" : `/account?tab=${tab}`;
}
