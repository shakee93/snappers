"use client";
import { Loader, ShoppingCart, XIcon } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { ProductVariation, SimpleProduct, VariableProduct, } from "@/graphql/types/graphql";
import NcInputNumber from "@/components/NcInputNumber";
import React, { useState } from "react";
import { toast } from "sonner";
import { Transition } from "@headlessui/react";
import AddedToCart from "@/app/components/Notifications/added-to-cart";
import { twMerge } from "tailwind-merge";

const ProductAddToCart = ({
  product,
  variation,
}: {
  product: SimpleProduct & VariableProduct;
  variation: ProductVariation;
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  // useEffect(() => {
  //   console.log(product);
  // }, [product])
  const notifyAddTocart = (quantity: number) => {
    toast(
      <div className="">
        <div className="flex   items-center  justify-between text-base font-semibold leading-none">
          Added to cart!
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 my-4" />
        <AddedToCart
          product={product}
          variation={variation}
          quantity={quantity}
        />
      </div>,
      {
        // position: "top-center",
        duration: 2000,
      }
    );

  };
  // const notifyAddTocart = (quantity: number) => {
  //   toast.custom(
  //     (t: any) => (
  //       <Transition
  //         appear
  //         show={t.visible}
  //         className="p-4 max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl pointer-events-auto ring-1 ring-black/5 dark:ring-white/10 text-slate-900 dark:text-slate-200"
  //         enter="transition-all duration-150"
  //         enterFrom="opacity-0 translate-x-20"
  //         enterTo="opacity-100 translate-x-0"
  //         leave="transition-all duration-150"
  //         leaveFrom="opacity-100 translate-x-0"
  //         leaveTo="opacity-0 translate-x-20"
  //       >
  //         <div className="flex items-center w-full justify-between text-base font-semibold leading-none">
  //           Added to cart!{" "}
  //           <button onClick={(e) => toast.dismiss("nc-product-notify")}>
  //             <XIcon />
  //           </button>
  //         </div>
  //         <div className="border-t border-slate-200 dark:border-slate-700 my-4" />
  //         <AddedToCart
  //           product={product}
  //           variation={variation}
  //           quantity={quantity}
  //         />
  //       </Transition>
  //     ),
  //     { position: "top-right", id: "nc-product-notify", duration: 3000 }
  //   );
  // };

  const cartCompleted = () => {
    notifyAddTocart(quantity);
    setQuantity(1);
  };

  const addItemToCart = async () => {

    if (
      (product?.type === "VARIABLE" && variation?.stockStatus !== "IN_STOCK") ||
      (product?.type === "SIMPLE" && product?.stockStatus !== "IN_STOCK")
    ) {
      return;
    }

    setLoading(true);
    let variationId = product.type == "SIMPLE" ? undefined : variation.databaseId;

    try {
      await addToCart(product?.databaseId, quantity, variationId);
      cartCompleted();
    } catch (error) {
      console.log("Error:", error);
      toast.error("Unable to add to cart");
    } finally {
      setLoading(false);
    }
  };


  if (product?.type === "VARIABLE" && !variation) {
    return <></>;
  }

  return (
    <>
      <div
        className="flex items-center justify-center md:justify-start gap-4 md:gap-0 md:space-x-3.5 py-2 px-2 md:py-4 fixed
      bottom-[82px] left-0 z-10 md:z-10 bg-white border-t md:bg-transparent w-full md:static"
      >
        <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 px-2 py-1 sm:p-2 rounded-full">
          <div className=" flex items-center justify-between space-x-5 w-full">
            <NcInputNumber
              onChange={(v) => setQuantity(v)}
              defaultValue={quantity}
            />
          </div>
        </div>
        <button
          disabled={loading}
          onClick={(e) => addItemToCart()}
          className={twMerge(
            "relative w-auto grow md:flex-none  h-auto inline-flex\
            cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 bg-primaryColor dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl  flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0",
            (product?.stockStatus !== "IN_STOCK" ||
              (product?.type === "VARIABLE" &&
                variation?.stockStatus !== "IN_STOCK")) &&
            "opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loading ? <Loader className="animate-spin" /> : <ShoppingCart />}
          <span className="md:ml-3 cursor-pointer">Add to cart</span>
        </button>

      </div>
    </>
  );
};

export default ProductAddToCart;
