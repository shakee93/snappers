"use client"
import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/gq-logo.png";
import { twMerge } from "tailwind-merge";
import { useClearSearch } from "@/hooks/useClearSearch";


const Logo = ({ className = '', imageClass = '' }: { className?: string, imageClass?: string }) => {
  const clearSearch = useClearSearch();
  return (
    <Link href={"/"} className={className}
      onClick={clearSearch}>
      <Image
        width={320}
        height={266}
        priority={true}
        src={SiteLogo}
        alt="logo"
        className={twMerge(
          "h-28 md:h-16 hover:scale-110 transition-all max-w-[80px] md:max-w-[320px] w-auto relative rounded-b-2xl",
          imageClass
        )}
      ></Image>
    </Link>
  );
};

export default Logo;
