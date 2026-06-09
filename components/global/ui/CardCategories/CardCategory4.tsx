'use client'
import React, { FC } from "react";
import { getBrandPath } from "@/lib/productUrl";
import NcImage from "shared/NcImage/NcImage";
import Link from "next/link"
import explore1Svg from "@/public/images/collections/explore1.svg";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import {StaticImageData} from "next/image";
import Image from 'next/image';

import FallbackImage from "@/public/images/brandLogo/apple.png"

export interface CardCategory4Props {
  className?: string;
  featuredImage?: string ;
  bgSVG?: string;
  name: string;
  desc?: string;
  color?: string;
  slug?: string;
}

const CardCategory4: FC<CardCategory4Props> = ({
  className = "",
  featuredImage,
  bgSVG = explore1Svg,
  name,
  desc,
  color = "",
  slug = "",
}) => {

  return (
      <Link href={getBrandPath(slug)}>
        <div
            className={`nc-CardCategory4 relative w-full rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 group hover:nc-shadow-lg transition-shadow ${className}`}
            data-nc-id="CardCategory4"
        >
          <div className="flex p-8 flex-col gap-2 justify-between">
            <div className="flex items-center ">
              {/* <Image
              src={featuredImage || FallbackImage}
              className={`w-20 h-20 rounded-full overflow-hidden z-0 ${color}`}
              alt=""
              width={1000}
              height={1000}
            /> */}
              <Image
                  src={featuredImage || FallbackImage}
                  className={`h-[50px] object-contain w-auto ${color}`}
                  alt=""
                  width={100}
                  height={100}
              />
              {/* <span className="text-xs text-slate-700 dark:text-neutral-300 font-medium">
             products
            </span> */}
            </div>

            <div className="">
            <span
                className={`block mb-2 text-sm text-slate-500 dark:text-slate-400`}
            >
              {desc}
            </span>
              <h2 className={`text-2xl sm:text-3xl font-semibold`}>{name}</h2>
            </div>

            <div
                className="flex items-center text-xs md:text-sm font-medium group-hover:text-primary-500 transition-colors"
            >
              <span>See Collection</span>
              <ArrowRightIcon className="w-4 h-4 ml-2.5" />
            </div>
          </div>

        </div>
      </Link>

  );
};

export default CardCategory4;
