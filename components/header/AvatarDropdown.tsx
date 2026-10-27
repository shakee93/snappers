"use client";
import { Popover, Transition } from "@headlessui/react";
import Image from "next/image";
import { ClipboardList, Loader2, LogIn, User } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/header/LogoutButton";
import { useSession } from "@/context/SessionProvider";
import { accountTabHref } from "@/components/account/accountTabs";
import profileIcon from "@/public/global/profile.svg";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_MENU_ICON_CLASS,
  ACCOUNT_MENU_INNER_CLASS,
  ACCOUNT_MENU_ITEM_CLASS,
  ACCOUNT_MENU_PANEL_CLASS,
  HEADER_ACTION_ICON,
  HEADER_ACTION_ICON_BOX,
  HEADER_ACTION_ITEM,
  HEADER_ACTION_LABEL,
} from "./headerActionStyles";

const headerAvatarButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-header-green text-[#FACC15] transition-[filter] hover:brightness-95 focus:outline-none";

const headerAvatarLoaderClass =
  "h-[18px] w-[18px] animate-spin text-[#FACC15]";

type AvatarDropdownProps = {
  variant?: "icon" | "labeled";
};

export default function AvatarDropdown({ variant = "icon" }: AvatarDropdownProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { customer, fetchCustomer } = useSession();

  const customerInitial = useMemo(() => {
    const name = customer?.displayName?.trim();
    return name ? name.charAt(0).toUpperCase() : "?";
  }, [customer?.displayName]);

  const isLoggedIn = Boolean(customer && customer.id !== "guest");

  const fetchData = async () => {
    setIsLoading(true);
    await fetchCustomer();
    setIsLoading(false);
  };

  useEffect(() => {
    if (customer == null) {
      void fetchData();
    } else {
      setIsLoading(false);
    }
  }, [customer]);

  return (
    <div
      className={
        variant === "labeled" ? "AvatarDropdown inline-flex" : "AvatarDropdown"
      }
    >
      <Popover className="relative inline-flex">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={
                variant === "labeled"
                  ? `${HEADER_ACTION_ITEM} outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 data-[headlessui-state=open]:outline-none data-[headlessui-state=open]:ring-0`
                  : "outline-none ring-0 focus:outline-none focus:ring-0"
              }
              aria-label="Account"
              aria-expanded={open}
              onClick={() => {
                void fetchCustomer();
              }}
            >
              {variant === "labeled" ? (
                <>
                  <span className={HEADER_ACTION_ICON_BOX}>
                    {isLoading ? (
                      <Loader2
                        className={`${HEADER_ACTION_ICON} animate-spin`}
                        aria-hidden
                      />
                    ) : isLoggedIn ? (
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-header-green text-sm font-bold leading-none text-[#FACC15]"
                        aria-hidden
                      >
                        {customerInitial}
                      </span>
                    ) : (
                      <User className={HEADER_ACTION_ICON} aria-hidden />
                    )}
                  </span>
                  <span className={HEADER_ACTION_LABEL}>Account</span>
                </>
              ) : (
                <div className={headerAvatarButtonClass}>
                  {isLoading ? (
                    <Loader2
                      className={headerAvatarLoaderClass}
                      aria-hidden
                    />
                  ) : !customer || customer?.id === "guest" ? (
                    <Image
                      src={profileIcon}
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] object-contain"
                      aria-hidden
                    />
                  ) : (
                    <span className="text-lg font-bold leading-none text-[#FACC15]">
                      {customerInitial}
                    </span>
                  )}
                </div>
              )}
            </Popover.Button>
            <Transition
              as={Fragment}
              show={open}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                className={cn(
                  "absolute top-full z-[300] mt-2 w-[min(calc(100vw-1.5rem),16.25rem)] sm:w-[16.25rem]",
                  variant === "labeled"
                    ? "left-1/2 -translate-x-1/2"
                    : "right-0",
                )}
              >
                <div className={ACCOUNT_MENU_PANEL_CLASS}>
                  <div className={ACCOUNT_MENU_INNER_CLASS}>
                    {isLoading ? (
                      <div className="space-y-2 px-3 py-2 animate-pulse" aria-hidden>
                        <div className="h-4 w-2/3 rounded bg-neutral-200" />
                        <div className="h-9 w-full rounded-xl bg-neutral-100" />
                        <div className="h-9 w-full rounded-xl bg-neutral-100" />
                      </div>
                    ) : !customer || customer.id === "guest" ? (
                      <Link
                        href="/login"
                        className={ACCOUNT_MENU_ITEM_CLASS}
                        onClick={() => close()}
                      >
                        <span className={ACCOUNT_MENU_ICON_CLASS}>
                          <LogIn className="h-5 w-5" aria-hidden />
                        </span>
                        Sign in
                      </Link>
                    ) : (
                      <>
                        <p className="px-3 pb-2 pt-1 text-base font-bold text-header-green">
                          {customer.displayName ?? ""}
                        </p>
                        <div
                          className="mx-3 border-b border-neutral-200"
                          aria-hidden
                        />

                        <Link
                          href="/account"
                          className={ACCOUNT_MENU_ITEM_CLASS}
                          onClick={() => close()}
                        >
                          <span className={ACCOUNT_MENU_ICON_CLASS}>
                            <User className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                          </span>
                          My Account
                        </Link>

                        <Link
                          href={accountTabHref("orders")}
                          className={ACCOUNT_MENU_ITEM_CLASS}
                          onClick={() => close()}
                        >
                          <span className={ACCOUNT_MENU_ICON_CLASS}>
                            <ClipboardList
                              className="h-5 w-5"
                              strokeWidth={1.75}
                              aria-hidden
                            />
                          </span>
                          My Orders
                        </Link>

                        <LogoutButton onClose={close} />
                      </>
                    )}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}
