import React, { FC } from "react";
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
import {SimpleProduct, VariableProduct} from "@/graphql/types/graphql";

export interface ProductQuickViewProps {
  className?: string;
  product: SimpleProduct  & VariableProduct;
}

const ProductQuickView: FC<ProductQuickViewProps> = ({ className = "", product }) => {
  let product_images: string[] = [];

  if (product.galleryImages.nodes) {
    product_images = [product.image.sourceUrl, ...product.galleryImages.nodes.map(node => node.sourceUrl)];
  } else if (product.galleryImages.edges && product.galleryImages.edges.length > 0) {
    product_images = [product.image.sourceUrl, product.galleryImages.edges[0].node.sourceUrl, product.galleryImages.edges[1].node.sourceUrl];
  } else {
    product_images = [product.image.sourceUrl];
  }
  const link = useProductLink(product)

  console.log('recieved from quick view', product)
  // console.log({product_images})

  const [variantActive, setVariantActive] = React.useState(0);
  const [sizeSelected, setSizeSelected] = React.useState("");
  const [qualitySelected, setQualitySelected] = React.useState(1);

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
          {product.variations.nodes?.map((variant, index) => (
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
                  src={variant.image?.sourceUrl}
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
    return (
      <div className="space-y-8">
        {/* ---------- 1 HEADING ----------  */}
        <div>
          <h2 className="text-2xl font-semibold hover:text-primary-6000 transition-colors">
            <Link href={link}>{product.name}</Link>
          </h2>

          <div className="flex items-center mt-5 space-x-4 sm:space-x-5">
            <Prices
              contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
              price={product.price}
            />

            <div className="h-6 border-l border-slate-300 dark:border-slate-700"></div>

            <div className="flex items-center">
              <Link
                href={link}
                className="flex items-center text-sm font-medium"
              >
                <StarIcon className="w-5 h-5 pb-[1px] text-yellow-400" />
                <div className="ml-1.5 flex">
                  <span>{product.averageRating}</span>
                  <span className="block mx-2">·</span>
                  <span className="text-slate-600 dark:text-slate-400 underline">
                    {product.reviewCount} reviews
                  </span>
                </div>
              </Link>
              <span className="hidden sm:block mx-2.5">·</span>
              <div className="hidden sm:flex items-center text-sm">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span className="ml-1 leading-none">{status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- 3 VARIANTS AND SIZE LIST ----------  */}
        <div className="">{renderVariants()}</div>
        {/* <div className="">{renderSizeList()}</div> */}

        {/*  ---------- 4  QTY AND ADD TO CART BUTTON */}
        <div className="flex space-x-3.5">
          <ProductAddToCart product={product} />
        </div>

        {/*  */}
        <hr className=" border-slate-200 dark:border-slate-700"></hr>
        {/*  */}

        {/* ---------- 5 ----------  */}
        <AccordionInfo
          data={[
            {
              name: "Description",
              content: product.description,
            },
          ]}
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
          {(product.galleryImages.nodes || (product.galleryImages.edges && product.galleryImages.edges.length > 0)) && (
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
