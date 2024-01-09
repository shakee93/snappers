import React, {
  FC,
  ImgHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import checkInViewIntersectionObserver from "@/utils/isInViewPortIntersectionObserver";
import PlaceIcon from "./PlaceIcon";
import Image, {ImageProps} from "next/image";

export interface NcImageProps  {
  containerClassName?: string;
  src?: any;
  priority?:boolean
  className?: string
  alt?: string
}

const NcImage: FC<NcImageProps> = ({
  containerClassName = "",
  alt = "nc-imgs",
  src = "",
  className = "object-cover w-full h-full",
                                     priority =  false
}) => {

  return (
    <div
      className={`nc-NcImage ${containerClassName}`}
      data-nc-id="NcImage"
    >

      <Image src={src} className={className} alt={alt} width={500} height={500} priority={priority}  />
    </div>
  );
};

export default NcImage;
