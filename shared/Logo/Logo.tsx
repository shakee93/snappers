import React from "react";
import logoImg from "@/public/images/logo.svg";
import logoLightImg from "@/public/images/logo-light.svg";
import Link from "next/link";
import Image from "next/image";

export interface LogoProps {
  img?: string;
  imgLight?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  img = logoImg,
  imgLight = logoLightImg,
  className = "flex-shrink-0",
}) => {
  return (
    <Link
      href="/"
      className={`ttnc-logo inline-block text-slate-600 ${className}`}
    >
      {/* THIS USE FOR MY CLIENT */}
      {/* PLEASE UN COMMENT BELLOW CODE AND USE IT */}
      {img ? (
       <Image fill style={{ objectFit: 'cover' }}
          className={`block max-h-8 sm:max-h-10 ${
            
            imgLight ? "dark:hidden" : ""
          }`}
          src={img.src}
          alt="Logo"
        />
      ) : (
        "Logo Here"
      )}
      {imgLight && (
       <Image fill style={{ objectFit: 'cover' }}
          className="hidden max-h-8 sm:max-h-10 dark:block"
          src={imgLight}
          alt="Logo-Light"
        />
      )}
    </Link>
  );
};

export default Logo;
