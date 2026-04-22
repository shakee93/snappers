import React, { FC } from "react";
import Link from "next/link";
import NcImage from "shared/NcImage/NcImage";
import imgAds from "@/app/public/images/ads.png";

export interface SectionAdsProps {
  className?: string;
}

const SectionAds: FC<SectionAdsProps> = ({ className = "" }) => {
  return (
    <Link href="/" className={`nc-SectionAds block w-full ${className}`}>
      <NcImage className="w-full" src={imgAds} />
    </Link>
  );
};

export default SectionAds;
