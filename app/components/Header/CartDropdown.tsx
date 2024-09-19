"use client";
import { Popover, Transition } from "@headlessui/react";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { Fragment, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import CartDropdownItem from "@/app/components/Header/CartDropdownItem";

export default function CartDropdown() {
  const { cart } = useCart();
  let empty = cart?.contents?.itemCount == 0;


  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <Popover className="relative" ref={dropdownRef}>
      {({ open, close }) => (
        <>
          <Popover.Button
            onClick={() => setIsOpen(!isOpen)}
            className={`
                ${open ? "" : "text-opacity-90"}
                 group w-10 h-10 sm:w-10 sm:h-10 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 relative`}
          >
            {!!cart?.contents?.itemCount && (
              <div className="w-5 bg-primaryColor h-5 flex items-center justify-center bg-primary-500 absolute top-0 right-0 rounded-full text-[11px] leading-none text-white font-medium">
                <span className="mt-[1px] font-bold">{cart?.contents?.itemCount}</span>
              </div>
            )}

            <div className="text-primaryColor flex items-center justify-center w-10 sm:h-10">
              <ShoppingCart className="w-5" />
            </div>

            <Link className="block md:hidden absolute inset-0" href={"/cart"} />
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
            <Popover.Panel className="hidden md:block absolute z-[200] w-screen max-w-xs sm:max-w-md px-4 mt-3.5 -right-28 sm:right-0 sm:px-0">
              <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                <div className="relative bg-white dark:bg-neutral-800">
                  <div className="max-h-[60vh] p-5 overflow-y-auto hiddenScrollbar">
                    <h3 className="text-xl font-semibold">Shopping cart</h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {cart?.contents?.nodes?.map((item, index) => (
                        <CartDropdownItem
                          item={item}
                          key={index}
                          close={close}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-neutral-50 dark:bg-slate-900 p-5">
                    <p className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                      <span>
                        <span>Subtotal</span>
                        <span className="block text-sm text-slate-500 dark:text-slate-400 font-normal">
                          Shipping and taxes calculated at checkout.
                        </span>
                      </span>
                      {/* <span className="">{cart?.subtotal}</span> */}
                      <span dangerouslySetInnerHTML={{ __html: cart?.subtotal || '' }} />
                    </p>
                    <div className="flex space-x-2 mt-5">
                      <ButtonSecondary
                        href="/cart"
                        className="flex-1 border border-slate-200 dark:border-slate-700"
                        onClick={close}
                      >
                        View cart
                      </ButtonSecondary>
                      <Link className="flex-1" href={"/checkout"}>
                        <button
                          disabled={empty}
                          onClick={close}
                          className={
                            "relative w-full h-auto flex-1  items-center justify-center rounded-full \
    transition-colors disabled:cursor-not-allowed text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6  \
    disabled:bg-opacity-90 bg-primaryColor text-white"
                          }
                        >
                          <span className="">Checkout</span>
                        </button>
                      </Link>
                      {/* 
                      <ButtonPrimary
                        href="/checkout"
                        onClick={close}
                        className="flex-1 disabled:opacity-90 disabled:cursor-not-allowed"
                        disabled={true}
                      >
                        Checkout {JSON.stringify(empty)}
                      </ButtonPrimary> */}
                    </div>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
