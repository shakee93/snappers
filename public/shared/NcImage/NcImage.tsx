import React, { FC, ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import checkInViewIntersectionObserver from "@/utils/isInViewPortIntersectionObserver";
import PlaceIcon from "./PlaceIcon";
import Image from "next/image";

export interface NcImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

const NcImage: FC<NcImageProps> = ({
  containerClassName = "",
  alt = "nc-imgs",
  src = "",
  className = "object-cover w-full h-full",
  ...props // Changed from ...args to ...props
}) => {
  const _containerRef = useRef<HTMLDivElement>(null); // Explicitly set the ref type
  let _imageEl: HTMLImageElement | null = null;

  const [__src, set__src] = useState<string | undefined>(undefined); // Use a more specific type
  const [imageLoaded, setImageLoaded] = useState(false);

  const _checkInViewPort = () => {
    if (!_containerRef.current) return;
    checkInViewIntersectionObserver({
      target: _containerRef.current,
      options: {
        root: null,
        rootMargin: "0%",
        threshold: 0,
      },
      freezeOnceVisible: true,
      callback: _imageOnViewPort,
    });
  };

  const _imageOnViewPort = () => {
    if (!src) {
      _handleImageLoaded();
      return true;
    }
  
    const img = <Image src={src} alt={alt} className={className} {...props} />;
  
    // If you need to handle the load event, you can do so here
    const imgElement = React.createElement(img.type, img.props);
  
    // Simulate the load event manually
    imgElement.props.onLoad?.();
  
    return true;
  };
  

  const _handleImageLoaded = () => {
    setImageLoaded(true);
    set__src(src);
  };

  useEffect(() => {
    _checkInViewPort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const renderLoadingPlaceholder = () => {
    return (
      <div
        className={`${className} flex items-center justify-center bg-neutral-200 dark:bg-neutral-6000 text-neutral-100 dark:text-neutral-500`}
      >
        <div className="h-2/4 max-w-[50%]">
          <PlaceIcon />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`nc-NcImage ${containerClassName}`}
      data-nc-id="NcImage"
      ref={_containerRef}
    >
      {__src && imageLoaded ? (
        <Image src={__src} className={className} alt={alt} {...props} />
      ) : (
        renderLoadingPlaceholder()
      )}
    </div>
  );
};

export default NcImage;
