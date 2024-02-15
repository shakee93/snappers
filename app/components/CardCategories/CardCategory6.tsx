import React, { FC } from "react";
import NcImage from "shared/NcImage/NcImage";
import Image from "next/image";

import explore1Svg from "@/public/images/collections/explore1.svg";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { StaticImageData } from "next/image";

export interface CardCategory6Props {
  className?: string;
  featuredImage?: string | StaticImageData;
  bgSVG?: string;
  name: string;
  desc: string;
  color?: string;
}

const CardCategory6: FC<CardCategory6Props> = ({
  className = "",
  featuredImage = ".",
  bgSVG = explore1Svg,
  name,
  desc,
  color = "bg-rose-50",
}) => {
  return (
    <div
      className={`nc-CardCategory6 aspect-w-1 aspect-h-1 hover:nc-shadow-lg group relative h-0 w-full overflow-hidden rounded-3xl bg-white transition-shadow dark:bg-neutral-900 ${className}`}
      data-nc-id="CardCategory6"
    >
      <div>
        <div className="absolute bottom-0 right-0 top-0 opacity-10">
          <Image fill style={{ objectFit: "cover" }} src={bgSVG} alt="" />
        </div>

        <div className="absolute inset-5 flex flex-col items-center justify-between">
          <div className="flex items-center justify-center">
            <NcImage
              src={featuredImage}
              containerClassName={`w-20 h-20 rounded-full overflow-hidden z-0 ${color}`}
            />
          </div>

          <div className="text-center">
            <span
              className={`mb-1 block text-sm text-slate-500 dark:text-slate-400`}
            >
              {desc}
            </span>
            <h2 className={`text-lg font-semibold sm:text-xl`}>{name}</h2>
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

export default CardCategory6;
