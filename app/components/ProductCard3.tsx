import React, { FC, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import BagIcon from "./BagIcon";
import toast from "react-hot-toast";
import { Transition } from "@headlessui/react";
import ModalQuickView from "./ModalQuickView";
import ProductStatus from "./ProductStatus";
import Prices from "./Prices";
import LikeButton from "./LikeButton";

interface ProductCategory {
    __typename: string;
    name: string;
}

interface Product {
    __typename: string;
    id: string;
    name: string;
    slug: string;
    image: {
        mediaItemUrl: string;
    };
    price: string;
    stockStatus: string;
    productCategories: {
        nodes: ProductCategory[];
    };
    type: string;
}

export interface ProductCardProps {
    className?: string;
    data?: Product;
    isLiked?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({
    className = "",
    data = {
        __typename: "Product",
        id: "",
        name: "",
        slug: "",
        image: {
            mediaItemUrl: "",
        },
        price: "0",
        stockStatus: "",
        productCategories: {
            nodes: [],
        },
        type: "",
    },
    isLiked,
}) => {
    const { name, price, image, productCategories, slug, stockStatus } = data;
    const [showModalQuickView, setShowModalQuickView] = useState(false);


    const [isHovered, setIsHovered] = useState(false);
    const [currentVariation, setCurrentVariation] = useState(0);
    const hoverIntervalRef = useRef<number | null>(null);
    const delayBeforeNextImage = 500;

    useEffect(() => {
        return () => {
            if (hoverIntervalRef.current !== null) {
                clearInterval(hoverIntervalRef.current);
            }
        };
    }, []);

    // const startSlider = () => {
    //     hoverIntervalRef.current = window.setInterval(() => {
    //         setCurrentVariation((prev) => (prev + 1) % (data.variants?.length || 1));
    //     }, delayBeforeNextImage);
    // };

    // const handleHover = () => {
    //     setIsHovered(true);
    //     startSlider();
    // };

    // const handleHoverOut = () => {
    //     setIsHovered(false);
    //     setCurrentVariation(0);
    //     clearInterval(hoverIntervalRef.current!);
    // };

    // const handleDotClick = (index: number) => {
    //     setCurrentVariation(index);
    //     clearInterval(hoverIntervalRef.current!);
    // };

    const sliderStyle = {
        display: 'flex',
        cursor: 'pointer',
        transition: 'transform 0.3s ease-in-out',
        transform: `translateX(-${currentVariation * 100}%)`,
    };

    /* End of Slider Code */


    const notifyAddTocart = ({ size }: { size?: string }) => {
        toast.custom(
            (t) => (
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
                    {/* {renderProductCartOnNotify({ size })} */}
                </Transition>
            ),
            { position: "top-right", id: "nc-product-notify", duration: 3000 }
        );
    };

    // const renderProductCartOnNotify = ({ size }: { size?: string }) => {
    //     return (
    //         <div className="flex ">
    //             <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
    //                 <Image fill style={{ objectFit: 'cover' }}
    //                     src={image}
    //                     alt={name}
    //                     width={280}
    //                     height={305}
    //                     className="h-full w-full object-cover object-center"
    //                 />
    //             </div>

    //             <div className="ml-4 flex flex-1 flex-col">
    //                 <div>
    //                     <div className="flex justify-between ">
    //                         <div>
    //                             <h3 className="text-base font-medium ">{name}</h3>
    //                             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
    //                                 <span>
    //                                     {variants ? variants[variantActive].name : `Natural`}
    //                                 </span>
    //                                 <span className="mx-2 border-l border-slate-200 dark:border-slate-700 h-4"></span>
    //                                 <span>{size || "XL"}</span>
    //                             </p>
    //                         </div>
    //                         <Prices price={price} className="mt-0.5" />
    //                     </div>
    //                 </div>
    //                 <div className="flex flex-1 items-end justify-between text-sm">
    //                     <p className="text-gray-500 dark:text-slate-400">Qty 1</p>

    //                     <div className="flex">
    //                         <Link
    //                             href={"/cart"}
    //                             className="font-medium text-primary-6000 dark:text-primary-500 "
    //                         >
    //                             View cart
    //                         </Link>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };

    const getBorderClass = (Bgclass = "") => {
        if (Bgclass.includes("red")) {
            return "border-red-500";
        }
        if (Bgclass.includes("violet")) {
            return "border-violet-500";
        }
        if (Bgclass.includes("orange")) {
            return "border-orange-500";
        }
        if (Bgclass.includes("green")) {
            return "border-green-500";
        }
        if (Bgclass.includes("blue")) {
            return "border-blue-500";
        }
        if (Bgclass.includes("sky")) {
            return "border-sky-500";
        }
        if (Bgclass.includes("yellow")) {
            return "border-yellow-500";
        }
        return "border-transparent";
    };

    // const renderVariants = () => {
    //     if (!variants || !variants.length || !variantType) {
    //         return null;
    //     }

    //     if (variantType === "color") {

    //         return (
    //             <div className="flex space-x-1">
    //                 {variants.map((variant, index) => (
    //                     <div
    //                         key={index}
    //                         onClick={() => setVariantActive(index)}
    //                         className={`relative w-6 h-6 rounded-full overflow-hidden z-10 border cursor-pointer ${variantActive === index
    //                             ? getBorderClass(variant.color)
    //                             : "border-transparent"
    //                             }`}
    //                         title={variant.name}
    //                     >
    //                         <div
    //                             className={`absolute inset-0.5 rounded-full z-0 ${variant.color}`}
    //                         ></div>
    //                     </div>
    //                 ))}
    //             </div>
    //         );
    //     }

    //     return (
    //         <div className="flex ">

    //         </div>
    //     );
    // };

    const renderGroupButtons = () => {
        return (
            <div className="absolute bottom-0 group-hover:bottom-4 inset-x-1 flex justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <ButtonPrimary
                    className="shadow-lg"
                    fontSize="text-xs"
                    sizeClass="py-2 px-4"
                    onClick={() => notifyAddTocart({ size: "XL" })}
                >
                    <BagIcon className="w-3.5 h-3.5 mb-0.5" />
                    <span className="ml-1">Add to Cart</span>
                </ButtonPrimary>
                <ButtonSecondary
                    className="ml-1.5 bg-white hover:!bg-gray-100 hover:text-slate-900 transition-colors shadow-lg"
                    fontSize="text-xs"
                    sizeClass="py-2 px-4"
                    onClick={() => setShowModalQuickView(true)}
                >
                    <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
                    <span className="ml-1">Quick view</span>
                </ButtonSecondary>
            </div>
        );
    };

    // const renderSizeList = () => {
    //     if (!sizes || !sizes.length) {
    //         return null;
    //     }

    //     return (
    //         <div className="absolute bottom-0 inset-x-1 space-x-1.5 flex justify-center opacity-0 invisible group-hover:bottom-4 group-hover:opacity-100 group-hover:visible transition-all">
    //             {sizes.map((size, index) => {
    //                 return (
    //                     <div
    //                         key={index}
    //                         className="nc-shadow-lg w-10 h-10 rounded-xl bg-white hover:bg-primaryColor hover:text-white transition-colors cursor-pointer flex items-center justify-center uppercase font-semibold tracking-tight text-sm text-primaryColor"
    //                         onClick={() => notifyAddTocart({ size })}
    //                     >
    //                         {size}
    //                     </div>
    //                 );
    //             })}
    //         </div>
    //     );
    // };

    return (
        <>
            <div
                className={`nc-ProductCard relative flex flex-col bg-white p-2 rounded-3xl ${className}`}
                data-nc-id="ProductCard"
            >
                <div className="relative flex-shrink-0 bg-slate-50 dark:bg-slate-300 rounded-3xl overflow-hidden group">

                    <Link href={`/product/${slug}`}>

                        <Image
                            width={300}
                            height={300}
                            src={image?.mediaItemUrl || ''}
                            alt={name || ''}
                            className="object-cover w-full h-full drop-shadow-xl"
                        />
                    </Link>

                    <ProductStatus status={stockStatus} />

                    <LikeButton liked={isLiked} className="absolute top-3 right-3 z-10" />

                    {/* {sizes ? renderSizeList() : renderGroupButtons()} */}
                    {renderGroupButtons()}

                </div>

                <div className="space-y-2 px-2.5 pt-5 pb-2.5">
                    {/* {renderVariants()} */}

                    <div>
                        <h2
                            className={`nc-ProductCard__title  text-sm lg:text-base text-black line-clamp-2 min-h-[40px] lg:min-h-[47px] font-semibold transition-colors`}
                        >
                            {name}
                        </h2>
                    </div>

                    <div className="flex m-0 mb-2">
                        <Prices price={price} />
                        <div className="flex items-center mb-0.5">
                        </div>
                    </div>
                </div>

            </div>


            {/* QUICKVIEW */}
            < ModalQuickView
                show={showModalQuickView}
                onCloseModalQuickView={() => setShowModalQuickView(false)}
            />
        </>
    );
};

export default ProductCard;
