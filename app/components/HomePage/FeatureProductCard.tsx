"use client";
import React from "react";
import Link from "next/link";

interface FeatureProductData {
  name: string;
  price: string;
  imageUrl: string;
  currency: string;
  slug: string;
  regularPrice: string;
  salePrice: string;
}

interface FeatureProductCardProps {
  product: FeatureProductData;
}

const FeatureProductCard = ({ product }: FeatureProductCardProps) => {
  // Calculate discount percentage
  const calculateDiscountPercentage = (regularPrice: string, salePrice: string) => {
    if (!regularPrice || !salePrice) return 0;
    const regular = parseFloat(regularPrice);
    const sale = parseFloat(salePrice);
    if (regular === 0) return 0;
    return Math.round(((regular - sale) / regular) * 100);
  };

  const discountPercentage = calculateDiscountPercentage(product.regularPrice, product.salePrice);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="w-full md:w-1/3 hidden md:block lg:hidden xl:block h-full rounded-[18px] overflow-hidden relative bg-cover bg-center bg-no-repeat hover:scale-105 transition-transform duration-200"
      style={{
        backgroundImage: `url('${product.imageUrl}')`,
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      <div className="w-full h-full items-end flex p-2 relative z-10">
        <div className="flex items-center w-full ">
          <div className="text-white flex flex-col w-full justify-center items-center">
            <div className="text-xs font-semibold leading-normal">
              {product.name}
            </div>
            <div className="text-[10px] font-[400] leading-[12px]">
              {product.price} {product.currency}
            </div>
          </div>
        </div>
        <div className="absolute top-2 right-2">
          {discountPercentage > 0 && (
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {discountPercentage}% OFF
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default FeatureProductCard; 