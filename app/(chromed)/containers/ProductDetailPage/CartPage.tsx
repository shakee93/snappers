"use client";
import { CheckIcon } from "@heroicons/react/24/outline";
import NcInputNumber from "@/components/global/primitives/NcInputNumber";
import Image from "next/image";

import ButtonPrimary from "shared/Button/ButtonPrimary";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import {
  CartItem,
  Product,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";
import Prices from "@/components/global/ui/Prices";
import CartItemProduct from "@/app/(chromed)/containers/ProductDetailPage/CartItem";
import { Loader } from "lucide-react";
import BackdropSpinner from "@/components/global/ui/BackdropSpinner";

const CartPage = () => {
  const { cart, loading } = useCart();

  const renderStatusSoldout = () => {
    return (
      <div className="flex items-center justify-center rounded-full border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300">
        <span className="ml-1 leading-none">Sold Out</span>
      </div>
    );
  };

  const renderStatusInstock = () => {
    return (
      <div className="flex items-center justify-center rounded-full border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300">
        <CheckIcon className="h-3.5 w-3.5" />
        <span className="ml-1 leading-none">In Stock</span>
      </div>
    );
  };

  return (
    <div className="nc-CartPage">
      <main className="container space-y-5 py-8 sm:space-y-20 lg:space-y-20 lg:py-12">
        <div className="border-b-1 mb-5 border-slate-200 pb-5 sm:mb-16 md:pb-10">
          <h2 className="block text-2xl font-semibold sm:text-3xl lg:text-4xl">
            Shopping Cart
          </h2>
          <div className="mt-3 block text-xs font-medium text-slate-700 sm:mt-5 sm:text-sm dark:text-slate-400">
            <Link href={"/#"} className="">
              Homepage
            </Link>
            <span className="mx-1 text-xs sm:mx-1.5">/</span>
            <span className="underline">Shopping Cart</span>
          </div>
        </div>
        {/* <hr className="border-slate-200 dark:border-slate-700 " /> */}
        <div className="flex flex-col lg:flex-row">
          <div className="relative w-full divide-y divide-slate-200 py-4 lg:w-[60%] lg:pr-10 xl:w-[55%] xl:px-16 2xl:px-20 dark:divide-slate-700">
            {loading && <BackdropSpinner />}

            {cart?.contents?.nodes.map((item, index) => (
              <CartItemProduct key={index} cartItem={item} index={index} />
            ))}
          </div>
          <div className="my-10 flex-shrink-0 border-t border-slate-200 lg:my-0 lg:mr-10 lg:border-l lg:border-t-0 xl:mr-16 2xl:mr-20 dark:border-slate-700"></div>
          <div className="relative flex-1 px-4 py-4">
            {loading && <BackdropSpinner />}
            <div className="sticky top-28">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <div className="mt-7 divide-y divide-slate-200/70 text-sm text-slate-500 dark:divide-slate-700/80 dark:text-slate-400">
                <div className="flex justify-between pb-4">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    <span
                      dangerouslySetInnerHTML={{ __html: cart?.subtotal ?? "" }}
                    />
                  </span>
                </div>
                <div className="flex justify-between py-4">
                  <span>Shpping estimate</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: cart?.shippingTotal ?? "",
                      }}
                    />
                  </span>
                </div>
                <div className="flex justify-between pt-4 text-base font-semibold text-slate-900 dark:text-slate-200">
                  <span>Order total</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    <span
                      dangerouslySetInnerHTML={{ __html: cart?.total ?? "" }}
                    />
                  </span>
                </div>
              </div>
              <ButtonPrimary href="/checkout" className="mt-8 w-full">
                Checkout
              </ButtonPrimary>
              <div className="mt-5 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                <p className="relative block pl-5">
                  <svg
                    className="absolute -left-1 top-0.5 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 8V13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.9945 16H12.0035"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  By proceeding with your purchase you agree to our{" "}
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="/terms-and-conditions"
                    className="font-medium text-slate-900 underline dark:text-slate-200"
                  >
                    Terms and Conditions
                  </Link>
                  <span>
                    {` `}and{` `}
                  </span>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="/privacy"
                    className="font-medium text-slate-900 underline dark:text-slate-200"
                  >
                    Privacy Policy
                  </Link>
                  {` `}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
