"use client";
import { Loader, ShoppingCart, XIcon } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import {
  ProductVariation,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";
import NcInputNumber from "@/components/NcInputNumber";
import React, { useState } from "react";
import { toast } from "sonner";
import { Transition } from "@headlessui/react";
import AddedToCart from "@/app/components/Notifications/added-to-cart";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

const ProductAddToCart = ({
  product,
  variation,
}: {
  product: SimpleProduct & VariableProduct;
  variation: ProductVariation & { rawPrice: string };
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addToCart, cart } = useCart();
  const ROUTER = useRouter();

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
  // console.log("product", product, "type:", typeof product);
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
    if (!isProductInStock()) return;

    setLoading(true);
    const variationId = getVariationId();

    try {
      const { data, error } = await addToCart(
        product?.databaseId,
        quantity,
        variationId
      );
      handleAddToCartResponse(data, error);
    } catch (error: any) {
      handleAddToCartError(error);
    } finally {
      setLoading(false);
    }
  };

  const isProductInStock = () => {
    if (
      (product?.type === "VARIABLE" && variation?.stockStatus !== "IN_STOCK") ||
      (product?.type === "SIMPLE" && product?.stockStatus !== "IN_STOCK")
    ) {
      return false;
    }

    let find = cart?.contents?.nodes;
    let findProduct = find?.find(
      (item: any) => item.product.node.name === product.name
    );
    let cartQuantity = findProduct?.quantity as number;
    let maxVariationQuantity = (variation?.stockQuantity ?? 0) >= cartQuantity; // Use optional chaining and fallback to 0
    let maxProductQuantity = (variation?.stockQuantity ?? 0) >= cartQuantity; // Use optional chaining and fallback to 0

    if (
      product?.type === "VARIABLE" &&
      maxVariationQuantity
    ) {
      toast.error(
        "Added the maximum stock quantity to cart. Stock levels are low."
      );
      return false;
    }

    if (
      product?.type === "SIMPLE" &&
      maxProductQuantity
    ) {
      toast.error("stock quantity maximum added");
      return false;
    }

    return true;
  };

  const getVariationId = () => {
    return product.type == "SIMPLE" ? undefined : variation.databaseId;
  };

  const handleAddToCartResponse = (data: any, error: any) => {
    console.log("response", data);
    console.log("error", error);
    if (!error) cartCompleted();
  };

  const handleAddToCartError = (error: any) => {
    let isTokenExpired =
      error.graphQLErrors[0]?.debugMessage ===
      "invalid-secret-key | Expired token";

    error.graphQLErrors.forEach((err: any, index: number) => {
      console.log(`Error ${index + 1}:`, err.debugMessage);
    });

    if (isTokenExpired) {
      handleTokenExpiredError();
    } else {
      handleGenericError(error);
    }
  };

  const handleTokenExpiredError = () => {
    toast.error("You've been logged out. Please sign in again.");
    ROUTER.push("/login");
  };

  const handleGenericError = (error: any) => {
    const apiErrorMessage = error.graphQLErrors[0]?.message;

    if (apiErrorMessage) {
      toast.error(apiErrorMessage);
    } else {
      toast.error("Unable to add to cart");
    }
  };

  if (product?.type === "VARIABLE" && !variation) {
    return (
      <button
        className={twMerge(
          "relative w-auto my-8 grow bg-gray-600 md:flex-none  h-auto inline-flex\
      cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base\
       font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 \
        dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl  flex-shrink-0 focus:outline-none\
         focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0",
          "opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {/* {loading ? <Loader className="animate-spin" /> : <ShoppingCart />} */}
        <span className="md:ml-3 cursor-pointer">Not Available</span>
      </button>
    );
  }

  return (
    <>
      <div
        className="flex items-center justify-center md:justify-start gap-4 md:gap-0 md:space-x-3.5 py-2 px-2 md:py-4 fixed
      bottom-[82px] left-0 z-10 md:z-10 bg-white  md:bg-transparent w-full md:static"
      >
        <div className="flex border border-primaryColor/20 items-center justify-center dark:bg-slate-800/70  px-2 py-1 sm:p-2 rounded-full">
          <div className=" flex items-center justify-between space-x-5 w-full">
            <NcInputNumber
              onChange={(v) => setQuantity(v)}
              defaultValue={quantity}
            />
          </div>
        </div>

        <button
          disabled={
            loading ||
            variation?.rawPrice === "0.00" ||
            variation?.rawPrice == null
          }
          onClick={(e) => addItemToCart()}
          className={twMerge(
            "relative w-auto grow md:flex-none  h-auto inline-flex\
            cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base\
             font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 bg-primaryColor\
              dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl  flex-shrink-0 focus:outline-none\
               focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0",
            (product?.stockStatus !== "IN_STOCK" ||
              variation?.rawPrice === "0.00" ||
              variation?.rawPrice == null ||
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
