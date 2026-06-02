"use client";
import {
  ExternalLink,
  Flame,
  Loader,
  MousePointerClick,
  Settings2,
  ShoppingCart,
  Truck,
  XIcon,
} from "lucide-react";
import { FC, useEffect, useMemo, useRef, useState } from "react";
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
  ProductAttribute,
  ProductVariation,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";
import AddedToCart from "@/components/ui/Notifications/added-to-cart";
import { useCart } from "@/context/CartProvider";
import { twMerge } from "tailwind-merge";
import { Highlight } from "react-instantsearch";
import { redirect, useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store/store";
import koko from "@/public/koko.png";
import {
  getDatabaseIdFromProductLike,
  mergeProductMetaForBogo,
  normalizeBogoConfig,
} from "@/lib/bogo";
import { parsePriceString, resolveProductSale } from "@/lib/productSale";

export interface ProductCardProps {
  className?: string;
  data: (SimpleProduct & VariableProduct) | any;
  fromSearch?: boolean;
  /** From `ProductGridInstant`: BOGO meta keyed by Woo `databaseId` (Typesense hits have no meta). */
  bogoPluginMetaByProductId?: Record<
    number,
    | Array<{ key: string; value?: string | null; id?: string | null } | null>
    | null
  >;
}

// Color Preview Component
interface ColorPreviewProps {
  variations?: ProductVariation[];
}

const ColorPreview: FC<ColorPreviewProps> = ({ variations }) => {
  // Extract unique color values from variations
  const colors = variations
    ?.map((variation: ProductVariation) => {
      const colorAttr = variation.attributes?.nodes?.find(
        (attribute: any) => attribute.name === 'pa_color'
      ) as any;
      return colorAttr?.value;
    })
    .filter((color): color is string => !!color && color !== undefined)
    .filter((color, index, array) => array.indexOf(color) === index) || [];

  if (colors.length <= 1) return null;

  return (
    <div className="text-[12px] text-gray-600 font-medium">
      {colors.length} {colors.length === 1 ? 'color' : 'colors'}
    </div>
  );
};

const ProductCard: FC<ProductCardProps> = ({
  className = "",
  data,
  fromSearch = false,
  bogoPluginMetaByProductId,
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
    nodes,
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

  // Check if product is a pre-order product
  const isPreOrderProduct = () => {
    return data?.productTags?.nodes?.some(
      (tag: any) => tag.slug === 'pre-order'
    ) || false;
  };

  const isFreeGiftProduct = useMemo(
    () => data?.productTags?.nodes?.some((tag: { slug?: string | null }) => tag.slug === 'free-gift') ?? false,
    [data?.productTags?.nodes]
  );

  // Listing cards key off the parent's `free-shipping` tag rather than the
  // BOGO-plugin meta the PDP/cart use, because no variation is selected at
  // listing time — there's nothing to resolve the meta priority against.
  // The WP plugin keeps the parent tag in sync with the meta on save, so
  // the badge shown here matches what the PDP will resolve to once a
  // variation is picked. Don't unify with the meta-based check used on PDP/cart.
  const isFreeShippingProduct = useMemo(
    () => data?.productTags?.nodes?.some((tag: { slug?: string | null }) => tag.slug === 'free-shipping') ?? false,
    [data?.productTags?.nodes]
  );

  // Extract the last segment of the pathname
  const segments = pathname.split("/");
  const productName = segments[segments.length - 1];
  const LinkSegments = link.split("/");
  const productLink = LinkSegments[LinkSegments.length - 1];

  const { search, setSearch, search_status } = useStore();
  const isKokoEnabled = true;
  const productDbId = getDatabaseIdFromProductLike(data) ?? databaseId;
  const batchBogoMeta =
    productDbId != null && bogoPluginMetaByProductId
      ? bogoPluginMetaByProductId[productDbId]
      : undefined;
  const bogo = useMemo(
    () => normalizeBogoConfig(
      mergeProductMetaForBogo(
        batchBogoMeta !== undefined
          ? { metaData: data?.metaData, bogoPluginMeta: batchBogoMeta }
          : data
      ),
      productDbId ?? data?.databaseId
    ),
    [data?.metaData, batchBogoMeta, productDbId]
  );

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
      if (productDbId) {
        await addToCart(productDbId, quantity);
        cartCompleted();
      } else {
        // notifyAddTocart(1);
      }
    } catch (error: any) {
      let highQuantity = error.message.includes("You cannot add that amount");

      if (highQuantity) {
        toast.error(
          "You've reached the maximum quantity allowed for this item."
        );
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resolved sale used by the % OFF badge. Returns null when no in-stock
  // variation has a discount that rounds above 0%; that null also drives
  // the On-Sale post-filter in ProductGridInstant so a card without a
  // visible discount can't render under the On Sale filter at all.
  const saleDiscount = useMemo(
    () => resolveProductSale({ type, salePrice, regularPrice, variations }),
    [type, salePrice, regularPrice, variations]
  );

  // Compute the absolute top offset for the free-shipping badge so it never
  // overlaps the BOGO, Sold Out, or Sale badges above it.
  const freeShippingBadgeTop = useMemo((): string | null => {
    if (!isFreeShippingProduct) return null;
    const inStock = stockStatus === "IN_STOCK";
    const hasBogo = bogo.isBogoEnabled;
    const hasSale = inStock && !!saleDiscount;
    if (!inStock) return hasBogo ? "top-20" : "top-12";
    if (hasBogo && hasSale) return "top-20";
    if (hasBogo || hasSale) return "top-12";
    return "top-4";
  }, [isFreeShippingProduct, stockStatus, bogo.isBogoEnabled, saleDiscount]);

  // Calculate the lowest and highest prices among in-stock variations
  let lowestPrice = price;
  let lowestSalePrice = regularPrice;

  let highestPrice = price;
  if (variations?.nodes) {
    const prices = variations.nodes.map((variation: ProductVariation) =>
      parseFloat(variation.price?.replace(/[^0-9.]/g, "") || "0")
    );
    highestPrice = Math.max(...prices).toString();
  }


  if (type === "VARIABLE" && variations?.nodes) {
    const inStockVariations = variations.nodes.filter(
      (variation: ProductVariation) => variation.stockStatus === "IN_STOCK"
    );

    if (inStockVariations.length > 0) {
      const lowestPriceVariation = inStockVariations.reduce(
        (prev: any, curr: any) => {
          return parsePriceString(curr.price) < parsePriceString(prev.price) ? curr : prev;
        }
      );

      const lowestSalePriceVariation = inStockVariations.reduce(
        (prev: any, curr: any) => {
          return parsePriceString(curr.regularPrice) < parsePriceString(prev.regularPrice)
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
      <div className="absolute -top-10 right-1 flex justify-center opacity-100 visible transition-all hover:scale-105 hover:shadow-md rounded-full">
        {stockStatus === "IN_STOCK" ? (
          <>
            {type === "SIMPLE" && price && price?.length > 0 && (
              <ButtonPrimary
                className={`shadow-md ${rawPrice === "0.00" ? "opacity-60 cursor-not-allowed" : ""
                  }
                `}
                fontSize="text-xs"
                sizeClass="py-1.5 px-3.5"
                onClick={handleAddToCart}
                disabled={loading || rawPrice === "0.00"}
              >
                <span className="flex items-center gap-2">
                  {" "}
                  {loading ? (
                    <Loader className="animate-spin w-4" />
                  ) : (
                    <ShoppingCart className="w-3.5" />
                  )}{" "}
                  {isPreOrderProduct() ? "Pre-order Now" : "Buy Now"}
                </span>
              </ButtonPrimary>
            )}

            {type === "VARIABLE" && (
              <Link
                href={link}
                onClick={() => {
                  if (productLink == productName) {
                    setSearch("");
                  }
                }}
              >
                <ButtonPrimary
                  className="shadow-md"
                  fontSize="text-xs"
                  sizeClass="py-1.5 px-3.5"
                >
                  <span className="flex items-center gap-2  transition-all">
                    <MousePointerClick className="w-3.5 group-hover:scale-125 transition-all" />
                    Customize
                  </span>
                </ButtonPrimary>
              </Link>
            )}
          </>
        ) : (
          <Link href={link}>
            {/* <ButtonPrimary
              className="shadow-lg bg-zinc-500"
              fontSize="text-xs"
              sizeClass="py-1.5 px-3.5"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5" />
              </span>
            </ButtonPrimary> */}
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
      {/* Sale Badge - Outside image container */}
      {stockStatus === "IN_STOCK" && saleDiscount && (
        <div className={`absolute left-0 z-10 cursor-pointer bg-green-600 w-fit font-normal text-xs text-white px-3 py-1.5 rounded-r-full shadow-md ${bogo.isBogoEnabled ? "top-12" : "top-4"}`}>
          {saleDiscount.roundedPercent}% OFF!
        </div>
      )}
      {stockStatus !== "IN_STOCK" && (
        <div className="absolute left-0 top-4 z-10 cursor-pointer bg-red-600 w-fit font-normal text-xs text-white px-3 py-1.5 rounded-r-full shadow-md">
          Sold Out
        </div>
      )}

      {bogo.isBogoEnabled && (
        <div
          className={`absolute left-0 z-10 w-fit cursor-default rounded-r-full bg-green-600 text-xs font-normal text-white shadow-md ${
            stockStatus === "IN_STOCK" ? "top-4" : "top-12"
          }`}
        >
          {/* Mobile / touch: full label. md+: only "Free"; on card hover swap to full label. */}
          <span className="block whitespace-nowrap px-3 py-1.5 md:hidden">{isFreeGiftProduct ? "Free Gift" : bogo.label}</span>
          <div className="hidden md:block">
            <span className="block whitespace-nowrap px-3 py-1.5 font-semibold group-hover:hidden">
              Free
            </span>
            <span className="hidden max-w-[min(16rem,calc(100vw-3rem))] whitespace-nowrap px-3 py-1.5 group-hover:block">
              {isFreeGiftProduct ? "Free Gift" : bogo.label}
            </span>
          </div>
        </div>
      )}

      {freeShippingBadgeTop && (
        <div
          className={`absolute left-0 z-10 w-fit cursor-default rounded-r-full bg-blue-600 text-xs font-normal text-white shadow-md ${freeShippingBadgeTop}`}
        >
          <span className="flex items-center gap-1 whitespace-nowrap px-3 py-1.5 md:hidden">
            <Truck className="w-3 h-3 shrink-0" />
            Free Shipping
          </span>
          <div className="hidden md:block">
            <span className="flex items-center justify-center px-3 py-1.5 group-hover:hidden">
              <Truck className="w-3 h-3" />
            </span>
            <span className="hidden items-center gap-1 whitespace-nowrap px-3 py-1.5 group-hover:flex">
              <Truck className="w-3 h-3 shrink-0" />
              Free Shipping
            </span>
          </div>
        </div>
      )}

      <div className="relative flex-shrink-0 bg-white rounded-2xl overflow-hidden ">

        <Link
          href={link}
          onClick={() => {
            if (productLink == productName) {
              setSearch("");
            }
          }}
        >
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
                      className="object-contain w-full h-full aspect-square max-h-[225px] transition-transform duration-800 ease-in-out group-hover:scale-110" // <-- Add hover scale effect
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
                    `object-cover object-center w-full h-full rounded-2xl aspect-square max-h-[225px] transition-transform duration-800 ease-in-out group-hover:scale-105` // <-- Add hover scale effect
                  )}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white/90 via-white/30 to-transparent"></div>{" "}
                {/* Overlay from bottom */}
              </div>
            )}
          </div>
        </Link>

        {/* Arrow Icon */}
        {/* <div
          className={"absolute hidden md:block top-3 cursor-pointer right-3"}
          onClick={() => handleCloseModalQuickView()}
        >
          <ArrowsPointingOutIcon className="w-5" />
        </div> */}
        <div className="absolute top-1 right-2.5">
          <ColorPreview variations={variations?.nodes} />
        </div>
      </div>

      <div className="space-y-3 flex flex-col space-between min-h-[100px] px-2.5 justify-between  lg:pt-2 lg:pb-2.5 relative">
        <div>{renderGroupButtons()}</div>



        <Link
          className="block"
          href={link}
          onClick={() => {
            if (productLink == productName) {
              setSearch("");
            }
          }}
        >
          <h2
            className={`text-xs hidden lg:text-sm text-black font-semibold transition-colors whitespace-normal min-h-[2.5rem] min-lg:h-[3rem] overflow-hidden leading-tight`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
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
        <div className="flex  justify-between gap-2 ">
          <div className="flex flex-wrap items-center gap-1 ">
            {brands?.nodes?.map((brand: Brand, index: number) => (
              <Link
                onClick={() => {
                  if (productLink == productName) {
                    setSearch("");
                  }
                }}
                href={`/${brand?.slug}`}
                key={index}
              >

                <div className="font-semibold text-xs text-blue-900 px-0 py-0 rounded-full ">
                  {brand?.name}
                </div>
              </Link>
            ))}


          </div>

          {/* INstock badge in green */}
          {stockStatus === "IN_STOCK" ? (
            isPreOrderProduct() ? (
              <div className="font-semibold text-xs text-blue-500 px-0 py-0 rounded-full ">
                Pre Order
              </div>
            ) : (
              <div className="font-semibold text-xs text-green-500 px-0 py-0 rounded-full ">
                In Stock
              </div>
            )
          ) : (
            <div className="hidden font-semibold text-xs text-red-500 px-0 py-0 rounded-full whitespace-nowrap">
              Sold Out
            </div>
          )}
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

        {isKokoEnabled && lowestPrice && lowestSalePrice && (
          <div className="flex flex-wrap items-center text-xs text-gray-500 gap-1 ">


            <Image
              src={koko}
              alt="KOKO"
              className="inline-block w-12 h-auto -mt-1"
            />
            <div className="flex flex-row items-center gap-1">
              <span className="ml-1 flex items-center gap-1">3 x RS</span>
              <span className="font-semibold ">
                {(
                  ((parseFloat(
                    (lowestPrice?.includes("₨&nbsp;0.00") ||
                      lowestSalePrice?.includes("₨&nbsp;0.00")
                      ? highestPrice
                      : lowestPrice || lowestSalePrice || "0"
                    )
                      .toString()
                      .replace(/[^\d.]/g, "")
                  ) /
                    88) *
                    100) /
                  3
                ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

          </div>
        )}
      </div>
      {/* <ModalQuickView
        show={showModalQuickView}
        onCloseModalQuickView={() => setShowModalQuickView(false)}
        productData={databaseId}
        brands={brands?.nodes[0]}
      /> */}
    </div>
  );
};

export default ProductCard;
