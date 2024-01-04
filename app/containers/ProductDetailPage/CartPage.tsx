'use client'
import { CheckIcon } from "@heroicons/react/24/outline";
import NcInputNumber from "components/NcInputNumber";
import Image from "next/image";

import ButtonPrimary from "shared/Button/ButtonPrimary";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { CartItem, Product, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import Prices from "@/app/components/Prices";
import CartItemProduct from "@/app/containers/ProductDetailPage/CartItem";
import { Loader } from "lucide-react";
import BackdropSpinner from "@/app/components/BackdropSpinner";

const CartPage = () => {

  const { cart, loading } = useCart()

  const renderStatusSoldout = () => {
    return (
      <div className="rounded-full flex items-center justify-center px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span className="ml-1 leading-none">Sold Out</span>
      </div>
    );
  };

  const renderStatusInstock = () => {
    return (
      <div className="rounded-full flex items-center justify-center px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <CheckIcon className="w-3.5 h-3.5" />
        <span className="ml-1 leading-none">In Stock</span>
      </div>
    );
  };


  return (
    <div className="nc-CartPage">
      <main className="container py-16 lg:pb-28 lg:pt-20 ">

        <div className="mb-12 sm:mb-16">
          <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold ">
            Shopping Cart
          </h2>
          <div className="block mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">
            <Link href={"/#"} className="">
              Homepage
            </Link>
            <span className="text-xs mx-1 sm:mx-1.5">/</span>
            <span className="underline">Shopping Cart</span>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700 my-10 xl:my-12" />

        <div className="flex flex-col lg:flex-row">
          <div className="relative w-full lg:w-[60%] xl:w-[55%] divide-y divide-slate-200 dark:divide-slate-700 lg:pr-10 xl:px-16 2xl:px-20 py-4">

            {loading && <BackdropSpinner />}

            {cart?.contents?.nodes.map((item, index) =>
              <CartItemProduct key={index} cartItem={item} index={index} />
            )}
          </div>
          <div className="border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 my-10 lg:my-0 lg:mr-10 xl:mr-16 2xl:mr-20 flex-shrink-0"></div>
          <div className="flex-1 relative px-4 py-4" >
            {loading && <BackdropSpinner />}
            <div className="sticky top-28">
              <h3 className="text-lg font-semibold ">Order Summary</h3>
              <div className="mt-7 text-sm text-slate-500 dark:text-slate-400 divide-y divide-slate-200/70 dark:divide-slate-700/80">
                <div className="flex justify-between pb-4">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {cart?.subtotal}
                  </span>
                </div>
                <div className="flex justify-between py-4">
                  <span>Shpping estimate</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {cart?.shippingTotal}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-200 text-base pt-4">
                  <span>Order total</span>
                  <span>{cart?.total}</span>
                </div>
              </div>
              <ButtonPrimary href="/checkout" className="mt-8 w-full">
                Checkout
              </ButtonPrimary>
              <div className="mt-5 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center">
                <p className="block relative pl-5">
                  <svg
                    className="w-4 h-4 absolute -left-1 top-0.5"
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
                    className="text-slate-900 dark:text-slate-200 underline font-medium"
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
                    className="text-slate-900 dark:text-slate-200 underline font-medium"
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
