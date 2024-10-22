"use client";
import { Loader, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import {
  ProductVariation,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";
import NcInputNumber from "@/components/NcInputNumber";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import AddedToCart from "@/app/components/Notifications/added-to-cart";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

interface ProductAddToCartProps {
  product: SimpleProduct & VariableProduct;
  variation: ProductVariation & { rawPrice: string };
}

const ProductAddToCart: React.FC<ProductAddToCartProps> = ({ product, variation }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const { addToCart, cart } = useCart();
  const router = useRouter();

  const notifyAddToCart = (quantity: number) => {
    toast(
      <div>
        <div className="flex items-center justify-between text-base font-semibold leading-none">
          Added to cart!
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 my-4" />
        <AddedToCart product={product} variation={variation} quantity={quantity} />
      </div>,
      {
        duration: 2000,
      }
    );
  };

  const handleCartCompletion = () => {
    notifyAddToCart(quantity);
    setQuantity(1);
  };

  const getVariationId = () => {
    return product.type === "SIMPLE" ? undefined : variation.databaseId;
  };

  const isProductOutOfStock = () => {
    if (product.type === "VARIABLE") {
      return variation?.stockStatus !== "IN_STOCK";
    }
    return product?.stockStatus !== "IN_STOCK";
  };

  const isDesiredQuantityAvailable = () => {
    const cartItems = cart?.contents?.nodes ?? [];
    const existingCartItem = cartItems.find(
      (item: any) => item.product.node.databaseId === product.databaseId
    );

    const existingCartQuantity = existingCartItem?.quantity ?? 0;
    const desiredQuantity = existingCartQuantity + quantity;


    const availableStock =
      product.type === "VARIABLE"
        ? variation?.stockQuantity
        : product?.stockQuantity;


    console.log("availableStock", availableStock);
    if (availableStock === null || availableStock === undefined) {
      return true
    }


    if (availableStock < desiredQuantity) {
      const message =
        product.type === "VARIABLE"
          ? "Added the maximum stock quantity to cart. Stock levels are low."
          : "Stock quantity maximum added";

      toast.error(message);
      return false;
    }

    return true;
  };

  const addItemToCart = async () => {
    if (isProductOutOfStock()) {
      return;
    }

    if (!isDesiredQuantityAvailable()) {
      return;
    }

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

  const handleAddToCartResponse = (data: any, error: any) => {
    if (!error) {
      handleCartCompletion();
    }
  };

  const handleAddToCartError = (error: any) => {
    const isTokenExpired =
      error.graphQLErrors?.[0]?.debugMessage === "invalid-secret-key | Expired token";

    if (isTokenExpired) {
      handleTokenExpiredError();
    } else {
      handleGenericError(error);
    }
  };

  const handleTokenExpiredError = () => {
    toast.error("You've been logged out. Please sign in again.");
    router.push("/login");
  };

  const handleGenericError = (error: any) => {
    const apiErrorMessage = error.graphQLErrors?.[0]?.message;

    if (apiErrorMessage) {
      toast.error(apiErrorMessage.replace(/&quot;/g, '"'));
    } else {
      toast.error("Unable to add to cart");
    }
  };


  const isAddToCartDisabled =
    loading ||
    variation?.rawPrice === "0.00" ||
    variation?.rawPrice == null ||
    isProductOutOfStock();

  // console.log('isAddToCartDisabled', isAddToCartDisabled);
  // console.log('product', product);
  // console.log('variation', variation);


  if (product.type === "VARIABLE" && !variation) {
    return (
      <button
        className={twMerge(
          "relative w-auto my-8 grow bg-gray-600 md:flex-none h-auto inline-flex cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0",
          "opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <span className="md:ml-3 cursor-pointer">Not Available</span>
      </button>
    )
  }

  return (
    <div
      className="flex items-center justify-center md:justify-start gap-4 md:gap-0 md:space-x-3.5 py-2 px-2 md:py-4 fixed bottom-[82px] left-0 z-10 md:z-10 bg-white md:bg-transparent w-full md:static"
    >
      <div className="flex border border-primaryColor/20 items-center justify-center dark:bg-slate-800/70 px-2 py-1 sm:p-2 rounded-full">
        <div className="flex items-center justify-between space-x-5 w-full">
          <NcInputNumber onChange={(v) => setQuantity(v)} defaultValue={quantity} />
        </div>
      </div>

      <button
        disabled={isAddToCartDisabled}
        onClick={addItemToCart}
        className={twMerge(
          "relative w-auto grow md:flex-none h-auto inline-flex cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 bg-primaryColor dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0",
          isAddToCartDisabled && "opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {loading ? <Loader className="animate-spin" /> : <ShoppingCart />}
        <span className="md:ml-3 cursor-pointer">Add to cart</span>
      </button>

    </div>
  );
};

export default ProductAddToCart;
