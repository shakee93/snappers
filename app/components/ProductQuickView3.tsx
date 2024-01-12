import React, { FC, useState, useCallback, useEffect } from "react";
import { useStore } from "@/store/store";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import LikeButton from "@/app/components/LikeButton";
import { StarIcon } from "@heroicons/react/24/solid";
import BagIcon from "@/app/components/BagIcon";
import NcInputNumber from "@/components/NcInputNumber";
import {
  NoSymbolIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import IconDiscount from "@/components/IconDiscount";
import Prices from "@/app/components/Prices";
import toast from "react-hot-toast";
import NotifyAddTocart from "./NotifyAddTocart";
import AccordionInfo from "@/containers/ProductDetailPage/AccordionInfo";
import Link from 'next/link';
import Image from "next/image";
import useProductLink from "@/hooks/useProductLink";
import ProductAddToCart from "./SingleProductPage/ProductAddToCart";
import { twMerge } from "tailwind-merge";

import ProductSpecifications from "./SingleProductPage/ProductSpecifications";
import BrandBar from "./globalComponents/BrandBar";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import {
  Attribute,
  Brand,
  Category, GlobalProductAttribute,
  Product,
  ProductAttribute, ProductUnion, ProductVariation,
} from "@/graphql/types/graphql";

import { GET_TECH_SPEC } from "@/graphql/defs/products";
import { useQuery } from "@apollo/client";
import ProductDetails from "@/app/components/SingleProductPage/ProductDetailsQuickView";

export interface ProductQuickViewProps {
  className?: string;
  product: SimpleProduct & VariableProduct;
  brands?: any;
}

const ProductQuickView: FC<ProductQuickViewProps> = ({ className = "", product, brands }) => {

  const [variantActive, setVariantActive] = React.useState(0);
  const [sizeSelected, setSizeSelected] = React.useState("");
  const [qualitySelected, setQualitySelected] = React.useState(1);
  const { product: { attribute }, setAttribute } = useStore()
  const [techspecs, setTechSpecs] = React.useState(null);
  const [activeVariation, setActiveVariation] = useState<any>(
    !!product && 'variations' in product && product.variations?.nodes?.length
      ? product.variations.nodes[0]
      : null
  );

  const link = useProductLink(product)

  // let brand = product?.brands?.nodes[0]?.name;

  let product_images: string[] = [];
  product_images = [
    product?.image?.sourceUrl ?? "",
    product?.galleryImages?.nodes[0]?.sourceUrl ?? "",
    product?.galleryImages?.nodes[1]?.sourceUrl ?? ""
  ];

  // console.log({ product });

  const { loading, error, data } = useQuery(GET_TECH_SPEC, {
    variables: {
      productId: product.databaseId,
    }
  });

  useEffect(() => {
    if (data) {
      setTechSpecs(data);
    }
  }, [data]);

  const activeAttr = useCallback((attr: ProductAttribute) => {
    return attribute.find(a => a.name === attr.name)
  }, [attribute])

  const notifyAddTocart = () => {
    toast.custom(
      (t) => (
        <NotifyAddTocart
          productImage={product_images[0]}
          qualitySelected={qualitySelected}
          show={t.visible}
          sizeSelected={sizeSelected}
          variantActive={variantActive}
        />
      ),
      { position: "top-right", id: "nc-product-notify", duration: 3000 }
    );
  };

  const renderVariants = () => {
    if (!product.variations || !product.variations?.nodes?.length) {
      return null;
    }

    return (
      <div>
        <label htmlFor="">
          <span className="text-sm font-medium">
            Variations:
            <span className="ml-1 font-semibold">
              {/* {variants[variantActive].name} */}
            </span>
          </span>
        </label>
        <div className="flex mt-2.5">
          {product.variations.nodes?.map((variant: ProductVariation, index) => (
            <div
              key={index}
              onClick={() => setVariantActive(index)}
              className={`w-auto relative flex-1 max-w-[75px] h-16 rounded-full border-2 cursor-pointer ${variantActive === index
                ? "border-primary-6000 dark:border-primary-500"
                : "border-transparent"
                }`}
            >
              <div className="absolute inset-0.5 rounded-full overflow-hidden z-0">
                <Image fill style={{ objectFit: 'cover' }}
                  src={variant.image?.sourceUrl || ''}
                  alt=""
                  className="absolute w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStatus = () => {
    if (!status) {
      return null;
    }
    const CLASSES =
      "absolute top-3 left-3 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 nc-shadow-lg rounded-full flex items-center justify-center text-slate-700 text-slate-900 dark:text-slate-300";
    if (status === "New in") {
      return (
        <div className={CLASSES}>
          <SparklesIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "50% Discount") {
      return (
        <div className={CLASSES}>
          <IconDiscount className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "Sold Out") {
      return (
        <div className={CLASSES}>
          <NoSymbolIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "limited edition") {
      return (
        <div className={CLASSES}>
          <ClockIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    return null;
  };

  const renderSectionContent = () => {
    console.log({ product })
    console.log('sctivr vsaritation', activeVariation)
    console.log('brands', brands)
    return (
      <div className="space-y-8">

        {/* <ProductDetails brand={brand} product={product} /> */}
        {/* ---------- 1 HEADING ----------  */}

        <ProductDetails brand={brands} product={product}/>

        {/* <div>

          <div className="flex gap-1  text-sm text-gray-500 pb-4">
            Brand : <span className="">{brand}</span>
          </div>

          <div className="text-base md:text-lg font-medium ">
            <Link href={link}> {product.name} - {product.databaseId} </Link>
          </div>


          {product.type === 'VARIABLE' &&
            <>
              {product.attributes?.nodes.map((attr: ProductAttribute, index: number) =>
                <div key={index} className="py-2 text-gray-500">
                  <div className="text-sm py-2"> {attr.label}:{" "}
                    <span className="font-medium text-gray-700">
                      {(product as any)[`allPa${attr.label}`]?.nodes.find(
                        (node: any) => node.slug === activeAttr(attr)?.val
                      )?.name}
                    </span>{" "}</div>

                  <ul className="flex gap-2 flex-wrap text-sm items-center">

                    {attr.options?.map((option, index) =>
                      <li key={index}
                        onClick={e => setAttribute(attr, option ?? "")}
                        className={
                          twMerge(
                            "border bg-gray-200/80 cursor-pointer text-black inline-block py-2 px-3.5  text-xs md:text-sm rounded",
                            activeAttr(attr)?.val === option && ' border-blue-700 bg-white'
                          )
                        }>

                        {option}
                        {
                          (typeof product[`allPa${attr.label}` as keyof typeof product] === 'object' &&
                            Array.isArray((product[`allPa${attr.label}` as keyof typeof product] as any)?.nodes) &&
                            (product[`allPa${attr.label}` as keyof typeof product] as any)?.nodes.find(
                              (node: any) => node.slug === option
                            )?.name || 'Option')
                        }

                      </li>
                    )}

                  </ul>
                </div>
              )}

            </>
          }

          {product.type === 'VARIABLE' && activeVariation ?

            <div>
              <div className="flex gap-4 text-base py-2 flex-wrap md:text-lg font-medium text-gray-600">
                <span>
                  {activeVariation.price}
                </span>

                {(!!activeVariation.salePrice && activeVariation.salePrice !== activeVariation.regularPrice) &&
                  <span className="text-red-400">
                    <s>{activeVariation.regularPrice}</s>
                  </span>
                }

              </div>
            </div> :

            <div className="flex gap-2 text-base py-2 flex-wrap md:text-lg font-medium text-gray-600">
              <span>
                {product.price}
              </span>

              {(!!product.salePrice && product.salePrice !== product.regularPrice) &&
                <span className="text-red-400">
                  <s>{product.regularPrice}</s>
                </span>
              }

            </div>
          }

          {(product.type === 'SIMPLE' && product.stockStatus !== 'IN_STOCK') &&
            <div className="w-max px-4 bg-red-200  text-center rounded-full  text-gray-800 text-xs md:text-sm py-1">
              Sold Out
            </div>
          }

          {product.type === 'VARIABLE' && activeVariation?.stockStatus !== 'IN_STOCK' &&
            <div className="w-max px-4 bg-red-200  text-center rounded-full  text-gray-800 text-xs md:text-sm py-1">
              Sold Out
            </div>
          }

          <ProductAddToCart product={product} variation={activeVariation} />
          <div className="flex gap-1 items-center text-sm md:text-base text-gray-500">
            <div className="text-sm py-2">Category:</div>
            {product.productCategories?.nodes.map((category: any, index: number) =>
              <Link href={`/collections/${category.slug}`} key={index} className="bg-primary-100 inline-block py-1 px-2  text-xs md:text-sm rounded-3xl">
                {category.name}
              </Link>
            )}

          </div>

        </div> */}

        {/*  */}
        <hr className=" border-slate-200 dark:border-slate-700"></hr>
        {/*  */}

        {/* ---------- 5 ----------  */}
        <AccordionInfo
          data={[
            {
              name: "Description",
              content: product.description ?? "",
            },
            {
              name: "Specifications",
              content: product.description ?? "",
            }
          ]}
          techspecs={techspecs}
        />
      </div>
    );
  };

  return (
    <div className={`nc-ProductQuickView ${className}`}>
      {/* MAIn */}
      <div className="lg:flex">
        {/* CONTENT */}
        <div className="w-full lg:w-[50%] ">
          {/* HEADING */}
          <div className="relative">
            <div className="aspect-w-16 aspect-h-16">
              <Image fill style={{ objectFit: 'contain' }}
                src={product_images[0]}
                className="w-full rounded-xl object-cover"
                alt="product detail 1"
              />
            </div>

            {/* STATUS */}
            {renderStatus()}
            {/* META FAVORITES */}
            <LikeButton className="absolute right-3 top-3 " />
          </div>
          {(product?.galleryImages?.nodes || (product?.galleryImages?.edges && product?.galleryImages?.edges?.length > 0)) && (
            <div className="hidden lg:grid grid-cols-2 gap-3 mt-3 sm:gap-6 sm:mt-6 xl:gap-5 xl:mt-5">
              {[product_images[1], product_images[2]].map((item, index) => {
                return (
                  <div key={index} className="aspect-w-3 aspect-h-4">
                    <Image fill style={{ objectFit: 'contain' }}
                      src={item}
                      className="w-full rounded-xl object-contain"
                      alt={`product detail ${index + 2}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-[50%] pt-6 lg:pt-0 lg:pl-7 xl:pl-8">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
