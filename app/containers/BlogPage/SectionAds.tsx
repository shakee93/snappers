import React, { FC } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import imgAds from "@/public/images/ads.png";

export interface SectionAdsProps {
  className?: string;
}

const SectionAds: FC<SectionAdsProps> = ({ className = "" }) => {
  return (
    <a href="/#" className={`nc-SectionAds block w-full ${className}`}>
      <NcImage className="w-full" src={imgAds.src} />
    </a>
  );
};

export default SectionAds;
