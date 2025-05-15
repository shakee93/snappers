"use client";
import {
  ExternalLink,
  Loader,
  MousePointerClick,
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
import { redirect, useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store/store";
import koko from "@/public/koko.png";
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
    nodes
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
  const pathname = usePathname();

  // Extract the last segment of the pathname
  const segments = pathname.split('/');
  const productName = segments[segments.length - 1];
  const LinkSegments = link.split('/');
  const productLink = LinkSegments[LinkSegments.length - 1];
  // console.log("Product link:", productLink);
  // console.log("Product Name:", productName);

  const { search, setSearch, search_status } = useStore();

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
    // notifyAddTocart(quantity);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      if (data.databaseId) {
        await addToCart(data.databaseId, quantity);
        cartCompleted();
      } else {
        // toast("Wow so easy !");
        // notifyAddTocart(1);
      }
    } catch (error: any) {
      // console.log("error", error);
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

  // Calculate the lowest and highest prices among in-stock variations
  let lowestPrice = price;
  let lowestSalePrice = regularPrice;
  // console.log('lowestPrice', name, lowestPrice);
  // console.log('lowestSalePrice', name, lowestSalePrice);

  let highestPrice = price;
  if (variations?.nodes) {
    const prices = variations.nodes.map((variation: ProductVariation) =>
      parseFloat(variation.price?.replace(/[^0-9.]/g, '') || "0")
    );
    highestPrice = Math.max(...prices).toString();
  }

  // console.log('highestPrice', name, highestPrice);

  if (type === "VARIABLE" && variations?.nodes) {
    const inStockVariations = variations.nodes.filter(
      (variation: ProductVariation) => variation.stockStatus === "IN_STOCK"
    );

    if (inStockVariations.length > 0) {
      const lowestPriceVariation = inStockVariations.reduce(
        (prev: any, curr: any) => {
          return parsePrice(curr.price) < parsePrice(prev.price) ? curr : prev;
        }
      );

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

      <div className="absolute -top-10 right-1 flex justify-center opacity-100 visible transition-all">
        {stockStatus === "IN_STOCK" ? (
          <>
            {type === "SIMPLE" && price && price?.length > 0 && (
              <ButtonPrimary
                className={`shadow-md ${rawPrice === "0.00" ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                fontSize="text-xs"
                sizeClass="py-1.5 px-3.5"
                onClick={handleAddToCart}
                disabled={loading || rawPrice === "0.00"}
              >
                <span className="flex items-center gap-2"> {loading ? (
                  <Loader className="animate-spin w-4" />
                ) : (
                  <ShoppingCart className="w-3.5" />
                )} Buy Now</span>

              </ButtonPrimary>
            )}

            {type === "VARIABLE" && (
              <Link href={link} onClick={() => {
                if (productLink == productName) {
                  setSearch("");
                }
              }}>
                <ButtonPrimary
                  className="shadow-md"
                  fontSize="text-xs"
                  sizeClass="py-1.5 px-3.5"
                >
                  <span className="flex items-center gap-2"><MousePointerClick className="w-3.5" />Select</span>
                </ButtonPrimary>
              </Link>
            )}
          </>
        ) : (
          <Link href={link}>
            <ButtonPrimary
              className="shadow-lg bg-zinc-500"
              fontSize="text-xs"
              sizeClass="py-1.5 px-3.5"
            >
              <span className="flex items-center gap-2"><ExternalLink className="w-3.5" />View</span>
            </ButtonPrimary>
          </Link>
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-[270px] md:min-h-[350px] nc-ProductCard relative flex flex-col bg-white rounded-2xl p-1 group ${className} `}
      data-nc-id="ProductCard"
    >
      <div className="relative flex-shrink-0 bg-white rounded-2xl overflow-hidden ">
        <Link href={link}
          onClick={() => {
            if (productLink == productName) {
              setSearch("");
            }
          }}>
          <div className="flex items-center justify-center aspect-square relative">
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
                    className="w-full flex-shrink-0 bg-[#fefefe] relative overflow-hidden"
                  >
                    <Image
                      src={
                        variation?.node?.image?.sourceUrl?.replace(
                          "http://",
                          "https://"
                        ) || ""
                      }
                      width={300}
                      height={300}
                      alt={name || ""}
                      placeholder="blur"
                      className="object-contain w-auto h-full mx-auto my-auto transition-transform duration-800 ease-in-out group-hover:scale-110" // <-- Add hover scale effect
                    />
                    <div className="h-full relative ">
                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-transparent to-transparent"></div>{" "}
                      {/* Overlay from bottom */}
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="relative w-full aspect-square overflow-hidden">
                <Image
                  width={250}
                  height={250}
                  src={image?.sourceUrl || ""}
                  alt={name || ""}
                  className={twMerge(
                    `object-cover object-center w-full h-full rounded-2xl transition-transform duration-800 ease-in-out group-hover:scale-105` // <-- Add hover scale effect
                  )}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white/90 via-white/30 to-transparent"></div>{" "}
                {/* Overlay from bottom */}
              </div>
            )}
          </div>
        </Link>

        {/* Arrow Icon */}
        <div


          className={"absolute hidden md:block top-3 cursor-pointer right-3"}
          onClick={() => handleCloseModalQuickView()}
        >
          <ArrowsPointingOutIcon className="w-5" />
        </div>

        {/* Sold Out */}
        <div
          className={`absolute left-1 top-1.5 text-center text-xs lg:text-sm line-clamp-2 rounded-full text-slate-800`}
        >
          {stockStatus !== "IN_STOCK" && (
            <div className="bg-gradient-to-b w-fit from-gray-500/30 font-semibold to-gray-400/5 text-xs text-gray-900 px-4 py-2 rounded-full">
              Sold Out
            </div>
          )}

        </div>

      </div>

      <div className="space-y-2 flex flex-col space-between min-h-[100px] px-2.5 justify-between  lg:pt-2 lg:pb-2.5 relative">
        <div>{renderGroupButtons()}</div>

        <Link className="block" href={link}
          onClick={() => {
            if (productLink == productName) {
              setSearch("");
            }
          }}>
          <h2
            className={`flex flex-col md:flex-row gap-2 justify-between md:gap-0 text-xs lg:text-sm text-black font-semibold transition-colors whitespace-normal min-h-[2.5rem] min-lg:h-[3rem] line-clamp-2 overflow-hidden`}
          >
            {fromSearch ? (
              <Highlight attribute="name" hit={data as any} />
            ) : (
              <>{name}</>
            )}
            {/* {stockStatus !== "IN_STOCK" && (
              <span className="ml-2 inline-block bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-full self-start w-24 text-center">
                Sold Out
              </span>
            )} */}
          </h2>
        </Link>



        {/* Brand */}
        <div className="flex flex-wrap items-center gap-2 ">
          {brands?.nodes?.map((brand: Brand, index: number) => (
            <Link onClick={() => {
              if (productLink == productName) {
                setSearch("");
              }
            }} href={`/${brand?.slug}`} key={index}>

              <div className="font-semibold text-xs text-blue-900 px-0 py-0 rounded-full ">
                {brand?.name}
              </div>
            </Link>
          ))}

        </div>


        <Link
          href={link}
          className="flex m-0 mb-2 justify-between items-center"
          onClick={() => {
            if (productLink == productName) {
              setSearch("");
            }
          }}
        >
          <Prices
            price={lowestPrice}
            salePrice={lowestSalePrice}
            className=""
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



        {lowestPrice && lowestSalePrice && (
          <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 mb-2">
            <span>or pay in 3 x Rs</span>
            <span className="font-semibold mx-1">
              {(
                parseFloat(
                  ((lowestPrice?.includes("₨&nbsp;0.00") || lowestSalePrice?.includes("₨&nbsp;0.00"))
                    ? highestPrice
                    : (lowestPrice || lowestSalePrice || "0"))
                    .toString()
                    .replace(/[^\d.]/g, "")
                ) / 88 * 100 / 3
              ).toFixed(2)}
            </span>
            <span>with</span>
            <span className="ml-1 inline-block mb-2">
              <Image src={koko} alt="KOKO" className="inline-block w-12 h-auto" />
            </span>
          </div>
        )}



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