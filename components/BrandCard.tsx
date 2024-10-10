import Image from "next/image";
import React, { FC } from "react";

export interface BrandCardProps {
  imageUrl: string;
  brandLink: string;
  className?: string;
}

const BrandCard: FC<BrandCardProps> = ({
  imageUrl,
  brandLink,
  className = "",
}) => {
  return (
    <a
      href={brandLink}
      rel="noopener noreferrer"
      className="block h-full group " // Add group class for hover targeting
    >
      <div
        className={`nc-BrandCard bg-white flex h-full px-8 items-center justify-center overflow-hidden relative w-[125px] rounded-2xl ${className}`}
      >
        {/* Wrapping the Image in a div to ensure hover applies correctly */}
        <div className="transition-transform duration-300 ease-in-out transform hover:scale-140">
          <Image
            className="w-[100px] sm:w-[150px] h-auto"
            src={imageUrl}
            alt="Brand"
            width={200}
            height={200}
          />
        </div>
      </div>
    </a>
  );
};

export default BrandCard;