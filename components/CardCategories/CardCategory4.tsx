import React, { FC } from "react";
import NcImage from "shared/NcImage/NcImage";
import Link from "next/link";
import explore1Svg from "@/public/images/collections/explore1.svg";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { StaticImageData } from "next/image";

export interface CardCategory4Props {
  className?: string;
  featuredImage?: string | StaticImageData;
  bgSVG?: string;
  name: string;
  desc: string;
  color?: string;
}

const CardCategory4: FC<CardCategory4Props> = ({
  className = "",
  featuredImage = ".",
  bgSVG = explore1Svg,
  name,
  desc,
  color = "bg-rose-50",
}) => {
  return (
    <div
      className={`nc-CardCategory4 aspect-w-12 aspect-h-11 hover:nc-shadow-lg group relative h-0 w-full overflow-hidden rounded-3xl bg-white transition-shadow dark:bg-neutral-900 ${className}`}
      data-nc-id="CardCategory4"
    >
      <div>
        <div className="absolute bottom-0 right-0 max-w-[280px] opacity-80">
          {/* <img src={bgSVG} alt="" /> */}
        </div>

        <div className="absolute inset-5 flex flex-col justify-between sm:inset-8">
          <div className="flex items-center justify-between">
            <NcImage
              src={featuredImage}
              containerClassName={`w-20 h-20 rounded-full overflow-hidden z-0 ${color}`}
            />
            <span className="text-xs font-medium text-slate-700 dark:text-neutral-300">
              products
            </span>
          </div>

          <div className="">
            <span
              className={`mb-2 block text-sm text-slate-500 dark:text-slate-400`}
            >
              {desc}
            </span>
            <h2 className={`text-2xl font-semibold sm:text-3xl`}>{name}</h2>
          </div>

          <Link
            href={"/page-collection"}
            className="group-hover:text-primary-500 flex items-center text-sm font-medium transition-colors"
          >
            <span>See Collection</span>
            <ArrowRightIcon className="ml-2.5 h-4 w-4" />
          </Link>
        </div>
      </div>

      <Link href={"/page-collection"}></Link>
    </div>
  );
};

export default CardCategory4;
