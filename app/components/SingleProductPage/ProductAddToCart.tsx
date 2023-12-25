'use client'
import { MousePointerClick } from "lucide-react";
import Link from "next/link";
import {useCart} from "@/context/CartProvider";
import {ProductVariation, SimpleProduct, VariableProduct} from "@/graphql/types/graphql";
import NcInputNumber from "@/components/NcInputNumber";
import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import {Transition} from "@headlessui/react";
import Image from "next/image";
import Prices from "@/app/components/Prices";
import AddedToCart from "@/app/components/Notifications/added-to-cart";
import {twMerge} from "tailwind-merge";


const ProductAddToCart = ({product, variation} : {
  product: SimpleProduct | VariableProduct
  variation: ProductVariation
}) => {

  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  useEffect(() => {
    console.log(product);
  }, [product])
  const notifyAddTocart = (quantity:number) => {
    toast.custom(
        (t : any) => (
            <Transition
                appear
                show={t.visible}
                className="p-4 max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl pointer-events-auto ring-1 ring-black/5 dark:ring-white/10 text-slate-900 dark:text-slate-200"
                enter="transition-all duration-150"
                enterFrom="opacity-0 translate-x-20"
                enterTo="opacity-100 translate-x-0"
                leave="transition-all duration-150"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 translate-x-20"
            >
              <p className="block text-base font-semibold leading-none">
                Added to cart!
              </p>
              <div className="border-t border-slate-200 dark:border-slate-700 my-4" />
              <AddedToCart product={product} quantity={quantity}/>
            </Transition>
        ),
        { position: "top-right", id: "nc-product-notify", duration: 3000 }
    );
  };

  const cartCompleted = () => {
    notifyAddTocart(quantity)
    setQuantity(1)
  }


  if (product.type === 'VARIABLE' && !variation) {
    return <></>
  }


  return (
    <>
      <div className="flex space-x-3.5 py-4">
        <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 px-2 py-1 sm:p-2 rounded-full">
          <div className=" flex items-center justify-between space-x-5 w-full">
            <NcInputNumber onChange={v => setQuantity(v)} defaultValue={quantity} />
          </div>
        </div>
        <button
            onClick={e => addToCart(product.databaseId, quantity, variation?.databaseId )?.then(e => cartCompleted())}
            className={twMerge(
                "relative  h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-1 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 bg-primaryColor dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl  flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0",
                (product.stockStatus !== 'IN_STOCK' || variation?.stockStatus !== 'IN_STOCK')  && 'opacity-50 cursor-not-allowed'
            )}>
          <svg
            className="hidden sm:inline-block w-5 h-5 mb-0.5"
            viewBox="0 0 9 9"
            fill="none"
          >
            <path
              d="M2.99997 4.125C3.20708 4.125 3.37497 4.29289 3.37497 4.5C3.37497 5.12132 3.87865 5.625 4.49997 5.625C5.12129 5.625 5.62497 5.12132 5.62497 4.5C5.62497 4.29289 5.79286 4.125 5.99997 4.125C6.20708 4.125 6.37497 4.29289 6.37497 4.5C6.37497 5.53553 5.5355 6.375 4.49997 6.375C3.46444 6.375 2.62497 5.53553 2.62497 4.5C2.62497 4.29289 2.79286 4.125 2.99997 4.125Z"
              fill="currentColor"
            ></path>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.37497 2.625H7.17663C7.76685 2.625 8.25672 3.08113 8.29877 3.66985L8.50924 6.61641C8.58677 7.70179 7.72715 8.625 6.63901 8.625H2.36094C1.2728 8.625 0.413174 7.70179 0.490701 6.61641L0.70117 3.66985C0.743222 3.08113 1.23309 2.625 1.82331 2.625H2.62497L2.62497 2.25C2.62497 1.21447 3.46444 0.375 4.49997 0.375C5.5355 0.375 6.37497 1.21447 6.37497 2.25V2.625ZM3.37497 2.625H5.62497V2.25C5.62497 1.62868 5.12129 1.125 4.49997 1.125C3.87865 1.125 3.37497 1.62868 3.37497 2.25L3.37497 2.625ZM1.82331 3.375C1.62657 3.375 1.46328 3.52704 1.44926 3.72328L1.2388 6.66985C1.19228 7.32107 1.70805 7.875 2.36094 7.875H6.63901C7.29189 7.875 7.80766 7.32107 7.76115 6.66985L7.55068 3.72328C7.53666 3.52704 7.37337 3.375 7.17663 3.375H1.82331Z"
              fill="currentColor"
            ></path>
          </svg>
          <span className="md:ml-3">Add to cart</span>
        </button>
      </div>
    </>
  );
};

export default ProductAddToCart;
