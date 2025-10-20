"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

interface SaleProductData {
  name: string;
  price: string;
  imageUrl: string;
  currency: string;
  slug: string;
  regularPrice: string;
  salePrice: string;
}

interface SaleProductCardProps {
  product: SaleProductData;
  tiktokLink?: string;
}

const
  SaleProductCard = ({ product, tiktokLink }: SaleProductCardProps) => {
    return (
      <div className="w-full md:w-2/3 lg:w-full xl:w-2/3 block h-full bg-white rounded-[18px] overflow-hidden relative border border-gray-200">
        <div className="w-full h-full flex items-center justify-between p-3">
          <div className="flex items-center space-x-4">
            <div className="w-40 rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl || "/32d001bb62499c4283e0ea3ea0c92d55ece10b5b.png"}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col w-full gap-1">
              <div className="text-sm font-semibold line-clamp-2">
                {product.name}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex gap-2 justify-center items-center font-semibold">
                  <span className="text-[33px] font-normal">at</span>
                  <Image
                    src="https://cdn.gqmobiles.lk/wp-content/uploads/2025/08/gq-logo.9de22309.png"
                    alt="star"
                    width={30}
                    height={30}
                    className="w-10 h-auto"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {product.regularPrice && product.regularPrice !== product.price && (
                    <span className="text-[#D71E1E] font-medium leading-none line-through text-[9px]">
                      {product.regularPrice} {product.currency}
                    </span>
                  )}
                  <span className="text-[#1B40AF] font-bold text-sm leading-none">
                    {product.price} {product.currency}
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <Link href="/tag/clearance">
                  <button className="bg-white border border-[#1B40AF] text-[#1B40AF] text-xs px-1 sm:px-4 py-1 rounded-full hover:bg-blue-50 transition-colors">
                    Explore Clearance
                  </button>
                </Link>
                <Link href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer">
                  <button className="bg-[#1B40AF] text-white text-xs px-4 py-1 rounded-full hover:bg-blue-600 transition-colors">
                    Buy Now
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

export default SaleProductCard; 