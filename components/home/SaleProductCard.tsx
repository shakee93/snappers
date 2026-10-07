"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HIDDEN_PRODUCT_SLUGS } from "@/lib/hidden-products";
import { getProductPath } from "@/lib/productUrl";
import { siteConfig } from "@/site.config";

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
    if (HIDDEN_PRODUCT_SLUGS.has((product.slug ?? "").toLowerCase())) {
      return null;
    }

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
                    src={`${siteConfig.url.cdn}/wp-content/uploads/2025/08/gq-logo.9de22309.png`}
                    alt={`${siteConfig.brand.name} logo`}
                    width={30}
                    height={30}
                    className="w-10 h-auto"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {product.regularPrice && product.regularPrice !== product.price && (
                    <span className="price-strike-angled font-medium leading-none text-[9px]">
                      {product.regularPrice} {product.currency}
                    </span>
                  )}
                  <span className="text-primary-500 font-bold text-sm leading-none">
                    {product.price} {product.currency}
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <Link href="/deals">
                  <button className="bg-white border border-primary-500 text-primary-500 text-xs px-1 sm:px-4 py-1 rounded-full hover:bg-blue-50 transition-colors">
                    Explore Deals
                  </button>
                </Link>
                <Link href={getProductPath(product)} target="_blank" rel="noopener noreferrer">
                  <button className="rounded-full bg-header-action px-4 py-1.5 text-xs font-bold text-header-green transition-opacity hover:opacity-90">
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