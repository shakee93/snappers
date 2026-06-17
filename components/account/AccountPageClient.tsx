"use client";

import {
  ACCOUNT_TABS,
  AccountTabId,
  accountTabHref,
  parseAccountTab,
} from "@/components/account/accountTabs";
import {
  accountTabClassName,
  accountTabListClassName,
} from "@/components/account/accountStyles";
import UserDetails from "@/components/account/UserDetails";
import AccountInfoPanel from "@/components/account/panels/AccountInfoPanel";
import AccountOrdersPanel from "@/components/account/panels/AccountOrdersPanel";
import AccountWishlistPanel from "@/components/account/panels/AccountWishlistPanel";
import AccountAddressPanel from "@/components/account/panels/AccountAddressPanel";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, type ComponentType } from "react";

const TAB_PANELS: Record<AccountTabId, ComponentType> = {
  info: AccountInfoPanel,
  orders: AccountOrdersPanel,
  wishlist: AccountWishlistPanel,
  address: AccountAddressPanel,
};

const AccountNav = ({
  activeTab,
  onTabChange,
}: {
  activeTab: AccountTabId;
  onTabChange: (tab: AccountTabId) => void;
}) => (
  <nav aria-label="Account sections">
    <div role="tablist" className={accountTabListClassName}>
      {ACCOUNT_TABS.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`account-panel-${item.id}`}
            id={`account-tab-${item.id}`}
            onClick={() => onTabChange(item.id)}
            className={accountTabClassName(isActive)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  </nav>
);

const AccountPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseAccountTab(searchParams.get("tab"));

  const handleTabChange = useCallback(
    (tab: AccountTabId) => {
      router.replace(accountTabHref(tab), { scroll: false });
    },
    [router]
  );

  const ActivePanel = TAB_PANELS[activeTab];

  return (
    <div className="nc-CommonLayoutProps container">
      <div className="mx-auto mt-14 max-w-5xl sm:mt-20">
        <UserDetails />
        <div className="mt-10">
          <AccountNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>
      <div className="mx-auto max-w-5xl pb-24 pt-10 sm:pt-12 lg:pb-32">
        <div
          role="tabpanel"
          id={`account-panel-${activeTab}`}
          aria-labelledby={`account-tab-${activeTab}`}
        >
          <ActivePanel />
        </div>
      </div>
    </div>
  );
};

export default AccountPageClient;
