"use client";

import Image from "next/image";
import whatsappLogo from "@/public/images/whatsapplogo.webp";
import Link from "next/link";
import { useState } from "react";

const WhatsappLogoComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="fixed md:bottom-8  md:left-10 bottom-28 left-4 h-8 w-12 z-50 md:mb-5">
      <Link href={"https://wa.me/94777555665"} target="_blank">
        <div className="relative flex items-center">
          <Image
            src={whatsappLogo}
            alt="WhatsApp-Logo"
            width={80}
            height={80}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          {/* <span className="top-full left-full ml-2 mt-1 bg-gray-800 text-white text-sm px-2 py-1 rounded whitespace-nowrap opacity-100 pointer-events-none transition-opacity duration-300">
                        Chat Now
                    </span> */}
          {isHovered && (
            <span className="top-full transition-all 
            left-full ml-2 mt-1 bg-gray-800 text-white animate-pulse  text-sm px-2 py-1 rounded 
            whitespace-nowrap opacity-100 pointer-events-none duration-300 hover:duration-500">
              Chat Now
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default WhatsappLogoComponent;
