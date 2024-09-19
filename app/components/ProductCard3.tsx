"use client";
import {
  ExternalLink,
  Loader,
  Settings2,
  ShoppingCart,
  XIcon,
} from "lucide-react";
import React, { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { Toaster, toast } from "sonner";
import ModalQuickView from "./ModalQuickView";
import Prices from "./Prices";
import useProductLink from "@/hooks/useProductLink";
import {
  Brand,
  ProductVariation,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";
import AddedToCart from "@/app/components/Notifications/added-to-cart";
import { useCart } from "@/context/CartProvider";
import { twMerge } from "tailwind-merge";
import { GET_QUICK_VIEW_PRODUCT } from "@/graphql/defs/products";
import { useQuery } from "@apollo/client";
import { Highlight } from "react-instantsearch";
import { redirect, useRouter } from "next/navigation";

export interface ProductCardProps {
  className?: string;
  data: (SimpleProduct & VariableProduct) | any;
  fromSearch?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({
  className = "",
  data,
  fromSearch = false,
}) => {
  const {
    name,
    price,
    type,
    image,
    stockStatus,
    variations,
    regularPrice,
    brands,
    reviewCount,
    averageRating,
    salePrice,
    rawPrice,
    databaseId,
  } = data;

  const [showModalQuickView, setShowModalQuickView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentVariation, setCurrentVariation] = useState(0);
  const hoverIntervalRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const link = useProductLink(data);
  const ROUTER = useRouter();

  const handleHoverOut = () => {
    setIsHovered(false);
    setCurrentVariation(0);
    clearInterval(hoverIntervalRef.current!);
  };

  const handleCloseModalQuickView = () => {
    setShowModalQuickView(true);
  };

  useEffect(() => {
    if (showModalQuickView) {
      handleHoverOut();
    }
  }, [showModalQuickView]);

  const notifyAddTocart = (quantity: number) => {
    toast(
      <div className="">
        <div className="flex   items-center  justify-between text-base font-semibold leading-none">
          Added to cart!
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 my-4" />
        <AddedToCart product={data} quantity={quantity} />
      </div>,
      {
        duration: 2000,
      }
    );
  };

  const cartCompleted = () => {
    notifyAddTocart(quantity);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      if (data.databaseId) {
        await addToCart(data.databaseId, quantity);
        cartCompleted();
      } else {
        toast("Wow so easy !");
        notifyAddTocart(1);
      }
    } catch (error: any) {
      console.log("error", error);
      let isTokenExpired =
        error.graphQLErrors[0]?.debugMessage ===
        "invalid-secret-key | Expired token";
      if (isTokenExpired) {
        toast.error("You've been logged out. Please sign in again.");
        ROUTER.push("/login");
      } else {
        toast.error("This product is out of stock.");
      }
    } finally {
      setLoading(false);
    }
  };

  const parsePrice = (priceString: any) => {
    return parseFloat(priceString?.replace(/[^\d.]/g, ""));
  };

  // Calculate the lowest price and sale price among in-stock variations
  let lowestPrice = price;
  let lowestSalePrice = regularPrice;

  if (type === "VARIABLE" && variations?.nodes) {
    const inStockVariations = variations.nodes.filter(
      (variation: ProductVariation) => variation.stockStatus === "IN_STOCK"
    );

    if (inStockVariations.length > 0) {
      const lowestPriceVariation = inStockVariations.reduce((prev: any, curr: any) => {
        return parsePrice(curr.price) < parsePrice(prev.price) ? curr : prev;
      });

      const lowestSalePriceVariation = inStockVariations.reduce(
        (prev: any, curr: any) => {
          return parsePrice(curr.regularPrice) < parsePrice(prev.regularPrice)
            ? curr
            : prev;
        }
      );

      lowestPrice = lowestPriceVariation?.price || price;
      lowestSalePrice = lowestSalePriceVariation?.regularPrice || regularPrice;
    }
  }

  const renderGroupButtons = () => {
    return (
      <div className="absolute -top-12 right-1 flex justify-center opacity-100 visible transition-all">
        {stockStatus === "IN_STOCK" ? (
          <>
            {type === "SIMPLE" && price && price?.length > 0 && (
              <ButtonPrimary
                className={`shadow-md ${
                  rawPrice === "0.00" ? "opacity-60 cursor-not-allowed" : ""
                }`}
                fontSize="text-xs"
                sizeClass="py-2.5 px-3.5"
                onClick={handleAddToCart}
                disabled={loading || rawPrice === "0.00"}
              >
                {loading ? (
                  <Loader className="animate-spin w-4" />
                ) : (
                  <ShoppingCart className="w-4" />
                )}
              </ButtonPrimary>
            )}

            {type === "VARIABLE" && (
              <Link href={link}>
                <ButtonPrimary
                  className="shadow-md"
                  fontSize="text-xs"
                  sizeClass="py-2.5 px-3.5"
                >
                  <Settings2 className="w-4" />
                </ButtonPrimary>
              </Link>
            )}
          </>
        ) : (
          <Link href={link}>
            <ButtonPrimary
              className="shadow-lg bg-zinc-500"
              fontSize="text-xs"
              sizeClass="py-2.5 px-3.5"
            >
              <ExternalLink className="w-4" />
            </ButtonPrimary>
          </Link>
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-[270px] md:min-h-[365px] nc-ProductCard relative flex flex-col bg-white rounded-2xl p-1 group ${className}`}
      data-nc-id="ProductCard"
    >
      <div className="relative flex-shrink-0 bg-slate-50 rounded-2xl dark:bg-slate-300 overflow-hidden ">
        <Link href={link}>
          <div className="flex items-center justify-center h-[150px] sm:h-[250px]">
            {variations?.edges &&
            variations.edges.some(
              (variation: { node: ProductVariation }) =>
                variation.node?.image?.sourceUrl
            ) ? (
              variations.edges.map(
                (
                  variation: {
                    node: ProductVariation;
                  },
                  index: number
                ) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0 bg-[#fefefe]"
                  >
                    <Image
                      src={variation?.node?.image?.sourceUrl?.replace('http://', 'https://') || ""}
                      width={300}
                      height={300}
                      alt={name || ""}
                      placeholder="blur"
                      className="object-contain w-auto h-full mx-auto my-auto"
                    />
                  </div>
                )
              )
            ) : (
              <Image
                width={300}
                height={300}
                src={image?.sourceUrl || ""}
                alt={name || ""}
                className={twMerge(
                  `object-cover object-center mx-auto my-auto rounded-2xl`
                )}
              />
            )}
          </div>
        </Link>

        <div
          className={"absolute hidden md:block top-3 cursor-pointer right-3"}
          onClick={() => handleCloseModalQuickView()}
        >
          <ArrowsPointingOutIcon className="w-5" />
        </div>

        <div
          className={`absolute left-1.5  top-2 bg-zinc-100/80 text-center text-xs lg:text-sm

 line-clamp-2 rounded-full text-slate-800`}
        >
          {brands?.nodes?.map((brand: Brand, index: number) => (
            <Link href={`/${brand?.slug}`} key={index}>
              <div className="bg-gradient-to-b w-fit  from-blue-500/30 font-semibold to-blue-400/5 text-xs text-blue-900 px-4 py-2 rounded-full ">
                {brand?.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-2 flex flex-col space-between min-h-[100px] px-2.5 justify-between  lg:pt-2 lg:pb-2.5 relative">
        <div>{renderGroupButtons()}</div>

        <Link className="block " href={link}>
          <h2
            className={`nc-ProductCard__title  text-xs lg:text-sm text-black line-clamp-2 font-semibold transition-colors whitespace-normal`}
          >
            {fromSearch ? (
              <Highlight attribute="name" hit={data as any} />
            ) : (
              <>{name}</>
            )}
          </h2>
        </Link>

        <Link
          href={link}
          className="flex m-0 mb-2 justify-between  items-center"
        >
          <Prices
            price={lowestPrice}
            salePrice={lowestSalePrice}
            className="lg:flex-col-reverse"
          />

          {(salePrice === price || !salePrice) && !!reviewCount && (
            <div className="flex items-center mb-0.5">
              <StarIcon className="w-4 h-4 pb-[1px] text-amber-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {averageRating ? (
                  <>{averageRating.toFixed(1)}</>
                ) : (
                  <span className="mr-1">5</span>
                )}
                (
                {reviewCount ? (
                  <>
                    {reviewCount} review{reviewCount > 1 ? "s" : ""}
                  </>
                ) : (
                  "0 reviews"
                )}
                )
              </span>
            </div>
          )}
        </Link>
      </div>
      <ModalQuickView
        show={showModalQuickView}
        onCloseModalQuickView={() => setShowModalQuickView(false)}
        productData={databaseId}
        brands={brands?.nodes[0]}
      />
    </div>
  );
};

export default ProductCard;
