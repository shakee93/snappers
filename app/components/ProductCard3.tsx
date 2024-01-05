"use client";
import { Loader, ShoppingCart } from "lucide-react";
import React, { FC, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import BagIcon from "./BagIcon";
import { StarIcon } from "@heroicons/react/24/solid";
import toast, { Toaster } from "react-hot-toast";
import { Transition } from "@headlessui/react";
import ModalQuickView from "./ModalQuickView";
import ProductStatus from "./ProductStatus";
import Prices from "./Prices";
import LikeButton from "./LikeButton";
import useProductLink from "@/hooks/useProductLink";
import {
  Brand,
  Edge,
  Product,
  ProductVariation,
  SimpleProduct,
  VariableProduct,
  VariationAttribute,
} from "@/graphql/types/graphql";
import AddedToCart from "@/app/components/Notifications/added-to-cart";
import { useCart } from "@/context/CartProvider";
import {ExternalLink, List, MenuSquare, MoreHorizontal, MoreVertical, XIcon} from "lucide-react";
import AttributeIcon from "@/app/components/AttributeIcon";
import {getBlurData} from "@/utils/blurPlaceholder";
import {twMerge} from "tailwind-merge";

export interface ProductCardProps {
  className?: string;
  data: SimpleProduct & VariableProduct;
  isLiked?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({
  className = "",
  data,
  isLiked,
}) => {
  const {
    name,
    price,
    type,
    purchasable,
        image,
        attributes,
        productCategories,
        slug, stockStatus,
        variations,
        regularPrice,
        brands,
        reviewCount,
        averageRating, featured,
        salePrice, databaseId,
  } = data;

    const [showModalQuickView, setShowModalQuickView] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false)

    const [isHovered, setIsHovered] = useState(false);
    const [currentVariation, setCurrentVariation] = useState(0);
    const hoverIntervalRef = useRef<number | null>(null);
    const [loading, setLoading] = useState(false)

    const link = useProductLink(data)



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


    const [quantity, setQuantity] = useState(1)
    const { addToCart } = useCart()

    const notifyAddTocart = (quantity: number) => {
        toast.custom(
            (t: any) => (
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
                    <div className="flex items-center w-full justify-between text-base font-semibold leading-none">
                        Added to cart! <button onClick={e => toast.dismiss('nc-product-notify')}><XIcon/></button>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-4" />
                    <AddedToCart product={data} quantity={quantity} />
                </Transition>
            ),
            { position: "top-right", id: "nc-product-notify", duration: 3000 }
        );
    };

    const cartCompleted = () => {
        notifyAddTocart(quantity)
        setQuantity(1)
    }

    const handleAddToCart = async () => {
        // console.log(data.databaseId);
        if (data.databaseId) {
            addToCart(data.databaseId, quantity)?.then(cartCompleted);
        } else {
            notifyAddTocart(1);
        }
        setLoading(true);
        await addToCart(data.databaseId, quantity);
        cartCompleted();
        setLoading(false);
    };

    const renderGroupButtons = () => {
        return (
            <div className="flex justify-center opacity-100 visible transition-all">


                {stockStatus === 'IN_STOCK' ?
                    <>
                        {(type === 'SIMPLE' && price && price?.length > 0) &&
                            <ButtonPrimary
                                className="shadow-lg"
                                fontSize="text-xs"
                                sizeClass="py-2.5 px-5"
                                onClick={handleAddToCart}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader className="animate-spin w-4" />
                                ) : (
                                    <ShoppingCart className='w-4' />
                                )}
                                <span className="ml-2">Add</span>
                            </ButtonPrimary>
                        }

                        {type === 'VARIABLE' &&
                            <Link href={link}>
                                <ButtonPrimary
                                    className="shadow-lg"
                                    fontSize="text-xs"
                                    sizeClass="py-2.5 px-5"
                                >
                                    <AttributeIcon className='w-4 mr-1' name={attributes?.nodes[0].name}/>
                                    <span className="ml-1">{attributes?.nodes[0].label || "Options" }</span>
                                </ButtonPrimary>
                            </Link>
                        }
                    </> :

                    <Link href={link}>
                        <ButtonPrimary
                            className="shadow-lg bg-zinc-500"
                            fontSize="text-xs"
                            sizeClass="py-3.5 px-5"
                        >
                            <ExternalLink className="w-3.5 h-3.5 mb-0.5"  />
                            <span className="ml-1">Out of Stock</span>
                        </ButtonPrimary>
                    </Link>
                }



            </div>

        );
    };



    return (
        <div
            className={`nc-ProductCard relative flex flex-col bg-white rounded-3xl p-2 group ${className}`}
            data-nc-id="ProductCard"
        >
            <div className="relative flex-shrink-0 bg-slate-50 rounded-2xl dark:bg-slate-300 overflow-hidden ">

                <Link href={link}>
                    <div className='flex items-center justify-center h-[150px] sm:h-[250px]' >
                        {variations?.edges && variations.edges.some((variation: {
                            node: ProductVariation
                        }) => variation.node?.image?.sourceUrl) ? (
                            variations.edges.map((variation: {
                                node: ProductVariation
                            }, index) => (
                                <div key={index} className="w-full flex-shrink-0 bg-[#fefefe]">
                                    <Image
                                        src={variation?.node?.image?.sourceUrl || ''}
                                        width={300}
                                        height={300}
                                        alt={name || ''}
                                        className="object-contain w-auto h-full mx-auto my-auto"
                                    />
                                </div>
                            ))
                        ) : (
                            <>
                                {/*{!imageLoaded &&*/}
                                {/*    <div className="h-full w-full bg-gray-200 rounded-3xl animate-pulse"></div>*/}
                                {/*}*/}

                                <Image
                                    width={300}
                                    height={300}
                                    src={image?.sourceUrl || ''}
                                    alt={name || ''}
                                    className={twMerge(
                                        `object-cover object-center mx-auto my-auto rounded-3xl`,
                                    )}
                                />
                            </>

                        )}
                    </div>
                </Link>


                {/* <ProductStatus status={stockStatus} /> */}

                <div className={"absolute hidden md:block top-3 cursor-pointer right-3"} onClick={e => handleCloseModalQuickView()}>
                    <ArrowsPointingOutIcon className='w-5'/>
                    {/*<LikeButton liked={isLiked} className="" />*/}
                </div>

                <div
                    className={`absolute left-1.5 top-2 text-center text-xs lg:text-sm line-clamp-2 text-slate-800`}
                >
                    {brands?.nodes?.map((brand: Brand, index) => (
                        <Link className='bg-zinc-100/70 px-2 py-1 rounded-lg' href={`/${brand?.slug}`} key={index}>{brand?.name}</Link>
                    ))}
                    {/*- {type} - {databaseId}*/}
                </div>
            </div>

            <div className="space-y-2 px-2.5 pt-1 pb-1 lg:pt-2 lg:pb-2.5"

            >

                <div>
                    {renderGroupButtons()}
                </div>

                <Link className='block' href={link}>
                    <h2
                        className={`nc-ProductCard__title  text-xs lg:text-sm text-black line-clamp-2 font-semibold transition-colors whitespace-normal`}
                    >
                        {name}
                    </h2>

                </Link>

                <Link href={link} className="flex m-0 mb-2 justify-between items-center">
                    <Prices price={price} salePrice={regularPrice} className='lg:flex-row' />
                    {((salePrice === price || !salePrice) && !!reviewCount) && (
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
                                    <>{reviewCount} review{reviewCount > 1 ? 's' : ''}</>
                                ) : (
                                    '0 reviews'
                                )}
                                )
                            </span>
                        </div>
                    )}
                </Link>
            </div>


            < ModalQuickView
                show={showModalQuickView}
                onCloseModalQuickView={() => setShowModalQuickView(false)}
                productData={data}
            />
        </div>

    );
};

export default ProductCard;
