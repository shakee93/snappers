'use client'
import React, { FC, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import BagIcon from "./BagIcon";
import { StarIcon } from "@heroicons/react/24/solid";
import toast, { Toaster } from 'react-hot-toast';
import { Transition } from "@headlessui/react";
import ModalQuickView from "./ModalQuickView";
import ProductStatus from "./ProductStatus";
import Prices from "./Prices";
import LikeButton from "./LikeButton";
import useProductLink from "@/hooks/useProductLink";
import { Brand, Product, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import AddedToCart from "@/app/components/Notifications/added-to-cart";
import { useCart } from "@/context/CartProvider";
import {ExternalLink, List, MenuSquare, MoreHorizontal, MoreVertical} from "lucide-react";
import AttributeIcon from "@/app/components/AttributeIcon";


export interface ProductCardProps {
    className?: string;
    data: SimpleProduct | VariableProduct;
    isLiked?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({
    className = "",
    data,
    isLiked,
}) => {

    const { name, price,
        type,
        image,
        attributes,
        productCategories,
        slug, stockStatus,
        variations,
        brands,
        reviewCount,
        averageRating, featured,
        salePrice, databaseId } = data;

    const [showModalQuickView, setShowModalQuickView] = useState(false);


    const [isHovered, setIsHovered] = useState(false);
    const [currentVariation, setCurrentVariation] = useState(0);
    const hoverIntervalRef = useRef<number | null>(null);
    const delayBeforeNextImage = 1000;
    const link = useProductLink(data)

    useEffect(() => {
        return () => {
            if (hoverIntervalRef.current !== null) {
                clearInterval(hoverIntervalRef.current);
            }
        };
    }, []);

    // console.log('product card', data)

    /* Slider Start */

    const startSlider = () => {
        hoverIntervalRef.current = window.setInterval(() => {
            setCurrentVariation((prev) => (prev + 1) % (variations?.edges?.length || 1));
        }, delayBeforeNextImage);
    };

    const handleHover = () => {
        setIsHovered(true);
        startSlider();
    };

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

    // const variationImages = variations?.edges.map((variation: any) => variation.node.image.mediaItemUrl) || [];

    const sliderStyle = {
        display: 'flex',
        cursor: 'pointer',
        transition: 'transform 0.3s ease-in-out',
        transform: `translateX(-${currentVariation * 100}%)`,
        height: `250px`,
        backgroundColor: `#fefefe`
    };

    /* End of Slider Code */

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
                    <p className="block text-base font-semibold leading-none">
                        Added to cart!
                    </p>
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

    const handleAddToCart = () => {
        console.log(data.databaseId);
        if (data.databaseId) {
            addToCart(data.databaseId, quantity)?.then(cartCompleted);
        } else {
            notifyAddTocart(1);
        }
    };


    const renderProductCartOnNotify = () => {
        return (
            <div className="flex">
                <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <Image
                        style={{ objectFit: 'cover' }}
                        src={variations?.edges[currentVariation]?.node?.image?.mediaItemUrl || image?.mediaItemUrl || ''}
                        alt={name || ''}
                        width={280}
                        height={305}
                        className="h-full w-full object-cover object-center"
                    />
                </div>

                <div className="ml-4 flex flex-1 flex-col">
                    <div>
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-base font-medium ">{name}</h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    <span>
                                        {data.name}
                                    </span>
                                    <span className="mx-2 border-l border-slate-200 dark:border-slate-700 h-4"></span>
                                    {/* Omitted the size span */}
                                </p>
                            </div>
                            <Prices price={price} className="mt-0.5" />
                        </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500 dark:text-slate-400">Qty 1</p>
                        <div className="flex">
                            <Link href={"/cart"} className="font-medium text-primary-6000 dark:text-primary-500 ">
                                View cart
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderVariants = () => {
        if (data.type !== "VARIABLE" || !variations || !variations.edges.length) {
            return null;
        } else {
            return (
                <div className="flex space-x-1">
                    {variations.edges.map((variation, index) => (
                        <div
                            key={index}
                            onClick={() => setCurrentVariation(index)}
                            className={`relative w-6 h-6 rounded-full overflow-hidden z-10 border cursor-pointer ${currentVariation === index
                                ? 'border-primaryColor'
                                : 'border-transparent'
                                }`}
                            title={variation.node.name}
                        >
                            <div
                                className="absolute inset-0.5 rounded-full z-0"
                                style={{ backgroundColor: 'var(--your-variant-color-property)' }}
                            ></div>
                        </div>
                    ))}
                </div>
            )
        };
    };

    const renderGroupButtons = () => {
        return (
            <div className="absolute bottom-4 inset-x-1 flex justify-center opacity-100 visible transition-all">


                {stockStatus === 'IN_STOCK' ?
                    <>
                        {type === 'SIMPLE' &&
                            <ButtonPrimary
                                className="shadow-lg"
                                fontSize="text-xs"
                                sizeClass="py-3.5 px-5"
                                onClick={handleAddToCart}
                            >
                                <BagIcon className="w-3.5 h-3.5 mb-0.5" />
                                <span className="ml-1">Add to Cart</span>
                            </ButtonPrimary>
                        }

                        {type === 'VARIABLE' &&
                            <Link href={link}>
                                <ButtonPrimary
                                    className="shadow-lg"
                                    fontSize="text-xs"
                                    sizeClass="py-3.5 px-5"
                                >
                                    <AttributeIcon className='w-4 mr-1' name={attributes?.nodes[0].name}/>
                                    <span className="ml-1">Choose {attributes?.nodes[0].label || "Options" }</span>
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
            className={`nc-ProductCard relative flex flex-col bg-white p-2 rounded-3xl group ${className}`}
            data-nc-id="ProductCard"
            onMouseEnter={handleHover}
            onMouseLeave={handleHoverOut}
        >
            <div className="relative flex-shrink-0 bg-slate-50 dark:bg-slate-300 rounded-3xl overflow-hidden ">

                <Link href={link}>
                    <div style={sliderStyle}>
                        {variations?.edges && variations.edges.some(variation => variation.node?.image?.sourceUrl) ? (
                            variations.edges.map((variation, index) => (
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
                            <Image
                                width={300}
                                height={300}
                                src={image?.sourceUrl || ''}
                                alt={name || ''}
                                className="object-contain w-auto h-full mx-auto my-auto"
                            />
                        )}
                    </div>
                </Link>


                {/* <ProductStatus status={stockStatus} /> */}

                <div className={"absolute top-3 right-3 z-10"} onClick={e => handleCloseModalQuickView(true)}>
                    <ArrowsPointingOutIcon className='w-5'/>
                    {/*<LikeButton liked={isLiked} className="" />*/}
                </div>

                {/* {sizes ? renderSizeList() : renderGroupButtons()} */}
                {renderGroupButtons()}

            </div>

            <div className="space-y-2 px-2.5 pt-5 pb-2.5"

            >

                {/* {renderVariants()} */}

                <div>
                    <h2
                        className={`nc-ProductCard__title  text-sm lg:text-base text-black line-clamp-2 min-h-[40px] lg:min-h-[47px] font-semibold transition-colors`}
                    >
                        {name}
                    </h2>
                    <div
                        className={`nc-ProductCard__title text-xs lg:text-sm text-black line-clamp-2 min-h-[20px] lg:min-h-[20px] text-slate-800`}
                    >
                        {brands?.nodes.map((brand: Brand, index) => (
                            <Link href={`/${brand?.slug}`} key={index}>{brand?.name}</Link>
                        ))}

                        - {type} - {databaseId}
                    </div>
                </div>


                <div className="flex m-0 mb-2 justify-between items-center">
                    <Prices price={price} salePrice={salePrice} />
                    {((salePrice === price || !salePrice) && reviewCount) && (
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
                </div>



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
