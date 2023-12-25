import React, {
  FC,
  ImgHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import checkInViewIntersectionObserver from "@/utils/isInViewPortIntersectionObserver";
import PlaceIcon from "./PlaceIcon";
import Image from "next/image";

export interface NcImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  src?: any;
}

const NcImage: FC<NcImageProps> = ({
  containerClassName = "",
  alt = "nc-imgs",
  src = "",
  className = "object-cover w-full h-full",
}) => {

  return (
    <div
      className={`nc-NcImage ${containerClassName}`}
      data-nc-id="NcImage"
    >

      <Image src={src} className={className} alt={alt} width={10000} height={10000}  />
    </div>
  );
};

export default NcImage;
