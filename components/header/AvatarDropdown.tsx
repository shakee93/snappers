"use client";
import { Popover, Transition } from "@headlessui/react";
import Image from "next/image";
import { Loader2, LogIn, User } from "lucide-react";
import { Fragment, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import LogoutButton from "@/components/header/LogoutButton";
import { useSession } from "@/context/SessionProvider";
import profileIcon from "@/public/global/profile.svg";

const headerAvatarButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-header-peach text-neutral-900 transition-[filter] hover:brightness-95 focus:outline-none";

const headerAvatarLoaderClass =
  "h-[18px] w-[18px] animate-spin text-neutral-900";

// Skeleton for loading
export default function AvatarDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { customer, fetchCustomer } = useSession();

  const customerInitial = useMemo(() => {
    const name = customer?.displayName?.trim();
    return name ? name.charAt(0).toUpperCase() : "?";
  }, [customer?.displayName]);

  const fetchData = async () => {
    setIsLoading(true); // Set loading state to true
    await fetchCustomer();
    setIsLoading(false); // Set loading state to false once fetched
  };

  useEffect(() => {
    if (customer == null) {
      fetchData();
    } else {
      setIsLoading(false); // Ensure no loading if customer data is already available
    }
  }, [customer]);

  const handleClickOutside = (event: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="AvatarDropdown" ref={dropdownRef}>
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className=""
              aria-label="Account"
              onClick={() => {
                fetchCustomer();
                setIsOpen(!isOpen);
              }}
            >
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
                  <span className="text-lg font-bold leading-none text-neutral-900">
                    {customerInitial}
                  </span>
                )}
              </div>
            </Popover.Button>
            <Transition
              as={Fragment}
              show={isOpen}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-[200] w-screen max-w-[260px] px-4 mt-3.5 -right-10 sm:right-0 sm:px-0">
                <div className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid grid-cols-1 gap-6 bg-white dark:bg-neutral-800 py-7 px-6">
                    {isLoading ? (
                      <div className="space-y-3 animate-pulse" aria-hidden>
                        <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-700" />
                      </div>
                    ) : !customer || customer.id === "guest" ? (
                      <>
                        <Link
                          href={"/login"}
                          className="flex items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                          onClick={() => close()}
                        >
                          <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                            <LogIn />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium ">{"Login"}</p>
                          </div>
                        </Link>
                        <Link
                          href={"/signup"}
                          className="flex items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                          onClick={() => close()}
                        >
                          <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                            <User />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium ">{"Register"}</p>
                          </div>
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="flex-grow">
                            <h4 className="font-semibold">
                              {customer?.displayName ?? ""}
                            </h4>
                          </div>
                        </div>

                        <div className="w-full border-b border-neutral-200 dark:border-neutral-700" />

                        <Link
                          href={"/account"}
                          className="flex items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                          onClick={() => close()}
                        >
                          <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45006 10.79 7.56006 8.84 7.56006 6.44C7.56006 3.99 9.54006 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M7.15997 14.56C4.73997 16.18 4.73997 18.82 7.15997 20.43C9.90997 22.27 14.42 22.27 17.17 20.43C19.59 18.81 19.59 16.17 17.17 14.56C14.43 12.73 9.91997 12.73 7.15997 14.56Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium ">
                              {"My Account"}
                            </p>
                          </div>
                        </Link>

                        <Link
                          href={"/account/my-orders"}
                          className="flex items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                          onClick={() => close()}
                        >
                          <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M8 12.2H15"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeMiterlimit="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 16.2H12.38"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeMiterlimit="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 6H14C16 6 16 5 16 4C16 2 15 2 14 2H10C9 2 8 2 8 4C8 6 9 6 10 6Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeMiterlimit="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M16 4.02002C19.33 4.20002 21 5.43002 21 10V16C21 20 20 22 15 22H9C4 22 3 20 3 16V10C3 5.44002 4.67 4.20002 8 4.02002"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeMiterlimit="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium ">{"My Order"}</p>
                          </div>
                        </Link>

                        <LogoutButton />
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
